import React, { useState, useEffect } from "react";
import { X, UserCheck, DoorOpen, Loader } from "lucide-react";
import { roomApi } from "../../api/roomApi";

export default function RoomAssignModal({ patient, onClose, onAssign }) {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAvailableRooms();
  }, []);

  const loadAvailableRooms = async () => {
    setLoading(true);
    setError("");

    try {
      const rooms = await roomApi.getAvailableRooms();

      setAvailableRooms(Array.isArray(rooms) ? rooms : []);

      if (!rooms || rooms.length === 0) {
        setError("Hiện không có phòng khám nào sẵn sàng. Vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("Failed to load available rooms:", err);
      setError("Không thể tải danh sách phòng khám.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedRoomId) {
      setError("Vui lòng chọn phòng khám");
      return;
    }

    setAssigning(true);
    setError("");

    try {
      await roomApi.assignRoom(patient.queueId, selectedRoomId);

      // callback cập nhật queue list
      onAssign(patient.queueId, selectedRoomId);

      onClose();
    } catch (err) {
      console.error("Failed to assign room:", err);
      setError("Không thể phân phòng. Vui lòng thử lại.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Phân phòng khám</h2>
              <p className="text-sm text-gray-600">Bệnh nhân: {patient.patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Patient Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Mã hàng đợi:</span>
                <span className="ml-2 font-medium text-gray-900">{patient.queueNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Điện thoại:</span>
                <span className="ml-2 font-medium text-gray-900">{patient.phone}</span>
              </div>
              <div>
                <span className="text-gray-600">Độ ưu tiên:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    patient.priority === "Emergency"
                      ? "bg-red-100 text-red-700"
                      : patient.priority === "Urgent"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {patient.priority === "Emergency"
                    ? "Khẩn cấp"
                    : patient.priority === "Urgent"
                    ? "Ưu tiên"
                    : "Thường"}
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Đang tải danh sách phòng khám...</span>
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="text-center py-12">
              <DoorOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có phòng khám nào sẵn sàng</p>
            </div>
          ) : (
            <>
              {/* Room List */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chọn phòng khám (với bác sĩ sẵn sàng) <span className="text-red-500">*</span>
                </label>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableRooms.map((room) => (
                    <div
                      key={room.roomId}
                      onClick={() => setSelectedRoomId(room.roomId)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedRoomId === room.roomId
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <DoorOpen
                              className={`w-5 h-5 ${
                                selectedRoomId === room.roomId
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <h3 className="font-semibold text-gray-900">{room.roomName}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Sẵn sàng
                            </span>
                          </div>

                          {room.doctorName && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 ml-7">
                              <UserCheck className="w-4 h-4" />
                              <span>
                                Bác sĩ: <span className="font-medium">{room.doctorName}</span>
                              </span>
                            </div>
                          )}

                          {room.description && (
                            <p className="text-sm text-gray-500 mt-1 ml-7">{room.description}</p>
                          )}
                        </div>

                        {selectedRoomId === room.roomId && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={assigning}
          >
            Hủy
          </button>

          <button
            onClick={handleAssign}
            disabled={!selectedRoomId || assigning}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {assigning ? (
              <>
                <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                Đang phân phòng...
              </>
            ) : (
              "Xác nhận phân phòng (chuyển sang đang khám)"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
