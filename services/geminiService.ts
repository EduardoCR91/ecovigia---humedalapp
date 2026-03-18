
import { GoogleGenAI } from "@google/genai";

/**
 * Service to interact with Gemini API for EcoBot.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (prompt: string, lang: 'es' | 'en') => {
  try {
    const languageLabel = lang === 'en' ? 'INGLÉS' : 'ESPAÑOL';
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Idioma de respuesta: ${languageLabel}\n\nPregunta del usuario:\n${prompt}`,
      config: {
        systemInstruction: `Eres EcoBot, un asistente experto en el Humedal de Techo en Bogotá, Colombia.
Tu objetivo es educar, informar sobre la biodiversidad (como la Tingua Azul o el Cucarachero de Pantano)
y promover la protección ambiental.

Responde SIEMPRE en el idioma indicado (español o inglés) y con un formato muy claro y fácil de leer:
- Empieza con un TÍTULO corto en mayúsculas (máx. 6 palabras) en el idioma correcto.
- Luego da una EXPLICACIÓN BREVE de 2 a 3 frases sencillas.
- Después escribe de 3 a 5 PUNTOS CLAVE usando viñetas con el símbolo "•".
- Termina con una línea que empiece por "Recuerda:" o "Remember:" según el idioma, con una recomendación práctica para cuidar el humedal.

Evita párrafos largos, lenguaje muy técnico o respuestas desordenadas.
Si te preguntan algo fuera del contexto de humedales o Bogotá, responde muy brevemente y redirige la conversación hacia la importancia ecológica del humedal.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, tuve un problema al procesar tu consulta.";
  }
};

/**
 * Fetches real-time weather for Humedal de Techo.
 * Removed googleSearch tool as it is incompatible with mandatory JSON parsing requirements in the guidelines.
 */
export const getWetlandWeather = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Proporciona el clima actual aproximado en el Humedal de Techo, Bogotá: temperatura en °C, humedad en % y velocidad del viento en km/h. Responde únicamente en formato JSON con estas llaves: temp, humidity, wind.",
      config: {
        responseMimeType: "application/json"
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    return null;
  }
};
