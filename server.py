from flask import Flask, jsonify, request
from flask_cors import CORS
from pyngrok import ngrok, conf

import uuid
import datetime
import json
import os
from sos import send_sos_alert
from divider import execute_commands


app = Flask(__name__)
CORS(app)

HISTORY_FILE = os.path.join(os.path.dirname(__file__), 'command_history.json')


command_history = {
    "history": []
}

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
    "Uptime": 30576477,
    "Realtime": 30932048
  },
  "CPU Metrics": {
    "Load": [
      15.12,
      15.07,
      15.44
    ],
    "CPU Usage": {
      "From": "2025-03-08 11:51:30.025",
      "To": "2025-03-08 11:51:49.474",
      "Details": {
        "Time Range": "20s",
        "Processes": {
          "1564/system_server": {
            "User": "10%",
            "Kernel": "12%",
            "Faults": {
              "Minor": 2207,
              "Major": 2080
            }
          },
          "1218/android.hardware.sensors@2.0-service.multihal": {
            "User": "0.3%",
            "Kernel": "2.8%"
          },
          "2594/com.google.android.gms.persistent": {
            "User": "2.1%",
            "Kernel": "0.9%",
            "Faults": {
              "Minor": 3056,
              "Major": 93
            }
          }
        }
      }
    }
  },
  "GPU Metrics": {
    "Applications Graphics Acceleration Info": {},
    "Uptime": 30578557,
    "Realtime": 30934129,
    "Graphics Info": {
      "PID": 2833,
      "App": "com.sec.android.app.launcher"
    }
  },
  "Battery Metrics": {
    "Current Battery Service State": {
      "AC Powered": False,
      "USB Powered": True,
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
        
        result = execute_commands(command)
        command_history["history"].append({
            "command": command,
            "timestamp": timestamp,
            "result": result
        })
        save_history()
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)})
  
@app.route('/metrics', methods=['GET'])
def get_metrics():
    return jsonify(metrics_data)

@app.route('/sos', methods=['GET'])
def sos():
    sos_data = send_sos_alert()
    return jsonify(sos_data)

@app.route('/zerodha', methods=['GET'])
def zerodha():
    from fullZerodha import run_zerodha  
    recommendations = run_zerodha()
    return jsonify({"recommendations": recommendations})

if __name__ == '__main__':
    conf.get_default().auth_token = "2tzQ6lHmAbxJyh2XXRhl0MfjFdU_32a41sN7MCKJxKzsr1cVn"
    public_url = ngrok.connect(5000)
    print(f"Public URL: {public_url}")
    app.run(port=5000)
