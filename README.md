# AI Agent Workspace (MVP)

<div align="center">

![Project Logo](frontend/public/globe.svg)

**An Autonomous Agent Workspace for Investment Banking IT**

[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20LangChain-009688?style=flat-square)](./backend)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20Tailwind-000000?style=flat-square)](./frontend)
[![Database](https://img.shields.io/badge/Data-ChromaDB%20%7C%20SQLite-018bff?style=flat-square)](./workspaces)

</div>

## 📖 Introduction

**AI Agent Workspace** is a Proof of Concept (MVP) designed to modernize the workflow of Investment Banking IT departments. In large financial institutions, critical knowledge is often fragmented across Jira, Confluence, and GitHub, making it difficult for developers to connect requirements with implementation.

This system solves this problem by combining **Google NotebookLLM's knowledge management** with **Google Jules' autonomous coding capabilities**. It allows users to:
1.  **Ingest & Synthesize**: Automatically fetch, summarize, and organize requirements from disparate sources (Jira/Confluence) into a cohesive knowledge base.
2.  **Plan & Execute**: Assign high-level coding tasks to an autonomous agent that plans, writes code, runs tests, and commits changes to a target repository.

The UI follows **HSBC's design system** (Red/White/Dark Gray) to ensure a familiar and professional user experience.

---

## 🌟 Key Features

### 🧠 Knowledge Workspace (RAG)
- **Unified Ingestion**: Connects to Jira and Confluence (mocked for MVP) to fetch raw requirements.
- **LLM-TXT Summarization**: automatically converts verbose documentation into high-level Markdown summaries optimized for agent consumption.
- **Contextual Chat**: Ask questions about the project requirements and get answers cited from the ingested knowledge base.

### 🤖 Autonomous Coding Agent (Jules)
- **Task Planning**: Decomposes high-level instructions (e.g., "Implement Market Data Module") into actionable steps.
- **Code Generation & Testing**: Writes production-ready Python code and corresponding unit tests.
- **Self-Healing**: Automatically runs tests, analyzes failures, and patches the code until tests pass.
- **Git Integration**: Operates on a simulated local Git repository, creating branches and simulating Pull Requests.

### ⚡ Modern Banking UI
- **HSBC Theming**: Built with Tailwind CSS using the official corporate color palette (Red #db0011, Dark Gray #333333).
- **Dashboard Layout**: intuitive navigation between Workspace management, Knowledge Notebook, and Coding Agent interfaces.
- **Real-Time Terminal**: Visualizes the agent's thought process and terminal execution outputs.

---

## 🏗️ Architecture

The system is built as a modular application with a clear separation of concerns:

### System Components

| Component | Technology | Description |
|-----------|------------|-------------|
| **Backend API** | **FastAPI** | RESTful API managing workspaces and agent triggers |
| **Agent Logic** | **LangChain** | Orchestrates the Analyst and Coding agents |
| **Vector Store** | **ChromaDB** | Stores semantic embeddings of knowledge documents |
| **LLM Provider** | **Groq** | High-speed inference (Llama3-70b) for agent reasoning |
| **Frontend** | **Next.js 14** | React-based UI with Server Components |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework with custom HSBC theme |
| **Target Repo** | **Git (Local)** | A simulated repository directory for safe agent operations |

### Workflow

1.  **Analyst Agent**:
    -   User imports data -> Agent fetches from Source -> Summarizes to `llmtxt` -> Stores in ChromaDB.
2.  **Coding Agent**:
    -   User Task -> Agent retrieves Context (RAG) -> Generates Plan -> Loop [Write Code -> Run Tests -> Fix] -> Commit & PR.

---

## 🚀 Getting Started

### Prerequisites

1.  **Python 3.10+**
2.  **Node.js 18+** & npm
3.  **Git**

### 🛠️ Installation

#### 1. Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure Environment
cp .env.example .env
# Edit .env and add your LLM_API_KEY (Groq) and other credentials
```

#### 2. Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

#### 3. Initialize Simulated Repository

The agent needs a target repository to work on. The MVP includes a simulation script:

```bash
# From the root directory
mkdir -p simulated_repo_origin
cd simulated_repo_origin
git init
git add .
git commit -m "Initial commit"
```

### ▶️ Running the System

1.  **Start Backend**:
    ```bash
    cd backend
    uvicorn main:app --reload
    ```
    *API running at: http://localhost:8000*

2.  **Start Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
    *Access UI at: http://localhost:3000*

---

## 📚 Usage Guide

### 1. Create a Workspace
Navigate to the home page and create a new workspace. Point it to your local simulated repository path (default: `/app/simulated_repo_origin`).

### 2. Import Knowledge
Go to the **Notebook** tab. Click "Import" to fetch mock requirements from Jira/Confluence. The agent will summarize them into the knowledge base.

### 3. Assign Coding Tasks
Switch to the **Jules (Coding)** tab. Type a command like:
> "Implement the Market Data Module based on the requirements."

The agent will:
1.  Read the requirements.
2.  Create a plan.
3.  Write `src/market_data.py` and `tests/test_market_data.py`.
4.  Run the tests and fix any errors.
5.  Commit the changes and provide a link to the simulated PR.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch.
5.  Open a Pull Request.

---

**© 2025 AI Agent Team** | Internal POC
