from fastapi.testclient import TestClient
from main import app
import main

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 404 # No root endpoint defined

def test_create_workspace():
    # Mock git_service.clone_repo to avoid actual git operations
    original_clone = main.git_service.clone_repo
    main.git_service.clone_repo = lambda url, path: True
    
    try:
        response = client.post("/workspace", json={"name": "Test Workspace", "repo_url": "https://github.com/test/repo"})
        assert response.status_code == 200
        assert response.json()["name"] == "Test Workspace"
        assert "id" in response.json()
    finally:
        main.git_service.clone_repo = original_clone

def test_import_data_mock():
    # Mock analyst_agent.import_requirements
    original_import = main.analyst_agent.import_requirements
    main.analyst_agent.import_requirements = lambda query: [{"id": "1", "title": "Test Doc", "summary": "Summary"}]
    
    # First create workspace (manually adding to dict to avoid side effects of create endpoint if needed, but endpoint calls are better if mocked)
    # But since we mock import_requirements, let's just use a fake workspace ID that we inject
    main.workspaces["test-id"] = {"id": "test-id", "name": "Test", "repo_path": "/tmp/test"}
    
    try:
        response = client.post("/import-data", json={"workspace_id": "test-id", "query": "market data"})
        assert response.status_code == 200
        assert response.json()["imported_count"] == 1
    finally:
        main.analyst_agent.import_requirements = original_import
        if "test-id" in main.workspaces:
            del main.workspaces["test-id"]
