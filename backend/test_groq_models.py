from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
keys = os.getenv("GROQ_API_KEYS", "").split(",")
key = keys[0].strip()

client = Groq(api_key=key)
try:
    models = client.models.list()
    for m in models.data:
        print(m.id)
except Exception as e:
    print(f"Error: {e}")
