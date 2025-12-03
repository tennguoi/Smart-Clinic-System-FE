import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Star, AlertTriangle, Eye,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import AdminServiceApi from '../../api/AdminServiceApi';
import CountBadge from '../common/CountBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function ReviewManagement() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedReview, setSelectedReview] = useState(null);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 8;

  // Filters
  const [filterRating, setFilterRating] = useState('');
  const [filterReviewer, setFilterReviewer] = useState('');

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    reviewerName: ''
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await AdminServiceApi.getAllReviews();
      setReviews(data || []);
      applyFilters(data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters(reviews);
    setCurrentPage(0);
  }, [filterRating, filterReviewer]);

  const applyFilters = (data) => {
    let filtered = [...data];

    if (filterRating) {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }

    if (filterReviewer.trim()) {
      filtered = filtered.filter(r =>
        r.reviewerName.toLowerCase().includes(filterReviewer.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  const handleClearFilters = () => {
    setFilterRating('');
    setFilterReviewer('');
    setCurrentPage(0);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const currentPageReviews = filteredReviews.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setCurrentPage(newPage);
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setLoading(true);
    try {
      await AdminServiceApi.deleteReview(reviewToDelete.id);
      toast.success(`Đã xóa đánh giá của ${reviewToDelete.reviewerName}`);
      setShowDeleteConfirmation(false);
      setReviewToDelete(null);
      fetchReviews();
    } catch (err) {
      toast.error('Xóa đánh giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, review = null) => {
    setModalMode(mode);
    setSelectedReview(review);
    if (mode === 'create') {
      setFormData({
        rating: 5,
        comment: '',
        reviewerName: ''
      });
    } else if (review) {
      setFormData({
        rating: review.rating,
        comment: review.comment,
        reviewerName: review.reviewerName
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReview(null);
  };

  const handleSwitchToEdit = () => setModalMode('edit');

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reviewerName.trim() || !formData.comment.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      toast.error('Đánh giá phải từ 1-5 sao');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData };

      if (modalMode === 'edit') {
        await AdminServiceApi.updateReview(selectedReview.id, payload);
        toast.success('Cập nhật đánh giá thành công');
      } else {
        await AdminServiceApi.createReview(payload);
        toast.success('Tạo đánh giá thành công');
      }
      handleCloseModal();
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('vi-VN', { hour12: false });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    if (rating === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  };

  return (
    <>
      <Toaster {...toastConfig} />
      <div className={`px-4 md:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
              <MessageSquare className="w-9 h-9 text-blue-600" />
              <span>Quản Lý Đánh Giá</span>
            </h1>
            <CountBadge currentCount={currentPageReviews.length} totalCount={filteredReviews.length} label="đánh giá" />
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium"
          >
            <Plus className="w-5 h-5" /> Tạo Đánh Giá
          </button>
        </div>

        {/* Filters */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded-lg p-5 mb-6 shadow-md transition-colors duration-300`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            {/* Rating Filter */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Lọc theo đánh giá
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              >
                <option value="">Tất cả</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>

            {/* Reviewer Filter */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Tìm theo người đánh giá
              </label>
              <input
                type="text"
                value={filterReviewer}
                onChange={(e) => setFilterReviewer(e.target.value)}
                placeholder="Tên người đánh giá..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>

            {/* Clear */}
            <div>
              <button
                onClick={handleClearFilters}
                className={`w-full px-4 py-3 rounded-xl transition font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className={`mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
              Đang tải...
            </p>
          </div>
        ) : (
          <>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow overflow-x-auto transition-colors duration-300`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Người đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Nhận xét
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentPageReviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-gray-500 dark:text-gray-400 text-lg">
                        Không có đánh giá nào
                      </td>
                    </tr>
                  ) : (
                    currentPageReviews.map((review, index) => (
                      <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {currentPage * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{review.reviewerName}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {renderStars(review.rating)}
                            </div>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getRatingColor(review.rating)}`}>
                              {review.rating}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {review.comment}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(review.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleOpenModal('view', review)}
                              title="Xem"
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(review)}
                              title="Xóa"
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const startPage = Math.max(0, currentPage - 2);
                    const endPage = Math.min(totalPages - 1, currentPage + 2);

                    if (startPage > 0) {
                      pages.push(
                        <button
                          key={0}
                          onClick={() => handlePageChange(0)}
                          className={`px-4 py-2.5 rounded-lg border font-medium transition ${
                            currentPage === 0
                              ? 'bg-blue-600 text-white border-blue-600'
                              : `${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                          }`}
                        >
                          1
                        </button>
                      );
                      if (startPage > 1) pages.push(<span key="start-ellipsis" className="px-2 text-gray-500">...</span>);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-4 py-2.5 rounded-lg border font-medium transition ${
                            currentPage === i
                              ? 'bg-blue-600 text-white border-blue-600'
                              : `${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    }

                    if (endPage < totalPages - 1) {
                      if (endPage < totalPages - 2) pages.push(<span key="end-ellipsis" className="px-2 text-gray-500">...</span>);
                      pages.push(
                        <button
                          key={totalPages - 1}
                          onClick={() => handlePageChange(totalPages - 1)}
                          className={`px-4 py-2.5 rounded-lg border font-medium transition ${
                            currentPage === totalPages - 1
                              ? 'bg-blue-600 text-white border-blue-600'
                              : `${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                  className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal Create / Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
              <div className={`flex justify-between items-center p-6 border-b sticky top-0 ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50/80'} backdrop-blur`}>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`}>
                  {modalMode === 'create' ? 'Tạo Đánh Giá' :
                   modalMode === 'view' ? 'Chi Tiết Đánh Giá' :
                   'Chỉnh Sửa Đánh Giá'}
                </h2>
                <div className="flex items-center gap-3">
                  {modalMode === 'view' && (
                    <button
                      onClick={handleSwitchToEdit}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit className="w-5 h-5" /> Chỉnh sửa
                    </button>
                  )}
                  <button
                    onClick={handleCloseModal}
                    className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-white/50'}`}
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Tên người đánh giá <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="reviewerName" 
                      value={formData.reviewerName} 
                      onChange={handleInputChange} 
                      required 
                      disabled={modalMode === 'view'} 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Đánh giá <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        name="rating" 
                        value={formData.rating} 
                        onChange={handleInputChange} 
                        min="1" 
                        max="5" 
                        required 
                        disabled={modalMode === 'view'} 
                        className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
                      />
                      <div className="flex gap-1">
                        {renderStars(formData.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Nhận xét <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="comment" 
                      value={formData.comment} 
                      onChange={handleInputChange} 
                      rows="4" 
                      required 
                      disabled={modalMode === 'view'} 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    ></textarea>
                  </div>
                </div>

                {modalMode !== 'view' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                    >
                      {loading ? 'Đang xử lý...' : modalMode === 'create' ? 'Tạo Đánh Giá' : 'Lưu'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={loading}
                      className={`flex-1 py-2.5 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'}`}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {showDeleteConfirmation && reviewToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transition-colors duration-300`}>
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Xác nhận xóa
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Bạn có chắc chắn muốn xóa đánh giá của <strong>{reviewToDelete.reviewerName}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-70"
                >
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirmation(false); setReviewToDelete(null); }}
                  className={`flex-1 py-2.5 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold transition ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'}`}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}