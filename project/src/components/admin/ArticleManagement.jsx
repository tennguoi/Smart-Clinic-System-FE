// src/components/admin/ArticleManagement.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Plus, Edit, Trash2, X, FileText, Upload, Image as ImageIcon,
  AlertTriangle, Eye
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import axiosInstance from "../../utils/axiosConfig";
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const isViewMode = modalMode === 'view';
  const isCreateMode = modalMode === 'create';
  const isEditMode = modalMode === 'edit';

  // Xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const size = 8;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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


  // Mapping cố định cho các danh mục phổ biến (chỉ cần 1 variant, normalize sẽ xử lý)
  const fixedCategoryColors = {
    "sức khỏe": "bg-green-100 text-green-700 border-green-200",
    "tư vấn": "bg-blue-100 text-blue-700 border-blue-200",
    "điều trị": "bg-purple-100 text-purple-700 border-purple-200",
    "cảnh báo": "bg-red-100 text-red-700 border-red-200",
    "công nghệ": "bg-orange-100 text-orange-700 border-orange-200",
    "tin tức": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "nghiên cứu": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "phòng bệnh": "bg-teal-100 text-teal-700 border-teal-200",
  };

  // Palette màu dự phòng cho danh mục khác
  const colorPalette = [
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-lime-100 text-lime-700 border-lime-200",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-sky-100 text-sky-700 border-sky-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  ];

  // Hàm tự động gán màu cho danh mục
  const getCategoryColor = (category) => {
    if (!category) return "bg-gray-100 text-gray-700 border-gray-200";
    
    // Normalize: trim + lowercase để đảm bảo nhất quán
    const normalized = category.trim().toLowerCase();
    
    // Tìm trong mapping cố định
    if (fixedCategoryColors[normalized]) {
      return fixedCategoryColors[normalized];
    }
    
    // Nếu không có trong mapping, dùng hash (dùng normalized để đảm bảo nhất quán)
    const hash = normalized.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  };

  const hasActiveFilters = useMemo(() => {
    return !!(filterTitle || filterCategory || filterStartDate || filterEndDate);
  }, [filterTitle, filterCategory, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchArticles();
  }, [page, filterTitle, filterCategory, filterStartDate, filterEndDate]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Kiểm tra filter trực tiếp thay vì dùng hasActiveFilters
      const hasFilters = !!(filterTitle || filterCategory || filterStartDate || filterEndDate);
      
      // Nếu có filter, fetch tất cả để filter client-side
      // Nếu không, chỉ fetch theo page
      const endpoint = hasFilters 
        ? `/api/public/articles?page=0&size=1000`  // Fetch all
        : `/api/public/articles?page=${page}&size=${size}`;
      
      const res = await axiosInstance.get(endpoint);
      const list = res.data.content || [];
      
      setArticles(list);
      
      // Filter client-side
      let filtered = [...list];
      
      if (filterTitle.trim()) {
        filtered = filtered.filter(a => a.title.toLowerCase().includes(filterTitle.toLowerCase()));
      }
      if (filterCategory) {
        filtered = filtered.filter(a => a.category === filterCategory);
      }
      // Validate: Đến ngày phải >= Từ ngày
      if (filterStartDate && filterEndDate && filterEndDate < filterStartDate) {
        toast.error("Khoảng ngày không hợp lệ: Đến ngày phải lớn hơn hoặc bằng Từ ngày");
        setFilteredArticles([]);
        setTotalPages(0);
        setTotalElements(0);
        setLoading(false);
        return;
      }

      if (filterStartDate) {
        filtered = filtered.filter(a => {
          if (!a.publishedAt) return false;
          const articleDate = new Date(a.publishedAt);
          const articleDateStr = articleDate.toISOString().split('T')[0]; // YYYY-MM-DD
          return articleDateStr >= filterStartDate;
        });
      }
      if (filterEndDate) {
        filtered = filtered.filter(a => {
          if (!a.publishedAt) return false;
          const articleDate = new Date(a.publishedAt);
          const articleDateStr = articleDate.toISOString().split('T')[0]; // YYYY-MM-DD
          return articleDateStr <= filterEndDate;
        });
      }
      
      setFilteredArticles(filtered);
      
      // Categories từ filtered data
      const cateList = [...new Set(filtered.map(a => a.category))].filter(Boolean);
      setCategories(cateList);
      
      // Tính lại totalPages và totalElements dựa trên filtered data
      if (hasFilters) {
        setTotalPages(Math.ceil(filtered.length / size));
        setTotalElements(filtered.length);
      } else {
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error("Không thể tải danh sách tin tức");
      setFilteredArticles([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => {
    setFilterTitle("");
    setFilterCategory("");
    setFilterStartDate("");
    setFilterEndDate("");
    setPage(0);
  };

  // Lấy data cho page hiện tại
  const currentPageArticles = useMemo(() => {
    if (hasActiveFilters) {
      // Khi có filter, slice từ filteredArticles
      return filteredArticles.slice(page * size, (page + 1) * size);
    }
    // Khi không có filter, filteredArticles đã là data của page hiện tại
    return filteredArticles;
  }, [filteredArticles, page, size, hasActiveFilters]);

  const handleOpenModal = (mode, article = null) => {
    setModalMode(mode);
    setSelectedArticle(article);
    setSelectedFile(null);

    if ((mode === "edit" || mode === "view") && article) {
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

  const handleSwitchToEdit = () => {
    setModalMode('edit');
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
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 10MB");
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
        toast.success("Cập nhật tin tức thành công!");
      } else {
        await axiosInstance.post("/api/admin/articles", dataToSubmit);
        toast.success("Tạo tin tức thành công!");
      }

      handleCloseModal();
      await fetchArticles();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Có lỗi khi lưu tin tức";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    try {
      await axiosInstance.delete(`/api/admin/articles/${articleToDelete.id}`);
      toast.success(`Đã xóa tin tức "${articleToDelete.title}"`);
      setShowDeleteConfirmation(false);
      setArticleToDelete(null);
      fetchArticles();
    } catch (err) {
      toast.error("Không thể xóa tin tức");
    }
  };

  const formatDate = (d) => !d ? "—" : new Date(d).toLocaleString("vi-VN", { hour12: false });

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith('http')) return imageUrl;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    return `${baseURL}${imageUrl}`;
  };

  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
      <Toaster {...toastConfig} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-9 h-9 text-blue-600" />
            <span>Quản Lý Tin Tức</span>
          </h1>
          <CountBadge 
            currentCount={currentPageArticles.length} 
            totalCount={totalElements} 
            label="tin tức" 
          />
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium"
        >
          <Plus className="w-5 h-5" /> Tạo tin tức
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={filterTitle}
              onChange={(e) => { setFilterTitle(e.target.value); setPage(0); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
            <input 
              type="date" 
              value={filterStartDate}
              max={filterEndDate || undefined}
              onChange={(e) => { 
                const newStartDate = e.target.value;
                // Validate: Từ ngày không được > Đến ngày
                if (filterEndDate && newStartDate > filterEndDate) {
                  toast.error("Từ ngày phải nhỏ hơn hoặc bằng Đến ngày");
                  return;
                }
                setFilterStartDate(newStartDate);
                setPage(0);
              }} 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
            <input 
              type="date" 
              value={filterEndDate} 
              min={filterStartDate} 
              onChange={(e) => { 
                const newEndDate = e.target.value;
                // Validate: Đến ngày phải >= Từ ngày
                if (filterStartDate && newEndDate < filterStartDate) {
                  toast.error("Đến ngày phải lớn hơn hoặc bằng Từ ngày");
                  return;
                }
                setFilterEndDate(newEndDate); 
                setPage(0); 
              }} 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
            />
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
              {currentPageArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-xl font-medium">Không tìm thấy tin tức nào</p>
                  </td>
                </tr>
              ) : (
                currentPageArticles.map((a, i) => (
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
                    <td className="px-6 py-4 text-gray-900 max-w-xs truncate">{a.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(a.category)}`}>
                        {a.category || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">{a.author || "—"}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{formatDate(a.publishedAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleOpenModal("view", a)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition" title="Xem chi tiết">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(a)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition" title="Xóa tin tức">
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

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={goToPage} />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-blue-50/80 backdrop-blur">
              <h2 className="text-2xl font-bold text-blue-700">
                {isCreateMode ? "Tạo tin tức mới" : isViewMode ? "Chi tiết tin tức" : "Chỉnh sửa tin tức"}
              </h2>
              <div className="flex items-center gap-3">
                {isViewMode && (
                  <button
                    onClick={handleSwitchToEdit}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Edit className="w-4 h-4" /> Chỉnh sửa
                  </button>
                )}
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white/50">
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ảnh bìa - Lên đầu */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa</label>
                  {previewImage && (
                    <div className="mb-4 relative">
                      <img src={previewImage} alt="Preview" className="w-full h-64 object-cover rounded-xl border-2 border-gray-300" />
                      {!isViewMode && (
                        <button type="button" onClick={() => { setPreviewImage(""); setSelectedFile(null); setFormData(p => ({ ...p, image: "" })); }} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                  {!isViewMode && (
                    <>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-700 rounded-xl cursor-pointer hover:bg-blue-100 transition border-2 border-dashed border-blue-300">
                          <Upload className="w-5 h-5" />
                          <span className="font-medium">{selectedFile ? "Thay đổi ảnh" : "Chọn ảnh"}</span>
                          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </label>
                        {selectedFile && <span className="text-sm text-gray-600 flex items-center gap-2"><ImageIcon className="w-4 h-4" />{selectedFile.name}</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF – Tối đa 10MB</p>
                    </>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                  <input type="text" name="title" required disabled={isViewMode} value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Nhập tiêu đề tin tức" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
                  <textarea name="content" rows={8} required disabled={isViewMode} value={formData.content} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Nhập nội dung tin tức" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                  <select name="category" required disabled={isViewMode} value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tác giả *</label>
                  <input type="text" name="author" required disabled={isViewMode} value={formData.author} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Tên tác giả" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn (tùy chọn)</label>
                  <input type="text" name="source" disabled={isViewMode} value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="https://..." />
                </div>
              </div>

              {!isViewMode && (
                <div className="flex gap-4 pt-6 border-t">
                  <button type="submit" disabled={loading || uploading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-70 transition">
                    {loading || uploading ? "Đang xử lý..." : isCreateMode ? "Tạo tin tức" : "Cập nhật"}
                  </button>
                  <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition">
                    Hủy
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận XÓA */}
      {showDeleteConfirmation && articleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Xóa tin tức <strong>{articleToDelete.title}</strong>?<br />
              Thao tác này <span className="text-red-600 font-semibold">không thể hoàn tác</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Xóa
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setArticleToDelete(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}