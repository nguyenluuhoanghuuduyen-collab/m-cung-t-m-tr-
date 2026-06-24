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

function getGeminiClient(customApiKey?: string) {
  import { GameResponse, EmotionalResource } from "./types";

// System instructions for the Arch-Architect
const SYSTEM_INSTRUCTION = `
Bạn là The Arch-Architect (Kiến trúc sư Trưởng), trí tuệ nhân tạo trung tâm điều hành toàn bộ vũ trụ "InnerScape: Mê Cung Tâm Trí". Bạn không chỉ là một người kể chuyện, mà còn là một chuyên gia tâm lý học lâm sàng dành cho thanh thiếu niên học sinh THPT Việt Nam, một nhà giáo dục theo triết lý kỷ luật tích cực và một thủ thư thông thái về văn học Việt Nam cũng như thế giới.

Bạn vận hành đồng thời 3 thực thể (Sub-persona):
1. AI Dungeon Master: Xây dựng kịch bản nhập vai tương tác (RPG) bẻ cong cốt truyện theo các lựa chọn thời gian thực của học sinh.
2. AI Therapist (The Echo): Phân tích tâm lý học đường sâu sắc, phản hồi bằng phương pháp Socrates nhẹ nhàng, đồng cảm.
3. AI Book Soul Scanner (The Time Librarian): Kết nối vết thương lòng của học sinh với tri thức nhân loại qua văn học.

Mục tiêu của bạn:
- Chuyển hóa giáo dục: Biến các bài học đạo đức/kỹ năng sống khô khan thành hành trình khám phá bản thân đầy kịch tính.
- Điều hướng cảm xúc: Giúp học sinh nhận diện, đối mặt và giải quyết các xung đột nội tâm liên quan đến học sinh cấp 3 Việt Nam (áp lực thi cử tốt nghiệp THPT Quốc gia, chọn trường chọn ngành đại học, áp lực đồng trang lứa, kỳ vọng Á Đông từ cha mẹ, bạo lực mạng qua confessions trường học, cô lập bè phái).
- Thúc đẩy hành động thực tế: Dẫn dắt học sinh từ thế giới ảo đến các hành động phục hồi (Restorative Justice) trong đời thực.
- Nuôi dưỡng văn hóa đọc: Giúp học sinh tìm lại bình yên thông qua các mảnh vỡ văn học thế giới và Việt Nam.

Quy tắc Ứng xử và Trị liệu:
- Phương pháp Socrates: Không bao giờ giáo điều hay đưa ra lời khuyên sáo rỗng trực tiếp. Thay vào đó, hãy phản hồi đầy thấu cảm và đặt câu hỏi gợi mở để Voyager tự liên hệ bản thân và suy ngẫm (ví dụ: "Nếu nhìn lại hành trình vừa qua, điều gì khiến đôi vai em cảm thấy nặng trĩu nhất?").
- Shadow Mode (Góc tối): Nếu học sinh chọn giải pháp bộc phát/tấn công/tiêu cực (Lựa chọn C), hãy mô tả hậu quả một cách thực tế nhưng đầy thấu cảm, phản chiếu nỗi đau để đánh thức sự thấu cảm, chứ không chỉ trích hay phạt điểm thẳng thừng.
- Bảo mật & Quyền riêng tư: Giữ cho thế giới game nặc danh tuyệt đối, bảo vệ sự bộc bạch của học sinh.
- Tích hợp Văn hóa Đọc Việt Nam & Thế giới: Mỗi khi người chơi đối diện thử thách, hãy cung cấp một "Mảnh vỡ tri thức" từ thư viện văn học phù hợp (ví dụ: "Tuổi trẻ đáng giá bao nhiêu" - Rosie Nguyễn, "Tôi tự học" - Nguyễn Duy Cần, "Thiện Ác và Smartphone" - Đặng Hoàng Giang, "Giết con chim nhạn", "Hoàng tử bé", "Chiến binh cầu vồng", v.v.).

LƯU Ý: Phản hồi của bạn PHẢI LUÔN tuân theo cấu trúc JSON định sẵn để client hiển thị đồ họa tuyệt đẹp. Giọng văn phải mang âm hưởng Dark Academia (tri thức, cổ điển, sâu lắng, đậm tính văn học) pha trộn Cyberpunk (hiện đại, sắc sảo, hệ thống kỹ thuật số), điềm tĩnh, huyền bí, đầy thấu cảm nhưng khách quan. Sử dụng nhiều ẩn dụ về ánh sáng, bóng tối, mê cung và những vì sao. Gọi học sinh là "Voyager" (Người lữ hành) hoặc "Architect" (Người kiến tạo). Xưng là "Ta" hoặc "InnerScape". Nhắc nhở tinh tế về nhạc nền Lo-fi Ambient hoặc không gian tím khói.
`;

const GAME_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    islandStatus: {
      type: "string",
      description: "Mô tả trạng thái thời tiết, cảnh quan tâm trí (ví dụ: sương mù tím khói, bầu trời bão giông rực sấm sét neon, mây xám u sầu) phản ánh cảm xúc hiện tại của Voyager."
    },
    emotionalResource: {
      type: "object",
      properties: {
        empathy: { type: "integer", description: "Chỉ số Thấu cảm (0-100)" },
        resilience: { type: "integer", description: "Chỉ số Kiên định (0-100)" },
        clarity: { type: "integer", description: "Chỉ số Sáng suốt (0-100)" }
      },
      required: ["empathy", "resilience", "clarity"]
    },
    narrative: {
      type: "string",
      description: "Phần cốt truyện tiếp nối, kịch bản bạo lực mạng, miệt thị ngoại hình, áp lực học tập hoặc sự cô lập bộc lộ. Viết bằng giọng văn Dark Academia cổ điển kết hợp Cyberpunk hiện đại lôi cuốn."
    },
    knowledgeFragment: {
      type: "object",
      properties: {
        bookTitle: { type: "string", description: "Tên cuốn sách nổi tiếng phù hợp (ví dụ: Giết con chim nhạn, Thiện Ác và Smartphone...)" },
        quote: { type: "string", description: "Câu trích dẫn đắt giá từ cuốn sách này" },
        insight: { type: "string", description: "Phân tích tâm lý thấu cảm, liên hệ câu trích dẫn này với thử thách hiện tại bằng phương pháp Socrates." },
        question: { type: "string", description: "Câu hỏi gợi mở tâm hồn ngắn gọn liên quan đến thông điệp sách để Voyager suy ngẫm." },
        correctAnswerExplanation: { type: "string", description: "Lời đúc kết sâu sắc gợi ý Voyager tìm câu trả lời trong chính lồng ngực mình." }
      },
      required: ["bookTitle", "quote", "insight", "question", "correctAnswerExplanation"]
    },
    choices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Phải là 'A', 'B' hoặc 'C'" },
          text: { type: "string", description: "Nội dung lựa chọn" },
          consequenceText: { type: "string", description: "Hệ quả logic ẩn sâu (thuật toán hiệu ứng cánh bướm) sẽ diễn ra khi Voyager chọn phương án này." },
          resourceChanges: {
            type: "object",
            properties: {
              empathy: { type: "integer", description: "Thay đổi chỉ số thấu cảm (-15 đến +15)" },
              resilience: { type: "integer", description: "Thay đổi chỉ số kiên định (-15 đến +15)" },
              clarity: { type: "integer", description: "Thay đổi chỉ số sáng suốt (-15 đến +15)" }
            },
            required: ["empathy", "resilience", "clarity"]
          }
        },
        required: ["id", "text", "consequenceText", "resourceChanges"]
      }
    },
    realWorldQuest: {
      type: "object",
      properties: {
        title: { type: "string", description: "Tên nhiệm vụ thực tế đầy thi vị" },
        description: { type: "string", description: "Hướng dẫn thực hiện phục hồi nhân cách/giải quyết mâu thuẫn/chữa lành cụ thể." },
        reward: { type: "string", description: "Phần thưởng tinh thần ý nghĩa khi hoàn thành." }
      },
      required: ["title", "description", "reward"]
    }
  },
  required: ["islandStatus", "emotionalResource", "narrative", "knowledgeFragment", "choices", "realWorldQuest"]
};

// In client-side REST call, we use standard fetch to communicate directly with Google's servers.
export async function callGeminiDirectly(
  apiKey: string,
  message: string,
  history: { sender: "user" | "architect"; text: string }[],
  emotionalResource: EmotionalResource
): Promise<GameResponse> {
  // Use gemini-2.5-flash as the fallback client-side model because it is fast, stable, and highly compatible.
  const model = "gemini-2.5-flash"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Formulate history
  const formattedHistory = (history || []).map((msg) => {
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
Hãy nhớ tích hợp sách văn học nổi tiếng hoặc Việt Nam phù hợp để nâng cao nhận thức, chữa lành tâm hồn Voyager.
`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: SYSTEM_INSTRUCTION,
          },
        ],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GAME_RESPONSE_SCHEMA,
        temperature: 1.0,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = "Lỗi kết nối Gemini API.";
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson?.error?.message || errMsg;
    } catch (e) {}
    throw new Error(`Google API Error: ${errMsg}`);
  }

  const data = await response.json();
  const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!replyText) {
    throw new Error("Không nhận được nội dung phản hồi từ mô hình AI.");
  }

  const parsedData: GameResponse = JSON.parse(replyText);
  return parsedData;
}

[LỊCH SỬ HÀNH TRÌNH]
${formattedHistory || "Voyager vừa mới đặt chân vào Mê cung InnerScape."}

[HÀNH ĐỘNG/PHẢN HỒI MỚI NHẤT CỦA VOYAGER]
Voyager nói/chọn: "${message}"

Hãy phân tích cảm xúc và hành động trên của Voyager, cập nhật chỉ số tài nguyên, và xây dựng phần tiếp theo của mê cung tâm trí theo đúng định dạng JSON yêu cầu. 
Hãy nhớ tích hợp sách văn học nổi tiếng hoặc Việt Nam phù hợp để nâng cao nhận thức, chữa lành tâm hồn Voyager.
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
    
    // Trả về lỗi chi tiết hơn nếu thiếu API Key để Frontend hiển thị form cấu hình
    const isApiKeyMissing = error.message && (
      error.message.includes("API_KEY_MISSING") || 
      error.message.includes("API key not valid") || 
      error.message.includes("is not defined")
    );

    res.status(isApiKeyMissing ? 401 : 500).json({
      error: error.message || "An error occurred while generating the scenario.",
      code: isApiKeyMissing ? "API_KEY_MISSING" : "SERVER_ERROR"
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

