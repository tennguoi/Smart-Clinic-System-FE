// src/components/admin/ClinicRoomManagement.jsx
import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Building2, DoorOpen, Eye, Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import { roomApi } from '../../api/roomApi';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import { useTranslation } from 'react-i18next';

export default function ClinicRoomManagement() {
  const { t } = useTranslation();

  const [rooms, setRooms] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRoom, setSelectedRoom] = useState(null);

  // XÓA: Thêm state cho modal xác nhận xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

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
  
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 8;

  const statusOptions = [
    { value: 'Available', label: t('roomManagement.statusAvailable', 'Sẵn sàng') },
    { value: 'Occupied', label: t('roomManagement.statusOccupied', 'Đang sử dụng') },
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [filterStatus, filterActive, searchKeyword]);

  useEffect(() => {
    if (showModal && (modalMode === 'edit' || modalMode === 'view') && selectedRoom) {
      fetchDoctorsForUpdate(selectedRoom.roomId);
    } else if (showModal) {
      fetchDoctors();
    }
  }, [showModal, modalMode, selectedRoom]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await roomApi.getAllDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(t('roomManagement.loadDoctorsError', 'Không thể tải danh sách bác sĩ'));
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
      fetchDoctors();
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const data = await roomApi.getAllRooms(params);
      let roomsArray = Array.isArray(data) ? data : [];

      if (filterActive === 'active') roomsArray = roomsArray.filter(r => r.isActive);
      if (filterActive === 'inactive') roomsArray = roomsArray.filter(r => !r.isActive);

      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        roomsArray = roomsArray.filter(room => {
          const matchName = room.roomName?.toLowerCase().includes(kw);
          const doctorName = room.doctorName || doctors.find(d => (d.doctorId === room.doctorId || d.userId === room.doctorId))?.fullName || '';
          const matchDoctor = doctorName.toLowerCase().includes(kw);
          return matchName || matchDoctor;
        });
      }

      setRooms(roomsArray);
    } catch (err) {
      const msg = err.response?.data?.message || t('roomManagement.loadError', 'Không thể tải danh sách phòng khám');
      toast.error(msg);
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
    } else if (room) {
      setFormData({
        roomName: room.roomName || '',
        doctorId: room.doctorId || null,
        currentQueueId: room.currentQueueId || null,
        status: room.status || 'Available',
        isActive: room.isActive ?? true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };

  const handleSwitchToEdit = () => setModalMode('edit');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomName.trim()) {
      toast.error(t('roomManagement.nameRequired', 'Vui lòng nhập tên phòng'));
      return;
    }

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
        toast.success(t('roomManagement.updateSuccess', 'Cập nhật phòng khám thành công!'));
      } else {
        await roomApi.createRoom(payload);
        toast.success(t('roomManagement.createSuccess', 'Tạo phòng khám thành công!'));
      }

      handleCloseModal();
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error', 'Thao tác thất bại'));
    } finally {
      setLoading(false);
    }
  };

  // XÓA: Thay window.confirm bằng modal đẹp
  const openDeleteConfirm = (room) => {
    setRoomToDelete(room);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    setLoading(true);
    try {
      await roomApi.deleteRoom(roomToDelete.roomId);
      toast.success(t('roomManagement.deleteSuccess', 'Xóa phòng khám thành công!'));
      setShowDeleteConfirm(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || t('roomManagement.deleteError', 'Không thể xóa phòng khám'));
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (doctorId) => {
    if (!doctorId) return t('roomManagement.noDoctor', 'Chưa gán bác sĩ');
    if (selectedRoom?.doctorName) return selectedRoom.doctorName;
    const doctor = doctors.find(d => d.doctorId === doctorId || d.userId === doctorId);
    return doctor ? doctor.fullName : t('roomManagement.noDoctor', 'Chưa gán bác sĩ');
  };

  const totalPages = Math.ceil(rooms.length / pageSize);
  const currentPageRooms = useMemo(() => {
    const start = currentPage * pageSize;
    return rooms.slice(start, start + pageSize);
  }, [rooms, currentPage, pageSize]);

  useEffect(() => setCurrentPage(0), [filterStatus, filterActive, searchKeyword]);

  return (
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
      <Toaster {...toastConfig} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <DoorOpen className="w-9 h-9 text-blue-600" />
          <span>{t('roomManagement.title', 'Quản Lý Phòng Khám')}</span>
          <CountBadge currentCount={currentPageRooms.length} totalCount={rooms.length} label={t('roomManagement.room', 'phòng')} />
        </h1>
        <button onClick={() => handleOpenModal('create')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('roomManagement.createButton', 'Thêm phòng mới')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('roomManagement.common.search', 'Tìm kiếm')}</label>
            <input
              type="text"
              placeholder={t('roomManagement.searchPlaceholder', 'Tên phòng hoặc tên bác sĩ...')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('roomManagement.statusLabel', 'Trạng thái')}</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="">{t('roomManagement.common.all', 'Tất cả')}</option>
              {statusOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('roomManagement.activeLabel', 'Hoạt động')}</label>
            <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="">{t('roomManagement.common.all', 'Tất cả')}</option>
              <option value="active">{t('roomManagement.active', 'Hoạt động')}</option>
              <option value="inactive">{t('roomManagement.inactive', 'Ngưng hoạt động')}</option>
            </select>
          </div>
          <div className="lg:col-span-1 flex items-end">
            <button onClick={() => { setFilterStatus(''); setFilterActive(''); setSearchKeyword(''); }}
              className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium">
              {t('roomManagement.common.clearFilter', 'Xóa lọc')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && !showModal ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
          <p>{t('roomManagement.loading', 'Đang tải danh sách phòng khám...')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-20">{t('roomManagement.common.stt', 'STT')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('roomManagement.table.roomName', 'Tên phòng')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('roomManagement.table.doctor', 'Bác sĩ')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('roomManagement.table.status', 'Trạng thái')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('roomManagement.table.active', 'Hoạt động')}</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{t('roomManagement.common.actions', 'Thao tác')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500 text-lg">
                    {t('roomManagement.noRooms', 'Chưa có phòng khám nào')}
                  </td>
                </tr>
              ) : (
                currentPageRooms.map((room, idx) => (
                  <tr key={room.roomId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-center font-semibold">{currentPage * pageSize + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{room.roomName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {room.doctorName ? room.doctorName : <span className="text-gray-400 italic">{t('roomManagement.noDoctor', 'Chưa gán bác sĩ')}</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                        room.status === 'Available' ? 'bg-green-100 text-green-700' :
                        room.status === 'Occupied' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {room.status === 'Available' ? t('roomManagement.statusAvailable', 'Sẵn sàng') :
                         room.status === 'Occupied' ? t('roomManagement.statusOccupied', 'Đang sử dụng') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                        room.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {room.isActive ? t('roomManagement.active', 'Hoạt động') : t('roomManagement.inactive', 'Ngưng hoạt động')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center space-x-3">
                      <button onClick={() => handleOpenModal('view', room)} title={t('common.view', 'Xem chi tiết')}
                        className="text-blue-600 hover:text-blue-800"><Eye className="w-5 h-5" /></button>
                      {/* <button onClick={() => handleOpenModal('edit', room)} title={t('common.edit', 'Chỉnh sửa')}
                        className="text-amber-600 hover:text-amber-800"><Edit className="w-5 h-5" /></button> */}
                      <button onClick={() => openDeleteConfirm(room)} title={t('common.delete', 'Xóa')}
                        className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {rooms.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>
      )}

      {/* Modal tạo/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b bg-blue-50">
              <h2 className="text-2xl font-bold text-blue-700">
                {modalMode === 'create' ? t('roomManagement.modal.create', 'Thêm phòng khám mới') :
                 modalMode === 'view' ? t('roomManagement.modal.view', 'Chi tiết phòng khám') :
                 t('roomManagement.modal.edit', 'Chỉnh sửa phòng khám')}
              </h2>
              <div className="flex items-center gap-3">
                {modalMode === 'view' && (
                  <button onClick={handleSwitchToEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Edit className="w-5 h-5" /> {t('roomManagement.common.edit', 'Chỉnh sửa')}
                  </button>
                )}
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('roomManagement.roomName', 'Tên phòng')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="roomName" value={formData.roomName} onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  placeholder={t('roomManagement.roomNamePlaceholder', 'VD: Phòng khám Tai-Mũi-Họng số 1')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('roomManagement.statusLabel', 'Trạng thái')} <span className="text-red-500">*</span>
                </label>
                <select name="status" value={formData.status} onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                  {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('roomManagement.doctorLabel', 'Bác sĩ phụ trách (Tùy chọn)')}
                </label>
                {modalMode === 'view' ? (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {getDoctorName(formData.doctorId)}
                  </div>
                ) : loadingDoctors ? (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    {t('roomManagement.loadingDoctors', 'Đang tải danh sách bác sĩ...')}
                  </div>
                ) : (
                  <select name="doctorId" value={formData.doctorId || ''} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option value="">{t('roomManagement.noDoctorSelect', '-- Chưa gán bác sĩ --')}</option>
                    {doctors.map(doc => {
                      const assigned = rooms.some(r => r.doctorId === doc.doctorId && r.roomId !== selectedRoom?.roomId && r.isActive);
                      const current = modalMode === 'edit' && selectedRoom?.doctorId === doc.doctorId;
                      return (
                        <option key={doc.doctorId} value={doc.doctorId}>
                          {doc.fullName} {assigned && !current && ' [Đã có phòng]'} {current && ' [Bác sĩ hiện tại]'}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className="h-4 w-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium text-gray-700">
                    {t('roomManagement.activeCheckbox', 'Phòng đang hoạt động')}
                  </span>
                </label>
              </div>

              {modalMode !== 'view' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-70 font-medium flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {modalMode === 'create' ? t('roomManagement.createButton', 'Tạo phòng') : t('roomManagement.updateButton', 'Cập nhật')}
                  </button>
                  <button type="button" onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 font-medium">
                    {t('roomManagement.common.cancel', 'Hủy')}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA – ĐẸP + i18n SONG NGỮ */}
      {showDeleteConfirm && roomToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold mb-2">
              {t('roomManagement.confirmDelete.title', 'Xóa phòng khám?')}
            </h3>
            <p className="text-gray-600 mb-2">
              {t('roomManagement.confirmDelete.text1', 'Bạn có chắc chắn muốn xóa phòng khám')}
            </p>
            <p className="font-semibold text-gray-800 mb-6">
              "{roomToDelete.roomName}"
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t('roomManagement.confirmDelete.warning', 'Hành động này không thể hoàn tác.')}
            </p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} disabled={loading}
                className="flex-1 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {t('roomManagement.confirmDelete.confirm', 'Xóa')}
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setRoomToDelete(null); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium">
                {t('common.cancel', 'Hủy')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}