from langchain_google_genai import ChatGoogleGenerativeAI
from tools import send_whatsapp_message, add_calendar_event, play_spotify_music

# Define available tools
tools = [send_whatsapp_message, add_calendar_event, play_spotify_music]

# Initialize LLM with tools
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key="AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA")
llm_with_tools = llm.bind_tools(tools)

# Get user input
user_prompt = input("Enter command: ")
response = llm_with_tools.invoke(user_prompt)

# print(response)
# print(response.tool_calls)


tool_name = response.tool_calls[0]["name"]
tool_args = response.tool_calls[0]["args"]


print("Tool Name:", tool_name)
print("Tool Arguments:", tool_args)

# Tool mapping
tool_mapping = {
    "send_whatsapp_message": send_whatsapp_message.func,
    "add_calendar_event": add_calendar_event.func,
    "play_spotify_music": play_spotify_music.func
}

# Call the correct function dynamically
if tool_name in tool_mapping:
    tool_result = tool_mapping[tool_name](**tool_args)
    print("Tool Result:", tool_result)
else:
    print("No tool found with name:", tool_name)
