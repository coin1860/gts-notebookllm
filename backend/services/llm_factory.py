from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from config import config

def get_llm():
    """Returns a ChatOpenAI instance configured with environment variables."""
    return ChatOpenAI(
        model=config.LLM_MODEL,
        api_key=config.LLM_API_KEY,
        base_url=config.LLM_API_URL,
        temperature=0
    )

def get_embeddings():
    """Returns a HuggingFaceEmbeddings instance."""
    # Using sentence-transformers for local embeddings to avoid extra costs/complexity
    return HuggingFaceEmbeddings(model_name=config.EMBEDDING_MODEL)
