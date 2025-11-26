import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Building2 } from 'lucide-react';
import { roomApi } from '../../api/roomApi';

export default function ClinicRoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    roomName: '',
    doctorId: null,
    currentQueueId: null,
    status: 'Available',
    isActive: true,
  });

  const [filterStatus, setFilterStatus] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const statusOptions = [
    { value: 'Available', label: 'Sẵn sàng' },
    { value: 'Occupied', label: 'Đang sử dụng' },
  ];

  useEffect(() => {
    fetchRooms();
  }, [filterStatus, searchKeyword, activeOnly]);

  useEffect(() => {
    if (showModal) {
      if (modalMode === 'edit' && selectedRoom) {
        fetchDoctorsForUpdate(selectedRoom.roomId);
      } else {
        fetchDoctors();
      }
    }
  }, [showModal, modalMode, selectedRoom]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await roomApi.getAllDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchDoctorsForUpdate = async (roomId) => {
    setLoadingDoctors(true);
    try {
      const data = await roomApi.getDoctorsForUpdate(roomId);
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching doctors for update:', err);
      fetchDoctors();
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (searchKeyword) params.keyword = searchKeyword;
      if (activeOnly) params.activeOnly = true;

      const data = await roomApi.getAllRooms(params);
      const roomsArray = Array.isArray(data) ? data : [];
      setRooms(roomsArray);

      if (roomsArray.length === 0 && !filterStatus && !searchKeyword && !activeOnly) {
        setError('Chưa có phòng khám nào trong hệ thống. Vui lòng tạo phòng mới.');
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      const status = err.response?.status;

      if (status === 401) {
        setError('Bạn không có quyền truy cập tính năng này hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (status === 403) {
        setError('Bạn không có quyền truy cập tính năng quản lý phòng khám. Vui lòng liên hệ quản trị viên để được cấp quyền.');
      } else if (status === 404) {
        setError('API quản lý phòng khám chưa được triển khai trên backend.');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách phòng khám';
        setError(`Lỗi: ${errorMessage}`);
      }
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, room = null) => {
    setModalMode(mode);
    setSelectedRoom(room);
    setError('');
    setSuccess('');

    if (mode === 'create') {
      setFormData({
        roomName: '',
        doctorId: null,
        currentQueueId: null,
        status: 'Available',
        isActive: true,
      });
    } else if (mode === 'edit' && room) {
      setFormData({
        roomName: room.roomName || '',
        doctorId: room.doctorId || null,
        currentQueueId: room.currentQueueId || null,
        status: room.status || 'Available',
        isActive: room.isActive !== undefined ? room.isActive : true,
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        roomName: formData.roomName.trim(),
        status: formData.status,
        isActive: formData.isActive,
        ...(formData.doctorId && { doctorId: formData.doctorId }),
        ...(formData.currentQueueId && { currentQueueId: formData.currentQueueId }),
      };

      if (modalMode === 'edit' && selectedRoom) {
        await roomApi.updateRoom(selectedRoom.roomId, payload);
        setSuccess('Cập nhật phòng khám thành công!');
      } else {
        await roomApi.createRoom(payload);
        setSuccess('Tạo phòng khám thành công!');
      }

      setTimeout(() => {
        handleCloseModal();
        fetchRooms();
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng khám này?')) return;

    setLoading(true);
    setError('');

    try {
      await roomApi.deleteRoom(roomId);
      setSuccess('Xóa phòng khám thành công!');
      fetchRooms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa phòng khám';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Không xác định';
    const s = String(status).toUpperCase();
    if (s === 'AVAILABLE') return 'Sẵn sàng';
    if (s === 'OCCUPIED') return 'Đang sử dụng';
    return 'Không xác định';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Quản lý phòng khám</h2>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm phòng mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Filter và Search */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Nhập tên phòng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Chỉ hiển thị phòng hoạt động</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus('');
                setSearchKeyword('');
                setActiveOnly(false);
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Bảng danh sách phòng */}
      {loading && !showModal ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p>Đang tải danh sách phòng khám...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tên phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bác sĩ
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hoạt động
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                    {error ? (
                      <div>
                        <p className="text-red-600 font-medium mb-2">{error}</p>
                        <p className="text-sm">Vui lòng kiểm tra console để xem chi tiết lỗi.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4 text-lg">Chưa có phòng khám nào</p>
                        <button
                          onClick={() => handleOpenModal('create')}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Tạo phòng đầu tiên
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                rooms.map((room, index) => (
                  <tr key={room.roomId} className="hover:bg-gray-50 transition-colors">
                    {/* STT - Đã thêm */}
                    <td className="px-4 py-4 text-center font-semibold text-gray-700">
                      {index + 1}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{room.roomName || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {room.doctorName ? (
                        <span className="font-medium">{room.doctorName}</span>
                      ) : (
                        <span className="text-gray-400 italic">Chưa gán bác sĩ</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                          room.status === 'Available'
                            ? 'bg-green-100 text-green-700'
                            : room.status === 'Occupied'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {getStatusLabel(room.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                          room.isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {room.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleOpenModal('edit', room)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.roomId)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Xóa phòng"
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
      )}

      {/* Modal tạo/sửa phòng */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Thêm phòng khám mới' : 'Chỉnh sửa phòng khám'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              {/* Form fields giữ nguyên như cũ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phòng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Phòng khám Tai-Mũi-Họng số 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none:2 focus:ring-blue-500"
                  required
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bác sĩ phụ trách (Tùy chọn)
                </label>
                {loadingDoctors ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm">
                    Đang tải danh sách bác sĩ...
                  </div>
                ) : (
                  <select
                    name="doctorId"
                    value={formData.doctorId || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        doctorId: value ? value : null,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chưa gán bác sĩ --</option>
                    {doctors.map((doctor) => {
                      const hasRoom = rooms.some(
                        (r) => r.doctorId === doctor.doctorId && r.isActive && r.roomId !== selectedRoom?.roomId
                      );
                      const isCurrentDoctor = modalMode === 'edit' && selectedRoom?.doctorId === doctor.doctorId;
                      return (
                        <option key={doctor.doctorId} value={doctor.doctorId}>
                          {doctor.fullName} {doctor.email ? `(${doctor.email})` : ''}
                          {isCurrentDoctor ? ' [Bác sĩ hiện tại]' : hasRoom ? ' [Đã có phòng]' : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Phòng đang hoạt động
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 font-medium"
                >
                  {loading ? 'Đang xử lý...' : modalMode === 'create' ? 'Tạo phòng' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2.5 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
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