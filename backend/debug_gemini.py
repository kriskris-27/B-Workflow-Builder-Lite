import os
from google import genai
import asyncio

async def test_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("MISSING API KEY")
        return
    
    client = genai.Client(api_key=api_key)
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents="Hello"
        )
        print("SUCCESS:", response.text)
    except Exception as e:
        print("FAILURE:", str(e))

if __name__ == "__main__":
    asyncio.run(test_gemini())
