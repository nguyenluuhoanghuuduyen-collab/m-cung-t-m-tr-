import { EmotionalResource, RealWorldQuest } from "./types";

interface JourneyData {
  emotionalResource: EmotionalResource;
  history: { sender: "user" | "architect"; text: string }[];
  quests: RealWorldQuest[];
  completedQuestIndexes: number[];
  restorativeScore: number;
}

// Dynamically load html2pdf from CDN to keep local bundle size minimal and serverless friendly
function loadHtml2Pdf(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).html2pdf) {
      resolve((window as any).html2pdf);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.setAttribute("integrity", "sha512-GsLlZN/3F2ErC5IfS51RR841q569UXQcPsDBWfVVR6XXcTIipg37ICpMB1imYGSEz85Ibxzk959l1A1pl15IiQ==");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("referrerpolicy", "no-referrer");
    
    script.onload = () => {
      resolve((window as any).html2pdf);
    };
    script.onerror = () => {
      reject(new Error("Không thể tải thư viện xuất PDF từ CDN. Vui lòng kiểm tra lại kết nối mạng."));
    };
    
    document.body.appendChild(script);
  });
}

export async function exportJourneyToPDF(data: JourneyData): Promise<void> {
  const html2pdf = await loadHtml2Pdf();

  // Create a hidden styled container for the PDF content (light parchment theme for print optimization)
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "800px";
  container.style.padding = "40px";
  container.style.backgroundColor = "#faf8f5";
  container.style.color = "#1e1b4b";
  container.style.fontFamily = "'Inter', sans-serif";
  container.className = "pdf-report-container";

  // Filter out choices and greetings, focus on narrative progression and Socratic reflections
  const socratesQAs: { question: string; answer: string }[] = [];

  // Group user responses and narrative states
  data.history.forEach((msg, idx) => {
    if (msg.sender === "user") {
      // Check if this user message was a Socrates answer
      const prevMsg = data.history[idx - 1];
      if (prevMsg && prevMsg.text.includes("?")) {
        // Simple heuristic for question-answer matching
        socratesQAs.push({
          question: prevMsg.text.slice(0, 150) + "...",
          answer: msg.text
        });
      }
    }
  });

  const currentDate = new Date().toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  container.innerHTML = `
    <div style="border: 2px solid #d97706; padding: 30px; border-radius: 12px; background-color: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f59e0b; padding-bottom: 20px;">
        <h1 style="font-family: 'Outfit', sans-serif; font-size: 26px; color: #7c2d12; margin: 0 0 5px 0; letter-spacing: -0.5px;">
          InnerScape: Mê Cung Tâm Trí
        </h1>
        <p style="font-size: 12px; color: #b45309; font-family: monospace; text-transform: uppercase; margin: 0; font-weight: bold; letter-spacing: 1px;">
          Báo cáo Kết quả Rèn luyện & Khám phá Bản thân
        </p>
        <p style="font-size: 10px; color: #6b7280; margin: 5px 0 0 0;">
          Ngày xuất bản: ${currentDate} &bull; Hành trình: Voyager (Nặc danh)
        </p>
      </div>

      <!-- Stats Grid -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 14px; text-transform: uppercase; font-family: 'Outfit', sans-serif; border-left: 3px solid #d97706; padding-left: 10px; margin-bottom: 15px; color: #7c2d12;">
          Chỉ Số Tài Nguyên Tâm Lý (Emotional Resources)
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 15px; border-radius: 8px; text-align: center;">
            <span style="font-size: 10px; color: #6b21a8; font-weight: bold; display: block; margin-bottom: 5px;">THẤU CẢM (Empathy)</span>
            <strong style="font-size: 24px; color: #7e22ce;">${data.emotionalResource.empathy}/100</strong>
          </div>
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
            <span style="font-size: 10px; color: #92400e; font-weight: bold; display: block; margin-bottom: 5px;">KIÊN ĐỊNH (Resilience)</span>
            <strong style="font-size: 24px; color: #d97706;">${data.emotionalResource.resilience}/100</strong>
          </div>
          <div style="background-color: #eff6ff; border: 1px solid #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
            <span style="font-size: 10px; color: #1e40af; font-weight: bold; display: block; margin-bottom: 5px;">SÁNG SUỐT (Clarity)</span>
            <strong style="font-size: 24px; color: #2563eb;">${data.emotionalResource.clarity}/100</strong>
          </div>
        </div>
        <div style="margin-top: 15px; text-align: right;">
          <span style="background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 5px 12px; border-radius: 99px; font-size: 11px; font-weight: bold; font-family: monospace;">
            Phục Hồi Lực: ${data.restorativeScore} RP
          </span>
        </div>
      </div>

      <!-- Socratic Reflection Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 14px; text-transform: uppercase; font-family: 'Outfit', sans-serif; border-left: 3px solid #d97706; padding-left: 10px; margin-bottom: 15px; color: #7c2d12;">
          Nhật Ký Phản Chiếu & Tự Sự (Socratic Reflections)
        </h3>
        ${
          socratesQAs.length === 0
            ? `<p style="font-size: 12px; color: #6b7280; font-style: italic; background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px dashed #e5e7eb;">
                Voyager chưa tham gia giải mã hoặc trả lời câu hỏi tự suy ngẫm nào từ thủ thư văn học.
              </p>`
            : socratesQAs.map((qa, idx) => `
                <div style="margin-bottom: 15px; background-color: #fcfbf9; border: 1px solid #f3f1ec; padding: 15px; border-radius: 8px;">
                  <p style="font-size: 11px; color: #b45309; font-weight: bold; margin: 0 0 5px 0;">Câu hỏi gợi mở #${idx + 1}:</p>
                  <p style="font-size: 12px; color: #4b5563; font-style: italic; margin: 0 0 10px 0; leading-height: 1.5;">"${qa.question}"</p>
                  <p style="font-size: 11px; color: #1e1b4b; font-weight: bold; margin: 0 0 3px 0;">Voyager bộc bạch:</p>
                  <p style="font-size: 12px; color: #111827; margin: 0; font-family: Georgia, serif; line-height: 1.5; padding-left: 10px; border-left: 2px solid #d97706;">
                    "${qa.answer}"
                  </p>
                </div>
              `).join("")
        }
      </div>

      <!-- Completed Quests Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 14px; text-transform: uppercase; font-family: 'Outfit', sans-serif; border-left: 3px solid #d97706; padding-left: 10px; margin-bottom: 15px; color: #7c2d12;">
          Hành Động Phục Hồi Đời Thực (Real-world Restorative Quests)
        </h3>
        ${
          data.quests.length === 0
            ? `<p style="font-size: 12px; color: #6b7280; font-style: italic; background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px dashed #e5e7eb;">
                Chưa mở khóa hoặc hoàn thành nhiệm vụ thực tế nào.
              </p>`
            : data.quests.map((quest, idx) => {
                const isCompleted = data.completedQuestIndexes.includes(idx);
                return `
                  <div style="display: flex; gap: 15px; margin-bottom: 12px; background-color: ${isCompleted ? '#f0fdf4' : '#fff'}; border: 1px solid ${isCompleted ? '#bbf7d0' : '#e5e7eb'}; padding: 12px; border-radius: 8px;">
                    <div style="color: ${isCompleted ? '#16a34a' : '#9ca3af'}; font-size: 16px; font-weight: bold;">
                      ${isCompleted ? '✓' : '○'}
                    </div>
                    <div style="flex-grow: 1;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 12px; color: ${isCompleted ? '#15803d' : '#1e1b4b'};">${quest.title}</strong>
                        <span style="font-size: 9px; padding: 2px 8px; border-radius: 99px; background-color: ${isCompleted ? '#dcfce7' : '#f3f4f6'}; color: ${isCompleted ? '#16a34a' : '#6b7280'}; font-weight: bold; text-transform: uppercase;">
                          ${isCompleted ? 'Hoàn thành' : 'Chưa xong'}
                        </span>
                      </div>
                      <p style="font-size: 11px; color: #4b5563; margin: 4px 0 0 0; line-height: 1.4;">${quest.description}</p>
                    </div>
                  </div>
                `;
              }).join("")
        }
      </div>

      <!-- Footer Stamp -->
      <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; position: relative;">
        <div style="display: inline-block; text-align: left; max-width: 320px;">
          <p style="font-size: 11px; color: #4b5563; font-style: italic; text-align: center; margin-bottom: 15px;">
            "Hãy biến những mảnh vỡ tổn thương trong mê cung ảo thành những vì sao rực sáng trong đời thực."
          </p>
          <div style="text-align: center;">
            <div style="display: inline-block; border: 2px dashed #b45309; color: #b45309; padding: 8px 15px; font-family: monospace; font-size: 11px; border-radius: 4px; font-weight: bold; transform: rotate(-2deg); text-transform: uppercase;">
              INNER_SCAPE APPROVED &bull; ARCH_ARCHITECT
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Configure html2pdf options for high quality A4 PDF rendering
  const options = {
    margin: 10,
    filename: `InnerScape_Journey_Report_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  try {
    await html2pdf().from(container).set(options).save();
  } catch (error) {
    console.error("Lỗi xuất PDF:", error);
    throw error;
  } finally {
    // Clean up temporary DOM node
    document.body.removeChild(container);
  }
}
