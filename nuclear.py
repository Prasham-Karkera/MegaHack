from flask import Flask
from flask_socketio import SocketIO
from pyngrok import ngrok

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Set your ngrok authtoken
ngrok.set_auth_token("2tzQ6lHmAbxJyh2XXRhl0MfjFdU_32a41sN7MCKJxKzsr1cVn")

@app.route('/')
def index():
    return "Socket Server is Running"

@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

@app.route('/start')
def start_audio():
    socketio.emit('start')
    return "Audio Started"

@app.route('/stop')
def stop_audio():
    socketio.emit('stop')
    return "Audio Stopped"

if __name__ == '__main__':
    
    public_url = ngrok.connect(5001)
    print(" * ngrok tunnel \"{}\" -> \"http://127.0.0.1:5001\"".format(public_url))
    
    import threading
    def run_server():
        socketio.run(app, host='0.0.0.0', port=5001, debug=True, use_reloader=False)
    
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    
    while True:
        cmd = input("Enter command (start/stop): ").strip().lower()
        if cmd in ["start", "stop"]:
            socketio.emit(cmd)
        else:
            print("Unknown command. Use 'start' or 'stop'")