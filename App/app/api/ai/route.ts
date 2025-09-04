import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const response = await fetch(`${process.env.OLLAMA_API_URL}/api/generate`, {
      method: "POST",

      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-oss:20b",
        prompt,
        stream: false
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Ollama request failed" }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
