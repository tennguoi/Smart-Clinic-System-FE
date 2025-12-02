import { useState, useEffect, useMemo } from "react";
import {
  Plus, Edit, Trash2, X, FileText, Upload, Image as ImageIcon,
  AlertTriangle, Eye
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import { useTranslation } from "react-i18next";
import axiosInstance from "../../utils/axiosConfig";
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import { useTheme } from '../../contexts/ThemeContext';

export default function ArticleManagement() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const isViewMode = modalMode === 'view';
  const isCreateMode = modalMode === 'create';
  const isEditMode = modalMode === 'edit';

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
    title: "", content: "", category: "", author: "", source: "", image: "",
  });

  // Mapping cố định cho các danh mục phổ biến (chỉ cần 1 variant, normalize sẽ xử lý)
  const fixedCategoryColors = {
    "sức khỏe": "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    "tư vấn": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "điều trị": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    "cảnh báo": "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    "công nghệ": "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    "tin tức": "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
    "nghiên cứu": "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    "phòng bệnh": "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  };

  // Palette màu dự phòng cho danh mục khác
  const colorPalette = [
    "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800",
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800",
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800",
  ];

  // Hàm tự động gán màu cho danh mục
  const getCategoryColor = (category) => {
    if (!category) return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    
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
      const hasFilters = hasActiveFilters;
      const endpoint = hasFilters
        ? `/api/public/articles?page=0&size=1000`
        : `/api/public/articles?page=${page}&size=${size}`;

      const res = await axiosInstance.get(endpoint);
      const list = res.data.content || [];

      setArticles(list);

      let filtered = [...list];

      if (filterTitle.trim()) {
        filtered = filtered.filter(a => a.title.toLowerCase().includes(filterTitle.toLowerCase()));
      }
      if (filterCategory) {
        filtered = filtered.filter(a => a.category === filterCategory);
      }

      if (filterStartDate && filterEndDate && filterEndDate < filterStartDate) {
        toast.error(t("articles.errors.invalidDateRange") || "Invalid date range");
        setFilteredArticles([]);
        setTotalPages(0);
        setTotalElements(0);
        setLoading(false);
        return;
      }

      if (filterStartDate) {
        filtered = filtered.filter(a => new Date(a.publishedAt).toISOString().split('T')[0] >= filterStartDate);
      }
      if (filterEndDate) {
        filtered = filtered.filter(a => new Date(a.publishedAt).toISOString().split('T')[0] <= filterEndDate);
      }

      setFilteredArticles(filtered);

      const uniqueCats = [...new Set(filtered.map(a => a.category))].filter(Boolean);
      setCategories(uniqueCats);

      if (hasFilters) {
        setTotalPages(Math.ceil(filtered.length / size));
        setTotalElements(filtered.length);
      } else {
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error(t("articles.errors.loadFailed"));
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

  const currentPageArticles = useMemo(() => {
    if (hasActiveFilters) {
      return filteredArticles.slice(page * size, (page + 1) * size);
    }
    return filteredArticles;
  }, [filteredArticles, page, size, hasActiveFilters]);

  const handleOpenModal = (mode, article = null) => {
    setModalMode(mode);
    setSelectedArticle(article);
    setSelectedFile(null);
    setPreviewImage("");

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
    }
    setShowModal(true);
  };

  const handleSwitchToEdit = () => setModalMode("edit");
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
      toast.error(t("articles.errors.invalidImage"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("articles.errors.imageTooLarge"));
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
    const fd = new FormData();
    fd.append('file', selectedFile);
    try {
      const res = await axiosInstance.post('/api/admin/upload/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch (err) {
      throw new Error(t("articles.errors.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = formData.image;
      if (selectedFile) imageUrl = await uploadImage();

      const payload = { ...formData, image: imageUrl };

      if (isEditMode) {
        await axiosInstance.put(`/api/admin/articles/${selectedArticle.id}`, payload);
        toast.success(t("articles.toast.updateSuccess"));
      } else {
        await axiosInstance.post("/api/admin/articles", payload);
        toast.success(t("articles.toast.createSuccess"));
      }

      handleCloseModal();
      await fetchArticles();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t("articles.errors.saveFailed");
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
      toast.success(t("articles.toast.deleteSuccess", { title: articleToDelete.title }));
      setShowDeleteConfirmation(false);
      setArticleToDelete(null);
      fetchArticles();
    } catch (err) {
      toast.error(t("articles.errors.deleteFailed"));
    }
  };

  const formatDate = (d) => !d ? "—" : new Date(d).toLocaleString(t("common.locale") === "vi" ? "vi-VN" : "en-GB", { hour12: false });
  const getImageUrl = (url) => url?.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}${url || ''}`;

  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster {...toastConfig} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
            <FileText className="w-9 h-9 text-blue-600" />
            <span>{t("articles.pageTitle")}</span>
          </h1>
          <CountBadge currentCount={currentPageArticles.length} totalCount={totalElements} label={t("newsPage.title")} />
        </div>
        <button onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium">
          <Plus className="w-5 h-5" /> {t("articles.createButton")}
        </button>
      </div>

      {/* Filters */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t("articles.filter.title")}
            </label>
            <input
              type="text"
              placeholder={t("articles.filter.titlePlaceholder")}
              value={filterTitle}
              onChange={(e) => { setFilterTitle(e.target.value); setPage(0); }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
            />
          </div>
          <div className="lg:col-span-3">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t("articles.filter.category")}
            </label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
            >
              <option value="">{t("articles.filter.allCategories")}</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t("articles.filter.fromDate")}
            </label>
            <input 
              type="date" 
              value={filterStartDate}
              max={filterEndDate || undefined}
              onChange={(e) => { 
                const newStartDate = e.target.value;
                if (filterEndDate && newStartDate > filterEndDate) {
                  toast.error(t("articles.errors.invalidDateRange"));
                  return;
                }
                setFilterStartDate(newStartDate);
                setPage(0);
              }} 
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`} 
            />
          </div>
          <div className="lg:col-span-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t("articles.filter.toDate")}
            </label>
            <input 
              type="date" 
              value={filterEndDate} 
              min={filterStartDate} 
              onChange={(e) => { 
                const newEndDate = e.target.value;
                if (filterStartDate && newEndDate < filterStartDate) {
                  toast.error(t("articles.errors.invalidDateRange"));
                  return;
                }
                setFilterEndDate(newEndDate); 
                setPage(0); 
              }} 
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`} 
            />
          </div>
          <div className="lg:col-span-1">
            <button onClick={resetFilter} className={`w-full px-4 py-3 rounded-xl transition font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
              {t("articles.filter.clearFilter")}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden transition-colors duration-300`}>
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium transition-colors duration-300`}>
              {t("common.loading")}
            </p>
          </div>
        ) : (
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-300`}>
            <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}>
              <tr>
                <th className={`px-6 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase transition-colors duration-300`}>
                  {t("articles.table.no")}
                </th>
                <th className={`px-6 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase transition-colors duration-300`}>
                  {t("articles.table.image")}
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase transition-colors duration-300`}>
                  {t("articles.table.title")}
                </th>
                <th className={`px-6 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase transition-colors duration-300`}>
                  {t("articles.table.category")}
                </th>
                <th className={`px-6 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase transition-colors duration-300`}>
                  {t("articles.table.author")}
                </th>
                <th className={`px-6 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase transition-colors duration-300`}>
                  {t("articles.table.publishedAt")}
                </th>
                <th className={`px-6 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase transition-colors duration-300`}>
                  {t("articles.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-100'} divide-y transition-colors duration-300`}>
              {currentPageArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-xl font-medium">{t("articles.noArticles")}</p>
                  </td>
                </tr>
              ) : (
                currentPageArticles.map((a, i) => (
                  <tr key={a.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition">
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">{page * size + i + 1}</td>
                    <td className="px-6 py-4 text-center">
                      {a.image ? (
                        <img src={getImageUrl(a.image)} alt={a.title} className="w-16 h-16 rounded-lg object-cover border shadow-sm dark:border-gray-700 mx-auto" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto">
                          <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white max-w-xs truncate">{a.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(a.category)}`}>
                        {a.category || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{a.author || "—"}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">{formatDate(a.publishedAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleOpenModal("view", a)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition" title={t("common.view")}>
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(a)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition" title={t("common.delete")}>
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

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={goToPage} theme={theme} />

      {/* Modal Create / Edit / View */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto transition-colors duration-300`}>
            <div className={`flex justify-between items-center p-6 border-b sticky top-0 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50/80 border-gray-200'} backdrop-blur transition-colors duration-300`}>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-700'} transition-colors duration-300`}>
                {isCreateMode ? t("articles.modal.createTitle") :
                 isViewMode ? t("articles.modal.editTitle") + " (View)" :
                 t("articles.modal.editTitle")}
              </h2>
              <div className="flex items-center gap-3">
                {isViewMode && (
                  <button onClick={handleSwitchToEdit}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    <Edit className="w-4 h-4" /> {t("articles.common.edit")}
                  </button>
                )}
                <button onClick={handleCloseModal} className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-600`}>
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Ảnh bìa - Lên đầu */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  {t("articles.modal.coverImage")}
                </label>
                {previewImage && (
                  <div className="mb-4 relative">
                    <img src={previewImage} alt="Preview" className="w-full h-64 object-cover rounded-xl border-2 border-gray-300 dark:border-gray-600" />
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
                      <label className={`flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition border-2 border-dashed border-blue-300 dark:border-blue-700`}>
                        <Upload className="w-5 h-5" />
                        <span className="font-medium">
                          {selectedFile ? t("articles.modal.changeImage") : t("articles.modal.chooseImage")}
                        </span>
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                      {selectedFile && <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}><ImageIcon className="w-4 h-4" />{selectedFile.name}</span>}
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                      {t("articles.modal.imageHint")}
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t("articles.modal.title")} *
                  </label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    disabled={isViewMode} 
                    value={formData.title} 
                    onChange={handleInputChange}
                    placeholder={t("articles.modal.titlePlaceholder")}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t("articles.modal.content")} *
                  </label>
                  <textarea 
                    name="content" 
                    rows={8} 
                    required 
                    disabled={isViewMode} 
                    value={formData.content} 
                    onChange={handleInputChange}
                    placeholder={t("articles.modal.contentPlaceholder")}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t("articles.modal.category")} *
                  </label>
                  <select 
                    name="category" 
                    required 
                    disabled={isViewMode} 
                    value={formData.category} 
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">{t("articles.modal.selectCategory")}</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t("articles.modal.author")} *
                  </label>
                  <input 
                    type="text" 
                    name="author" 
                    required 
                    disabled={isViewMode} 
                    value={formData.author} 
                    onChange={handleInputChange}
                    placeholder={t("articles.modal.authorPlaceholder")}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t("articles.modal.source")}
                  </label>
                  <input 
                    type="text" 
                    name="source" 
                    disabled={isViewMode} 
                    value={formData.source} 
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
                  />
                </div>
              </div>

              {!isViewMode && (
                <div className={`flex gap-4 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : ''}`}>
                  <button type="submit" disabled={loading || uploading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-70 transition">
                    {loading || uploading ? t("common.processing") : isCreateMode ? t("articles.createButton") : t("common.save")}
                  </button>
                  <button type="button" onClick={handleCloseModal} className={`flex-1 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition`}>
                    {t("common.cancel")}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && articleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transition-colors duration-300`}>
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
              {t("common.confirm")}
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6 transition-colors duration-300`}>
              {t("articles.toast.deleteSuccess", { title: "" }).replace(/^.*"/, '').replace(/".*$/, '')} <strong>{articleToDelete.title}</strong>?<br />
              {/* <span className="text-red-600 font-semibold">{t("common.delete")}</span> */}
            </p>
            <div className="flex gap-3">
              <button onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition">
                {t("articles.common.delete")}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setArticleToDelete(null);
                }}
                className={`flex-1 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition`}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}