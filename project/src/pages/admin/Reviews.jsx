// src/pages/admin/ReviewsPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:8082/api/admin/reviews",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

function ReviewsContent() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    rating: 5,
    reviewerName: "",
    reviewerEmail: "",
    comment: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("", { params: { page, size: 10, search } });
      setReviews(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Phiên đăng nhập hết hạn!");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Lỗi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  const save = async () => {
    if (!form.reviewerName || !form.reviewerEmail) {
      toast.error("Nhập tên và email!");
      return;
    }
    try {
      if (form.id) {
        await api.put(`/${form.id}`, form);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("", form);
        toast.success("Thêm mới thành công!");
      }
      setForm({ id: null, rating: 5, reviewerName: "", reviewerEmail: "", comment: "" });
      load();
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu");
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa đánh giá này?")) return;
    try {
      await api.delete(`/${id}`);
      toast.success("Đã xóa!");
      load();
    } catch (err) {
      toast.error("Lỗi xóa");
    }
  };

  const edit = (r) => {
    setForm({
      id: r.id,
      rating: r.rating,
      reviewerName: r.reviewerName,
      reviewerEmail: r.reviewerEmail,
      comment: r.comment || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Quản Lý Đánh Giá Khách Hàng
        </h1>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">{form.id ? "Sửa" : "Thêm mới"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input placeholder="Tên" value={form.reviewerName} onChange={e => setForm({ ...form, reviewerName: e.target.value })} className="px-4 py-3 border rounded-lg" />
            <input placeholder="Email" value={form.reviewerEmail} onChange={e => setForm({ ...form, reviewerEmail: e.target.value })} className="px-4 py-3 border rounded-lg" />
            <select value={form.rating} onChange={e => setForm({ ...form, rating: +e.target.value })} className="px-4 py-3 border rounded-lg">
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} sao</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                {form.id ? "CẬP NHẬT" : "THÊM"}
              </button>
              {form.id && <button onClick={() => setForm({ id: null, rating: 5, reviewerName: "", reviewerEmail: "", comment: "" })} className="px-6 bg-gray-500 text-white rounded-lg">HỦY</button>}
            </div>
          </div>
          <textarea placeholder="Nội dung (tùy chọn)" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows="4" className="w-full px-4 py-3 border rounded-lg" />
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Tìm kiếm tên/email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="w-full max-w-xl mb-8 px-6 py-4 border-2 rounded-2xl text-lg"
        />

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Tên</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Bình luận</th>
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="7" className="text-center py-10">Đang tải...</td></tr>}
              {reviews.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">#{r.id}</td>
                  <td className="px-6 py-4">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</td>
                  <td className="px-6 py-4 font-medium">{r.reviewerName}</td>
                  <td className="px-6 py-4 text-blue-600">{r.reviewerEmail}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{r.comment || "-"}</td>
                  <td className="px-6 py-4 text-sm">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => edit(r)} className="bg-amber-500 text-white px-4 py-2 rounded mr-2">Sửa</button>
                    <button onClick={() => remove(r.id)} className="bg-red-600 text-white px-4 py-2 rounded">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 py-6 bg-gray-50">
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0} className="px-6 py-3 border rounded-lg disabled:opacity-50">Trước</button>
              <span className="px-6 py-3 font-bold">Trang {page+1} / {totalPages}</span>
              <button onClick={() => setPage(p => p+1)} disabled={page>=totalPages-1} className="px-6 py-3 border rounded-lg disabled:opacity-50">Sau</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || !user.roles?.includes("ROLE_ADMIN")) {
    window.location.href = "/login";
    return null;
  }

  return <ReviewsContent />;
}