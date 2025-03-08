import os
import datetime
import time
import re
import json
from twilio.rest import Client
from calling import call_number

def send_sos_alert():
    ss_folder = "ss"
    os.makedirs(ss_folder, exist_ok=True)
    adb_gps = 'adb shell "dumpsys location | grep -A 1 fused"'
    adb_battery = 'adb shell dumpsys battery'
    gps_output = os.popen(adb_gps).read()
    location_match = re.search(r'last location=Location\[fused ([\d\.-]+),([\d\.-]+)', gps_output)
    if location_match:
        latitude = location_match.group(1)
        longitude = location_match.group(2)
    else:
        latitude = None
        longitude = None
    battery_output = os.popen(adb_battery).read()
    level_match = re.search(r'level: (\d+)', battery_output)
    charging_match = re.search(r'USB powered: (\w+)', battery_output)

    if level_match and charging_match:
        battery_level = level_match.group(1)
        charging_status = 'Charging' if charging_match.group(1) == 'true' else 'Not Charging'
    else:
        battery_level = None
        charging_status = None

    output = {
        "latitude": latitude,
        "longitude": longitude,
        "battery_level": battery_level,
        "charging_status": charging_status
    }

    print(json.dumps(output, indent=4))

    account_sid = 'AC0fd25543411b487a4e48fef4ee56efbe'
    auth_token = 'd3a947d30e90fec1ad377b4b9d9634c6'

    client = Client(account_sid, auth_token)

    message_body = f"Emergency Alert!\nGPS Location: Latitude = {latitude}, Longitude = {longitude}\nBattery Level: {battery_level}%\nCharging Status: {charging_status}"

    emergency_contacts = ['+918108155346']  

    call_number(emergency_contacts[0])

    for contact in emergency_contacts:
        message = client.messages.create(
            body=message_body,
            from_='+18573824872', 
            to=contact
        )
        print(f"Message sent to {contact}")
    
    return(output)

# if __name__ == "__main__":
#     send_sos_alert()