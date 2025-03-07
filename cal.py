
import subprocess
import datetime
import time
import os

def run_adb_command(command):
    try:
        process = subprocess.run(command, capture_output=True, text=True, check=True)
        print("Output:", process.stdout)
    except subprocess.CalledProcessError as e:
        print("Error:", e.stderr)


def send_calendar_event(task, date_str, all_day=False):

    try:
        if all_day:
            # Parse date string assuming "YYYY-MM-DD" format
            dt_start = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            timestamp_start = int(dt_start.timestamp() * 1000)
            # All-day event ends at midnight the next day
            dt_end = dt_start + datetime.timedelta(days=1)
            timestamp_end = int(dt_end.timestamp() * 1000)
        else:
            # Parse date string assuming "YYYY-MM-DD HH:MM" format
            dt_start = datetime.datetime.strptime(date_str, "%Y-%m-%d %H:%M")
            timestamp_start = int(dt_start.timestamp() * 1000)
            # Default duration is 1 hour
            dt_end = dt_start + datetime.timedelta(hours=1)
            timestamp_end = int(dt_end.timestamp() * 1000)
    except ValueError:
        if all_day:
            print("Error parsing date string. Please use 'YYYY-MM-DD' format for all-day events.")
        else:
            print("Error parsing date string. Please use 'YYYY-MM-DD HH:MM' format for timed events.")
        return

    adb_command = [
        "adb", "shell", "am", "start",
        "-a", "android.intent.action.INSERT",
        "-d", "content://com.android.calendar/events",
        "--el", "beginTime", str(timestamp_start),
        "--el", "endTime", str(timestamp_end),
        "--es", "title", f"\"{task}\"",
        "--es", "eventLocation", "\"Office\"",
        "--es", "description", f"\"Scheduled task: {task}\"",
        "--ez", "allDay", "true" if all_day else "false"
    ]

    print("Sending event creation command to Google Calendar...")
    run_adb_command(adb_command)

    # Sleep for 3 seconds to ensure the event is created
    time.sleep(3)
    adb_command_save=f'adb shell input tap 950 200'
    os.system(adb_command_save)

if __name__ == "__main__":
    # Example usage:
    
    # Timed event example:
    # task_title = "Meeting with Team"
    # event_date = "2025-03-15 14:30"  # Format: YYYY-MM-DD HH:MM
    # send_calendar_event(task_title, event_date, all_day=False)
    
    # Uncomment below for an all-day event example:
    task_title = "Workshop"
    event_date = "2025-03-16"  # Format: YYYY-MM-DD
    send_calendar_event(task_title, event_date, all_day=True)
