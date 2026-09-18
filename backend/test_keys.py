import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
keys = os.getenv("GEMINI_API_KEYS", "").split(",")

for key in keys:
    key = key.strip()
    if not key: continue
    print(f"Testing key ending in {key[-4:]}...")
    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel('gemini-3.6-flash')
        response = model.generate_content("Hello")
        print(f"  -> SUCCESS! Response: {response.text}")
    except Exception as e:
        print(f"  -> ERROR: {e}")
