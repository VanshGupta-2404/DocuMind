from groq import Groq
from embeddings import query_vectorstore, initialize_vectorstore
import os
from typing import Tuple, List


groq_client = None

def get_groq_client():
    """Get or create Groq client"""
    global groq_client
    
    if groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        groq_client = Groq(api_key=api_key)
    
    return groq_client

def format_context(results: dict) -> str:
    """Format retrieved documents into context string"""
    documents = results.get('documents', [[]])[0]
    metadatas = results.get('metadatas', [[]])[0]
    
    context_parts = []
    for i, (doc, meta) in enumerate(zip(documents, metadatas)):
        source = meta.get('source', 'Unknown')
        chunk_idx = meta.get('chunk_index', 0)
        context_parts.append(f"[Source: {source}, Part {chunk_idx + 1}]\n{doc}\n")
    
    return "\n---\n".join(context_parts)

def create_prompt(question: str, context: str) -> str:
    """Create prompt for LLM"""
    prompt = f"""You are an intelligent document assistant. Answer the user's question based ONLY on the provided context from the documents. 

If the answer cannot be found in the context, politely say "I don't have enough information in the uploaded documents to answer that question."

Be concise, accurate, and cite which document you're referencing when possible.

Context from documents:
{context}

User Question: {question}

Answer:"""
    
    return prompt

def extract_sources(results: dict) -> List[dict]:
    """Extract source information from query results"""
    metadatas = results.get('metadatas', [[]])[0]
    documents = results.get('documents', [[]])[0]
    distances = results.get('distances', [[]])[0]
    
    sources = []
    seen_sources = set()
    
    for meta, doc, distance in zip(metadatas, documents, distances):
        source_name = meta.get('source', 'Unknown')
        
        if source_name not in seen_sources:
            sources.append({
                "filename": source_name,
                "chunk_index": meta.get('chunk_index', 0),
                "relevance_score": round(1 - distance, 3),
                "preview": doc[:150] + "..." if len(doc) > 150 else doc
            })
            seen_sources.add(source_name)
    
    return sources

def query_documents(question: str) -> Tuple[str, List[dict]]:
    """
    Main query function: Retrieval + Generation (RAG)
    Returns: (answer, sources)
    """
    try:
        initialize_vectorstore()
        
        results = query_vectorstore(question, n_results=5)
        
        if not results.get('documents') or not results['documents'][0]:
            return (
                "I don't have any documents uploaded yet. Please upload some documents first.",
                []
            )
        
        context = format_context(results)
        
        prompt = create_prompt(question, context)
        
        client = get_groq_client()
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",  
            temperature=0.7,
            max_tokens=1024,
        )
        
        answer = chat_completion.choices[0].message.content
        
        sources = extract_sources(results)
        
        return answer, sources
        
    except Exception as e:
        return f"Error processing query: {str(e)}", []