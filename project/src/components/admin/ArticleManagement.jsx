// src/components/admin/ArticleManagement.jsx – ĐÃ FIX HOÀN TOÀN, KHÔNG CÒN LỖI .map!
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, FileText } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
    source: '',
    image: '',
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  // FIX CHÍNH TẠI ĐÂY – ĐÃ XỬ LÝ CẢ 2 TRƯỜNG HỢP API TRẢ VỀ
  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/public/articles');
      const data = response.data;

      // Trường hợp 1: API trả về { content: [...] } (phân trang)
      // Trường hợp 2: API trả về trực tiếp mảng [...]
      const articleList = data?.content ?? data ?? [];

      // Đảm bảo 100% là array, không bao giờ bị lỗi .map
      if (Array.isArray(articleList)) {
        setArticles(articleList);
      } else {
        console.warn('Dữ liệu bài viết không phải mảng:', data);
        setArticles([]);
      }
    } catch (err) {
      console.error('Lỗi tải bài viết:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách bài viết');
      setArticles([]); // fallback an toàn
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, article = null) => {
    setModalMode(mode);
    setSelectedArticle(article);
    setError('');
    setSuccess('');

    if (mode === 'create') {
      setFormData({
        title: '',
        content: '',
        category: '',
        author: '',
        source: '',
        image: '',
      });
    } else if (mode === 'edit' && article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        category: article.category || '',
        author: article.author || '',
        source: article.source || '',
        image: article.image || '',
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'edit' && selectedArticle) {
        await axiosInstance.put(`/api/admin/articles/${selectedArticle.id}`, formData);
        setSuccess('Cập nhật bài viết thành công!');
      } else {
        await axiosInstance.post('/api/admin/articles', formData);
        setSuccess('Tạo bài viết thành công!');
      }

      setTimeout(() => {
        handleCloseModal();
        fetchArticles();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    setLoading(true);
    try {
      await axiosInstance.delete(`/api/admin/articles/${articleId}`);
      setSuccess('Xóa bài viết thành công!');
      fetchArticles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa bài viết');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Không hợp lệ';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Bài viết</h1>
          <p className="text-gray-600 mt-1">Tổng cộng: {articles.length} bài viết</p>
        </div>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          Tạo bài viết mới
        </button>
      </div>

      {/* Thông báo */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2">
          {success}
        </div>
      )}

      {/* Loading */}
      {loading && articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải danh sách bài viết...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {articles.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl">Chưa có bài viết nào</p>
              <p className="text-sm mt-2">Hãy nhấn "Tạo bài viết mới" để bắt đầu</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tác giả</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày đăng</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider pr-8">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1">{article.title}</div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {article.content?.substring(0, 120)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {article.category || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{article.author || 'Ẩn danh'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(article.publishedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenModal('edit', article)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal – giữ nguyên đẹp như cũ */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Thông báo trong modal */}
              {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}
              {success && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{success}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề bài viết"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="10"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Viết nội dung bài viết tại đây..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Sức khỏe tim mạch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tác giả *</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: BS. Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn</label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Bệnh viện Chợ Rẫy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL ảnh bìa</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition font-medium disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Đang xử lý...' : modalMode === 'create' ? 'Tạo bài viết' : 'Cập nhật bài viết'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-3.5 rounded-xl hover:bg-gray-300 transition font-medium"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}