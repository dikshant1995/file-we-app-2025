import chromadb

CHROMA_PATH = "laxmi_vector_db"

def list_collections():
    try:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        collections = client.list_collections()
        for col in collections:
            print(f"Collection: {col.name} | Count: {col.count()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_collections()
