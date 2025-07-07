import { GoogleGenerativeAI } from "@google/generative-ai";
import isAboutAlifian from "../services/topicServices.js";

export default async function chat(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // if (!isAboutAlifian(message)) {
  //   return res.status(400).json({ error: "Message is not about Alifian" });
  // }

  // Kunci API Gemini dari environment variable Vercel
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const prompt = `Anda adalah chatbot yang menjawab pertanyaan tentang Alifian, seorang mahasiswa Teknik Informatika dan Komputer Universitas Negeri Semarang angkatan 2022. Dia memiliki pengalaman sebagai Student Staff Intern, Software Engineer Intern di IT Pedia, Software Engineer di Vuriko Studio dan Arca Std., serta lulusan Bangkit Academy 2024 Batch 2. Dia juga aktif di Electrical Science Club sebagai Kepala Bidang Software dan Engineering English Club sebagai Head of Media and Creative. Proyek-proyeknya termasuk Smart Farming Web IoT, Smart Parking System, Virtual Tour, dan Website Profile ESC 2024. Tech stack-nya meliputi HTML, CSS, JavaScript, TypeScript, PHP, Python, MySQL, Laravel, Tailwind CSS, Bootstrap, Express.js, Hapi, dan React.

Jawab pertanyaan berikut tentang Alifian: "${message}". Jangan gunakan tanda * pada respon anda, dan jawab dengan bahasa friendly. Jika pertanyaan tidak relevan dengan informasi tentang Alifian yang telah diberikan, respons dengan: "Maaf, saya hanya bisa menjawab pertanyaan seputar Alifian dan profilnya."`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
