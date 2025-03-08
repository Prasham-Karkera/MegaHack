from langchain_google_genai import ChatGoogleGenerativeAI
from tools import send_whatsapp_message, add_calendar_event, music_control, call_whatsapp, system_controls, transaction, video_whatsapp, call_phone, take_picture , send_sms_capture
import json




def operator(c):
    tool_mapping = {
        "send_whatsapp_message": send_whatsapp_message.func,
        "add_calendar_event": add_calendar_event,
        "music_control": music_control.func,  
        "call_whatsapp": call_whatsapp.func,
        "system_controls": system_controls.func,
        "transaction": transaction.func,  
        "video_whatsapp": video_whatsapp.func,  
        "call_phone": call_phone.func,  
        "take_picture": take_picture.func,
        "send_sms_capture": send_sms_capture.func  
    }

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash", api_key="AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA")

    user_command = c

    llm_prompt = f"""
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

    Now analyze this command:
    "{user_command}"
    """

    response = llm.invoke(llm_prompt)

    print("\n")
    print(response)
    print("\n")

    cleaned_response = response.content.strip("```json\n").strip(
        "\n```")  
    response_data = json.loads(cleaned_response)  

    print(response_data)

    tool_name = response_data.get("tool_name")
    tool_args = response_data.get("arguments", {})

    print(tool_name)
    print(tool_args)
    # print(tool_args["user_command"])
    # take_picture("Input")
    if tool_name == "add_calendar_event":
        add_calendar_event(tool_args["user_command"])
        return tool_name
    if tool_name in tool_mapping:
        if tool_args:
            result = tool_mapping[tool_name](**tool_args)
        else:
            result = tool_mapping[tool_name]()
        print("Tool Result:", result)
    else:
        print("No matching tool found.")

    return tool_name

# c = input("Enter command: ")
# operator(c)
