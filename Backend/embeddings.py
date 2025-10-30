import chromadb
from chromadb.config import Settings
from langchain_community.embeddings import HuggingFaceEmbeddings
import os
from typing import List


chroma_client = None
collection = None
embeddings_model = None

def initialize_vectorstore():
    """Initialize ChromaDB and embeddings model"""
    global chroma_client, collection, embeddings_model
    
    try:
        print("📥 Loading HuggingFace embeddings model (first time may take a minute)...")
        
       
        embeddings_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        print("Embeddings model loaded!")
        
       
        chroma_client = chromadb.PersistentClient(
            path="./chroma_db",
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
       
        collection = chroma_client.get_or_create_collection(
            name="documind_collection",
            metadata={"description": "Document embeddings for DocuMind"}
        )
        
        print(f"Vector store initialized. Documents in collection: {collection.count()}")
        
    except Exception as e:
        print(f" Error initializing vector store: {str(e)}")
        raise

def create_embeddings(texts: List[str]) -> List[List[float]]:
    """Create embeddings for a list of texts"""
    global embeddings_model
    
    if embeddings_model is None:
        initialize_vectorstore()
    
    try:
        embeddings = embeddings_model.embed_documents(texts)
        return embeddings
    except Exception as e:
        raise Exception(f"Error creating embeddings: {str(e)}")

def add_to_vectorstore(texts: List[str], metadatas: List[dict]):
    """Add text chunks and their embeddings to vector store"""
    global collection
    
    if collection is None:
        initialize_vectorstore()
    
    try:
        # Create embeddings
        print(f" Creating embeddings for {len(texts)} chunks...")
        embeddings = create_embeddings(texts)
        
        # Generate unique IDs for each chunk
        existing_count = collection.count()
        ids = [f"doc_{existing_count + i}" for i in range(len(texts))]
        
        # Add to ChromaDB
        collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"Added {len(texts)} chunks to vector store")
        
    except Exception as e:
        raise Exception(f"Error adding to vector store: {str(e)}")

def query_vectorstore(query: str, n_results: int = 5) -> dict:
    """Query the vector store for relevant documents"""
    global collection, embeddings_model
    
    if collection is None or embeddings_model is None:
        initialize_vectorstore()
    
    try:
        query_embedding = embeddings_model.embed_query(query)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        
        return results
        
    except Exception as e:
        raise Exception(f"Error querying vector store: {str(e)}")

def get_collection_stats():
    """Get statistics about the vector store"""
    global collection
    
    if collection is None:
        return {"count": 0, "status": "not initialized"}
    
    return {
        "count": collection.count(),
        "name": collection.name,
        "status": "active"
    }