import time
import json
from last_tools import operator
from langchain_google_genai import ChatGoogleGenerativeAI

def split_commands(command_str):
    # Use Gemini LLM to split the multi-function command into a 
    # list of mini commands
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        api_key="AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA"
    )
    prompt = f"""
    You are an AI assistant that splits a multi-function command into a list of mini commands.
    Each mini command should represent a single function command suitable for operator execution.
    Split it into individual commands.
    Here is the prompt for each individual command:
    Prompt :-
    You are an AI assistant that determines which tool should be used based on user commands.
    Available tools:
    1. send_whatsapp_message(recipient, message)
    2. add_calendar_event(user_command) #return the usercommand as arguement
    3. music_control(song_name)  # updated tool for music control
    4. call_whatsapp(recipient)
    5. system_controls(command)  # new tool for system control commands
    6. transaction(details)  # new tool for processing transactions
    7. video_whatsapp(recipient)  # new tool for video WhatsApp call
    8. call_phone(recipient)  # new tool for phone call
    9. take_picture(dummy_input)  # new tool for taking a picture
    10. send_sms_capture(recipient, sms_body)  # new tool for sending SMS and capturing screenshot

    Analyze the given command and output the tool name and its required arguments as a JSON object.
    If the command contains "google" map it to system_controls.
    If arguments are required, place them in "arguments": "arg1": "value1", "arg2": "value2".
    If no arguments are required, output an empty object.
    End of individual Prompt 
    
    

    Keep the tool as tool_name and arguments as arguments it is causing errors in applications
    if only one command is possible then send a single command
    I just need the command in plain text in any other form of any just a list of arrays

    For Example :- 
    Input :- Send message to Prasham hello then search for 10 ten f1 tracks on google
    Output :- ["Send message to Prasham hello" , "search for 10 ten f1 tracks on google"]
    Return the result as a JSON array of strings.

    Input command: "{command_str}"
    """
    response = llm.invoke(prompt)
    cleaned_response = response.content.strip("```json\n").strip("\n```")
    print( "Cleaned Response " , cleaned_response)
    return json.loads(cleaned_response)

def execute_commands(command_str):
    commands = split_commands(command_str)
    print("Commands :- " , commands)
    for cmd in commands:
        operator(cmd)
        time.sleep(5)

if __name__ == '__main__':
    user_input = input("Enter command(s): ")
    execute_commands(user_input)


