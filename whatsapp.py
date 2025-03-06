import os
import datetime
import time
import subprocess

# Create the 'ss' folder if it doesn't exist
ss_folder = "ss"
os.makedirs(ss_folder, exist_ok=True)

# Generate a timestamped filename
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
screenshot_name = f"screen_{timestamp}.png"
screenshot_path = os.path.join(ss_folder, screenshot_name)

# Device IP address and port
device_ip = "192.168.0.139"
device_port = "33503"

# Enable TCP/IP on the device
os.system(f"adb tcpip {device_port}")

# Connect to the device over Wi-Fi
os.system(f"adb connect {device_ip}:{device_port}")

# ADB commands
# adb_command = 'adb shell am start -n com.google.android.calendar/com.android.calendar.LaunchActivity'
# adb_command= f'adb shell am start -a android.intent.action.VOICE_COMMAND'
# adb_command = f'adb shell input text "message%sprasham%son%swhatsapp" && adb shell input keyevent 66'
phone_number = "9082651125"
message = "Hello World"
adb_command = f'adb shell am start -a android.intent.action.VIEW -d "https://wa.me/{phone_number}?text={message.replace(" ", "%20")}"'
adb_command_send=f'adb shell input tap 966 2148'
adb_screencap = "adb shell screencap -p /sdcard/screen.png"
adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
adb_remove = "adb shell rm /sdcard/screen.png"

# adb_gpt=f'adb shell input tap 786 98'

# Execute the command
os.system(adb_command)
time.sleep(2)  # Wait for 2s
os.system(adb_command_send)
time.sleep(2)  # Wait for 2s

# os.system(adb_gpt)
# time.sleep(5)  # Wait for 5s

# Execute the screenshot commands
os.system(adb_screencap)
os.system(adb_pull)
os.system(adb_remove)


# Disconnect the device
os.system(f"adb disconnect {device_ip}:{device_port}")

print(f"Screenshot saved as {screenshot_path}")
# print(f"System metrics saved as {metrics_file_path}")
