import os
from google import genai
from google.genai import types
import datetime
import time
import base64
import yfinance as yf


GEMINI_API_KEY = "AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA"  


ss_folder = "ss"
os.makedirs(ss_folder, exist_ok=True)

timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
screenshot_name = f"screen_{timestamp}.png"
screenshot_path = os.path.join(ss_folder, screenshot_name)


# ADB commands
adb_start=f'adb shell am start -n com.zerodha.kite3/.MainActivity'
adb_command = 'adb shell input tap 750 200'
adb_command2='adb shell input tap 550 2100'
adb_command3 = 'adb shell input swipe 540 1200 540 100'  # Scroll down 600px

adb_screencap = "adb shell screencap -p /sdcard/screen.png"
adb_pull = f"adb pull /sdcard/screen.png {screenshot_path}"
adb_remove = "adb shell rm /sdcard/screen.png"

os.system(adb_start)
time.sleep(1.0)  
os.system(adb_command)
time.sleep(7.0)  
os.system(adb_command2)
time.sleep(2.0)  
os.system(adb_command2)
time.sleep(1.0)  
os.system(adb_command3)
time.sleep(1.0) 
os.system(adb_screencap)
os.system(adb_pull)
os.system(adb_remove)

# Read the screenshot file and encode it in base64
with open(screenshot_path, "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')

system_prompt = """
i will send you a screen  shot of my zerodha portfolio
return me just the stock names in plain text, sepearted by ';'
only include what is in the screenshot,nothing else or you will be punished for it
"""

contents = [
    types.Content(role="user", parts=[types.Part.from_text(text=encoded_image)])
]
config = types.GenerateContentConfig(
    temperature=2,
    top_p=0.9,
    top_k=40,
    max_output_tokens=512,
    system_instruction=system_prompt
)

client = genai.Client(api_key=GEMINI_API_KEY)
model = "gemini-2.0-flash"
response = client.models.generate_content(model=model, contents=contents, config=config)

response_text = response.text


def get_stock_recommendation(stock_name):
    symbol_nse = stock_name.upper() + ".NS"
    symbol_bse = stock_name.upper() + ".BO"
    for symbol in [symbol_nse, symbol_bse]:  
        try:
            
            end_date = datetime.datetime.today().strftime('%Y-%m-%d')
            start_date = (datetime.datetime.today() - datetime.timedelta(days=5*365)).strftime('%Y-%m-%d')
            
            stock = yf.Ticker(symbol)
            data = stock.history(start=start_date, end=end_date)

            if not data.empty:
                start_price = data["Close"].iloc[0]  
                end_price = data["Close"].iloc[-1]   


                if end_price > start_price * 2:  
                    return f"{stock_name} : STRONG BUY", 1
                elif end_price > start_price * 1.5: 
                    return f"{stock_name} : BUY", 1
                elif end_price < start_price * 0.5: 
                    return f"{stock_name} : STRONG SELL", 1
                elif end_price < start_price:
                    return f"{stock_name} : SELL", 1
                else:
                    return f"{stock_name} : HOLD", 1
        
        except Exception as e:
            continue 

    return f"{stock_name} : No data available", None  

stock_names = "BHEL;GAIL;IDEA;IDFC".split(";")

print("\nStock Recommendations (5-Year Analysis):\n")

valid_predictions = 0
total_stocks = 0

for stock_name in stock_names:
    stock_name = stock_name.strip().upper() 
    if stock_name:
        result, valid = get_stock_recommendation(stock_name)
        print(result)
        if valid is not None:
            valid_predictions += valid
            total_stocks += 1




# get_stock_recommendation(.<)