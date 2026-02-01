// src/components/common/ConfirmDialog.jsx
import { CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, patientName, queueNumber, patient }) {
  if (!isOpen) return null;

  const handleOverlayClick = () => onClose?.();
  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={stop}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5">
          <h3 className="text-xl font-extrabold">Hoàn thành khám bệnh?</h3>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-gray-700">
            <div className="font-bold text-lg">Số thứ tự: {queueNumber ?? '-'}</div>
            <div className="text-base">Bệnh nhân: {patientName ?? '-'}</div>
          </div>

          <p className="text-sm text-gray-600">Bạn có chắc chắn muốn hoàn thành khám cho bệnh nhân này?</p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
            >
              <XCircle className="w-5 h-5" />
              Hủy bỏ
            </button>

            <button
              onClick={() => onConfirm?.(patient)}   // ✅ truyền patient trực tiếp
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black shadow-xl"
            >
              <CheckCircle className="w-5 h-5" />
              Xác nhận hoàn thành
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
