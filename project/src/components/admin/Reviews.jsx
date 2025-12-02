
// src/pages/admin/Reviews.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

// === API base (public controller) ===
const api = axios.create({
  baseURL: "http://localhost:8082/api/public/reviews",
});


export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0); // 0 = all
  const [form, setForm] = useState({ id: null, rating: 5, reviewerName: "", reviewerEmail: "", comment: "" });

  // Client-side pagination
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const loadAll = async () => {
    setLoading(true);
    try {
      let res;
      // If filtering by rating on server side is available, prefer it
      if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
        res = await api.get(`/rating/${ratingFilter}`);
      } else {
        res = await api.get("");
      }
      const list = Array.isArray(res.data) ? res.data : [];
      setReviews(list);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [ratingFilter]);

  const filtered = reviews.filter(r => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.reviewerName || "").toLowerCase().includes(q) ||
      (r.reviewerEmail || "").toLowerCase().includes(q) ||
      (r.comment || "").toLowerCase().includes(q)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => {
    // reset page when search changes
    setPage(0);
  }, [search]);

  const save = async () => {
    // basic validation
    if (!form.reviewerName || !form.reviewerEmail) {
      toast.error("Vui lòng nhập tên và email");
      return;
    }
    const payload = {
      rating: Number(form.rating) || 5,
      reviewerName: form.reviewerName.trim(),
      reviewerEmail: form.reviewerEmail.trim(),
      comment: form.comment?.trim() || "",
    };
    try {
      if (form.id) {
        await api.put(`/${form.id}`, payload);
        toast.success("Cập nhật đánh giá thành công");
      } else {
        await api.post("", payload);
        toast.success("Thêm đánh giá thành công");
      }
      setForm({ id: null, rating: 5, reviewerName: "", reviewerEmail: "", comment: "" });
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi lưu dữ liệu");
    }
  };

  const edit = (r) => {
    setForm({ id: r.id, rating: r.rating, reviewerName: r.reviewerName, reviewerEmail: r.reviewerEmail, comment: r.comment || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Bạn muốn xóa đánh giá này?")) return;
    try {
      await api.delete(`/${id}`);
      toast.success("Đã xóa đánh giá");
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi xóa đánh giá");
    }
  };

  return (
    <div className="p-6">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Quản lý đánh giá (CRUD)</h2>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-4 bg-white border rounded-xl p-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Tên người đánh giá</label>
          <input
            value={form.reviewerName}
            onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="Ví dụ: Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            value={form.reviewerEmail}
            onChange={(e) => setForm({ ...form, reviewerEmail: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            type="email"
            placeholder="email@domain.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Số sao</label>
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded"
          >
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} sao</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Bình luận</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded"
            placeholder="Cảm nhận của bạn..."
          />
        </div>
        <div className="flex gap-3 md:col-span-2">
          <button onClick={save} className="px-5 py-2 bg-blue-600 text-white rounded">
            {form.id ? "CẬP NHẬT" : "THÊM"}
          </button>
          {form.id && (
            <button onClick={() => setForm({ id: null, rating: 5, reviewerName: "", reviewerEmail: "", comment: "" })} className="px-5 py-2 bg-gray-500 text-white rounded">
              HỦY
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên/email/nội dung..."
          className="px-4 py-2 border rounded w-full md:w-96"
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(Number(e.target.value))}
          className="px-4 py-2 border rounded"
        >
          <option value={0}>Tất cả sao</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} sao</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Đánh giá</th>
              <th className="text-left px-4 py-2">Tên</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Bình luận</th>
              <th className="text-left px-4 py-2">Ngày</th>
              <th className="text-left px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6">Đang tải...</td></tr>
            ) : (filtered.slice(page * pageSize, page * pageSize + pageSize).length === 0) ? (
              <tr><td colSpan={7} className="px-4 py-6">Không có dữ liệu</td></tr>
            ) : (
              filtered.slice(page * pageSize, page * pageSize + pageSize).map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">#{r.id}</td>
                  <td className="px-4 py-2">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</td>
                  <td className="px-4 py-2">{r.reviewerName}</td>
                  <td className="px-4 py-2">{r.reviewerEmail}</td>
                  <td className="px-4 py-2">{r.comment || '-'}</td>
                  <td className="px-4 py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '-'}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => edit(r)} className="px-3 py-1 bg-amber-500 text-white rounded mr-2">Sửa</button>
                    <button onClick={() => remove(r.id)} className="px-3 py-1 bg-red-600 text-white rounded">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => setPage(p => Math.max(0, p-1))}
          disabled={page===0}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Trước
        </button>
        <span>Trang {page+1} / {Math.max(1, Math.ceil(filtered.length / pageSize))}</span>
        <button
          onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil(filtered.length / pageSize))-1, p+1))}
          disabled={page>=Math.max(1, Math.ceil(filtered.length / pageSize))-1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
