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

  if (!article) return <div className="pt-20 text-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 min-h-screen">Đang tải...</div>;

  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 py-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate('/news')}
        className="flex items-center gap-2 mb-6 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Quay lại</span>
      </button>

      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {article.author} • {new Date(article.publishedAt).toLocaleDateString()}
      </p>

      <div
        className="prose dark:prose-invert max-w-none leading-relaxed text-lg text-justify [&>p]:mb-4 [&>img]:rounded-xl [&>img]:shadow-md [&>img]:mx-auto [&>img]:max-w-full"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
}
