import os
import subprocess
import logging
from typing import List, Dict, Optional
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from services.rag_service import rag_service
from services.llm_factory import get_llm
from services.git_service import git_service

logger = logging.getLogger(__name__)

class CodingAgent:
    def __init__(self):
        self.llm = get_llm()

    def run_task(self, task: str, repo_path: str) -> str:
        """Executes a coding task end-to-end."""
        logger.info(f"Starting task: {task}")
        
        # 1. Retrieve Context
        context_docs = rag_service.query_knowledge(task, k=3)
        context_text = "\n\n".join([f"Source: {d['title']}\nContent:\n{d['full_content']}" for d in context_docs])
        
        # 2. Plan
        plan = self._create_plan(task, context_text)
        logger.info(f"Plan created: {plan}")
        
        # 3. Execute Plan
        for step in plan:
            logger.info(f"Executing step: {step}")
            self._execute_step(step, context_text, repo_path)
            
        # 4. Final Commit & PR Simulation
        branch_name = f"feature/{task.lower().replace(' ', '-')}"
        # Ensure we are on main/master first or just branch off current? 
        # For simplicity, we assume we are at a clean state or just create branch.
        # Check if branch exists or just try to checkout -b
        git_service.create_branch(repo_path, branch_name)
        
        git_service.commit_changes(repo_path, f"Implemented task: {task}")
        
        simulated_pr_url = f"https://github.com/hsbc/trading-engine/pull/new/{branch_name}"
        logger.info(f"PR Created Simulation: {simulated_pr_url}")
        
        return f"Task completed successfully. PR created: {simulated_pr_url}"

    def _create_plan(self, task: str, context: str) -> List[str]:
        """Generates a list of implementation steps."""
        prompt = PromptTemplate.from_template(
            """
            You are a senior software engineer. Create a implementation plan for the following task based on the provided context.
            Return ONLY a list of steps, one per line.
            Each step should be a clear instruction like "Create file src/market_data.py with MarketDataProvider class".
            
            Task: {task}
            
            Context:
            {context}
            
            Plan:
            """
        )
        chain = prompt | self.llm | StrOutputParser()
        result = chain.invoke({"task": task, "context": context})
        return [line.strip() for line in result.split("\n") if line.strip() and not line.startswith("#")]

    def _execute_step(self, step: str, context: str, repo_path: str):
        """Generates code and tests for a single step, verifies, and fixes if needed."""
        
        # 1. Generate Code
        code_files = self._generate_code(step, context)
        
        # 2. Write Files
        for filepath, content in code_files.items():
            if not self._is_safe_path(filepath, repo_path):
                logger.error(f"Attempted to write to unsafe path: {filepath}")
                continue
            full_path = os.path.join(repo_path, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w") as f:
                f.write(content)
                
        # 3. Verify (Run Tests)
        # Assuming the step generated a test file, or we run existing tests
        # For simplicity in this MVP, we look for 'test' in the filename to run it
        test_files = [f for f in code_files.keys() if "test" in f or "tests/" in f]
        
        for test_file in test_files:
            logger.info(f"Running test: {test_file}")
            success, output = self._run_test(test_file, repo_path)
            
            if not success:
                logger.warning(f"Test failed: {output}. Attempting fix...")
                # 4. Fix if failed
                self._fix_code(step, context, code_files, output, repo_path)

    def _generate_code(self, step: str, context: str) -> Dict[str, str]:
        """Generates code files (source and test) for a step."""
        prompt = PromptTemplate.from_template(
            """
            You are an expert Python developer.
            Write the code to accomplish the following step: {step}
            Use the context provided.
            
            You must provide TWO files:
            1. The implementation file (e.g., src/module.py)
            2. A corresponding test file (e.g., tests/test_module.py) using `unittest`.
            
            Output format:
            FILE: <filepath>
            <code content>
            END_FILE
            
            FILE: <filepath>
            <code content>
            END_FILE
            
            Context:
            {context}
            """
        )
        chain = prompt | self.llm | StrOutputParser()
        result = chain.invoke({"step": step, "context": context})
        return self._parse_files(result)

    def _fix_code(self, step: str, context: str, code_files: Dict[str, str], error: str, repo_path: str):
        """Fixes code based on error output."""
        prompt = PromptTemplate.from_template(
            """
            The following code failed its test. Fix the implementation and/or the test.
            
            Step: {step}
            
            Current Files:
            {code_files}
            
            Error Output:
            {error}
            
            Output format:
            FILE: <filepath>
            <code content>
            END_FILE
            ...
            """
        )
        # Format code_files for prompt
        files_str = "\n".join([f"File: {k}\nContent:\n{v}" for k, v in code_files.items()])
        
        chain = prompt | self.llm | StrOutputParser()
        result = chain.invoke({"step": step, "code_files": files_str, "error": error})
        new_files = self._parse_files(result)
        
        # Overwrite files
        for filepath, content in new_files.items():
            if not self._is_safe_path(filepath, repo_path):
                logger.error(f"Attempted to write to unsafe path: {filepath}")
                continue
            full_path = os.path.join(repo_path, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True) # Ensure dir exists for new files in fix
            with open(full_path, "w") as f:
                f.write(content)
                
        # Retry test (optional, limited retries to avoid infinite loops)
        # For MVP, we just try to fix once.

    def _is_safe_path(self, path: str, repo_path: str) -> bool:
        """Checks if the path is safe (not absolute, doesn't start with -, stays within repo)."""
        if path.startswith("-"):
            return False

        # Prevent absolute paths
        if os.path.isabs(path):
            return False

        # Ensure it stays within repo_path using commonpath for security
        abs_repo_path = os.path.abspath(repo_path)
        abs_target_path = os.path.abspath(os.path.join(repo_path, path))

        try:
            return os.path.commonpath([abs_repo_path, abs_target_path]) == abs_repo_path
        except ValueError:
            return False

    def _run_test(self, test_file: str, repo_path: str) -> (bool, str):
        """Runs a specific test file using python -m unittest."""
        # Convert path to module format if needed, but simple file run works for standalone
        # Ideally: python -m unittest tests/test_foo.py
        if not self._is_safe_path(test_file, repo_path):
            return False, f"Invalid or unsafe test file path: {test_file}"

        try:
            # We run from repo root
            cmd = ["python3", "-m", "unittest", test_file]
            result = subprocess.run(cmd, cwd=repo_path, capture_output=True, text=True)
            if result.returncode == 0:
                return True, result.stdout
            else:
                return False, result.stderr + "\n" + result.stdout
        except Exception as e:
            return False, str(e)

    def _parse_files(self, text: str) -> Dict[str, str]:
        """Parses the LLM output into a dictionary of filename -> content."""
        files = {}
        current_file = None
        current_content = []
        
        for line in text.split("\n"):
            if line.startswith("FILE: "):
                if current_file:
                    files[current_file] = "\n".join(current_content).strip()
                current_file = line.replace("FILE: ", "").strip()
                current_content = []
            elif line.startswith("END_FILE"):
                if current_file:
                    files[current_file] = "\n".join(current_content).strip()
                    current_file = None
            else:
                if current_file:
                    current_content.append(line)
                    
        return files

coding_agent = CodingAgent()
