import os
import datetime
import time

ss_folder = "ss"
os.makedirs(ss_folder, exist_ok=True)

timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
screenshot_name = f"screen_{timestamp}.png"
screenshot_path = os.path.join(ss_folder, screenshot_name)

device_ip = "192.168.0.218"
device_port = "38015"
    
def send_whatsapp_messages(phone_number, message):
    adb_command = f'adb shell am start -a android.intent.action.VIEW -d "https://wa.me/{phone_number}?text={message.replace(" ", "%20")}"'
    adb_command_send = f'adb shell input tap 966 2148'
    adb_screencap = "adb shell screencap -p /sdcard/screen.png"
    adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
    adb_remove = "adb shell rm /sdcard/screen.png"

    os.system(adb_command)
    time.sleep(2)  
    os.system(adb_command_send)
    time.sleep(2)  

    os.system(adb_screencap)
    os.system(adb_pull)
    os.system(adb_remove)

    print(f"Screenshot saved as {screenshot_path}")

def audio_call_whatsapp(phone_number):
    adb_command = f'adb shell am start -a android.intent.action.VIEW -d "https://wa.me/{phone_number}"'
    adb_command_call = f'adb shell input tap 920 100'
    adb_screencap = "adb shell screencap -p /sdcard/screen.png"
    adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
    adb_remove = "adb shell rm /sdcard/screen.png"

    os.system(adb_command)
    time.sleep(2) 
    os.system(adb_command_call)
    time.sleep(2) 

    os.system(adb_screencap)
    os.system(adb_pull)
    os.system(adb_remove)

    print(f"Screenshot saved as {screenshot_path}")

def video_call_whatsapp(phone_number):
    adb_command = f'adb shell am start -a android.intent.action.VIEW -d "https://wa.me/{phone_number}"'
    adb_command_call = f'adb shell input tap 760 190'
    adb_screencap = "adb shell screencap -p /sdcard/screen.png"
    adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
    adb_remove = "adb shell rm /sdcard/screen.png"

    os.system(adb_command)
    time.sleep(2)  
    os.system(adb_command_call)
    time.sleep(2)  

    os.system(adb_screencap)
    os.system(adb_pull)
    os.system(adb_remove)

    print(f"Screenshot saved as {screenshot_path}")

# send_whatsapp_message("+919082651125","Hello")
# video_call_whatsapp("9082651125")