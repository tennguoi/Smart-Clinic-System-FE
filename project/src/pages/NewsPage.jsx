import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function NewsPage() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);

  const loadArticles = async () => {
    let url = `http://localhost:8082/api/public/articles?page=${page}&size=6`;
    if (category) {
      url = `http://localhost:8082/api/public/articles/category/${encodeURIComponent(category)}`;
    }
    if (keyword) {
      url = `http://localhost:8082/api/public/articles/search?title=${encodeURIComponent(keyword)}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Failed to load articles (${response.status})`);
      }
      const data = await response.json();
      setNews(data.content ? data.content : data);
    } catch (error) {
      console.error("Error loading articles:", error);
      setNews([]);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [category, keyword, page]);

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 pb-20">
      
      <h1 className="text-4xl font-bold text-center mb-10">Tin Tức Y Khoa</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            className="w-full border rounded-lg py-3 px-4 pl-10"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>

              <select
        className="border rounded-lg py-3 px-4 w-full md:w-1/4"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Tất cả chuyên mục</option>
        <option value="Công nghệ">Công nghệ</option>
        <option value="Sức khỏe">Sức khỏe</option>
        <option value="Điều trị">Điều trị</option>
        <option value="Cảnh báo">Cảnh báo</option>
        <option value="Tư vấn">Tư vấn</option>
      </select>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {news.map((a) => (
          <div
            key={a.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden border hover:shadow-2xl transition"
          >
            <img
              src={a.image || "https://via.placeholder.com/400x200"}
              alt={a.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-5">
              <h2 className="text-lg font-bold mb-2">{a.title}</h2>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {a.content}
              </p>
              <button
                onClick={() => navigate(`/news/${a.id}`)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Đọc thêm →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10 space-x-3">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Trang trước
        </button>

        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
