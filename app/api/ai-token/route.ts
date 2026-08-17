import { GoogleGenAI } from '@google/genai'

// Creates a short-lived ephemeral token so the browser can connect
// directly to the Gemini Live API without exposing the real API key.
export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY सेट नहीं है' }, { status: 500 })
    }

    const client = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' })

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        httpOptions: { apiVersion: 'v1alpha' },
      },
    })

    return Response.json({ token: token.name })
  } catch (err) {
    console.error('[ai-token] failed:', err)
    return Response.json({ error: 'AI टोकन नहीं बन पाया' }, { status: 500 })
  }
}
