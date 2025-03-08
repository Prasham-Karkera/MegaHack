import subprocess
import datetime
import time
import os
import base64
from google import genai
from google.genai import types
import re

def generate(prompt):
    client = genai.Client(
        api_key="AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA"
    )
    model = "gemini-2.0-flash-exp"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=2,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(text="""you are an ai agent whose purpose is to schedule events on google calendar using intents,
            if u are provided with the time then return "Option1"
            use yyyy-mm-dd format for date, and 24hour format for 
            return me in json format
            {
            "option": "1",
            "event_name": "full team meet",
            "event_date": "2025-08-17",
            "event_time": "14:30"
            }
            if no time is provided that means it is supposed to be an all day task or else it is specified that it is an all day task then return "Option2"
            use yyyy-mm-dd format for date, and 24hour format for 
            return me in json format
            {
            "option": "2",
            "event_name": "full team meet",
            "event_date": "2025-08-17"
            }
            return the json object.
            """),
        ],
    )
    output = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        output += chunk.text
    return output

def run_adb_command(command):
    try:
        process = subprocess.run(command, capture_output=True, text=True, check=True)
        print("Output:", process.stdout)
    except subprocess.CalledProcessError as e:
        print("Error:", e.stderr)

def set_calendar_event(task, date_str, all_day=False):
    try:
        if all_day:
            dt_start = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            timestamp_start = int(dt_start.timestamp() * 1000)
            dt_end = dt_start + datetime.timedelta(days=1)
            timestamp_end = int(dt_end.timestamp() * 1000)
        else:
            dt_start = datetime.datetime.strptime(date_str, "%Y-%m-%d %H:%M")
            timestamp_start = int(dt_start.timestamp() * 1000)
            dt_end = dt_start + datetime.timedelta(hours=1)
            timestamp_end = int(dt_end.timestamp() * 1000)
    except ValueError:
        if all_day:
            print("Error parsing date string. Please use 'YYYY-MM-DD' format for all-day events.")
        else:
            print("Error parsing date string. Please use 'YYYY-MM-DD HH:MM' format for timed events.")
        return

    adb_command = [
        "adb", "shell", "am", "start",
        "-a", "android.intent.action.INSERT",
        "-d", "content://com.android.calendar/events",
        "--el", "beginTime", str(timestamp_start),
        "--el", "endTime", str(timestamp_end),
        "--es", "title", f"\"{task}\"",
        "--es", "eventLocation", "\"Office\"",
        "--es", "description", f"\"Scheduled task: {task}\"",
        "--ez", "allDay", "true" if all_day else "false"
    ]

    print("Sending event creation command to Google Calendar...")
    run_adb_command(adb_command)

    time.sleep(3)
    adb_command_save = f'adb shell input tap 950 200'
    os.system(adb_command_save)

def set_calendar_event_with_time(task, date_str, time_str):
    try:
        dt_start = datetime.datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        timestamp_start = int(dt_start.timestamp() * 1000)
        dt_end = dt_start + datetime.timedelta(hours=1)
        timestamp_end = int(dt_end.timestamp() * 1000)
    except ValueError:
        print("Error parsing date or time string. Please use 'YYYY-MM-DD' format for date and 'HH:MM' format for time.")
        return

    adb_command = [
        "adb", "shell", "am", "start",
        "-a", "android.intent.action.INSERT",
        "-d", "content://com.android.calendar/events",
        "--el", "beginTime", str(timestamp_start),
        "--el", "endTime", str(timestamp_end),
        "--es", "title", f"\"{task}\"",
        "--es", "eventLocation", "\"Office\"",
        "--es", "description", f"\"Scheduled task: {task}\"",
        "--ez", "allDay", "false"
    ]

    print("Sending event creation command to Google Calendar...")
    run_adb_command(adb_command)

    time.sleep(3)
    adb_command_save = f'adb shell input tap 950 200'
    os.system(adb_command_save)

def calendar_stuff(prompt):
    res = generate(prompt)
    json_pattern = re.compile(r'\{.*?\}', re.DOTALL)
    match = json_pattern.search(res)
    if match:
        json_object = match.group(0)
        print(json_object)
        
        if '"option": "1"' in json_object:
            event_name = re.search(r'"event_name":\s*"(.*?)"', json_object).group(1)
            event_date = re.search(r'"event_date":\s*"(.*?)"', json_object).group(1)
            event_time = re.search(r'"event_time":\s*"(.*?)"', json_object).group(1)
            set_calendar_event_with_time(event_name, event_date, event_time)
        elif '"option": "2"' in json_object:
            event_name = re.search(r'"event_name":\s*"(.*?)"', json_object).group(1)
            event_date = re.search(r'"event_date":\s*"(.*?)"', json_object).group(1)
            set_calendar_event(event_name, event_date, all_day=True)
    else:
        print("No valid JSON object found in the response.")

# if __name__ == "__main__":
#     # prompt = input("Enter the stuff: ")
#     prompt = "Schedule a meeting with the team on 2025-03-15 at 2:30 PM."
#     calendar_stuff(prompt)


