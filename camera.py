import os
import datetime
import time

def take_pic():
    ss_folder = "ss"
    os.makedirs(ss_folder, exist_ok=True)

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_name = f"screen_{timestamp}.png"
    screenshot_path = os.path.join(ss_folder, screenshot_name)

    adb_command = f'adb shell am start -a android.media.action.IMAGE_CAPTURE'
    adb_command2 = f'adb shell input keyevent 27'
    os.system(adb_command)
    time.sleep(2)  
    os.system(adb_command2)
    time.sleep(0.5)  

    adb_screencap = "adb shell screencap -p /sdcard/screen.png"
    adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
    adb_remove = "adb shell rm /sdcard/screen.png"

    os.system(adb_screencap)
    os.system(adb_pull)
    os.system(adb_remove)

    print(f"Screenshot saved as {screenshot_path}")