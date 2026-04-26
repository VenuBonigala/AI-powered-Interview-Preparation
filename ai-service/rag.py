from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

index = None
chunks_store = []

def create_chunks(text, chunk_size=300):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)

    return chunks


def build_index(text):
    global index, chunks_store

    chunks = create_chunks(text)
    embeddings = model.encode(chunks)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)

    index.add(np.array(embeddings))
    chunks_store = chunks


def retrieve(query, k=3):
    global index

    if index is None:
        return ["No JD context available"]

    query_embedding = model.encode([query])
    distances, indices = index.search(np.array(query_embedding), k)

    results = [chunks_store[i] for i in indices[0]]
    return results

def similarity_score(answer, ideal):
    emb1 = model.encode([answer])
    emb2 = model.encode([ideal])

    score = np.dot(emb1, emb2.T) / (
        np.linalg.norm(emb1) * np.linalg.norm(emb2)
    )

    return float(score)