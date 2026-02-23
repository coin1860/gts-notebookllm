# AI Agent Workspace MVP

This project is an MVP for an AI Agent workspace designed for an investment bank's IT department. It integrates knowledge management (Jira/Confluence via RAG) with autonomous coding capabilities (simulated Git workflow).

## Features

- **Workspace Management**: Create workspaces bound to specific repositories.
- **Knowledge Integration**: Import requirements from Jira/Confluence (mocked for MVP) and generate summaries (`llmtxt`).
- **RAG Chat**: Query the knowledge base for project context.
- **Coding Agent (Jules)**: Assign coding tasks to an autonomous agent that plans, codes, tests, and commits changes.
- **Simulated Environment**: Operates on a local simulated repository to demonstrate end-to-end workflows without external dependencies.

## Architecture

- **Backend**: Python (FastAPI), LangChain, ChromaDB.
- **Frontend**: Next.js, Tailwind CSS (HSBC styling).
- **Simulated Repo**: A local directory acting as the "remote" Git repository.

## Getting Started

1.  **Setup Backend**:
    ```bash
    cd backend
    pip install -r requirements.txt
    cp .env.example .env
    # Edit .env with your LLM API keys
    uvicorn main:app --reload
    ```

2.  **Setup Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Initialize Simulated Repo**:
    ```bash
    cd simulated_repo_origin
    git init
    git add .
    git commit -m "Initial commit"
    cd ..
    ```

4.  **Usage**:
    - Open `http://localhost:3000`.
    - Create a workspace pointing to `/app/simulated_repo_origin` (or your local path).
    - Import data (mocked requirements are provided).
    - Chat with the knowledge base or assign coding tasks like "Implement Market Data Module".

## License
HSBC Internal Use Only (MVP).
