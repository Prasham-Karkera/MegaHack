# main_llm.py
from prompt import custom_prompt_template
from gemini_llm import GeminiLLM  # Our Gemini LLM wrapper from before
from tools import send_whatsapp_message, add_calendar_event, play_spotify_music
from langchain.agents import initialize_agent, Tool
import os
from dotenv import load_dotenv
from langchain.prompts import StringPromptTemplate

load_dotenv()

# Wrap our dummy tool functions with LangChain's Tool class and descriptions
tools = [
    Tool(
        name="WhatsApp",
        func=send_whatsapp_message,
        description="Send a WhatsApp message or make a call. Useful for communication tasks."
    ),
    Tool(
        name="Calendar",
        func=add_calendar_event,
        description="Add or update a calendar event. Use this when scheduling meetings or reminders."
    ),
    Tool(
        name="Spotify",
        func=play_spotify_music,
        description="Play music on Spotify. Use this for music commands like playing a specific genre or song."
    )
]


# Create a prompt template object.
class CustomPromptTemplate(StringPromptTemplate):
    template: str = custom_prompt_template
    input_variables: list = ["tools", "agent_scratchpad", "input"]

    def format(self, **kwargs) -> str:
        # Convert tool objects into their descriptions
        kwargs["tools"] = "\n".join(
            [f"{tool.name}: {tool.description}" for tool in kwargs.get("tools", [])]
        )
        return self.template.format(**kwargs)
# Instantiate the custom prompt template with our tools.
custom_prompt = CustomPromptTemplate()
# Note: When passing the prompt into the agent, include the list of tools as well.
agent_kwargs = {"prompt": custom_prompt, "tools": tools}

# Instantiate the Gemini LLM (make sure to replace with your actual API key)
llm = GeminiLLM(model="gemini-2.0-flash", api_key="AIzaSyARz4paB2iL3hdRj6jHSMHHFBo6_Xj2MxA")

# Initialize an agent with the LLM and tools
agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True,handle_parsing_errors=True)

def main():
    user_command = input("Enter your command: ")
    # The agent will decide which tool(s) to call based on the user's command.
    response = agent.run(user_command)
    print("Agent Response:")
    print(response)

if __name__ == "__main__":
    main()
