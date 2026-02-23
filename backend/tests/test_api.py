from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 404 # No root endpoint defined

def test_create_workspace():
    # Mock git_service.clone_repo to avoid actual git operations
    import backend.main
    main.git_service.clone_repo = lambda url, path: True
    
    response = client.post("/workspace", json={"name": "Test Workspace", "repo_url": "https://github.com/test/repo"})
    assert response.status_code == 200
    assert response.json()["name"] == "Test Workspace"
    assert "id" in response.json()

def test_import_data_mock():
    # Mock analyst_agent.import_requirements
    import backend.main
    main.analyst_agent.import_requirements = lambda query: [{"id": "1", "title": "Test Doc", "summary": "Summary"}]
    
    # First create workspace
    main.workspaces["test-id"] = {"id": "test-id", "name": "Test", "repo_path": "/tmp/test"}
    
    response = client.post("/import-data", json={"workspace_id": "test-id", "query": "market data"})
    assert response.status_code == 200
    assert response.json()["imported_count"] == 1
