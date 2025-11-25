import React, { useState } from 'react';
import { 
  CreditCard, Banknote, Building2, Smartphone, 
  Printer, FileDown, Edit2, Trash2, 
  Stethoscope, TestTube, Scan, Syringe,
  User, Calendar, Check, AlertCircle, X, CheckCircle
} from 'lucide-react';

const paymentMethods = [
  { value: 'Cash', label: 'Tiền mặt', icon: Banknote },
  { value: 'CreditCard', label: 'Thẻ tín dụng', icon: CreditCard },
  { value: 'BankTransfer', label: 'Chuyển khoản', icon: Building2 },
  { value: 'QRPayment', label: 'QR Payment', icon: Smartphone }
];

const categoryIcons = {
  Exam: Stethoscope,
  Test: TestTube,
  Imaging: Scan,
  Procedure: Syringe
};

const categoryColors = {
  Exam: 'bg-blue-50 text-blue-600',
  Test: 'bg-purple-50 text-purple-600',
  Imaging: 'bg-emerald-50 text-emerald-600',
  Procedure: 'bg-orange-50 text-orange-600'
};

const steps = [
  { label: 'Khám bệnh', completed: true },
  { label: 'Dịch vụ', completed: true },
  { label: 'Thanh toán', completed: false }
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function PayInvoiceModal({ invoice, onClose, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!invoice) return null;

  const remaining = invoice.remainingAmount || (invoice.finalAmount - invoice.amountPaid) || 0;

  const handlePay = async () => {
    if (remaining <= 0) {
      setError('Hóa đơn đã thanh toán đủ');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8082/api/billing/${invoice.billId}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paidAmount: remaining,
          paymentMethod: selectedMethod
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Thanh toán thất bại');
      }

      setSuccess(true);
      
      // Dispatch event to notify other components about payment completion
      window.dispatchEvent(new CustomEvent('paymentCompleted', {
        detail: {
          billId: invoice.billId,
          amount: remaining,
          paymentMethod: selectedMethod,
          timestamp: new Date().toISOString()
        }
      }));
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Thanh toán thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-2xl w-full max-w-7xl my-8">
        {/* Header với nút đóng */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán hóa đơn</h1>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step.completed ? 'bg-[#0ABAB5] text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step.completed ? 'text-[#0ABAB5]' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-3 ${
                      step.completed ? 'bg-[#0ABAB5]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Patient Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0ABAB5] to-[#0099FF] rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{invoice.patientName}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>Giới tính: <span className="font-medium">{invoice.gender || 'N/A'}</span></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Tuổi: <span className="font-medium">{invoice.age || 'N/A'}</span></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Mã hồ sơ: <span className="font-medium text-[#0ABAB5]">{invoice.recordId || 'N/A'}</span></span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                  <Calendar className="w-4 h-4" />
                  <span>{invoice.createdAt || new Date().toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">Mã hóa đơn: {invoice.billId?.slice(0, 15)}</div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900">Thanh toán thành công!</p>
                <p className="text-xs text-green-700 mt-1">
                  Đã thanh toán {formatPrice(remaining)} bằng {paymentMethods.find(m => m.value === selectedMethod)?.label}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Service List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Danh sách dịch vụ đã sử dụng</h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {invoice.services?.map((service) => {
                    const Icon = categoryIcons[service.category] || Stethoscope;
                    const colorClass = categoryColors[service.category] || 'bg-gray-50 text-gray-600';

                    return (
                      <div
                        key={service.id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-[#0ABAB5] group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg">{service.serviceName}</h4>
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                {service.doctorName && (
                                  <p className="text-xs text-[#0ABAB5] mt-2 font-medium">{service.doctorName}</p>
                                )}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div className="text-lg font-bold text-gray-900">
                                  {formatPrice(service.subTotal)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {service.quantity} x {formatPrice(service.unitPrice)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                <Edit2 className="w-3 h-3" />
                                Sửa
                              </button>
                              <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                <Trash2 className="w-3 h-3" />
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Tổng tạm tính</span>
                    <span className="text-2xl font-bold text-[#0ABAB5]">{formatPrice(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Tổng thanh toán</h3>
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border bg-yellow-100 text-yellow-700 border-yellow-200">
                    Chờ thanh toán
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Tạm tính</span>
                    <span className="font-medium">{formatPrice(invoice.totalAmount)}</span>
                  </div>

                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Giảm giá</span>
                      <span className="font-medium text-green-600">-{formatPrice(invoice.discount)}</span>
                    </div>
                  )}

                  {invoice.vat > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>VAT</span>
                      <span className="font-medium">{formatPrice(invoice.vat)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng phải trả</span>
                    <span className="text-2xl font-bold text-[#0ABAB5]">{formatPrice(invoice.finalAmount)}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Đã trả</span>
                    <span className="font-medium">{formatPrice(invoice.amountPaid)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-gray-900">Còn lại</span>
                    <span className="text-xl font-bold text-orange-600">{formatPrice(remaining)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Phương thức thanh toán</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedMethod === method.value;

                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setSelectedMethod(method.value)}
                          disabled={isLoading || success}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-[#0ABAB5] bg-[#0ABAB5]/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-[#0ABAB5]' : 'text-gray-600'}`} />
                          <span className={`text-xs font-medium ${isSelected ? 'text-[#0ABAB5]' : 'text-gray-700'}`}>
                            {method.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={isLoading || remaining <= 0 || success}
                    className="w-full bg-gradient-to-r from-[#0ABAB5] to-[#0099FF] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang xử lý...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Đã thanh toán
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Thanh toán ngay
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      In hóa đơn
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      Xuất PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}