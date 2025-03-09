# Phantom Link

Phantom Link is an autonomous AI agent that can control your Android phone using ADB commands and intents. It leverages various tools and APIs to perform tasks such as sending messages, making calls, controlling system settings, and more.

## Features

- **Send WhatsApp Messages**: Send messages via WhatsApp.
- **Make Calls**: Make audio and video calls using WhatsApp or regular phone calls.
- **Control System Settings**: Adjust brightness, volume, toggle Wi-Fi, and more.
- **Take Pictures**: Capture photos using the device camera.
- **Send SMS and Capture Screenshot**: Send SMS and capture screenshots.
- **Manage Calendar Events**: Add events to the Google Calendar.
- **Fetch System Metrics**: Retrieve system metrics like RAM, CPU, GPU, and battery status.
- **SOS Alerts**: Send SOS alerts with GPS location and battery status to your emergency contacts.
- **Find Your Device**: Make your device ring to locate it.
- **Enter Multiple Tasks**: Enter several tasks at once, and the divider will intelligently divide the tasks to execute one after the other. For example, you can enter a command like "Schedule a meeting with Prasham on 25th March 2025 at 5:30 pm; Message Varshil on WhatsApp saying hi; Video call Pranay" and it will be divided and executed sequentially:
    1. Schedule a meeting with Prasham on 25th March 2025 at 5:30 pm.
    2. Send a WhatsApp message to Varshil saying hi.
    3. Video call Pranay.

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd MegaHack
    ```

2. Install the required Python packages:
    ```sh
    pip install -r requirements.txt
    ```

3. Set up ADB on your system and ensure your Android device is connected and recognized by ADB.

## Usage

1. **Run the Flask Server**:
    ```sh
    python server.py
    ```

2. **Start the Frontend**:
    ```sh
    npm run dev
    ```