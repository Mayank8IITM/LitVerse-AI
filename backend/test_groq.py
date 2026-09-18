from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
keys = os.getenv("GROQ_API_KEYS", "").split(",")

for key in keys:
    key = key.strip()
    if not key: continue
    print(f"Testing Groq key ending in {key[-4:]}...")
    try:
        client = Groq(api_key=key)
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hello"}],
            model="llama3-8b-8192"
        )
        print(f"  -> SUCCESS! Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"  -> ERROR: {e}")
