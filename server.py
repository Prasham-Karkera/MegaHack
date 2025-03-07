from flask import Flask, jsonify, request
from flask_cors import CORS
from pyngrok import ngrok, conf
from last_tools import operator
import uuid
import datetime
import json
import os

app = Flask(__name__)
CORS(app)

# Define path for command history
HISTORY_FILE = os.path.join(os.path.dirname(__file__), 'command_history.json')

# Initialize command history
command_history = {
    "history": []
}

# Load existing history if available
if os.path.exists(HISTORY_FILE):
    try:
        with open(HISTORY_FILE, 'r') as f:
            command_history = json.load(f)
    except json.JSONDecodeError:
        pass

def save_history():
    with open(HISTORY_FILE, 'w') as f:
        json.dump(command_history, f, indent=2)

metrics_data = {
  "RAM Metrics": {
    "Applications Memory Usage (in Kilobytes)": {
      "Total RSS by process": "Data Not Provided"
    },
    "Uptime": 401146364,
    "Realtime": 702240092
  },
  "CPU Metrics": {
    "Load": [
      29.04,
      20.73,
      18.31
    ],
    "CPU Usage": {
      "From": "2025-03-06 22:57:09.016",
      "To": "2025-03-06 23:00:06.832",
      "Details": {
        "Time Range": "182s",
        "Processes": {
          "1309/system_server": {
            "User": "18%",
            "Kernel": "13%",
            "Faults": {
              "Minor": 213941,
              "Major": 18175
            }
          },
          "146/kswapd0": {
            "User": "0%",
            "Kernel": "18%"
          },
          "19703/android.process.acore": {
            "User": "4.3%",
            "Kernel": "3.9%",
            "Faults": {
              "Minor": 41626,
              "Major": 5599
            }
          }
        }
      }
    }
  },
  "GPU Metrics": {
    "Applications Graphics Acceleration Info": {},
    "Uptime": 401150919,
    "Realtime": 702244648,
    "Graphics Info": {
      "PID": 2369,
      "App": "com.sec.android.app.launcher"
    }
  },
  "Battery Metrics": {
    "Current Battery Service State": {
      "AC Powered": True,
      "USB Powered": False,
      "Wireless Powered": False,
      "Dock Powered": False
    }
  }
}

def get_history():
    return jsonify(command_history)

@app.route('/command', methods=['POST'])
def execute_command():
    data = request.get_json()
    if not data or "command" not in data:
        return jsonify({"error": "Missing 'command' field"}), 400

    command = data["command"].strip()
    timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"Received command: {command} at {timestamp}")

    try:
        # Execute operator and return only the tool name
        tool_used = operator(command)
        return jsonify({"tool_name": tool_used})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    conf.get_default().auth_token = "2tzQ6lHmAbxJyh2XXRhl0MfjFdU_32a41sN7MCKJxKzsr1cVn"
    public_url = ngrok.connect(5000)
    print(f"Public URL: {public_url}")
    app.run(port=5000)
