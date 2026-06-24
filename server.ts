import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crashes if key is missing on startup
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// System instructions for the Arch-Architect
const SYSTEM_INSTRUCTION = `
Bạn là The Arch-Architect (Kiến trúc sư Trưởng), trí tuệ nhân tạo trung tâm điều hành toàn bộ vũ trụ "InnerScape: Mê Cung Tâm Trí". Bạn không chỉ là một người kể chuyện, mà còn là một chuyên gia tâm lý học lâm sàng dành cho thanh thiếu niên, một nhà giáo dục theo triết lý kỷ luật tích cực và một thủ thư thông thái về văn học thế giới.

Bạn vận hành đồng thời 3 thực thể (Sub-persona):
1. AI Dungeon Master: Xây dựng kịch bản RPG tùy biến theo dữ liệu thời gian thực.
2. AI Therapist (The Echo): Phân tích tâm lý sâu, phản hồi bằng phương pháp Socrates.
3. AI Book Soul Scanner (The Time Librarian): Kết nối nỗi đau của người dùng với tri thức nhân loại qua văn học.

Mục tiêu của bạn:
- Chuyển hóa giáo dục: Biến các bài học đạo đức/kỹ năng sống khô khan thành hành trình khám phá bản thân đầy kịch tính.
- Điều hướng cảm xúc: Giúp học sinh nhận diện, đối mặt và giải quyết các xung đột nội tâm (stress, áp lực học tập, lo âu, áp lực đồng trang lứa) và xã hội (bạo lực học đường, cô lập).
- Thúc đẩy hành động thực tế: Dẫn dắt học sinh từ thế giới ảo đến các hành động phục hồi (Restorative Justice) trong đời thực.
- Nuôi dưỡng văn hóa đọc: Biến sách thành "vũ khí" và "liều thuốc" để vượt qua các thử thách trong mê cung.

Quy tắc Ứng xử và Trị liệu:
- Phương pháp Socrates: Không bao giờ đưa ra lời khuyên trực tiếp. Thay vào đó, đặt câu hỏi ngược để người học tự nhận thức (ví dụ: "Nếu bạn là nhân vật bị cô lập trong câu chuyện này, cảm giác nào sẽ chiếm lấy lồng ngực bạn đầu tiên?").
- Shadow Mode (Góc tối): Nếu học sinh có xu hướng chọn giải pháp tiêu cực/tấn công, hãy chuyển sang chế độ phản chiếu, mô phỏng nỗi đau của nạn nhân để đánh thức sự thấu cảm.
- Bảo mật & Quyền riêng tư: Tuyệt đối không tiết lộ thông tin cá nhân của học sinh này cho học sinh khác, chỉ tổng hợp dữ liệu dưới dạng "Dải ngân hà lớp học" (màu sắc chung).
- Tích hợp Văn hóa Đọc: Mỗi khi người chơi gặp bế tắc (Bóng ma tâm lý), hãy đưa ra một "Mảnh vỡ tri thức" từ các tác phẩm văn học nổi tiếng thế giới phù hợp với trạng thái tâm lý (ví dụ: "Giết con chim nhạn", "Thiện Ác và Smartphone", "Chiến binh cầu vồng", "Hoàng tử bé", "Nhà giả kim", "Khi lỗi thuộc về những vì sao", v.v.).

LƯU Ý: Phản hồi của bạn PHẢI LUÔN tuân theo cấu trúc JSON định sẵn để client hiển thị đồ họa tuyệt đẹp. Giọng văn phải mang âm hưởng Dark Academia (tri thức, cổ điển, sâu lắng, đậm tính văn học) pha trộn Cyberpunk (hiện đại, sắc sảo, hệ thống kỹ thuật số), điềm tĩnh, huyền bí, đầy thấu cảm nhưng khách quan. Sử dụng nhiều ẩn dụ về ánh sáng, bóng tối, mê cung và những vì sao. Gọi học sinh là "Voyager" (Người lữ hành) hoặc "Architect" (Người kiến tạo). Xưng là "Ta" hoặc "InnerScape". Nhắc nhở tinh tế về nhạc nền Lo-fi Ambient hoặc không gian tím khói.
`;

const GAME_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  description: "Phản hồi có cấu trúc của InnerScape",
  properties: {
    islandStatus: {
      type: Type.STRING,
      description: "Mô tả trạng thái thời tiết, cảnh quan tâm trí (ví dụ: sương mù tím khói, bầu trời bão giông rực sấm sét neon, mây xám u sầu) phản ánh cảm xúc hiện tại của Voyager."
    },
    emotionalResource: {
      type: Type.OBJECT,
      description: "Chỉ số tài nguyên tâm lý hiện tại của Voyager sau hành động vừa rồi",
      properties: {
        empathy: { type: Type.INTEGER, description: "Chỉ số Thấu cảm (0-100)" },
        resilience: { type: Type.INTEGER, description: "Chỉ số Kiên định (0-100)" },
        clarity: { type: Type.INTEGER, description: "Chỉ số Sáng suốt (0-100)" }
      },
      required: ["empathy", "resilience", "clarity"]
    },
    narrative: {
      type: Type.STRING,
      description: "Phần cốt truyện tiếp nối, kịch bản bạo lực mạng, miệt thị ngoại hình, áp lực học tập hoặc sự cô lập bộc lộ. Viết bằng giọng văn Dark Academia cổ điển kết hợp Cyberpunk hiện đại lôi cuốn."
    },
    knowledgeFragment: {
      type: Type.OBJECT,
      description: "Mảnh vỡ tri thức từ thư viện văn học thế giới giúp soi sáng tâm trí Voyager.",
      properties: {
        bookTitle: { type: Type.STRING, description: "Tên cuốn sách nổi tiếng phù hợp (ví dụ: Giết con chim nhạn, Thiện Ác và Smartphone...)" },
        quote: { type: Type.STRING, description: "Câu trích dẫn đắt giá từ cuốn sách này" },
        insight: { type: Type.STRING, description: "Phân tích tâm lý thấu cảm, liên hệ câu trích dẫn này với thử thách hiện tại bằng phương pháp Socrates." },
        question: { type: Type.STRING, description: "Câu hỏi gợi mở tâm hồn ngắn gọn liên quan đến thông điệp sách để Voyager suy ngẫm." },
        correctAnswerExplanation: { type: Type.STRING, description: "Lời đúc kết sâu sắc gợi ý Voyager tìm câu trả lời trong chính lồng ngực mình." }
      },
      required: ["bookTitle", "quote", "insight", "question", "correctAnswerExplanation"]
    },
    choices: {
      type: Type.ARRAY,
      description: "Danh sách 3 lựa chọn hành động đại diện cho 3 khuynh hướng tâm lý khác nhau.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Phải là 'A', 'B' hoặc 'C'" },
          text: { type: Type.STRING, description: "Nội dung lựa chọn" },
          consequenceText: { type: Type.STRING, description: "Hệ quả logic ẩn sâu (thuật toán hiệu ứng cánh bướm) sẽ diễn ra khi Voyager chọn phương án này." },
          resourceChanges: {
            type: Type.OBJECT,
            properties: {
              empathy: { type: Type.INTEGER, description: "Thay đổi chỉ số thấu cảm (-15 đến +15)" },
              resilience: { type: Type.INTEGER, description: "Thay đổi chỉ số kiên định (-15 đến +15)" },
              clarity: { type: Type.INTEGER, description: "Thay đổi chỉ số sáng suốt (-15 đến +15)" }
            },
            required: ["empathy", "resilience", "clarity"]
          }
        },
        required: ["id", "text", "consequenceText", "resourceChanges"]
      }
    },
    realWorldQuest: {
      type: Type.OBJECT,
      description: "Nhiệm vụ phục hồi thực tế (Restorative Quest) thúc đẩy Voyager hành động tích cực ngoài đời thực.",
      properties: {
        title: { type: Type.STRING, description: "Tên nhiệm vụ thực tế đầy thi vị" },
        description: { type: Type.STRING, description: "Hướng dẫn thực hiện phục hồi nhân cách/giải quyết mâu thuẫn/chữa lành cụ thể." },
        reward: { type: Type.STRING, description: "Phần thưởng tinh thần ý nghĩa khi hoàn thành." }
      },
      required: ["title", "description", "reward"]
    }
  },
  required: ["islandStatus", "emotionalResource", "narrative", "knowledgeFragment", "choices", "realWorldQuest"]
};

// API Endpoint for processing chat/action
app.post("/api/architect/chat", async (req, res) => {
  try {
    const { message, history, emotionalResource } = req.body;

    const client = getGeminiClient();

    // Prepare contents
    // Let's build a well-formed prompt combining session history, current stats, and current message
    const formattedHistory = (history || []).map((msg: any) => {
      return `${msg.sender === "user" ? "Voyager" : "InnerScape"}: ${msg.text}`;
    }).join("\n");

    const prompt = `
[THÔNG TIN HỆ THỐNG]
Chỉ số tài nguyên hiện tại của Voyager:
- Thấu cảm: ${emotionalResource?.empathy ?? 50}/100
- Kiên định: ${emotionalResource?.resilience ?? 50}/100
- Sáng suốt: ${emotionalResource?.clarity ?? 50}/100

[LỊCH SỬ HÀNH TRÌNH]
${formattedHistory || "Voyager vừa mới đặt chân vào Mê cung InnerScape."}

[HÀNH ĐỘNG/PHẢN HỒI MỚI NHẤT CỦA VOYAGER]
Voyager nói/chọn: "${message}"

Hãy phân tích cảm xúc và hành động trên của Voyager, cập nhật chỉ số tài nguyên, và xây dựng phần tiếp theo của mê cung tâm trí theo đúng định dạng JSON yêu cầu. 
Hãy nhớ tích hợp sách văn học thế giới có nội dung sâu sắc giúp xoa dịu stress, áp lực, bạo lực mạng, cô lập xã hội...
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: GAME_RESPONSE_SCHEMA,
        temperature: 1.0,
      }
    });

    const replyText = response.text;
    if (!replyText) {
      throw new Error("Không nhận được phản hồi từ Arch-Architect.");
    }

    const parsedData = JSON.parse(replyText);
    res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini API Error in server:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating the scenario."
    });
  }
});

async function startServer() {
  // Serve frontend assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`InnerScape Server listening on http://localhost:${PORT}`);
  });
}

startServer();
