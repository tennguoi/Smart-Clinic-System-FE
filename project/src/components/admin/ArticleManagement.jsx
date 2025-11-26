// src/components/admin/ArticleManagement.jsx
import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, X, FileText, Upload, Image as ImageIcon,
  CheckCircle, AlertTriangle
} from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";

// ====================== TOAST NOTIFICATION ======================
const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-green-600',
    error: 'bg-red-600'
  };
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <div
      className={`fixed top-4 right-4 z-[100] p-4 rounded-xl shadow-2xl text-white ${styles[type]} flex items-center gap-3 animate-bounce-in transition-all`}
      style={{ minWidth: '320px' }}
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto opacity-70 hover:opacity-100 p-1 rounded-full hover:bg-white/20 transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [toast, setToast] = useState({ message: "", type: "success" });

  const [page, setPage] = useState(0);
  const size = 6;
  const [totalPages, setTotalPages] = useState(0);

  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [categories, setCategories] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    author: "",
    source: "",
    image: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 4000);
  };

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
    "suckhoe": "bg-green-100 text-green-700",
    "tuvan": "bg-blue-100 text-blue-700",
    "dieutri": "bg-purple-100 text-purple-700",
    "canhbao": "bg-red-100 text-red-700",
    "congnghe": "bg-orange-100 text-orange-700",
    default: "bg-gray-100 text-gray-700",
  };

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/public/articles?page=${page}&size=${size}`);
      const list = res.data.content || [];
      setArticles(list);
      setFilteredArticles(list);
      const cateList = [...new Set(list.map(a => a.category))].filter(Boolean);
      setCategories(cateList);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      showToast("Không thể tải danh sách bài viết", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...articles];

    if (filterTitle.trim()) {
      data = data.filter(a => a.title.toLowerCase().includes(filterTitle.toLowerCase()));
    }
    if (filterCategory) data = data.filter(a => a.category === filterCategory);
    if (filterStartDate) {
      const start = new Date(filterStartDate);
      data = data.filter(a => new Date(a.publishedAt) >= start);
    }
    if (filterEndDate) {
      const end = new Date(filterEndDate);
      end.setHours(23, 59, 59, 999);
      data = data.filter(a => new Date(a.publishedAt) <= end);
    }

    setFilteredArticles(data);
  }, [filterTitle, filterCategory, filterStartDate, filterEndDate, articles]);

  const resetFilter = () => {
    setFilterTitle("");
    setFilterCategory("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const handleOpenModal = (mode, article = null) => {
    setModalMode(mode);
    setSelectedArticle(article);
    setSelectedFile(null);

    if (mode === "edit" && article) {
      setFormData({
        title: article.title || "",
        content: article.content || "",
        category: article.category || "",
        author: article.author || "",
        source: article.source || "",
        image: article.image || "",
      });
      setPreviewImage(article.image ? getImageUrl(article.image) : "");
    } else {
      setFormData({ title: "", content: "", category: "", author: "", source: "", image: "" });
      setPreviewImage("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    setSelectedFile(null);
    setPreviewImage("");
    setFormData({ title: "", content: "", category: "", author: "", source: "", image: "" });
  };

  const handleInputChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Vui lòng chọn file ảnh hợp lệ", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Kích thước ảnh không được vượt quá 10MB", "error");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', selectedFile);

    try {
      const res = await axiosInstance.post('/api/admin/upload/photo', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch (err) {
      throw new Error("Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;
      if (selectedFile) {
        imageUrl = await uploadImage();
      }

      const dataToSubmit = { ...formData, image: imageUrl };

      if (modalMode === "edit") {
        await axiosInstance.put(`/api/admin/articles/${selectedArticle.id}`, dataToSubmit);
        showToast("Cập nhật bài viết thành công!");
      } else {
        await axiosInstance.post("/api/admin/articles", dataToSubmit);
        showToast("Tạo bài viết thành công!");
      }

      handleCloseModal();
      await fetchArticles();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Có lỗi khi lưu bài viết";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
   

    try {
      await axiosInstance.delete(`/api/admin/articles/${id}`);
      showToast("Xóa bài viết thành công!");
      fetchArticles();
    } catch (err) {
      showToast("Không thể xóa bài viết", "error");
    }
  };

  const formatDate = (d) => !d ? "—" : new Date(d).toLocaleString("vi-VN", { hour12: false });

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith('http')) return imageUrl;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    return `${baseURL}${imageUrl}`;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-4 py-2.5 rounded-lg font-medium transition ${page === i ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50">
      <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Quản lý Bài viết</h1>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" /> Tạo bài viết mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
            <input
              type="text"
              placeholder="Tìm theo tiêu đề..."
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
            <input type="date" value={filterEndDate} min={filterStartDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="lg:col-span-1">
            <button onClick={resetFilter} className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium">
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Đang tải danh sách...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">STT</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Ảnh</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Tiêu đề</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Danh mục</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Tác giả</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Ngày đăng</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-xl font-medium">Không tìm thấy bài viết nào</p>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((a, i) => (
                  <tr key={a.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">{page * size + i + 1}</td>
                    <td className="px-6 py-4 text-center">
                      {a.image ? (
                        <img src={getImageUrl(a.image)} alt={a.title} className="w-16 h-16 rounded-lg object-cover border shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{a.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[normalizeCategory(a.category)] || categoryColors.default}`}>
                        {a.category || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">{a.author || "—"}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{formatDate(a.publishedAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleOpenModal("edit", a)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {renderPagination()}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-blue-50/80 backdrop-blur">
              <h2 className="text-2xl font-bold text-blue-700">
                {modalMode === "create" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white/50">
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Nhập tiêu đề bài viết" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
                  <textarea name="content" rows={8} required value={formData.content} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Nhập nội dung bài viết" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                  <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tác giả *</label>
                  <input type="text" name="author" required value={formData.author} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Tên tác giả" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn (tùy chọn)</label>
                  <input type="text" name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa</label>
                  {previewImage && (
                    <div className="mb-4 relative">
                      <img src={previewImage} alt="Preview" className="w-full h-64 object-cover rounded-xl border-2 border-gray-300" />
                      <button type="button" onClick={() => { setPreviewImage(""); setSelectedFile(null); setFormData(p => ({ ...p, image: "" })); }} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-700 rounded-xl cursor-pointer hover:bg-blue-100 transition border-2 border-dashed border-blue-300">
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">{selectedFile ? "Thay đổi ảnh" : "Chọn ảnh"}</span>
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                    {selectedFile && <span className="text-sm text-gray-600 flex items-center gap-2"><ImageIcon className="w-4 h-4" />{selectedFile.name}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF – Tối đa 10MB</p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button type="submit" disabled={loading || uploading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-70 transition">
                  {loading || uploading ? "Đang xử lý..." : modalMode === "create" ? "Tạo bài viết" : "Cập nhật"}
                </button>
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition">
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