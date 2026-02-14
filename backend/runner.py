import os
from google import genai
from typing import List, Dict, Any
import schemas

class WorkflowRunner:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment")
        self.client = genai.Client(api_key=api_key)
        self.model_id = "gemini-2.5-flash-lite"

    async def _call_gemini(self, prompt: str) -> str:
        response = await self.client.aio.models.generate_content(
            model=self.model_id,
            contents=prompt
        )
        return response.text

    async def run_step(self, step_type: str, input_data: str, config: Dict[str, Any]) -> str:
        prompts = {
            "clean": f"Clean and normalize the following text. Remove any unnecessary formatting or noise. Keep it concise:\n\n{input_data}",
            "summarize": f"Providing a concise summary of the following text:\n\n{input_data}",
            "extract": f"Extract the key entities and structured information from the following text as a JSON-like string:\n\n{input_data}",
            "tag": f"Categorize the following text with relevant tags based on its content. Return only a comma-separated list of tags:\n\n{input_data}",
            # `insight` produces short insights and actionable recommendations from the input
            "insight": f"Read the following text and produce 3 short insights and 2 actionable recommendations. Keep each insight to one sentence and each recommendation short and specific:\n\n{input_data}"
        }

        if step_type not in prompts:
            raise ValueError(f"Unknown step type: {step_type}")

        prompt = prompts[step_type]
        if config:
             prompt += f"\n\nAdditional instructions: {config}"

        return await self._call_gemini(prompt)

    async def run_workflow(self, steps: List[Dict[str, Any]], initial_data: str) -> str:
        current_data = initial_data
        for step in steps:
            current_data = await self.run_step(
                step_type=step["type"],
                input_data=current_data,
                config=step.get("config", {})
            )
        return current_data
