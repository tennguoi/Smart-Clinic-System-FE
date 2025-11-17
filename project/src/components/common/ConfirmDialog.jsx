// src/components/common/ConfirmDialog.jsx
import { CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, patientName, queueNumber }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            <h2 className="text-3xl font-black">Hoàn thành khám bệnh?</h2>
          </div>

          <div className="p-8 text-center space-y-6">
            <div>
              <p className="text-5xl font-black text-emerald-600">{queueNumber}</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{patientName}</p>
            </div>
            <p className="text-lg text-gray-600">
              Bạn có chắc chắn muốn <span className="font-bold text-emerald-600">hoàn thành khám</span> cho bệnh nhân này?
            </p>
          </div>

          <div className="flex gap-4 p-6 bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-2xl transition flex items-center justify-center gap-3 shadow-lg"
            >
              <XCircle className="w-8 h-8" />
              Hủy bỏ
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xl py-5 rounded-2xl transition flex items-center justify-center gap-3 shadow-2xl"
            >
              <CheckCircle className="w-9 h-9" />
              Xác nhận hoàn thành
            </button>
          </div>
        </div>
      </div>
    </>
  );
}