from flask import Flask, jsonify, request
from flask_cors import CORS
from pyngrok import ngrok, conf  # Import conf module
from last_tools import operator

app = Flask(__name__)
CORS(app)  # Allow frontend requests


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


# API to fetch metrics data (unchanged)
@app.route('/metrics', methods=['GET'])
def send_metrics():
     return jsonify(metrics_data)

# New API to receive a command as JSON payload
@app.route('/command', methods=['POST'])
def execute_command():
    data = request.get_json()  # Read JSON payload from frontend
    
    if not data or "command" not in data:
        return jsonify({"error": "Missing 'command' field"}), 400

    command = data["command"].strip()
    timestamp = data.get("timestamp", "N/A")

    print(f"Received command: {command} at {timestamp}")
    operator(command)  # Call the operator function with the command

    # Simulated responses based on command
    command_responses = {
        "status": {"message": "Server is running", "status": "OK"},
        "time": {"message": "Server Time", "time": "2025-03-07 12:00:00"},
        "uptime": {"message": "System Uptime", "uptime": "5 days, 4 hours"}
    }

    response = command_responses.get(command, {"error": "Invalid command"})
    
    return jsonify(response)

# Start ngrok when running the script
if __name__ == '__main__':
    conf.get_default().auth_token = "2tzQ6lHmAbxJyh2XXRhl0MfjFdU_32a41sN7MCKJxKzsr1cVn"  # Set your ngrok authtoken
    public_url = ngrok.connect(5000)
    print(f"Public URL: {public_url}")
    app.run(port=5000)
