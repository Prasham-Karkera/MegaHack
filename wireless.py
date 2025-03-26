import os
import datetime
import time

# Create the 'ss' folder if it doesn't exist
ss_folder = "ss"
os.makedirs(ss_folder, exist_ok=True)

# Generate a timestamped filename
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
screenshot_name = f"screen_{timestamp}.png"
screenshot_path = os.path.join(ss_folder, screenshot_name)

# Device IP address and port
device_ip = "10.120.113.201"
device_port = "43355"

# Enable TCP/IP on the device
os.system(f"adb tcpip {device_port}")

# Connect to the device over Wi-Fi
os.system(f"adb connect {device_ip}:{device_port}")

# ADB commands
adb_command = 'adb shell am start -a android.intent.action.VIEW -d "https://wa.me/9082651125?text=Hello%20World"' 
adb_screencap = "adb shell screencap -p /sdcard/screen.png"
adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
adb_remove = "adb shell rm /sdcard/screen.png"

# Execute the command
os.system(adb_command)
time.sleep(0.5)  # Wait for 50ms

# Execute the screenshot commands
os.system(adb_screencap)
os.system(adb_pull)
os.system(adb_remove)

# Disconnect the device
os.system(f"adb disconnect {device_ip}:{device_port}")

print(f"Screenshot saved as {screenshot_path}")
