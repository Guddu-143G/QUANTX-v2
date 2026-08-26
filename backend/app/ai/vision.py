import os
import io
from PIL import Image
from google import genai
from google.genai.errors import APIError

class VisionService:
    def __init__(self):
        self.model_id = "gemini-2.5-flash"
        self.api_key_missing = False
        self.client = None
        
        try:
            # Initializes client using GEMINI_API_KEY from environment
            self.client = genai.Client()
        except Exception as e:
            # Fallback if API key is not provided
            self.api_key_missing = True
        
        self.system_instruction = """
        You are a master technical analyst and market strategist with 20 years of experience on a prop trading desk. 
        Your goal is to look at the provided market chart and explain it to a layman so they can understand the current trend, 
        identify patterns, and make informed decisions.

        Structure your response exactly as follows in Markdown:

        ### 1. Market Structure & Trend
        Explain the overall trend (uptrend, downtrend, ranging). Mention higher highs, lower lows, or consolidation.
        Keep it simple.

        ### 2. Key Patterns & Levels
        Identify any specific chart patterns (e.g., Head and Shoulders, Double Bottom, Flags, Wedges).
        Identify key support and resistance zones.

        ### 3. Risk & Actionable Insight
        Provide a balanced view of what the chart suggests might happen next. 
        Provide clear scenarios (e.g., "If it breaks above X, it might go to Y. If it breaks below A, it might fall to B").
        Conclude with a clear risk warning that technical analysis deals in probabilities, not certainties.
        """

    def analyze_chart(self, image_bytes: bytes, mime_type: str) -> str:
        # Convert bytes to PIL Image which google-genai accepts seamlessly
        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            raise ValueError(f"Invalid image format: {e}")

        if self.api_key_missing or not self.client:
            return """
> **Note: Demo Mode Activated** 
> No Gemini API key was detected. Displaying a simulated technical analysis report for demonstration purposes.

### 1. Market Structure & Trend
The asset is currently demonstrating a **classic rounded bottom or "saucer" formation**, indicative of a gradual shift from a bearish trend to a bullish accumulation phase. We see the price consolidating near the lows before breaking out with higher highs and higher lows, suggesting buyers are steadily regaining control.

### 2. Key Patterns & Levels
- **Support Zone:** A strong base has formed around the **86.20** level. This area was tested multiple times without breaking, indicating significant buyer interest (a "floor").
- **Resistance/Breakout:** The price recently shattered the descending trendline and broke through the immediate resistance at **88.20**.
- **Moving Averages:** We can observe a bullish crossover imminent, where the shorter-term moving average (blue) is curling upwards to cross above the longer-term moving average (orange), often signaling sustained upward momentum.

### 3. Risk & Actionable Insight
- **Bullish Scenario:** If the price sustains above the **88.20** breakout zone and successfully completes the current retest without falling back down, the next leg up is highly probable. 
- **Bearish Scenario:** If this is a "fakeout" and the price drops back below **86.20**, the bullish thesis is invalidated, and we could see a rapid decline.

*Disclaimer: Technical analysis deals in probabilities, not certainties. Always employ proper risk management.*
"""

        prompt = "Analyze this financial chart."

        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[image, prompt],
                config=genai.types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    temperature=0.4,
                )
            )
            return response.text
        except Exception as e:
            raise Exception(f"Failed to generate content: {str(e)}")
