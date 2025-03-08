# from google import genai
# from dotenv import load_dotenv

# load_dotenv()

# client = genai.Client(api_key="AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA")

# response = client.models.generate_content(
#     model="gemini-2.0-flash",
#     contents="Explain how AI works",
# )

# print(response.text)

from tools import add_calendar_event

add_calendar_event("Schdule a meeting with SIH Team Mates on 15 Marsh 2025")