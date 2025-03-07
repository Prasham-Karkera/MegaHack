import os
import datetime
import time

def send_sms_and_capture_screenshot(phone_number, sms_body):
    # Create the 'ss' folder if it doesn't exist
    ss_folder = "ss"
    os.makedirs(ss_folder, exist_ok=True)

    # Generate a timestamped filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_name = f"screen_{timestamp}.png"
    screenshot_path = os.path.join(ss_folder, screenshot_name)

    # ADB commands
    adb_command = f"adb shell am start -a android.intent.action.SENDTO -d 'smsto:{phone_number}' --es sms_body '{sms_body}'"
    adb_command2 = 'adb shell input tap 975 2105'
    adb_screencap = "adb shell screencap -p /sdcard/screen.png"
    adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
    adb_remove = "adb shell rm /sdcard/screen.png"

    # Execute the commands
    os.system(adb_command)
    time.sleep(3.0)  # Wait for 3 seconds
    os.system(adb_command2)
    time.sleep(1.0)  # Wait for 1 second
    os.system(adb_screencap)
    os.system(adb_pull)
    os.system(adb_remove)

    print(f"Screenshot saved as {screenshot_path}")

# Example usage
phone_number = "+919082651125"
sms_body = "hello there"
send_sms_and_capture_screenshot(phone_number, sms_body)
