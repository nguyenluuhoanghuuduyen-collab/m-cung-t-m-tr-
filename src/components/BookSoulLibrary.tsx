import React, { useState } from "react";
import { BookItem } from "../types";
import { BookOpen, Quote, Shield, Heart, Sparkles, Filter } from "lucide-react";

const booksData: BookItem[] = [
  {
    title: "Giết Con Chim Nhạn",
    author: "Harper Lee",
    quote: "Con chưa bao giờ thực sự hiểu một người cho đến khi con đặt mình vào vị thế của họ và đi xung quanh trong lớp da của họ.",
    therapeuticValue: "Giúp Voyager rèn luyện trí tuệ thấu cảm (Empathy) sâu sắc trước các định kiến, thói phán xét bầy đàn hay sự cô lập bạn bè.",
    category: "Xung đột & Thấu cảm"
  },
  {
    title: "Thiện Ác và Smartphone",
    author: "Đặng Hoàng Giang",
    quote: "Đằng sau mỗi chiếc màn hình là một cơ thể bằng xương bằng thịt, một trái tim biết đau đớn và những giọt nước mắt có thật.",
    therapeuticValue: "Nhận diện nỗi đau từ bạo lực mạng, sự miệt thị trực tuyến. Khuyên người dùng giữ sự Sáng suốt (Clarity) và ngưng lan truyền định kiến.",
    category: "Bạo lực mạng"
  },
  {
    title: "Tôi Tự Học",
    author: "Thu Giang Nguyễn Duy Cần",
    quote: "Biết tự học là một sự giải phóng hoàn toàn, giúp khối óc thoát khỏi sự thụ động rập khuôn để tự tìm kiếm chân lý thực sự.",
    therapeuticValue: "Khuyên nhủ học sinh giữ sự Sáng suốt (Clarity), học tập tự chủ và có chiều sâu nội tâm giữa các kỳ thi nặng nề.",
    category: "Áp lực học tập"
  },
  {
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu?",
    author: "Rosie Nguyễn",
    quote: "Những ngày tháng tuổi trẻ chính là những năm tháng định hình nên con người bạn. Đừng lãng phí nó trong sự lo âu và nuối tiếc thụ động.",
    therapeuticValue: "Vực dậy ngọn lửa đam mê, xoa dịu stress học tập và lo âu định hướng nghề nghiệp cho thanh thiếu niên.",
    category: "Lo âu & Stress"
  },
  {
    title: "Chiến Binh Cầu Vồng",
    author: "Andrea Hirata",
    quote: "Học tập không chỉ là thu thập kiến thức, mà là học cách ước mơ và không bao giờ từ bỏ ước mơ đó, dù hoàn cảnh có tồi tệ đến đâu.",
    therapeuticValue: "Vực dậy tinh thần Kiên định (Resilience) vượt khó khi đối mặt áp lực học tập hoặc nghịch cảnh gia đình.",
    category: "Áp lực học tập"
  },
  {
    title: "Hoàng Tử Bé",
    author: "Antoine de Saint-Exupéry",
    quote: "Người ta chỉ nhìn rõ được bằng trái tim. Con mắt thường mù lòa trước những điều cốt tủy.",
    therapeuticValue: "Xoa dịu Stress và lo âu tuổi dậy thì thông qua việc thấu hiểu các mối quan hệ quý báu, tình bạn chân thật.",
    category: "Lo âu & Stress"
  },
  {
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    quote: "Khi bạn khao khát một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được điều đó.",
    therapeuticValue: "Tiếp thêm ngọn lửa kiên định để lắng nghe tiếng nói sâu thẳm của trái tim mình giữa những tiếng ồn ào xung quanh.",
    category: "Lo âu & Stress"
  }
];

export default function BookSoulLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");

  const categories = ["Tất cả", "Lo âu & Stress", "Xung đột & Thấu cảm", "Áp lực học tập", "Bạo lực mạng"];

  const filteredBooks = selectedCategory === "Tất cả" 
    ? booksData 
    : booksData.filter(b => b.category === selectedCategory);

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 border border-amber-500/30">
          <BookOpen className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-amber-100 font-sans tracking-tight">
            Tàng Thư Thần Trí (The Time Librarian)
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Kết nối vết thương tâm hồn với những tri thức vĩnh hằng
          </p>
        </div>
      </div>

      {/* Filter categories */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-900 pb-4">
        {categories.map(cat => (
          <button
            key={cat}
            id={`cat-btn-${cat.replace(/\s+/g, "-")}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-amber-500 text-slate-950 font-medium border border-amber-400/45"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Books List */}
      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {filteredBooks.map((book, index) => (
          <div
            key={index}
            id={`book-item-${index}`}
            className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl p-4 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h4 className="text-sm font-semibold text-amber-200 font-sans group-hover:text-amber-300 transition-colors">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-500 font-mono italic">
                  Tác giả: {book.author}
                </p>
              </div>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 text-amber-400 font-mono">
                {book.category}
              </span>
            </div>

            <div className="relative border-l-2 border-amber-500/30 pl-3 my-3">
              <Quote className="w-3.5 h-3.5 text-amber-500/40 absolute -top-1 -left-1" />
              <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                "{book.quote}"
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-2 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                <span className="font-medium text-amber-300/80">Giá trị trị liệu: </span>
                {book.therapeuticValue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
