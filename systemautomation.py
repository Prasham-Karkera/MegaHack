import os
from google import genai
from google.genai import types

# CONFIGURATION
DEVICE_SERIAL = "ZY322LFB7J"  # Update with your device's USB serial
GEMINI_API_KEY = "AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA"  # Replace with your Gemini API key


system_prompt = """
You are an AI assistant that controls an Android device via ADB. 
The user provides natural language system instructions for various tasks, including adjusting brightness, volume, toggling Wi-Fi/mobile data, launching apps, taking photos, and performing Google searches. 
Output only the exact ADB shell command for the next required step, with no extra text or explanation. 
Valid commands include:
  - 'adb shell am start -n <package>/<activity>' to launch an app,
  - 'adb shell input tap x y' to simulate a tap,
  - 'adb shell input swipe x1 y1 x2 y2 [duration]' for swiping,
  - 'adb shell input text "your_text"' for text input,
  - 'adb shell svc wifi disable/enable' for Wi-Fi toggling,
  - 'adb shell media volume --show --stream 3 --set <value>' for volume,
  - 'adb shell settings put system screen_brightness <value>' for brightness,
  - For Google search, use: adb shell am start -a android.intent.action.VIEW -d "https://www.google.com/search?q={query.replace(" ", "%20")}"

The device screen resolution is 1080 x 2340. Temperature is set to 2. 
Think carefully and output only the exact ADB command for the next required step.
"""

# Get natural language instruction from the user
instruction = input("Enter your calendar event instruction: ")

# Build the request for Gemini
contents = [
    types.Content(role="user", parts=[types.Part.from_text(text=instruction)])
]
config = types.GenerateContentConfig(
    temperature=2,
    top_p=0.9,
    top_k=40,
    max_output_tokens=256,
    system_instruction=system_prompt
)

# Call Gemini to generate the ADB command
client = genai.Client(api_key=GEMINI_API_KEY)
model = "gemini-2.0-flash"
response = client.models.generate_content(model=model, contents=contents, config=config)
response_text = response.text

# Assume the LLM output is exactly the command needed
adb_command = response_text.strip()
print("Generated ADB command:")
print(adb_command)

# Ensure the command includes the device specification
if not adb_command.startswith("adb -s"):
    parts = adb_command.split()
    if parts[0] == "adb":
        parts.insert(1, "-s")
        parts.insert(2, DEVICE_SERIAL)
    adb_command = " ".join(parts)

# Execute the generated ADB command
print("Executing command...")
ret = os.system(adb_command)
if ret == 0:
    print("Command executed successfully.")
else:
    print("Command execution failed.")
