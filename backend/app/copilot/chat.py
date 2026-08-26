from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
from google import genai
from google.genai import types

router = APIRouter(prefix="/api/v1/copilot", tags=["copilot"])

class ChatRequest(BaseModel):
    query: str
    
# Mock context for the LLM to use
SYSTEM_INSTRUCTION = """
You are the QUANTX AI Copilot, a sophisticated institutional finance assistant.
The user is asking you a question about their portfolio, markets, or research.
You have access to live market data, news, and portfolio holdings.

Your response MUST be an array of CopilotBlock objects in valid JSON format.
Each CopilotBlock can be one of the following kinds:
- {"kind": "text", "text": "Markdown formatted string"}
- {"kind": "metrics", "items": [{"k": "Metric Name", "v": "Value", "tone": "pos" | "neg" | "neu"}]}
- {"kind": "chart", "type": "bar" | "line", "data": [{"label": "Name", "value": number}], "unit": "Optional unit"}
- {"kind": "table", "cols": ["Col1", "Col2"], "rows": [["Val1", "Val2"]]}

Do NOT wrap the JSON in markdown code blocks. Just output the raw JSON array.
Respond strictly in a professional, quantitative, institutional tone.
"""

@router.post("/ask")
def ask_copilot(req: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Fallback to deterministic responses if no API key is provided
        q = req.query.lower()
        if "nifty" in q or "compare" in q or "benchmark" in q:
            return {
                "status": "success",
                "data": [
                    { "kind": "text", "text": "Year-to-date the strategy has returned **+14.72%** against **+9.14%** for NIFTY 50 — an excess of **+5.58pp** delivered with 24% lower realised volatility." },
                    { "kind": "metrics", "items": [
                        { "k": "Portfolio YTD", "v": "+14.72%", "tone": "pos" },
                        { "k": "NIFTY 50 YTD", "v": "+9.14%", "tone": "pos" },
                        { "k": "Excess return", "v": "+5.58pp", "tone": "pos" }
                    ]}
                ]
            }
        else:
            return {
                "status": "success",
                "data": [
                    { "kind": "text", "text": "I am currently running in offline mode because `GEMINI_API_KEY` is not set. Please set the API key in the backend environment to enable full Semantic RAG." }
                ]
            }
            
    client = genai.Client(api_key=api_key)
    
    # In a full RAG implementation, we would query Pinecone/ChromaDB here
    # For now, we simulate RAG by injecting a snapshot of the portfolio
    portfolio_context = "Current Portfolio: 15% HDFCBANK, 12% RELIANCE, 8% INFY, 65% Cash. Total PnL: +4.2% YTD."
    
    prompt = f"Portfolio Context: {portfolio_context}\n\nUser Question: {req.query}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.2,
            ),
        )
        
        # Parse the JSON response
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        blocks = json.loads(text)
        return {"status": "success", "data": blocks}
    except Exception as e:
        print(f"Copilot Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI response")
