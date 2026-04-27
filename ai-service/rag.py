from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

vectorizer = None
chunk_vectors = None
chunks_store = []


def create_chunks(text, chunk_size=300):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)

    return chunks


def build_index(text):
    global vectorizer, chunk_vectors, chunks_store

    chunks = create_chunks(text)

    if not chunks:
        vectorizer = None
        chunk_vectors = None
        chunks_store = []
        return

    vectorizer = TfidfVectorizer(stop_words="english")
    chunk_vectors = vectorizer.fit_transform(chunks)
    chunks_store = chunks


def retrieve(query, k=3):
    global vectorizer, chunk_vectors

    if vectorizer is None or chunk_vectors is None or not chunks_store:
        return ["No JD context available"]

    query_vector = vectorizer.transform([query])
    similarities = cosine_similarity(query_vector, chunk_vectors).flatten()

    top_k_indices = similarities.argsort()[::-1][:k]
    results = [chunks_store[i] for i in top_k_indices]
    return results
