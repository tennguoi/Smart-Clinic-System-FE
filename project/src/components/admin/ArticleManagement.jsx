// src/components/admin/ArticleManagement.jsx
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, FileText } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(0);
  const size = 6;
  const [totalPages, setTotalPages] = useState(0);

  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    author: "",
    source: "",
    image: "",
  });

  const normalizeCategory = (str) => {
    if (!str) return "";
    return str
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const categoryColors = {
    "suc khoe": "bg-green-100 text-green-700",
    "tu van": "bg-blue-100 text-blue-700",
    "dieu tri": "bg-purple-100 text-purple-700",
    "canh bao": "bg-red-100 text-red-700",
    "cong nghe": "bg-orange-100 text-orange-700",
    default: "bg-gray-100 text-gray-700",
  };

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const fetchArticles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(
        `/api/public/articles?page=${page}&size=${size}`
      );

      const list = res.data.content || [];
      setArticles(list);
      setFilteredArticles(list);

      const cateList = [...new Set(list.map((a) => a.category))];
      setCategories(cateList);

      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...articles];

    if (filterTitle.trim()) {
      data = data.filter((a) =>
        a.title.toLowerCase().includes(filterTitle.toLowerCase())
      );
    }

    if (filterCategory) {
      data = data.filter((a) => a.category === filterCategory);
    }

    if (filterStartDate) {
      const start = new Date(filterStartDate);
      data = data.filter((a) => new Date(a.publishedAt) >= start);
    }

    if (filterEndDate) {
      const end = new Date(filterEndDate);
      end.setHours(23, 59, 59, 999);
      data = data.filter((a) => new Date(a.publishedAt) <= end);
    }

    setFilteredArticles(data);
  }, [filterTitle, filterCategory, filterStartDate, filterEndDate, articles]);

  const resetFilter = () => {
    setFilterTitle("");
    setFilterCategory("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilteredArticles(articles);
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setFilterStartDate(value);

    setFilterEndDate((prev) => {
      if (!prev) return prev;
      if (value && new Date(prev) < new Date(value)) {
        return value;
      }
      return prev;
    });
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;

    if (filterStartDate && value && new Date(value) < new Date(filterStartDate)) {
      setFilterEndDate(filterStartDate);
    } else {
      setFilterEndDate(value);
    }
  };

  const handleOpenModal = (mode, article = null) => {
    setModalMode(mode);
    setSelectedArticle(article);
    setError("");
    setSuccess("");

    if (mode === "edit") {
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        author: article.author,
        source: article.source,
        image: article.image,
      });
    } else {
      setFormData({
        title: "",
        content: "",
        category: "",
        author: "",
        source: "",
        image: "",
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (modalMode === "edit") {
        await axiosInstance.put(
          `/api/admin/articles/${selectedArticle.id}`,
          formData
        );
        setSuccess("Cập nhật bài viết thành công!");
      } else {
        await axiosInstance.post("/api/admin/articles", formData);
        setSuccess("Tạo bài viết thành công!");
      }

      setTimeout(() => {
        fetchArticles();
        handleCloseModal();
        setSuccess("");
      }, 1200);
    } catch {
      setError("Có lỗi khi lưu bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
      await axiosInstance.delete(`/api/admin/articles/${id}`);
      setSuccess("Xóa bài viết thành công!");
      fetchArticles();
    } catch {
      setError("Không thể xóa bài viết");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("vi-VN", { hour12: false });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-1 rounded ${
              page === i
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Bài viết</h1>
        </div>

        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          Tạo bài viết mới
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">{success}</div>}

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="text-sm font-medium mb-1 block">Tiêu đề</label>
            <input
              type="text"
              placeholder="Tìm theo tiêu đề"
              className="border px-3 py-2 rounded-lg w-full"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
            />
          </div>

          <div className="lg:col-span-3">
            <label className="text-sm font-medium mb-1 block">Danh mục</label>
            <select
              className="border px-3 py-2 rounded-lg w-full"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Tất cả</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="text-sm font-medium mb-1 block">Từ ngày</label>
            <input
              type="date"
              className="border px-3 py-2 rounded-lg w-full"
              value={filterStartDate}
              onChange={handleStartDateChange}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="text-sm font-medium mb-1 block">Đến ngày</label>
            <input
              type="date"
              className="border px-3 py-2 rounded-lg w-full"
              value={filterEndDate}
              min={filterStartDate}
              onChange={handleEndDateChange}
            />
          </div>

          <div className="lg:col-span-1 flex lg:justify-end">
            <button
              onClick={resetFilter}
              className="bg-gray-300 px-4 py-2 rounded-lg"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-center">STT</th>
              <th className="px-4 py-3 text-xs font-semibold text-center">Ảnh</th>
              <th className="px-4 py-3 text-xs font-semibold text-left">Tiêu đề</th>
              <th className="px-4 py-3 text-xs font-semibold text-center">Danh mục</th>
              <th className="px-4 py-3 text-xs font-semibold text-center">Tác giả</th>
              <th className="px-4 py-3 text-xs font-semibold text-center">Ngày đăng</th>
              <th className="px-4 py-3 text-xs font-semibold text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Không tìm thấy bài viết nào
                </td>
              </tr>
            ) : (
              filteredArticles.map((a, i) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-4 text-center">{i + 1}</td>

                  <td className="px-4 py-4 text-center">
                    {a.image ? (
                      <img
                        src={a.image}
                        className="w-14 h-14 rounded object-cover border mx-auto"
                      />
                    ) : (
                      <div className="w-14 h-14 mx-auto bg-gray-200 flex items-center justify-center rounded">
                        <FileText className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 font-medium">{a.title}</td>

                  <td className="px-4 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        categoryColors[normalizeCategory(a.category)] ||
                        categoryColors.default
                      }`}
                    >
                      {a.category}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">{a.author}</td>

                  <td className="px-4 py-4 text-center text-gray-600">
                    {formatDate(a.publishedAt)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleOpenModal("edit", a)}
                      className="text-blue-600 mr-3"
                    >
                      <Edit />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-red-600"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">
                {modalMode === "create" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết"}
              </h2>
              <button onClick={handleCloseModal}>
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="md:col-span-2">
                  <label>Tiêu đề *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl"
                  />
                </div>

                {/* Content */}
                <div className="md:col-span-2">
                  <label>Nội dung *</label>
                  <textarea
                    name="content"
                    rows="8"
                    required
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl"
                  />
                </div>

                {/* Category */}
                <div>
                  <label>Danh mục *</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label>Tác giả *</label>
                  <input
                    type="text"
                    name="author"
                    required
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl"
                  />
                </div>

                {/* Source */}
                <div>
                  <label>Nguồn</label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl"
                  />
                </div>

                {/* Image */}
                <div>
                  <label>URL ảnh bìa</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
                >
                  {modalMode === "create" ? "Tạo bài viết" : "Cập nhật"}
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 py-3 rounded-xl"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
