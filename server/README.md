# NyayaSetu Backend

## Voice FIR

Voice FIR uses the browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
The browser converts speech to text and places the recognized text directly into the FIR description field.

No OpenAI API key or audio-upload endpoint is required for Voice FIR.

Health check:
- `GET /api/health`
- `GET /api/v1/voice/health`

The second endpoint only reports the Voice FIR mode; it does not perform transcription.

## Advanced Analytics

- `GET /api/v1/analytics`
- `POST /api/v1/analytics/cases`
