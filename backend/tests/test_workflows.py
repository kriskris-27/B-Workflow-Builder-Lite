from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_create_workflow():
    response = client.post(
        "/api/workflows",
        json={
            "name": "Test Workflow",
            "steps": [
                {"type": "clean", "config": {}},
                {"type": "summarize", "config": {}}
            ]
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Workflow"
    assert len(data["steps"]) == 2
    assert "id" in data

def test_list_workflows():
    response = client.get("/api/workflows")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_templates_list_not_empty():
    response = client.get("/api/templates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["id"] == "notes_insights_tag"

def test_create_workflow_from_template():
    response = client.post(
        "/api/templates/quick_summary/create-workflow",
        json={"name": "Custom Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Custom Name"
    assert len(data["steps"]) == 2
    assert data["steps"][0]["type"] == "clean"

def test_get_workflow_404():
    response = client.get("/api/workflows/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Workflow not found"
