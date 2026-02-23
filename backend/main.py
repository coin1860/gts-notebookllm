import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

from config import config
from services.git_service import git_service
from services.rag_service import rag_service
from agents.analyst_agent import analyst_agent
from agents.coding_agent import coding_agent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Agent Workspace MVP")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class CreateWorkspaceRequest(BaseModel):
    repo_url: str = config.SIMULATED_REPO_PATH # Default to local simulation
    name: str

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    repo_path: str

class ImportDataRequest(BaseModel):
    workspace_id: str
    query: Optional[str] = ""

class ChatRequest(BaseModel):
    workspace_id: Optional[str] = None
    message: str
    thread_id: Optional[str] = None

class AgentTaskRequest(BaseModel):
    workspace_id: Optional[str] = None
    task: str

class AgentTaskResponse(BaseModel):
    task_id: str
    status: str
    message: Optional[str] = None
    pr_url: Optional[str] = None
    logs: Optional[List[str]] = None

# --- State (In-Memory for MVP) ---
workspaces = {}
tasks = {}

# --- Endpoints ---

@app.post("/workspace", response_model=WorkspaceResponse)
async def create_workspace(req: CreateWorkspaceRequest):
    workspace_id = str(uuid.uuid4())
    repo_path = os.path.join(config.WORKSPACES_DIR, workspace_id, "repo")
    os.makedirs(repo_path, exist_ok=True)
    
    # Clone the repo (simulated or real)
    logger.info(f"Cloning repo from {req.repo_url} to {repo_path}")
    success = git_service.clone_repo(req.repo_url, repo_path)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clone repository")
    
    workspaces[workspace_id] = {
        "id": workspace_id,
        "name": req.name,
        "repo_path": repo_path
    }
    
    return WorkspaceResponse(id=workspace_id, name=req.name, repo_path=repo_path)

@app.post("/import-data")
async def import_data(req: ImportDataRequest):
    if req.workspace_id not in workspaces:
        # For MVP, allow import without explicit workspace if needed, or use default
        pass
    
    # Trigger Analyst Agent
    try:
        docs = analyst_agent.import_requirements(req.query)
        return {"status": "success", "imported_count": len(docs), "documents": docs}
    except Exception as e:
        logger.error(f"Import failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
async def search_docs(query: str):
    try:
        results = rag_service.query_knowledge(query)
        # Format for frontend
        formatted = []
        for doc in results:
             formatted.append({
                 "source": doc.metadata.get("source", "Unknown"),
                 "content": doc.page_content,
                 "relevance": 1.0 # Placeholder
             })
        return formatted
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_agent(req: ChatRequest):
    try:
        # Use Search Agent logic (which uses RAG + LLM)
        # For now, we reuse the RAG service directly or similar
        context_docs = rag_service.query_knowledge(req.message)
        context_str = "\n\n".join([d.page_content for d in context_docs])

        # Simple LLM call with context (Mocking the agent loop for speed/reliability in MVP check)
        # Ideally this calls SearchAgent
        from services.llm_factory import get_llm
        llm = get_llm()

        prompt = f"""Answer the user's question based on the context below.

        Context:
        {context_str}

        Question: {req.message}
        """
        response = llm.invoke(prompt)

        return {"response": response.content, "thread_id": req.thread_id or str(uuid.uuid4())}
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/task")
async def execute_task_sync(req: AgentTaskRequest):
    """
    Executes task synchronously for MVP demo purposes.
    """
    # Find a workspace or use default
    repo_path = config.SIMULATED_REPO_PATH
    if req.workspace_id and req.workspace_id in workspaces:
        repo_path = workspaces[req.workspace_id]["repo_path"]

    task_id = str(uuid.uuid4())
    logger.info(f"Starting task {task_id}: {req.task}")
    
    try:
        # Run coding agent synchronously
        result = coding_agent.run_task(req.task, repo_path)

        return AgentTaskResponse(
            task_id=task_id,
            status="success",
            message=result.get("message", "Task completed"),
            pr_url=result.get("pr_url"),
            logs=result.get("logs", [])
        )
    except Exception as e:
        logger.error(f"Task failed: {e}")
        return AgentTaskResponse(
            task_id=task_id,
            status="failed",
            message=str(e),
            logs=[str(e)]
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
