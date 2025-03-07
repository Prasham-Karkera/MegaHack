import os
import datetime
import time

def take_picture():
    # Create the 'ss' folder if it doesn't exist
    ss_folder = "ss"
    os.makedirs(ss_folder, exist_ok=True)

    # Generate a timestamped filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_name = f"screen_{timestamp}.png"
    screenshot_path = os.path.join(ss_folder, screenshot_name)

    # ADB commands
    adb_command = f'adb shell am start -a android.media.action.IMAGE_CAPTURE'
    adb_command2 = f'adb shell input keyevent 27'
    # Execute the commands
    os.system(adb_command)
    time.sleep(2)  # Wait for 2 seconds
    os.system(adb_command2)
    time.sleep(0.5)  # Wait for 0.5 seconds

    adb_screencap = "adb shell screencap -p /sdcard/screen.png"
    adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
    adb_remove = "adb shell rm /sdcard/screen.png"

    os.system(adb_screencap)
    os.system(adb_pull)
    os.system(adb_remove)

    print(f"Screenshot saved as {screenshot_path}")
