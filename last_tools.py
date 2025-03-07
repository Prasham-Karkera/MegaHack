from langchain_google_genai import ChatGoogleGenerativeAI
from tools import send_whatsapp_message, add_calendar_event, music_control, call_whatsapp, system_controls, transaction, video_whatsapp, call_phone, take_picture  # added new tools
import json

def operator(c):
    # Define available tools
    tool_mapping = {
        "send_whatsapp_message": send_whatsapp_message.func,
        "add_calendar_event": add_calendar_event.func,
        "music_control": music_control.func,  # updated tool mapping
        "call_whatsapp": call_whatsapp.func,
        "system_controls": system_controls.func,
        "transaction": transaction.func,  # added new tool for transaction
        "video_whatsapp": video_whatsapp.func,  # added new tool for video WhatsApp call
        "call_phone": call_phone.func,  # added new tool for phone call
        "take_picture": take_picture.func  # added new tool for taking a picture
    }

    # Initialize LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash", api_key="AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA")

    # Get user command
    user_command = c

    # Ask LLM to determine tool and arguments
    llm_prompt = f"""
    You are an AI assistant that determines which tool should be used based on user commands.
    Available tools:
    1. send_whatsapp_message(recipient, message)
    2. add_calendar_event(event_name, date, time)
    3. music_control(song_name)  # updated tool for music control
    4. call_whatsapp(recipient)
    5. system_controls(command)  # new tool for system control commands
    6. transaction(details)  # new tool for processing transactions
    7. video_whatsapp(recipient)  # new tool for video WhatsApp call
    8. call_phone(recipient)  # new tool for phone call
    9. take_picture(dummy_input)  # new tool for taking a picture

    Analyze the given command and output the tool name and its required arguments as a JSON object.
    If google is there map it to system controls
    If arguments are required, give them in 'arguments': 'argument1': 'value1'
    If no argurments are required, give an empty object .
    Now analyze this command:
    "{user_command}"
    """

    response = llm.invoke(llm_prompt)

    print("\n")
    print(response)
    print("\n")

    # Clean and parse JSON response
    cleaned_response = response.content.strip("```json\n").strip(
        "\n```")  # Remove code block formatting
    response_data = json.loads(cleaned_response)  # Parse JSON

    print(response_data)

    # Extract tool name and arguments
    tool_name = response_data.get("tool_name")
    tool_args = response_data.get("arguments", {})

    print(tool_name)
    print(tool_args)
    # take_picture("Input")
    if tool_name in tool_mapping:
        if tool_args:
            result = tool_mapping[tool_name](**tool_args)
        else:
            result = tool_mapping[tool_name]()
            # print("No arguments provided.")
        print("Tool Result:", result)
    else:
        print("No matching tool found.")

# c = input("Enter command: ")
# operator(c)
