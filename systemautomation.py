import os
import datetime
import time
import subprocess
import re
import json
from google import genai
from google.genai import types

#############################################
# CONFIGURATION
#############################################
# For a wired connection, set your device's USB serial (as shown by "adb devices")
DEVICE_SERIAL = "ZY322LFB7J"   # e.g., "ZY2245X9LQ" (update with your device's USB serial)
GEMINI_API_KEY = "AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA"   # Replace with your Gemini API key
EXECUTION_LOG = "executed_commands.json"  # Log file for executed commands

#############################################
# ADB HELPER FUNCTIONS
#############################################
def check_device():
    """Check that the device is connected via USB."""
    print("Checking connected devices...")
    result = subprocess.run(["adb", "devices"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    print(result.stdout)
    if DEVICE_SERIAL not in result.stdout:
        print(f"Device {DEVICE_SERIAL} is not connected via USB. Please connect your device.")
    else:
        print(f"Device {DEVICE_SERIAL} is connected.")

def run_adb_command(cmd_list):
    """Execute an ADB command for the specified device."""
    if cmd_list[0] == "adb":
        # Insert device specification for wired connection
        cmd_list.insert(1, "-s")
        cmd_list.insert(2, DEVICE_SERIAL)
    result = subprocess.run(cmd_list, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return result.stdout.strip(), result.stderr.strip(), result.returncode

#############################################
# SCREENSHOT & LOGGING FUNCTIONS
#############################################
def capture_screenshot(folder="ss"):
    """Capture a screenshot from the device and return the local file path."""
    os.makedirs(folder, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screen_{timestamp}.png"
    screenshot_path = os.path.join(folder, filename)
    run_adb_command(["adb", "shell", "screencap", "-p", "/sdcard/screen.png"])
    run_adb_command(["adb", "pull", "/sdcard/screen.png", screenshot_path])
    run_adb_command(["adb", "shell", "rm", "/sdcard/screen.png"])
    print(f"Screenshot saved as {screenshot_path}")
    return screenshot_path

def load_execution_log():
    if os.path.exists(EXECUTION_LOG):
        with open(EXECUTION_LOG, "r") as file:
            return json.load(file)
    return {}

def save_execution_log(log_data):
    with open(EXECUTION_LOG, "w") as file:
        json.dump(log_data, file, indent=4)

def get_screen_resolution():
    out, err, _ = run_adb_command(["adb", "shell", "wm", "size"])
    try:
        parts = out.split(":")[-1].strip().split("x")
        return parts[0], parts[1]
    except Exception as e:
        print("Error parsing screen resolution:", e)
        return "1080", "2340"

#############################################
# DIRECT COMMAND MAPPING
#############################################
def map_command(user_input):
    """
    Check for common system instructions and return a built-in ADB command.
    Adjust brightness: if not working, consider using 'settings put secure ...'
    """
    cmd = user_input.lower()
    # Brightness (e.g., "reduce brightness to 50%")
    if "brightness" in cmd:
        match = re.search(r'(\d+)', cmd)
        if match:
            percent = int(match.group(1))
            brightness = int((percent / 100) * 255)
            return f"adb shell settings put system screen_brightness {brightness}"
    # Volume (e.g., "set volume to 70%")
    if "volume" in cmd:
        match = re.search(r'(\d+)', cmd)
        if match:
            percent = int(match.group(1))
            # Assume max volume is 15
            vol = max(0, min(15, int((percent / 100) * 15)))
            return f"adb shell media volume --show --stream 3 --set {vol}"
    # Wi-Fi toggling
    if "wifi" in cmd:
        if "disable" in cmd:
            return "adb shell svc wifi disable"
        elif "enable" in cmd:
            return "adb shell svc wifi enable"
    # Mobile data toggling
    if "mobile data" in cmd:
        if "disable" in cmd:
            return "adb shell svc data disable"
        elif "enable" in cmd:
            return "adb shell svc data enable"
    # Open camera (built-in intent)
    if "open camera" in cmd and ("take a photo" in cmd or "capture" in cmd):
        return "adb shell am start -a android.media.action.IMAGE_CAPTURE"
    # Google search (built-in intent)
    if "search google for" in cmd:
        query = cmd.split("search google for", 1)[1].strip().replace(" ", "+")
        return f'adb shell am start -a android.intent.action.VIEW -d "https://www.google.com/search?q={query}"'
    return None

#############################################
# GEMINI AI COMMAND GENERATION (Fallback)
#############################################
def extract_adb_command(response_text):
    """Extract the exact ADB command from the AI response text."""
    if "```" in response_text:
        start = response_text.find("```") + 3
        end = response_text.find("```", start)
        if end != -1:
            return response_text[start:end].strip()
    index = response_text.find("adb shell")
    if index != -1:
        return response_text[index:].splitlines()[0].strip()
    return response_text.strip()

def generate_command(user_input, screenshot_path=None):
    """Generate an ADB command using Gemini AI if no direct mapping exists."""
    width, height = get_screen_resolution()
    contents = [
        types.Content(role="user", parts=[types.Part.from_text(text="hey")]),
        types.Content(role="model", parts=[types.Part.from_text(text="Okay, I'm ready to help. What's your task?")]),
        types.Content(role="user", parts=[types.Part.from_text(text=user_input)])
    ]
    if screenshot_path:
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=f"Screenshot path: {screenshot_path}")]))
    
    system_instr = (
        "You are an AI assistant that controls an Android device via ADB. "
        "The user will provide a natural language system instruction, and you must output only the exact ADB shell command for the next required step, with no extra text or explanation. "
        "Valid commands include:\n"
        "  - 'adb shell am start -n <package>/<activity>' for launching apps,\n"
        "  - 'adb shell input tap x y' for tapping,\n"
        "  - 'adb shell input swipe x1 y1 x2 y2 [duration]' for swiping,\n"
        "  - 'adb shell input text \"your_text\"' for text input,\n"
        "  - 'adb shell svc wifi disable/enable' for Wi-Fi toggling, etc.\n"
        "If a screenshot shows a step is already complete, output only the command for the next step. "
        "If a fresh screenshot is needed, output 'ss'. If the task is complete, output 'end'.\n\n"
        f"The device screen resolution is {width} x {height}. Temperature is set to 2. "
        "Think carefully and output only the exact ADB command for the next step."
    )
    
    generate_config = types.GenerateContentConfig(
        temperature=2,
        top_p=0.9,
        top_k=40,
        max_output_tokens=256,
        response_mime_type="text/plain",
        system_instruction=[types.Part.from_text(text=system_instr)]
    )
    
    client = genai.Client(api_key=GEMINI_API_KEY)
    model = "gemini-2.0-flash"
    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_config,
    ):
        response_text += chunk.text
    return extract_adb_command(response_text)

#############################################
# COMMAND EXECUTION & LOGGING
#############################################
def execute_adb_command(adb_command):
    """
    Execute the given ADB command and return status.
    Automatically prefixes the command if needed.
    """
    # Remove backticks and whitespace
    adb_command = adb_command.replace("`", "").strip()
    # If command doesn't start with "adb shell" but starts with svc, am, or input, prefix it.
    if not adb_command.startswith("adb shell"):
        if adb_command.startswith("svc") or adb_command.startswith("am") or adb_command.startswith("input"):
            adb_command = f"adb -s {DEVICE_SERIAL} shell {adb_command}"
    print(f"Executing: {adb_command}")
    ret = os.system(adb_command)
    if ret == 0:
        print("✅ Command executed successfully.")
        return "DONE"
    else:
        print("❌ Command execution failed.")
        return "FAILED"

#############################################
# MAIN FUNCTION
#############################################
def main():
    executed_commands = {}
    if os.path.exists(EXECUTION_LOG):
        with open(EXECUTION_LOG, "r") as file:
            executed_commands = json.load(file)
    
    check_device()
    
    while True:
        user_input = input("\nEnter a system instruction (or type 'exit' to quit): ").strip()
        if user_input.lower() == "exit":
            print("Exiting automation system.")
            break
        
        # Try direct mapping first
        base_cmd = map_command(user_input)
        if base_cmd:
            print("Direct mapping found. Using base command:")
            adb_command = base_cmd
        else:
            screenshot_path = capture_screenshot()
            print("Sending screenshot info to AI for processing...")
            adb_command = generate_command(user_input, screenshot_path=screenshot_path)
            print("AI responded with command:", adb_command)
        
        if adb_command.lower() == "end":
            print("Task complete. Exiting.")
            break
        
        if adb_command in executed_commands:
            print("Command already attempted. Skipping re-execution.")
            continue
        
        result = execute_adb_command(adb_command)
        executed_commands[adb_command] = "success" if result == "DONE" else "failed"
        with open(EXECUTION_LOG, "w") as file:
            json.dump(executed_commands, file, indent=4)
        time.sleep(2)

if __name__ == "__main__":
    main()
