# Bubbly Ollama API

Helper API for using ollama with function calling via. fast api.

## Usage

```git
git clone https://github.com/linuskang/bubbly-ollama-api

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

## License

**Bubbly** is under **CC BY-NC 4.0**. See [LICENSE](LICENSE) for more details.

## Credit

**Bubbly** is a project by **Linus Kang**. For any enquiries, please reach out at **email@linus.id.au**