import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is missing. Gemini AI will not function correctly.");
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

interface ChatHistory {
  role: 'user' | 'model';
  parts: string;
}

const WEBSITE_CONTEXT = `
Anda adalah Angkasa AI, asisten pintar untuk platform Angkasa.
Platform Angkasa adalah website yang didedikasikan untuk pengembangan diri dan karier.
Fitur Utama:
- Forum: Diskusi topik dengan pengguna lain untuk berbagi wawasan.
- Profil: Kelola identitas pengguna dan pencapaian.
- Dashboard Admin: Pusat kontrol untuk administrator mengelola konten dan pengguna.
- AI Agent: Itu Anda! Membantu pengguna navigasi dan menjawab pertanyaan.
- Tech Stack: Dibangun dengan React, Vite, Tailwind CSS, dan Firebase.

Panduan Menjawab:
1. Jawab dengan ramah, profesional, dan membantu.
2. Fokuskan jawaban pada konteks Angkasa jika relevan.
3. Anda bisa membantu navigasi, menjelaskan fitur, atau memberi saran pengembangan diri umum.
4. Gunakan Bahasa Indonesia yang baik dan benar.
`;

export const chatWithGemini = async (history: ChatHistory[], message: string): Promise<string> => {
  if (!API_KEY) {
    return "Maaf, saya sedang mengalami gangguan konfigurasi (API Key missing). Silakan hubungi admin.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepend system context if history is empty or just as a general instruction
    // Note: Gemini Pro works best if system instruction is part of the prompt or a user message.
    // We will inject it as the first message in the history internally.
    
    const internalHistory = [
      {
        role: 'user',
        parts: [{ text: WEBSITE_CONTEXT }]
      },
      {
        role: 'model',
        parts: [{ text: "Baik, saya mengerti. Saya adalah Angkasa AI, siap membantu pengguna platform Angkasa." }]
      },
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }]
      }))
    ];

    const chat = model.startChat({
      history: internalHistory as any, // Cast to any to bypass strict type check if needed, though structure matches
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";
  }
};
