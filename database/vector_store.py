import os
import json
import numpy as np

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

from ai_models.huggingface_models import embed_text_hf

STORE_PATH = os.path.join(os.path.dirname(__file__), "faiss_index")
META_PATH = os.path.join(os.path.dirname(__file__), "faiss_metadata.json")


class VectorStore:
    def __init__(self, dim: int = 384):
        self.dim = dim
        self.metadata = []
        if FAISS_AVAILABLE:
            self.index = faiss.IndexFlatL2(dim)
        else:
            self.index = None
            self.vectors = []

    def add(self, text: str, meta: dict):
        """Embed text and add it with metadata to the store."""
        vector = embed_text_hf(text)
        vec_np = np.array(vector, dtype="float32").reshape(1, -1)
        if FAISS_AVAILABLE:
            self.index.add(vec_np)
        else:
            self.vectors.append(vec_np)
        self.metadata.append(meta)

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """Search for the top_k most similar entries to a query."""
        query_vec = np.array(embed_text_hf(query), dtype="float32").reshape(1, -1)
        if FAISS_AVAILABLE and self.index.ntotal > 0:
            distances, indices = self.index.search(query_vec, min(top_k, self.index.ntotal))
            return [{"score": float(distances[0][i]), **self.metadata[indices[0][i]]}
                    for i in range(len(indices[0]))]
        elif not FAISS_AVAILABLE and self.vectors:
            all_vecs = np.vstack(self.vectors)
            dists = np.linalg.norm(all_vecs - query_vec, axis=1)
            top_idx = np.argsort(dists)[:top_k]
            return [{"score": float(dists[i]), **self.metadata[i]} for i in top_idx]
        return []

    def save(self):
        """Persist index and metadata to disk."""
        if FAISS_AVAILABLE:
            faiss.write_index(self.index, STORE_PATH)
        with open(META_PATH, "w") as f:
            json.dump(self.metadata, f)

    def load(self):
        """Load index and metadata from disk."""
        if FAISS_AVAILABLE and os.path.exists(STORE_PATH):
            self.index = faiss.read_index(STORE_PATH)
        if os.path.exists(META_PATH):
            with open(META_PATH) as f:
                self.metadata = json.load(f)


# Singleton instance
vector_store = VectorStore()
