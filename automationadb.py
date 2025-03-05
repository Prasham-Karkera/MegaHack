import os
import datetime
import time
import subprocess
from google import genai
from google.genai import types

# Target device (IP:port)
DEVICE_SERIAL = "172.20.10.3:5555"
# Replace with your actual Gemini API key
GEMINI_API_KEY = "AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA"

# Global flag to track if WhatsApp is already open
whatsapp_opened = False

def check_or_connect_device(device_ip_port=DEVICE_SERIAL):
    print("Checking connected devices...")
    result = subprocess.run(["adb", "devices"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    print(result.stdout)
    if device_ip_port not in result.stdout:
        print(f"Device {device_ip_port} not found. Attempting to connect...")
        os.system(f"adb connect {device_ip_port}")
        time.sleep(2)
        result = subprocess.run(["adb", "devices"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print("After attempting connection:")
        print(result.stdout)
    else:
        print(f"Device {device_ip_port} is connected.")

def run_adb_command(cmd_list):
    if cmd_list[0] == "adb":
        cmd_list.insert(1, "-s")
        cmd_list.insert(2, DEVICE_SERIAL)
    result = subprocess.run(cmd_list, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return result.stdout.strip()

def capture_screenshot(folder="ss"):
    os.makedirs(folder, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_filename = f"screen_{timestamp}.png"
    screenshot_path = os.path.join(folder, screenshot_filename)
    
    run_adb_command(["adb", "shell", "screencap", "-p", "/sdcard/screen.png"])
    run_adb_command(["adb", "pull", "/sdcard/screen.png", screenshot_path])
    run_adb_command(["adb", "shell", "rm", "/sdcard/screen.png"])
    
    print(f"Screenshot saved as {screenshot_path}")
    return screenshot_path

def get_screen_resolution():
    output = run_adb_command(["adb", "shell", "wm", "size"])
    try:
        parts = output.split(":")[-1].strip().split("x")
        width, height = parts[0], parts[1]
        return width, height
    except Exception as e:
        print("Error parsing screen resolution:", e)
        return "1080", "2340"

def extract_adb_command(response_text):
    if "```" in response_text:
        start = response_text.find("```") + 3
        end = response_text.find("```", start)
        if end != -1:
            return response_text[start:end].strip()
    index = response_text.find("adb shell")
    if index != -1:
        return response_text[index:].splitlines()[0].strip()
    return response_text.strip()

def generate_command(task_input, screenshot_path=None):
    width, height = get_screen_resolution()
    
    contents = [
        types.Content(role="user", parts=[types.Part.from_text(text="hey")]),
        types.Content(role="model", parts=[types.Part.from_text(text="Okay, I'm ready to help. What's your task?")]),
        types.Content(role="user", parts=[types.Part.from_text(text=task_input)])
    ]
    if screenshot_path:
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=f"Screenshot path: {screenshot_path}")]
            )
        )
    
    # Refined system instruction:
    system_instr = (
        "You are a helpful assistant that has full control of my Android phone via ADB. "
        "My task is to use WhatsApp to message the 'Hackathons' group with a specific message provided in the task input. "
        "Follow these steps in sequence and output only one valid ADB command at a time (with no extra explanation):\n\n"
        "Step 1: If WhatsApp is not open, open it using: adb shell am start -n com.whatsapp/.Main, then wait 2 seconds.\n"
        "Step 2: If WhatsApp is open (the screenshot shows the Chats screen), tap the search icon at coordinates (1050,100), then wait 2 seconds.\n"
        "Step 3: Type 'Hackathons' in the search field using: adb shell input text 'Hackathons', then wait 2 seconds.\n"
        "Step 4: Tap the first chat result (assume coordinates (540,500)) to open the group chat, then wait 2 seconds.\n"
        "Step 5: Tap the chat text field (assume coordinates (540,2000)) to activate it, then wait 2 seconds.\n"
        "Step 6: Type the message exactly as provided (for example, using: adb shell input text 'Hello this msg is sent with MY AUTOMATION'), then wait 2 seconds.\n"
        "Step 7: Tap the send button (assume coordinates (1050,2000)) to send the message, then wait 2 seconds.\n"
        "Step 8: Output 'end' when the task is complete.\n\n"
        "If a screenshot shows that a step is already completed (e.g., WhatsApp is open), do not repeat that step; instead, output only the command for the next step. "
        f"The device screen resolution is {width} x {height}. Temperature is set to 2. "
        "Output only the exact ADB command needed for the next step."
    )
    
    generate_content_config = types.GenerateContentConfig(
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
        config=generate_content_config,
    ):
        response_text += chunk.text
    return extract_adb_command(response_text)

def execute_adb_command(adb_command):
    global whatsapp_opened
    adb_command = adb_command.replace("`", "").strip()
    
    # If the command is to open WhatsApp and it's already open, skip it.
    if "am start -n com.whatsapp/.Main" in adb_command.lower():
        if whatsapp_opened:
            print("Skipping repeated open WhatsApp command. Requesting next step.")
            return "SKIPPED"
        else:
            whatsapp_opened = True
    
    if adb_command.startswith("adb"):
        full_command = adb_command
    elif adb_command.startswith("am") or adb_command.startswith("input"):
        full_command = f"adb -s {DEVICE_SERIAL} shell {adb_command}"
    else:
        full_command = adb_command
    print(f"Executing: {full_command}")
    os.system(full_command)
    return "DONE"

def main_loop():
    global whatsapp_opened
    whatsapp_opened = False  # Reset flag each run
    
    check_or_connect_device(DEVICE_SERIAL)
    
    task_input = input("Enter your task for the assistant (e.g., 'Use WhatsApp to message the Hackathons group: Hello this msg is sent with MY AUTOMATION'): ")
    print("Your task:", task_input)
    
    while True:
        screenshot_path = capture_screenshot()
        print("Sending screenshot info to AI for processing...")
        
        next_command = generate_command(task_input, screenshot_path=screenshot_path)
        print("AI responded with command:", next_command)
        
        if next_command.lower() == "end":
            print("Received 'end' instruction. Exiting automation loop.")
            break
        
        result = execute_adb_command(next_command)
        if result == "SKIPPED":
            time.sleep(2)
            continue
        
        time.sleep(2)

if __name__ == "__main__":
    main_loop()
