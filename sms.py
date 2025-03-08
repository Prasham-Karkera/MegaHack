import os
import datetime
import time

def send_sms_and_capture_screenshot(phone_number, sms_body):
    ss_folder = "ss"
    os.makedirs(ss_folder, exist_ok=True)

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_name = f"screen_{timestamp}.png"
    screenshot_path = os.path.join(ss_folder, screenshot_name)

    adb_command = f"adb shell am start -a android.intent.action.SENDTO -d 'smsto:{phone_number}' --es sms_body '{sms_body}'"
    adb_command2 = 'adb shell input tap 975 2105'
    adb_screencap = "adb shell screencap -p /sdcard/screen.png"
    adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
    adb_remove = "adb shell rm /sdcard/screen.png"

    os.system(adb_command)
    time.sleep(3.0)  
    os.system(adb_command2)
    time.sleep(1.0)  
    os.system(adb_screencap)
    os.system(adb_pull)
    os.system(adb_remove)

    print(f"Screenshot saved as {screenshot_path}")

# phone_number = "+919082651125"
# sms_body = "hello there"
# send_sms_and_capture_screenshot(phone_number, sms_body)