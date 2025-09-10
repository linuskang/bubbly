from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional, Callable
from ollama import Client
from utils.tools import (
    get_reviews, get_info,
    get_reviews_tool, get_information_tool
)

client = Client(host='http://localhost:11434')

available_functions: Dict[str, Callable] = {
    'get_reviews': get_reviews,
    'get_info': get_info,
}

app = FastAPI()

origins = [
    "https://bubbly.linuskang.au",
    "http://localhost:3400",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str
    conversation: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    reply: str
    tool_calls: Optional[List[Dict[str, Any]]] = None

@app.post("/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    conversation = request.conversation or []

    system_prompt = {
        "role": "system",
        "content": "You are a helpful assistant, named Bubbly, that assists the users with any questions or queries to do with water bubbler and the Bubbly app. The Bubbly app is a web service that maps and tracks public water fountains (bubblers). It allows users to view all bubblers, search by name or location, and fetch detailed information about each bubbler. Users can also submit reviews and ratings for bubblers. The backend provides endpoints to create, read, and delete bubblers, and it can notify a Discord channel when bubblers are added or removed. Optional API key or session-based authentication protects sensitive actions like creating or deleting entries. The system supports additional features like filtering by accessibility, dog-friendliness, and presence of bottle fillers. If the user goes off context, tell them that you cannot assist, and to recommend them to ask something like: Can I help you with summarising reviews, Can I help you with something with water bubblers, etc..",
    }
    conversation.insert(0, system_prompt)
    conversation.append({"role": "user", "content": request.prompt})

    response = client.chat(
        model="gpt-oss:20b",
        messages=conversation,
        tools=[get_reviews_tool, get_information_tool],
    )

    tool_call_data = []
    if response.message.tool_calls:
        for tool_call in response.message.tool_calls:
            function_name = tool_call.function.name
            args = tool_call.function.arguments
            if function_to_call := available_functions.get(function_name):
                result = function_to_call(**args)
                follow_up = client.chat(
                    model="gpt-oss:20b",
                    messages=[
                        {"role": "system",
                         "content": "You are a helpful assistant, named Bubbly, that explains data in natural language. You need to help the user understand the data given to you with the prompt, and explain, summarise the details. Don't go too detailed. You are a summariser, helper, etc.."},
                        {"role": "user",
                         "content": f"The user asked: {request.prompt}. Here is the raw data from the tool {function_name}: {result}. Please explain it clearly in natural language."}
                    ]
                )
                conversation.append({"role": "assistant", "content": follow_up.message.content})
                return ChatResponse(reply=follow_up.message.content)

    return ChatResponse(reply=response.message.content, tool_calls=tool_call_data)