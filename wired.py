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

# ADB commands
adb_command = 'adb shell input tap 979 2059'


adb_screencap = "adb shell screencap -p /sdcard/screen.png"
adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
adb_remove = "adb shell rm /sdcard/screen.png"

# Execute the commands
os.system(adb_command)
time.sleep(0.5)  # Wait for 50ms
os.system(adb_screencap)
os.system(adb_pull)
os.system(adb_remove)

print(f"Screenshot saved as {screenshot_path}")
