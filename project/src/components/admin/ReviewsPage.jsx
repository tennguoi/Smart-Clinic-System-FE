import React, { useEffect, useState, useMemo } from "react";
import {
  Star,
  Search,
  Trash2,
  Edit,
  Plus,
  X,
  TrendingUp,
  Users,
  Filter,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
// Import FaChartBar để đồng bộ với Header của Statistics.jsx
import { FaChartBar } from 'react-icons/fa';

const BASE = "http://localhost:8082/api/public/reviews";

// Toast Component (Không thay đổi)
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-blue-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div
      className={`fixed top-6 right-6 ${styles[type]} text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-slide-in`}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
}

// Delete Confirmation Modal (Không thay đổi nhiều)
function DeleteConfirmModal({ onConfirm, onCancel, reviewName }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-50 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Xác Nhận Xóa</h3>
              <p className="text-gray-600 text-sm mt-1">
                Hành động này không thể hoàn tác
              </p>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
            <p className="text-red-800">
              Bạn có chắc chắn muốn xóa đánh giá của{" "}
              <span className="font-bold">"{reviewName}"</span>?
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// API Functions (Giữ nguyên)
async function apiGetAll() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Lỗi tải đánh giá");
  return res.json();
}

async function apiGetByRating(rating) {
  const res = await fetch(`${BASE}/rating/${rating}`);
  if (!res.ok) throw new Error("Lỗi tải theo số sao");
  return res.json();
}

async function apiGetSummary() {
  const res = await fetch(`${BASE}/summary`);
  if (!res.ok) return { averageRating: 0, latestReviews: [], totalReviews: 0 };
  return res.json();
}

async function apiCreate(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không gửi được đánh giá");
  return res.json();
}

async function apiUpdate(id, payload) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không cập nhật được đánh giá");
  return res.json();
}

async function apiDelete(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Không xóa được đánh giá");
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    id: null,
    rating: 5,
    reviewerName: "",
    reviewerEmail: "anonymous@example.com",
    comment: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = ratingFilter
          ? await apiGetByRating(ratingFilter)
          : await apiGetAll();
        setReviews(Array.isArray(list) ? list : []);
        const s = await apiGetSummary();
        setSummary({
          averageRating: parseFloat(s.averageRating || 0),
          totalReviews: parseInt(
            s.totalReviews || (Array.isArray(list) ? list.length : 0),
            10
          ),
        });
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ratingFilter]);

  const filtered = reviews.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.reviewerName || "").toLowerCase().includes(q) ||
      (r.comment || "").toLowerCase().includes(q)
    );
  });

  const [page, setPage] = useState(1);
  const pageSize = 6;
  useEffect(() => setPage(1), [search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );

  const submit = async () => {
    if (!form.reviewerName?.trim()) {
      showToast("Vui lòng nhập tên của bạn", "error");
      return;
    }

    const payload = {
      rating: Number(form.rating) || 5,
      reviewerName: form.reviewerName.trim(),
      reviewerEmail: form.reviewerEmail || "anonymous@example.com",
      comment: form.comment?.trim() || "",
    };

    try {
      if (form.id) {
        await apiUpdate(form.id, payload);
        showToast("Cập nhật thành công!", "success");
      } else {
        await apiCreate(payload);
        showToast("Gửi đánh giá thành công!", "success");
      }

      resetForm();
      const list = ratingFilter
        ? await apiGetByRating(ratingFilter)
        : await apiGetAll();
      setReviews(Array.isArray(list) ? list : []);
      const s = await apiGetSummary();
      setSummary({
        averageRating: parseFloat(s.averageRating || 0),
        totalReviews: parseInt(s.totalReviews || reviews.length, 10),
      });
    } catch (e) {
      showToast(e.message || "Lỗi gửi/cập nhật", "error");
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      rating: 5,
      reviewerName: "",
      reviewerEmail: "anonymous@example.com",
      comment: "",
    });
    setShowModal(false);
  };

  const edit = (r) => {
    setForm({
      id: r.id,
      rating: r.rating,
      reviewerName: r.reviewerName,
      reviewerEmail: r.reviewerEmail || "anonymous@example.com",
      comment: r.comment || "",
    });
    setShowModal(true);
  };

  const handleDeleteClick = (review) => {
    setDeleteModal(review);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    try {
      await apiDelete(deleteModal.id);
      showToast("Đã xóa đánh giá!", "success");
      setDeleteModal(null);

      const list = ratingFilter
        ? await apiGetByRating(ratingFilter)
        : await apiGetAll();
      setReviews(Array.isArray(list) ? list : []);
      const s = await apiGetSummary();
      setSummary({
        averageRating: parseFloat(s.averageRating || 0),
        totalReviews: parseInt(s.totalReviews || reviews.length, 10),
      });
    } catch (e) {
      showToast(e.message || "Lỗi xóa", "error");
    }
  };

  const renderStars = (rating, interactive = false, size = "w-6 h-6") => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && setForm({ ...form, rating: i + 1 })}
        className={interactive ? "hover:scale-110 transition-transform" : ""}
      >
        <Star
          className={`${size} ${
            i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
        />
      </button>
    ));
  };
  
  // Custom Stat Card component for synchronization
  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-4 rounded-full ${bgColor} ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {deleteModal && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
          reviewName={deleteModal.reviewerName}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header - Đồng bộ với Statistics.jsx */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm mb-8">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                    <FaChartBar className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Quản lý phản hồi</p>
                    <h2 className="text-xl font-semibold text-gray-900">Đánh Giá Từ Khách Hàng</h2>
                </div>
            </div>
            <button
              onClick={() => {
                resetForm(); // Đảm bảo form reset khi mở modal mới
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Gửi Đánh Giá
            </button>
        </header>

        {/* Stats Cards - Đồng bộ phong cách */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Điểm Trung Bình" 
            value={
                <>
                {summary.averageRating.toFixed(1)}
                <span className="text-xl text-gray-400 ml-1">/5</span>
                </>
            } 
            icon={TrendingUp} 
            color="text-green-600" 
            bgColor="bg-green-50" 
          />

          <StatCard 
            title="Tổng Đánh Giá" 
            value={summary.totalReviews} 
            icon={MessageSquare} // Thay Users bằng MessageSquare cho bớt trùng lặp
            color="text-blue-600" 
            bgColor="bg-blue-50" 
          />

          {/* Rating Filter - Tinh chỉnh giao diện */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-yellow-50 p-2 rounded-full">
                <Filter className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-yellow-700 text-sm font-semibold uppercase tracking-wide">
                Lọc Theo Sao
              </p>
            </div>

            <input
              type="range"
              min={0}
              max={5}
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              className="w-full accent-yellow-500 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-yellow-500 text-xl font-bold">
                {"★".repeat(ratingFilter)}
                {"☆".repeat(Math.max(0, 5 - ratingFilter))}
              </span>
              <span className="text-base font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {ratingFilter === 0 ? "Tất cả" : `${ratingFilter} sao`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar - Chỉ giữ lại Search và loại bỏ nút Gửi Đánh Giá (đã chuyển lên Header) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc nội dung..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : paged.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 font-medium">
              Chưa có đánh giá nào
            </p>
            <p className="text-gray-400 mt-2">
              Hãy là người đầu tiên đánh giá!
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {paged.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  {/* Rating & ID */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {renderStars(r.rating, false, "w-5 h-5")}
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      #{r.id}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="mb-4 min-h-[80px]">
                    <blockquote className="text-gray-700 italic border-l-4 border-yellow-500 pl-3">
                        {r.comment || "Khách hàng hài lòng với dịch vụ"}
                    </blockquote>
                  </div>

                  {/* User Info */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="font-bold text-gray-900">
                      {r.reviewerName || "Khách hàng"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString("vi-VN")
                        : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                      onClick={() => edit(r)}
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium shadow-sm"
                      onClick={() => handleDeleteClick(r)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Trước
                </button>
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md">
                  Trang {page} / {pageCount}
                </span>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal (Giữ nguyên cấu trúc, tinh chỉnh màu sắc/bo góc) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-xl z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {form.id ? "Sửa Đánh Giá" : "Gửi Đánh Giá Mới"}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {form.id
                    ? "Cập nhật thông tin đánh giá"
                    : "Chia sẻ trải nghiệm của bạn"}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Đánh Giá Của Bạn *
                  </label>
                  <div className="flex gap-2 justify-center bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    {renderStars(form.rating, true, "w-10 h-10")}
                  </div>
                  <p className="text-center mt-2 text-sm text-gray-600">
                    {form.rating === 5 && "Xuất sắc"}
                    {form.rating === 4 && "Rất tốt"}
                    {form.rating === 3 && "Tốt"}
                    {form.rating === 2 && "Trung bình"}
                    {form.rating === 1 && "Cần cải thiện"}
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Tên Của Bạn *
                  </label>
                  <input
                    type="text"
                    value={form.reviewerName}
                    onChange={(e) =>
                      setForm({ ...form, reviewerName: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                    placeholder="Nhập tên của bạn"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nội Dung Đánh Giá
                  </label>
                  <textarea
                    rows={5}
                    value={form.comment}
                    onChange={(e) =>
                      setForm({ ...form, comment: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none transition"
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
                >
                  {form.id ? "Cập Nhật" : "Gửi Đánh Giá"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}