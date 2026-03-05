import { GoogleGenAI, Type, Modality } from '@google/genai';

export function getApiKey() {
  return (window as any).process?.env?.API_KEY || process.env.GEMINI_API_KEY;
}

export async function generateStory(topic: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Write a short children's story about: ${topic}. The story should be 3-4 pages long. For each page, provide the text of the story and a detailed prompt for an image generator to create an illustration for that page. Make the story engaging and fun for kids!`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ['text', 'imagePrompt']
            }
          }
        },
        required: ['title', 'pages']
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateImage(prompt: string, size: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: '16:9',
        imageSize: size as any // "1K", "2K", "4K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function generateSpeech(text: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return base64Audio;
  }
  throw new Error("No audio generated");
}

export async function playPcmAudio(base64Data: string, sampleRate: number = 24000) {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const buffer = new Int16Array(bytes.buffer);
  const float32Data = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    float32Data[i] = buffer[i] / 32768.0;
  }

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = audioCtx.createBuffer(1, float32Data.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Data);

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
  
  return new Promise<void>((resolve) => {
    source.onended = () => resolve();
  });
}
