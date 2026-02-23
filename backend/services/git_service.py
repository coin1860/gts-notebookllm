import os
import subprocess
import shutil
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class GitService:
    def clone_repo(self, repo_url: str, target_dir: str) -> bool:
        """Clones a repository to the target directory."""
        try:
            if os.path.exists(target_dir):
                shutil.rmtree(target_dir)
            
            subprocess.run(["git", "clone", repo_url, target_dir], check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to clone repo: {e.stderr.decode()}")
            return False

    def create_branch(self, repo_dir: str, branch_name: str) -> bool:
        """Creates and switches to a new branch."""
        try:
            subprocess.run(["git", "checkout", "-b", branch_name], cwd=repo_dir, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to create branch: {e.stderr.decode()}")
            return False

    def commit_changes(self, repo_dir: str, message: str) -> bool:
        """Stages all changes and commits them."""
        try:
            subprocess.run(["git", "add", "."], cwd=repo_dir, check=True, capture_output=True)
            subprocess.run(["git", "commit", "-m", message], cwd=repo_dir, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to commit changes: {e.stderr.decode()}")
            return False

    def get_current_branch(self, repo_dir: str) -> Optional[str]:
        """Returns the current branch name."""
        try:
            result = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_dir, check=True, capture_output=True)
            return result.stdout.decode().strip()
        except subprocess.CalledProcessError:
            return None

git_service = GitService()
