# from google import genai
# from dotenv import load_dotenv

# load_dotenv()

# client = genai.Client(api_key="AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA")

# response = client.models.generate_content(
#     model="gemini-2.0-flash",
#     contents="Explain how AI works",
# )

# print(response.text)

from tools import take_picture

take_picture("Hello")