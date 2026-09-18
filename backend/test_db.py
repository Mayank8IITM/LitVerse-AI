from app.db.database import SessionLocal
from app.models.vocab import VocabWord

db = SessionLocal()
try:
    count = db.query(VocabWord).count()
    print(f"Vocab words count: {count}")
except Exception as e:
    print(f"Error: {e}")
