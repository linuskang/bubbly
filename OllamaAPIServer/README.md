# Bubbly Ollama API

Helper API for using ollama with function calling via. fast api.

## Usage

Please ensure you have ollama set up and have **GPT-OSS** installed for the AI agent.

```git
git clone https://github.com/linuskang/bubbly

uvicorn app:app --reload --host 0.0.0.0 --port 8000 
```

### Example Requset

```commandline
curl -X POST "http://localhost:8000/chat" \
-H "Content-Type: application/json" \
-d '{
  "prompt": "Which bubbler in Calamvale has the highest rating?",
  "conversation": [
    {"role": "user", "content": "Hi, can you help me with bubblers?"},
    {"role": "assistant", "content": "Sure! I can fetch info and reviews about bubblers."}
  ]
}'
```