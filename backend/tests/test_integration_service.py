import sys
from unittest.mock import MagicMock

# Optional: Handle missing dependency in restricted environments
try:
    import dotenv
except ImportError:
    mock_dotenv = MagicMock()
    sys.modules["dotenv"] = mock_dotenv

import pytest
from services.integration_service import MockIntegrationClient

def test_fetch_requirements_no_query():
    client = MockIntegrationClient()
    requirements = client.fetch_requirements("")
    assert len(requirements) == 4

def test_fetch_requirements_none_query():
    client = MockIntegrationClient()
    requirements = client.fetch_requirements(None)
    assert len(requirements) == 4

def test_fetch_requirements_with_query_title_match():
    client = MockIntegrationClient()
    requirements = client.fetch_requirements("Market Data Module")
    assert len(requirements) == 1
    assert requirements[0]["id"] == "REQ-001"

def test_fetch_requirements_with_query_content_match():
    client = MockIntegrationClient()
    # CSVFeed appears in REQ-001 and REQ-004
    requirements = client.fetch_requirements("CSVFeed")
    assert len(requirements) == 2
    assert any(r["id"] == "REQ-001" for r in requirements)
    assert any(r["id"] == "REQ-004" for r in requirements)

def test_fetch_requirements_case_insensitive():
    client = MockIntegrationClient()
    requirements = client.fetch_requirements("market data")
    assert len(requirements) >= 1
    assert any(r["id"] == "REQ-001" for r in requirements)

    requirements = client.fetch_requirements("MARKET DATA")
    assert len(requirements) >= 1
    assert any(r["id"] == "REQ-001" for r in requirements)

def test_fetch_requirements_no_match():
    client = MockIntegrationClient()
    requirements = client.fetch_requirements("Non-existent-string-12345")
    assert len(requirements) == 0

def test_fetch_requirements_multiple_matches():
    client = MockIntegrationClient()
    # "Module" appears in all 4 requirements (titles or content)
    requirements = client.fetch_requirements("Module")
    assert len(requirements) == 4
