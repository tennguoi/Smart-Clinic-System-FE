import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function NewsDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8082/api/public/articles/${id}`)
      .then((res) => res.json())
      .then((data) => setArticle(data));
  }, [id]);

  if (!article) return <div className="pt-20 text-center">Đang tải...</div>;

  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 py-10">
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
