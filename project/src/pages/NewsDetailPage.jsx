import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8082/api/public/articles/${id}`)
      .then((res) => res.json())
      .then((data) => setArticle(data));
  }, [id]);

  if (!article) return <div className="pt-20 text-center">Đang tải...</div>;

  return (
    // Thêm class nền gradient cyan nhạt cho toàn trang nếu bạn muốn đồng bộ cả nền
    <div className="pt-20 min-h-screen bg-gradient-to-b from-cyan-50/30 to-white"> 
      <div className="max-w-4xl mx-auto px-4 py-10">
        
        {/* --- NÚT BACK ĐÃ SỬA MÀU CYAN --- */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            // Đã đổi border-green -> border-cyan, text-green -> text-cyan, hover:bg-cyan
            className="group flex items-center gap-2 px-5 py-2 bg-white border border-cyan-600 text-cyan-600 rounded-full font-semibold transition-all duration-300 hover:bg-cyan-600 hover:text-white shadow-sm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transform group-hover:-translate-x-1 transition-transform"
            >
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            Quay lại
          </button>
        </div>
        {/* -------------------------------- */}

        <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>
        <p className="text-gray-500 mb-6">
          {article.author} • {new Date(article.publishedAt).toLocaleDateString()}
        </p>

        {/* Ảnh bài viết */}
        <div className="flex justify-center mb-6">
          <img
            src={article.image || "https://via.placeholder.com/800x400"}
            alt={article.title}
            className="rounded-xl w-[70%] max-w-2xl object-contain shadow-md bg-white"
          />
        </div>

        {/* Nội dung bài viết */}
        <p className="leading-relaxed text-lg whitespace-pre-line text-justify text-gray-800">
          {article.content}
        </p>
      </div>
    </div>
  );
}