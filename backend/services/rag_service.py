from typing import List, Dict, Optional
import uuid
import logging

# Ensure chromadb is imported
import chromadb
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import config
from services.llm_factory import get_llm, get_embeddings

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.llm = get_llm()
        self.embeddings = get_embeddings()
        self.vector_store = Chroma(
            collection_name="workspace_knowledge",
            embedding_function=self.embeddings,
            persist_directory=f"{config.WORKSPACES_DIR}/chroma_db"
        )

    def generate_llmtxt(self, content: str) -> str:
        """Summarizes raw content into a high-level Markdown summary (llmtxt)."""
        prompt = PromptTemplate.from_template(
            """
            You are an expert technical writer. Summarize the following technical document into a concise Markdown summary.
            Focus on the key requirements, architectural decisions, and constraints.
            Keep the summary structured and easy for an AI agent to understand.
            
            Document:
            {content}
            
            Summary:
            """
        )
        chain = prompt | self.llm | StrOutputParser()
        return chain.invoke({"content": content})

    def ingest_document(self, content: str, title: str, source: str) -> str:
        """Ingests a document into the vector store."""
        summary = self.generate_llmtxt(content)
        
        doc_id = str(uuid.uuid4())
        
        # Store the full content with metadata
        # We might want to chunk large documents, but for MVP we assume reasonable size
        doc = Document(
            page_content=summary, # Indexing the summary for better semantic search relevance
            metadata={
                "id": doc_id,
                "title": title,
                "source": source,
                "full_content": content, # Storing full content in metadata to retrieve later
                "type": "summary"
            }
        )
        
        self.vector_store.add_documents([doc])
        return doc_id

    def query_knowledge(self, query: str, k: int = 3) -> List[Dict]:
        """Retrieves relevant documents based on the query."""
        results = self.vector_store.similarity_search(query, k=k)
        
        documents = []
        for res in results:
            documents.append({
                "id": res.metadata.get("id"),
                "title": res.metadata.get("title"),
                "source": res.metadata.get("source"),
                "summary": res.page_content,
                "full_content": res.metadata.get("full_content")
            })
        return documents

rag_service = RAGService()
