from typing import Dict, List
from backend.services.integration_service import get_integration_client
from backend.services.rag_service import rag_service

class AnalystAgent:
    def __init__(self):
        self.integration_client = get_integration_client()

    def import_requirements(self, query: str = "") -> List[Dict]:
        """Fetches requirements, summarizes them, and stores in RAG."""
        
        # 1. Fetch from source
        print(f"AnalystAgent: Fetching requirements with query '{query}'...")
        requirements = self.integration_client.fetch_requirements(query)
        
        imported_docs = []
        
        # 2. Process each requirement
        for req in requirements:
            print(f"AnalystAgent: Processing '{req['title']}'...")
            
            # 3. Summarize & Ingest
            doc_id = rag_service.ingest_document(
                content=req["content"],
                title=req["title"],
                source="Jira/Confluence" # In a real app, this would be the URL
            )
            
            imported_docs.append({
                "id": doc_id,
                "title": req["title"],
                "summary": rag_service.vector_store.get(doc_id)["documents"][0] # Simple way to get summary back if needed
            })
            
        print(f"AnalystAgent: Imported {len(imported_docs)} documents.")
        return imported_docs

analyst_agent = AnalystAgent()
