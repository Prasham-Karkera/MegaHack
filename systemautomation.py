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
# For a wired connection, set your device's USB serial (as seen in "adb devices")
DEVICE_SERIAL = "ADD YOUR DEVICE NAME"   # e.g., "ZY2245X9LQ" – update with your device's USB serial
GEMINI_API_KEY = "AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA"   # Replace with your actual Gemini API key
EXECUTION_LOG = "executed_commands.json"  # Log file to track executed commands

# Global state for camera tasks
camera_opened = False

#############################################
# ADB HELPER FUNCTIONS
#############################################
def check_device():
    """Check that the device is connected via USB."""
    print("Checking connected devices...")
    result = subprocess.run(["adb", "devices"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    print(result.stdout)
    if DEVICE_SERIAL not in result.stdout:
        print(f"Device {DEVICE_SERIAL} is not connected. Please connect your device via USB.")
    else:
        print(f"Device {DEVICE_SERIAL} is connected.")

def run_adb_command(cmd_list):
    """Execute an ADB command for the specified device."""
    if cmd_list[0] == "adb":
        # Insert device specification
        cmd_list.insert(1, "-s")
        cmd_list.insert(2, DEVICE_SERIAL)
    result = subprocess.run(cmd_list, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return result.stdout.strip(), result.stderr.strip(), result.returncode

#############################################
# SCREENSHOT & LOGGING FUNCTIONS
#############################################
def capture_screenshot(folder="ss"):
    """Capture a screenshot from the device and return its file path."""
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
    """Load executed commands log from file."""
    if os.path.exists(EXECUTION_LOG):
        with open(EXECUTION_LOG, "r") as file:
            return json.load(file)
    return {}

def save_execution_log(log_data):
    """Save executed commands log to file."""
    with open(EXECUTION_LOG, "w") as file:
        json.dump(log_data, file, indent=4)

def get_screen_resolution():
    """Get the device's screen resolution."""
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
    Return a built-in ADB command if the user input matches a common system instruction.
    Handles brightness, volume, Wi-Fi, mobile data, camera (open only), and Google search.
    """
    cmd = user_input.lower()
    # Brightness adjustments
    if "brightness" in cmd:
        if "low" in cmd:
            return "adb shell settings put system screen_brightness 51"  # 20% brightness
        if "off" in cmd or "min" in cmd:
            return "adb shell settings put system screen_brightness 0"
        if "high" in cmd:
            return "adb shell settings put system screen_brightness 230"  # ~90% brightness
        match = re.search(r'(\d+)%', cmd)
        if match:
            percent = int(match.group(1))
            brightness = int((percent / 100) * 255)
            return f"adb shell settings put system screen_brightness {brightness}"
    # Volume adjustments
    if "volume" in cmd:
        if "mute" in cmd or "no volume" in cmd:
            return "adb shell media volume --show --stream 3 --set 0"
        if "low" in cmd:
            return "adb shell media volume --show --stream 3 --set 3"  # 20% volume
        match = re.search(r'(\d+)%', cmd)
        if match:
            percent = int(match.group(1))
            vol = max(0, min(15, int((percent / 100) * 15)))
            return f"adb shell media volume --show --stream 3 --set {vol}"
    # Wi-Fi toggling
    if "wifi" in cmd:
        if "disable" in cmd or "off" in cmd:
            return "adb shell svc wifi disable"
        elif "enable" in cmd or "on" in cmd:
            return "adb shell svc wifi enable"
    # Mobile Data toggling
    if "mobile data" in cmd:
        if "disable" in cmd or "off" in cmd:
            return "adb shell svc data disable"
        elif "enable" in cmd or "on" in cmd:
            return "adb shell svc data enable"
    # Camera: for "open camera" but not capturing photo
    if "open camera" in cmd and "take" not in cmd and "capture" not in cmd:
        return "adb shell am start -a android.media.action.IMAGE_CAPTURE"
    # Camera: For capturing photo if instruction includes "take a photo" or "capture photo"
    if "take a photo" in cmd or "capture photo" in cmd:
        return "adb shell am start -a android.media.action.IMAGE_CAPTURE"
    # Google search
    if "search google for" in cmd:
        query = cmd.split("search google for", 1)[1].strip().replace(" ", "+")
        return f'adb shell am start -a android.intent.action.VIEW -d "https://www.google.com/search?q={query}"'
    return None

#############################################
# GEMINI AI COMMAND GENERATION (Fallback)
#############################################
def extract_adb_command(response_text):
    """Extract only the exact ADB command from the AI response."""
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
    """
    Generate an ADB command using Gemini AI if no direct mapping is found.
    The system prompt is extensive and dynamic.
    """
    width, height = get_screen_resolution()
    contents = [
        types.Content(role="user", content="hey"),
        types.Content(role="model", content="Okay, I'm ready to help. What's your task?"),
        types.Content(role="user", content=user_input)
    ]
    if screenshot_path:
        contents.append(types.Content(role="user", content=f"Screenshot path: {screenshot_path}"))
    
    system_instr = (
               "You are an AI assistant that controls an Android device via ADB. "
        "The user provides natural language system instructions for various tasks, including adjusting brightness, volume, toggling Wi-Fi/mobile data, launching apps, taking photos, and performing Google searches. "
        "Output only the exact ADB shell command for the next required step, with no extra text or explanation. "
        "Valid commands include:\n"
    
        "  - 'adb shell am start -n <package>/<activity>' to launch an app,\n"
        "  - 'adb shell input tap x y' to simulate a tap,\n"
        "  - 'adb shell input swipe x1 y1 x2 y2 [duration]' for swiping,\n"
        "  - 'adb shell input text \"your_text\"' for text input,\n"
        "  - 'adb shell svc wifi disable/enable' for Wi-Fi toggling,\n"
        "  - 'adb shell media volume --show --stream 3 --set <value>' for volume,\n"
        "  - 'adb shell settings put system screen_brightness <value>' for brightness,\n"
        "  - For Google search, use: adb shell am start -a android.intent.action.VIEW -d \"https://www.google.com/search?q={query.replace(' ', '%20')}\"\n\n"
        "The device screen resolution is 1080 x 2340. Temperature is set to 2. "
        "Think carefully and output only the exact ADB command for the next required step."
    )
    
    generate_config = types.GenerateContentConfig(
        temperature=2,
        top_p=0.9,
        top_k=40,
        max_output_tokens=256,
        response_mime_type="text/plain",
        system_instruction=[types.Part(text=system_instr)]
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
# SPECIAL CAMERA FLOW (For Capturing Photo)
#############################################
def camera_flow(user_input):
    """
    Dedicated flow for taking a photo. This function loops—capturing a fresh screenshot and sending an updated instruction
    to Gemini (e.g., "The camera is open. Now tap the shutter button to take the photo.")—until the shutter tap command executes successfully.
    """
    global camera_opened
    # Step 1: Open the camera if not already open.
    if not camera_opened:
        print("Opening camera...")
        cmd_open = "adb shell am start -a android.media.action.IMAGE_CAPTURE"
        result = execute_adb_command(cmd_open)
        if result == "DONE":
            camera_opened = True
            print("Camera opened successfully. Waiting for UI to stabilize...")
            time.sleep(5)
        else:
            print("Failed to open camera. Exiting camera flow.")
            return
    # Step 2: Loop for shutter tap until photo is captured.
    while True:
        screenshot_path = capture_screenshot()
        modified_input = "The camera is open. Now tap the shutter button to take the photo."
        print("Sending updated camera instruction to AI for processing...")
        cmd_shutter = generate_command(modified_input, screenshot_path=screenshot_path)
        print("AI responded with shutter command:", cmd_shutter)
        if cmd_shutter.lower() == "end":
            print("Camera task complete.")
            break
        result = execute_adb_command(cmd_shutter)
        if result == "DONE":
            print("Photo captured successfully. Exiting camera flow.")
            break
        else:
            print("Shutter command failed. Retrying...")
            time.sleep(2)

#############################################
# COMMAND EXECUTION & LOGGING
#############################################
def execute_adb_command(adb_command):
    """
    Execute the given ADB command (ensuring proper prefix) and return status.
    """
    adb_command = adb_command.replace("`", "").strip()
    # If the command does not start with "adb shell" but is a valid base command, prepend the prefix.
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
    global camera_opened
    camera_opened = False  # Reset camera state
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
        
        # Dedicated branch for camera tasks:
        if "take a photo" in user_input.lower() or "capture photo" in user_input.lower():
            camera_flow(user_input)
            break  # Exit loop after camera flow completes
        
        # For other instructions, try direct mapping first.
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
        
        # Only skip re-execution if the command previously failed.
        if adb_command in executed_commands and executed_commands[adb_command] == "failed":
            print("Command previously failed. Skipping re-execution.")
            continue
        
        result = execute_adb_command(adb_command)
        executed_commands[adb_command] = "success" if result == "DONE" else "failed"
        with open(EXECUTION_LOG, "w") as file:
            json.dump(executed_commands, file, indent=4)
        time.sleep(2)

if __name__ == "__main__":
    main()
