import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from starlette.concurrency import run_in_threadpool
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
    workspace_id: str
    message: str

class AgentTaskRequest(BaseModel):
    workspace_id: str
    task: str

class AgentTaskResponse(BaseModel):
    task_id: str
    status: str

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
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Trigger Analyst Agent
    try:
        docs = await run_in_threadpool(analyst_agent.import_requirements, req.query)
        return {"status": "success", "imported_count": len(docs), "documents": docs}
    except Exception as e:
        logger.error(f"Import failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat-knowledge")
async def chat_knowledge(req: ChatRequest):
    # simple RAG chat
    context_docs = rag_service.query_knowledge(req.message)
    # logic to generate answer would go here, for now return context
    return {"response": "Here is what I found in the knowledge base:", "context": context_docs}

def run_agent_task_background(task_id: str, task: str, repo_path: str):
    tasks[task_id]["status"] = "running"
    try:
        result = coding_agent.run_task(task, repo_path)
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["result"] = result
    except Exception as e:
        logger.error(f"Task failed: {e}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)

@app.post("/agent/task", response_model=AgentTaskResponse)
async def start_agent_task(req: AgentTaskRequest, background_tasks: BackgroundTasks):
    if req.workspace_id not in workspaces:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    repo_path = workspaces[req.workspace_id]["repo_path"]
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"id": task_id, "task": req.task, "status": "pending"}
    
    background_tasks.add_task(run_agent_task_background, task_id, req.task, repo_path)
    
    return AgentTaskResponse(task_id=task_id, status="pending")

@app.get("/agent/task/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
