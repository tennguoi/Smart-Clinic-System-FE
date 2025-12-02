import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Building2, DoorOpen, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import { roomApi } from '../../api/roomApi';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import { useTheme } from '../../contexts/ThemeContext';

export default function ClinicRoomManagement() {
  const { theme } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [formData, setFormData] = useState({
    roomName: '',
    doctorId: null,
    currentQueueId: null,
    status: 'Available',
    isActive: true,
  });

  const [filterStatus, setFilterStatus] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 8;

  const statusOptions = [
    { value: 'Available', label: 'Sẵn sàng' },
    { value: 'Occupied', label: 'Đang sử dụng' },
  ];

  useEffect(() => {
    fetchDoctors(); // Load doctors once on mount
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [filterStatus, filterActive, searchKeyword]);

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
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      // Không gửi keyword lên backend, sẽ filter client-side để tìm cả tên phòng và tên bác sĩ

      const data = await roomApi.getAllRooms(params);
      let roomsArray = Array.isArray(data) ? data : [];
      
      // Client-side filter by active status
      if (filterActive === 'active') {
        roomsArray = roomsArray.filter(room => room.isActive === true);
      } else if (filterActive === 'inactive') {
        roomsArray = roomsArray.filter(room => room.isActive === false);
      }
      
      // Client-side filter by room name and doctor name
      if (searchKeyword && searchKeyword.trim()) {
        const keyword = searchKeyword.trim().toLowerCase();
        roomsArray = roomsArray.filter(room => {
          // Tìm theo tên phòng
          const matchesRoomName = room.roomName?.toLowerCase().includes(keyword);
          
          // Tìm theo tên bác sĩ
          let matchesDoctorName = false;
          if (room.doctorId) {
            const doctor = doctors.find(d => 
              (d.doctorId === room.doctorId || d.userId === room.doctorId) &&
              d.fullName?.toLowerCase().includes(keyword)
            );
            matchesDoctorName = !!doctor;
          }
          // Nếu room có doctorName trực tiếp
          if (!matchesDoctorName && room.doctorName) {
            matchesDoctorName = room.doctorName.toLowerCase().includes(keyword);
          }
          
          return matchesRoomName || matchesDoctorName;
        });
      }
      
      setRooms(roomsArray);

      if (roomsArray.length === 0 && !filterStatus && !filterActive && !searchKeyword) {
        // toast.error('Chưa có phòng khám nào trong hệ thống. Vui lòng tạo phòng mới.');
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      const status = err.response?.status;

      if (status === 401) {
        toast.error('Bạn không có quyền truy cập tính năng này hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (status === 403) {
        toast.error('Bạn không có quyền truy cập tính năng quản lý phòng khám. Vui lòng liên hệ quản trị viên để được cấp quyền.');
      } else if (status === 404) {
        toast.error('API quản lý phòng khám chưa được triển khai trên backend.');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách phòng khám';
        toast.error(`Lỗi: ${errorMessage}`);
      }
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, room = null) => {
    setModalMode(mode);
    setSelectedRoom(room);

    if (mode === 'create') {
      setFormData({
        roomName: '',
        doctorId: null,
        currentQueueId: null,
        status: 'Available',
        isActive: true,
      });
    } else if ((mode === 'edit' || mode === 'view') && room) {
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

  const handleSwitchToEdit = () => {
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
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
        toast.success('Cập nhật phòng khám thành công!');
      } else {
        await roomApi.createRoom(payload);
        toast.success('Tạo phòng khám thành công!');
      }

      setTimeout(() => {
        handleCloseModal();
        fetchRooms();
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng khám này?')) return;

    setLoading(true);

    try {
      await roomApi.deleteRoom(roomId);
      toast.success('Xóa phòng khám thành công!');
      fetchRooms();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa phòng khám';
      toast.error(errorMessage);
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

  const getDoctorName = (doctorId) => {
    if (!doctorId) return null;
    // Ưu tiên lấy từ selectedRoom nếu có
    if (selectedRoom?.doctorName) {
      return selectedRoom.doctorName;
    }
    // Tìm trong danh sách doctors
    const doctor = doctors.find(d => d.doctorId === doctorId || d.userId === doctorId);
    return doctor ? doctor.fullName : null;
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(rooms.length / pageSize);
  const currentPageRooms = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return rooms.slice(startIndex, startIndex + pageSize);
  }, [rooms, currentPage, pageSize]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [filterStatus, filterActive, searchKeyword]);

  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster {...toastConfig} />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
          <DoorOpen className="w-9 h-9 text-blue-600" />
          <span>Quản Lý Phòng Khám</span>
          <CountBadge 
            currentCount={currentPageRooms.length} 
            totalCount={rooms.length} 
            label="phòng" 
          />
        </h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm phòng mới
        </button>
      </div>

      {/* Filter và Search */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md border p-6 mb-6 transition-colors duration-300`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên phòng hoặc tên bác sĩ..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(0);
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="lg:col-span-3">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="">Tất cả</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Hoạt động</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={() => {
                setFilterStatus('');
                setFilterActive('');
                setSearchKeyword('');
              }}
              className={`w-full px-4 py-3 rounded-xl transition font-medium whitespace-nowrap ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      {/* Bảng danh sách phòng */}
      {loading && !showModal ? (
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-12 text-center text-gray-500 transition-colors duration-300`}>
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Đang tải danh sách phòng khám...</p>
        </div>
      ) : (
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border overflow-hidden transition-colors duration-300`}>
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  STT
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tên phòng
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Bác sĩ
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Trạng thái
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hoạt động
                </th>
                <th className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`px-6 py-16 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div>
                      <p className="mb-4 text-lg">Chưa có phòng khám nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageRooms.map((room, index) => (
                  <tr key={room.roomId} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                    {/* STT - Đã thêm */}
                    <td className={`px-4 py-4 text-center font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {currentPage * pageSize + index + 1}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{room.roomName || 'N/A'}</span>
                      </div>
                    </td>

                    <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : room.status === 'Occupied'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {getStatusLabel(room.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                          room.isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {room.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleOpenModal('view', room)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                       
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {rooms.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
        </div>
      )}

      {/* Modal tạo/sửa phòng */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
            <div className={`flex justify-between items-center p-6 border-b sticky top-0 backdrop-blur z-10 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50/80 border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`}>
                {modalMode === 'create' ? 'Thêm phòng khám mới' : modalMode === 'view' ? 'Chi tiết phòng khám' : 'Chỉnh sửa phòng khám'}
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
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Form fields giữ nguyên như cũ */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tên phòng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="VD: Phòng khám Tai-Mũi-Họng số 1"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
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
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bác sĩ phụ trách (Tùy chọn)
                </label>
                {modalMode === 'view' ? (
                  <div className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
                    {getDoctorName(formData.doctorId) || 'Chưa gán bác sĩ'}
                  </div>
                ) : loadingDoctors ? (
                  <div className={`w-full px-3 py-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'}`}>
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
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

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Trạng thái hoạt động
                </label>
                <div className={`w-full px-3 py-2 border rounded-md ${modalMode === 'view' ? (theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300') : (theme === 'dark' ? 'border-gray-600' : 'border-gray-300')}`}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                    />
                    <label className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phòng đang hoạt động
                    </label>
                  </div>
                </div>
              </div>

              {modalMode !== 'view' && (
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
                    className={`flex-1 py-2.5 px-4 rounded-md transition-colors font-medium ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}