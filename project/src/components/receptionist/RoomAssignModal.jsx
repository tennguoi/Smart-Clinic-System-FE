import React, { useState, useEffect } from "react";
import { X, DoorOpen, Loader, UserCheck } from "lucide-react";
import { roomApi } from "../../api/roomApi";
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';

export default function RoomAssignModal({ patient, onClose, onAssign }) {
  const { theme } = useTheme();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAvailableRooms = async () => {
      setLoading(true);
      setError("");
      try {
        const rooms = await roomApi.getAvailableRooms();
        setAvailableRooms(Array.isArray(rooms) ? rooms : []);

        if (!rooms || rooms.length === 0) {
          setError("Hiện không có phòng khám nào trống.");
        }
      } catch (err) {
        console.error("Failed to load available rooms:", err);
        setError("Không thể tải danh sách phòng khám.");
      } finally {
        setLoading(false);
      }
    };

    loadAvailableRooms();
  }, []);

  const handleAssign = async () => {
    if (!selectedRoomId) {
      setError("Vui lòng chọn một phòng khám");
      return;
    }

    // Validate patient and queueId
    if (!patient || !patient.queueId) {
      setError("Lỗi: Không tìm thấy ID hàng đợi. Vui lòng làm mới trang.");
      console.error("Invalid patient or queueId:", patient);
      return;
    }

    setAssigning(true);
    setError("");

    try {
      await roomApi.assignRoom(patient.queueId, selectedRoomId);
      toast.success("Phân phòng thành công! Bệnh nhân đang được khám");
      onAssign?.(); // Reload queue list
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message 
               || err.response?.data?.error 
               || "Phân phòng thất bại. Vui lòng thử lại.";
      setError(msg);
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <DoorOpen className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Phân phòng khám</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bệnh nhân: {patient.patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Patient Info */}
          <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Mã hàng đợi:</span>
                <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{patient.queueNumber}</span>
              </div>
              <div>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Điện thoại:</span>
                <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{patient.phone}</span>
              </div>
              <div>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Độ ưu tiên:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    patient.priority === "Emergency"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : patient.priority === "Urgent"
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                >
                  {patient.priority === "Emergency" ? "Khẩn cấp" : 
                   patient.priority === "Urgent" ? "Ưu tiên" : "Thường"}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`border px-4 py-3 rounded-md text-sm ${theme === 'dark' ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}

          {/* Loading or Room List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              <span className={`ml-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Đang tải danh sách phòng khám...</span>
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="text-center py-12">
              <DoorOpen className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Không có phòng khám nào sẵn sàng</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Chọn phòng khám (với bác sĩ sẵn sàng) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableRooms.map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => setSelectedRoomId(room.roomId)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedRoomId === room.roomId
                        ? (theme === 'dark' ? "border-blue-500 bg-blue-900/30" : "border-blue-500 bg-blue-50")
                        : (theme === 'dark' ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50")
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <DoorOpen className={`w-5 h-5 ${selectedRoomId === room.roomId ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`} />
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{room.roomName}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full font-medium">
                            Sẵn sàng
                          </span>
                        </div>
                        {room.doctorName && (
                          <div className={`flex items-center gap-2 text-sm ml-7 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <UserCheck className="w-4 h-4" />
                            <span>
                              Bác sĩ: <span className="font-medium">{room.doctorName}</span>
                            </span>
                          </div>
                        )}
                        {room.description && (
                          <p className={`text-sm mt-1 ml-7 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{room.description}</p>
                        )}
                      </div>
                      {selectedRoomId === room.roomId && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <button
            onClick={onClose}
            disabled={assigning}
            className={`px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            Hủy
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedRoomId || assigning}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {assigning ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Đang phân phòng...
              </>
            ) : (
              "Xác nhận phân phòng"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}