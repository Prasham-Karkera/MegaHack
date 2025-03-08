# tools.py

from langchain.agents import tool
from fuzzy import get_phone_by_name
from whatsapp import send_whatsapp_messages, audio_call_whatsapp, video_call_whatsapp
from calling import call_number
from camera import take_pic
from systemautom import process_instruction
from cal import calendar_stuff
from sms import send_sms_and_capture_screenshot  # added import for sms tool

@tool
def send_whatsapp_message(recipient: str, message: str) -> str:
    '''Function to simulate sending a WhatsApp message.'''
    print(
        f"Tool: send_whatsapp_message called with recipient: {recipient}, message: {message}")
    phone = get_phone_by_name(recipient) 
    phone = phone[-10:]
    print(f"Found phone number: {phone}")
    # print(phone)
    send_whatsapp_messages(phone, message)  # Call the actual function
    return f"[Dummy] WhatsApp message sent to {recipient} ({phone}): {message}"


@tool
def add_calendar_event(input_text: str) -> str:
    '''Function to simulate adding a calendar event.'''
    print("Tool: Calender called with input:", input_text)
    calendar_stuff(input_text)

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
    phone = phone[-10:]  
    audio_call_whatsapp(phone)  
    print(f"Calling phone number: {phone}")
    return f"[Dummy] WhatsApp call initiated to {recipient} ({phone})"


@tool
def video_whatsapp(recipient: str) -> str:
    '''Function to simulate a video call via WhatsApp.'''
    print(f"Tool: video_whatsapp called with recipient: {recipient}")
    phone = get_phone_by_name(recipient)
    phone = phone[-10:]  
    video_call_whatsapp(phone) 
    print(f"Video calling phone number: {phone}")
    return f"[Dummy] WhatsApp video call initiated to {recipient} ({phone})"


@tool
def transaction(details: str) -> str:
    '''Function to simulate processing a transaction.'''
    print("Tool: transaction called with details:", details)
    return f"[Dummy] Transaction completed: {details}"


@tool
def system_controls(command: str) -> str:
    '''Function to simulate performing a system control action.'''
    print(f"Tool: system_controls received command: {command}")
    process_instruction(command)
    return f"[Dummy] System control executed: {command}"


@tool
def call_phone(recipient: str) -> str:
    '''Function to simulate making a phone call.'''
    print(f"Tool: call_phone called with recipient: {recipient}")
    phone = get_phone_by_name(recipient)
    phone = phone[-10:]  
    call_number(phone)
    print(f"Calling phone number: {phone}")

    return f"[Dummy] Phone call initiated to {recipient} ({phone})"


@tool
def take_picture():
    '''Function to simulate taking a picture.'''
    print("Tool: take_picture called" , input)
    take_pic()
    return "[Dummy] Picture taken"


@tool
def send_sms_capture(recipient: str, sms_body: str) -> str:
    '''Function to send an SMS and capture a screenshot.'''
    phone = get_phone_by_name(recipient)
    phone = phone[-10:]
    send_sms_and_capture_screenshot(recipient, sms_body)
    return f"[Dummy] SMS sent to {recipient} and screenshot captured."
