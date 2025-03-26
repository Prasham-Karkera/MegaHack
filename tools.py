# tools.py

from langchain.agents import tool
from fuzzy import get_phone_by_name
from whatsapp import send_whatsapp_messages, audio_call_whatsapp, video_call_whatsapp
from calling import call_number
from camera import take_pic
from systemautom import process_instruction

@tool
def send_whatsapp_message(recipient: str, message: str) -> str:
    '''Function to simulate sending a WhatsApp message.'''
    print(
        f"Tool: send_whatsapp_message called with recipient: {recipient}, message: {message}")
    phone = get_phone_by_name(recipient)  # Run get_phone_by_name for recipient
    phone = phone[-10:]  # Extract the last 10 digits of the phone number
    print(f"Found phone number: {phone}")
    # print(phone)
    send_whatsapp_messages(phone, message)  # Call the actual function
    return f"[Dummy] WhatsApp message sent to {recipient} ({phone}): {message}"


@tool
def add_calendar_event(input_text: str) -> str:
    '''Function to simulate adding a calendar event.'''
    print("Tool: play_spotify_music called with input:", input_text)
    return f"[Dummy] Calendar event added: {input_text}"


@tool
def music_control(input_text: str) -> str:
    '''Function to simulate controlling music playback.'''
    print("Tool: music_control called with input:", input_text)
    return f"[Dummy] Music control activated: {input_text}"


@tool
def call_whatsapp(recipient: str) -> str:
    '''Function to simulate calling a contact via WhatsApp.'''
    print(f"Tool: call_whatsapp called with recipient: {recipient}")
    phone = get_phone_by_name(recipient) 
    phone = phone[-10:]  # Extract the last 10 digits of the phone number
     # Retrieve recipient phone number
    audio_call_whatsapp(phone)  # Call the actual function
    print(f"Calling phone number: {phone}")
    return f"[Dummy] WhatsApp call initiated to {recipient} ({phone})"


@tool
def video_whatsapp(recipient: str) -> str:
    '''Function to simulate a video call via WhatsApp.'''
    print(f"Tool: video_whatsapp called with recipient: {recipient}")
    phone = get_phone_by_name(recipient)
    phone = phone[-10:]  # Extract the last 10 digits of the phone number
      # Retrieve recipient phone number
    video_call_whatsapp(phone)  # Call the actual function
    print(f"Video calling phone number: {phone}")
    return f"[Dummy] WhatsApp video call initiated to {recipient} ({phone})"


@tool
def transaction(details: str) -> str:
    '''Function to simulate processing a transaction.'''
    print("Tool: transaction called with details:", details)
    # Simulate processing the transaction here
    return f"[Dummy] Transaction completed: {details}"


@tool
def system_controls(command: str) -> str:
    '''Function to simulate performing a system control action.'''
    print(f"Tool: system_controls received command: {command}")
    # Simulate processing the system control command (e.g., shutdown, restart, etc.)
    process_instruction(command)
    return f"[Dummy] System control executed: {command}"


@tool
def call_phone(recipient: str) -> str:
    '''Function to simulate making a phone call.'''
    print(f"Tool: call_phone called with recipient: {recipient}")
    phone = get_phone_by_name(recipient)
    phone = phone[-10:]  # Extract the last 10 digits of the phone number
    call_number(phone)
    print(f"Calling phone number: {phone}")
    # Simulate making a phone call here

    return f"[Dummy] Phone call initiated to {recipient} ({phone})"


@tool
def take_picture():
    '''Function to simulate taking a picture.'''
    print("Tool: take_picture called" , input)
    # Simulate taking a picture here
    take_pic()
    return "[Dummy] Picture taken"
