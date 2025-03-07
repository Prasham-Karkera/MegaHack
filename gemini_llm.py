# gemini_llm.py

from langchain.llms.base import LLM
from typing import Optional, List
from pydantic import Field
import google.generativeai as genai  # Changed import statement


class GeminiLLM(LLM):
    model: str = Field(..., description="Gemini model name")
    api_key: str = Field(..., description="API key for Gemini")
    temperature: float = Field(0.0, description="Temperature for generation")
    tools: list = Field(default_factory=list,
                        description="Bound tool functions")

    def bind_tools(self, tools: list):
        """Bind a list of tool functions to the LLM."""
        self.tools = tools
        return self

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        genai.configure(api_key=self.api_key)  # Configure the API key
        model = genai.GenerativeModel(self.model)  # Use GenerativeModel
        response = model.generate_content(prompt)
        return response.text

    @property
    def _identifying_params(self):
        return {"model": self.model, "temperature": self.temperature}

    @property
    def _llm_type(self) -> str:
        return "gemini"
