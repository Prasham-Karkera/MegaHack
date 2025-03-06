import os
import datetime
import time
import subprocess


met_folder = "metric"
os.makedirs(met_folder, exist_ok=True)

# Generate a timestamped filename
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
screenshot_name = f"screen_{timestamp}.png"
screenshot_path = os.path.join(met_folder, screenshot_name)

# Device IP address and port
device_ip = "192.168.0.139"
device_port = "38467"

# Enable TCP/IP on the device
os.system(f"adb tcpip {device_port}")

# Connect to the device over Wi-Fi
os.system(f"adb connect {device_ip}:{device_port}")

# Retrieve and filter system metrics before disconnecting
metrics_file_path = os.path.join(met_folder, "system_metrics.txt")
commands = [
    ("RAM", "adb shell dumpsys meminfo"),
    ("CPU", "adb shell dumpsys cpuinfo"),
    ("GPU", "adb shell dumpsys gfxinfo"),
    ("Battery", "adb shell dumpsys battery")
]
metrics_output = ""
for label, cmd in commands:
    output = subprocess.getoutput(cmd)
    summary = "\n".join(output.splitlines()[:5])
    metrics_output += f"{label} Metrics:\n{summary}\n\n"

with open(metrics_file_path, "w") as f:
    f.write(metrics_output)

os.system(f"adb disconnect {device_ip}:{device_port}")

print(f"System metrics saved as {metrics_file_path}")
