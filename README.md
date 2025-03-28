# Phantom Link

🚀 **Watch the Demo on YouTube**: [Phantom Link - AI-Powered Android Automation](https://www.youtube.com/watch?v=Trm6EHTdGEo)

## 📌 Project Overview
Phantom Link is an autonomous AI agent that revolutionizes Android device management using advanced ADB command execution and intelligent multi-task processing. It features a dual-layer architecture that enhances command routing, execution, and user engagement.

### ✨ Key Features
- **Smart Automation**: Execute multiple tasks seamlessly using natural language commands.
- **Communication & Safety**:
  - Send WhatsApp messages & SMS
  - Initiate audio/video calls
  - SOS feature with emergency contact & location sharing
- **System Controls**:
  - Adjust brightness, volume, Wi-Fi settings
  - Capture screenshots and photos
- **Productivity Boost**:
  - Manage Google Calendar events
  - Multi-task execution with intelligent command splitting
- **Financial Analysis**:
  - Capture market snapshots via Zerodha
  - Analyze buy/sell signals and visualize data
- **Real-Time System Monitoring**:
  - Track RAM, CPU, GPU, and battery status

---

## 🏗️ Architecture Overview
Phantom Link operates on a **dual-layer system**:
- **Divider Layer**: Breaks down multi-command inputs into separate tasks, ensuring smooth execution with time intervals.
- **Operator Layer**: Routes tasks to the correct modules based on context and execution requirements.
- **Modules**: Handles functionalities like messaging, calls, system monitoring, financial insights, and more.

---

## ⚙️ Tech Stack
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Flask (Python)
- **Database**: Firebase Firestore
- **Communication**: ADB (Android Debug Bridge), WhatsApp API
- **Data Visualization**: Matplotlib, Seaborn

---

## 🚀 Getting Started
Clone the repository:

```bash
git clone <repository-url>
cd Phantom-Link
```

### 🔧 Install Dependencies
```bash
pip install -r requirements.txt  # Backend dependencies
npm install  # Frontend dependencies
```

### 🖥️ Set Up ADB
Ensure that ADB is installed and configured on your system. Connect your Android device and enable **USB Debugging**.

### ▶️ Run the Application
Start the backend server:
```bash
python server.py
```
Launch the frontend:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [ADB Guide](https://developer.android.com/studio/command-line/adb)

📩 **For inquiries or contributions, feel free to reach out!** 🚀
