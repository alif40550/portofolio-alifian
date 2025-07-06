import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(cors());
app.use(express.json());

const alifianTopics = [
  "nama",
  "siapa alifian",
  "tentang alifian",
  "riwayat pendidikan",
  "pendidikan",
  "kuliah",
  "universitas",
  "jurusan",
  "angkatan",
  "pengalaman kerja",
  "pengalaman",
  "pekerjaan",
  "intern",
  "student staff",
  "software engineer",
  "proyek",
  "project",
  "projek",
  "portfolio",
  "aplikasi",
  "skills",
  "kemampuan",
  "tech stack",
  "teknologi",
  "bahasa pemrograman",
  "kontak",
  "hubungi",
  "email",
  "linkedin",
  "github",
  "instagram",
  "social media",
  "media sosial",
  "hobi",
  "minat",
  "kegiatan",
  "organisasi",
  "klub",
  "bangkit academy",
  "unnes",
  "electrical science club",
  "engineering english club",
  "ini alifian",
  "kamu siapa",
  "tentangmu",
  "biodata",
  "informasi",
  "website ini",
  "pembuat",
  "fungsi kamu",
  "bisa apa",
  "tentang chatbot",
  "kamu bot",
];

function isAboutAlifian(query) {
  const lowerQuery = query.toLowerCase();
  for (const topic of alifianTopics) {
    if (lowerQuery.includes(topic)) {
      return true;
    }
  }
  return false;
}

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

//   Check if the question is about "Alifian"
    if (!isAboutAlifian(userMessage)) {
      return res.json({ response: "Maaf, saya hanya bisa menjawab pertanyaan tentang Alifian. Silakan tanyakan hal lain tentang Alifian." });
    }

  try {
    const prompt = `Anda adalah chatbot yang menjawab pertanyaan tentang Alifian, seorang mahasiswa Teknik Informatika dan Komputer Universitas Negeri Semarang angkatan 2022. Dia memiliki pengalaman sebagai Student Staff Intern, Software Engineer Intern di IT Pedia, Software Engineer di Vuriko Studio dan Arca Std., serta lulusan Bangkit Academy 2024 Batch 2. Dia juga aktif di Electrical Science Club sebagai Kepala Bidang Software dan Engineering English Club sebagai Head of Media and Creative. Proyek-proyeknya termasuk Smart Farming Web IoT, Smart Parking System, Virtual Tour, dan Website Profile ESC 2024. Tech stack-nya meliputi HTML, CSS, JavaScript, TypeScript, PHP, Python, MySQL, Laravel, Tailwind CSS, Bootstrap, Express.js, Hapi, dan React.
        
        Jawab pertanyaan berikut tentang Alifian: "${userMessage}", jangan gunakan tanda * pada respon anda, dan awab dengan bahasa friendly`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    res.json({ response });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat memproses permintaan Anda." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
