import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
    <div className="pt-20 max-w-4xl mx-auto px-4 py-10">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate('/news')}
        className="flex items-center gap-2 mb-6 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Quay lại</span>
      </button>

      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-500 mb-6">
        {article.author} • {new Date(article.publishedAt).toLocaleDateString()}
      </p>

      {/* Ảnh bài viết - thu nhỏ, căn giữa, responsive */}
      <div className="flex justify-center mb-6">
        <img
          src={article.image || "https://via.placeholder.com/800x400"}
          alt={article.title}
          className="rounded-xl w-[70%] max-w-2xl object-contain shadow-md"
        />
      </div>

      {/* Nội dung bài viết */}
      <p className="leading-relaxed text-lg whitespace-pre-line text-justify">
        {article.content}
      </p>
    </div>
  );
}
