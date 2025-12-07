import { Pill, Plus, X } from 'lucide-react';

export default function PrescriptionForm({ 
  prescriptionItems, 
  onAdd, 
  onRemove, 
  onUpdate 
}) {
  return (
    <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-lg border-2 border-blue-100">
      <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 flex items-center gap-3 text-slate-800">
        <Pill size={24} className="lg:w-7 lg:h-7 text-blue-600" />
        Kê đơn thuốc
      </h3>
      
      <div className="space-y-4">
        {/* Header - ẩn trên mobile */}
        <div className="hidden lg:grid grid-cols-12 gap-4 font-semibold text-sm text-slate-600 mb-2 px-2">
          <div className="col-span-1 text-center">STT</div>
          <div className="col-span-5">TÊN THUỐC *</div>
          <div className="col-span-5">HƯỚNG DẪN SỬ DỤNG *</div>
          <div className="col-span-1 text-center">XÓA</div>
        </div>

        {prescriptionItems.map((item, index) => (
          <div key={index} className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-600 text-lg">#{index + 1}</span>
                <button 
                  onClick={() => onRemove(index)} 
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên thuốc *
                </label>
                <input 
                  type="text" 
                  value={item.drugName} 
                  onChange={e => onUpdate(index, 'drugName', e.target.value)} 
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm transition-all" 
                  placeholder="Paracetamol 500mg..." 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Hướng dẫn sử dụng *
                </label>
                <input 
                  type="text" 
                  value={item.instructions} 
                  onChange={e => onUpdate(index, 'instructions', e.target.value)} 
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm transition-all" 
                  placeholder="Uống 1 viên x 3 lần/ngày..." 
                />
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid grid-cols-12 gap-4 items-start">
              <div className="col-span-1 flex items-center justify-center pt-3 font-bold text-blue-600">
                {index + 1}
              </div>
              <div className="col-span-5">
                <input 
                  type="text" 
                  value={item.drugName} 
                  onChange={e => onUpdate(index, 'drugName', e.target.value)} 
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all" 
                  placeholder="Paracetamol 500mg..." 
                />
              </div>
              <div className="col-span-5">
                <input 
                  type="text" 
                  value={item.instructions} 
                  onChange={e => onUpdate(index, 'instructions', e.target.value)} 
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all" 
                  placeholder="Uống 1 viên x 3 lần/ngày..." 
                />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <button 
                  onClick={() => onRemove(index)} 
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={onAdd} 
          className="w-full py-3 lg:py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={20} /> Thêm thuốc mới
        </button>
      </div>
    </div>
  );
}