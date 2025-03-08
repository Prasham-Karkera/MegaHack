import os
import datetime
import time

ss_folder = "ss"
os.makedirs(ss_folder, exist_ok=True)

timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
screenshot_name = f"screen_{timestamp}.png"
screenshot_path = os.path.join(ss_folder, screenshot_name)


adb_command2 = "adb shell am start -a android.intent.action.VIEW -d \"gpay://upi/pay?pa=+919833156020\" com.google.android.apps.nbu.paisa.user"
adb_screencap = "adb shell screencap -p /sdcard/screen.png"
adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
adb_remove = "adb shell rm /sdcard/screen.png"

os.system(adb_command2)
time.sleep(1)  
os.system(adb_screencap)
os.system(adb_pull)
os.system(adb_remove)

print(f"Screenshot saved as {screenshot_path}")
