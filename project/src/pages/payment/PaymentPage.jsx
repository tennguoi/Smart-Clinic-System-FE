// src/pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BankQRCodeModal from '../../components/receptionist/BankQRCodeModal';
import { 
  CreditCard, Banknote, Building2, Smartphone, 
  Printer, FileDown, Stethoscope, TestTube, Scan, Syringe,
  User, Calendar, Check, AlertCircle, ArrowLeft, CheckCircle
} from 'lucide-react';
import { billingApi } from '../../api/billingApi';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8082';

const paymentMethods = [
  { value: 'Cash', label: 'Tiền mặt', icon: Banknote },
  { value: 'Card', label: 'Thẻ tín dụng', icon: CreditCard },
  { value: 'Transfer', label: 'Chuyển khoản / QR', icon: Smartphone }
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

export default function PaymentPage() {
  const [showQRModal, setShowQRModal] = useState(false);
  const navigate = useNavigate();
  const { billId } = useParams();
  
  const [invoice, setInvoice] = useState(null);
  const [patient, setPatient] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch invoice data khi component mount
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setIsFetching(true);
        
        // Gọi API lấy thông tin hóa đơn qua billingApi
        const invoiceData = await billingApi.getById(billId);
        console.log('Invoice data:', invoiceData);
        setInvoice(invoiceData);

        // Gọi API lấy thông tin bệnh nhân nếu có patientId
        if (invoiceData.patientId) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/public/patients/${invoiceData.patientId}`, {
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const patientData = await response.json();
              console.log('Patient data:', patientData);
              setPatient(patientData);
            }
          } catch (err) {
            console.error('Error fetching patient:', err);
            // Không throw error vì thông tin bệnh nhân không bắt buộc
          }
        }

      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err.message || 'Không thể tải dữ liệu hóa đơn');
        toast.error('Không thể tải thông tin hóa đơn');
      } finally {
        setIsFetching(false);
      }
    };

    if (billId) {
      fetchInvoiceData();
    }
  }, [billId]);

  // Hàm xử lý thanh toán riêng
  const processPayment = async () => {
    const totalAmount = invoice.totalAmount || 0;
    const amountPaid = invoice.amountPaid || 0;
    const remaining = totalAmount - amountPaid;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Gọi API thanh toán qua billingApi
      await billingApi.pay(invoice.billId, remaining, selectedMethod);

      setSuccess(true);
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Thanh toán thành công!
        </div>
      );
      
      // Chuyển về trang hóa đơn sau 2 giây
      setTimeout(() => {
        navigate('/reception/invoices');
      }, 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Thanh toán thất bại. Vui lòng thử lại!';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý khi nhấn nút thanh toán
  const handlePay = async () => {
    // Tính toán số tiền còn lại
    const totalAmount = invoice.totalAmount || 0;
    const amountPaid = invoice.amountPaid || 0;
    const remaining = totalAmount - amountPaid;
    
    if (remaining <= 0) {
      setError('Hóa đơn đã thanh toán đủ');
      toast.warning('Hóa đơn đã thanh toán đủ');
      return;
    }

    // Nếu chọn chuyển khoản, hiển thị modal QR code
    if (selectedMethod === 'Transfer') {
      setShowQRModal(true);
      return;
    }

    // Các phương thức khác (Cash, Card) thì thanh toán trực tiếp
    await processPayment();
  };

  const handleBack = () => {
    navigate('/reception/invoices');
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0ABAB5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin hóa đơn...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!invoice && !isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-800 mb-4">Không tìm thấy hóa đơn</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099999] transition-colors"
          >
            Quay lại danh sách hóa đơn
          </button>
        </div>
      </div>
    );
  }

  // Tính toán tổng tiền
  const totalAmount = invoice.totalAmount || 0;
  const amountPaid = invoice.amountPaid || 0;
  const discount = invoice.discount || 0;
  const vat = invoice.vat || 0;
  const finalAmount = invoice.finalAmount || totalAmount;
  const remaining = finalAmount - amountPaid;

  // Lấy danh sách dịch vụ từ items
  const services = invoice.items || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại danh sách hóa đơn</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán hóa đơn</h1>
        </div>

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
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient?.fullName || invoice.patientName || 'Khách hàng'}
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>SĐT: <span className="font-medium text-[#0ABAB5]">{patient?.phone || invoice.patientPhone || 'N/A'}</span></span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                <Calendar className="w-4 h-4" />
                <span>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Mã hóa đơn: #{invoice.billId?.slice(0, 15).toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3 animate-pulse">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900">Thanh toán thành công!</p>
              <p className="text-xs text-green-700 mt-1">
                Đã thanh toán {formatPrice(remaining)} bằng {paymentMethods.find(m => m.value === selectedMethod)?.label}
              </p>
              <p className="text-xs text-green-600 mt-1">Đang chuyển về trang hóa đơn...</p>
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
                {services.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có dịch vụ nào trong hóa đơn</p>
                  </div>
                ) : (
                  services.map((service, index) => {
                    const Icon = categoryIcons[service.category] || Stethoscope;
                    const colorClass = categoryColors[service.category] || 'bg-gray-50 text-gray-600';

                    return (
                      <div
                        key={service.serviceId || index}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-[#0ABAB5]"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg">{service.serviceName}</h4>
                                {service.description && (
                                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                )}
                                {service.doctorName && (
                                  <p className="text-xs text-[#0ABAB5] mt-2 font-medium">{service.doctorName}</p>
                                )}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div className="text-lg font-bold text-gray-900">
                                  {formatPrice(service.subTotal || 0)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {service.quantity || 1} x {formatPrice(service.unitPrice || 0)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Tổng tạm tính</span>
                  <span className="text-2xl font-bold text-[#0ABAB5]">{formatPrice(totalAmount)}</span>
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
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Giảm giá</span>
                    <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
                  </div>
                )}

                {vat > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>VAT</span>
                    <span className="font-medium">{formatPrice(vat)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng phải trả</span>
                  <span className="text-2xl font-bold text-[#0ABAB5]">{formatPrice(finalAmount)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Đã trả</span>
                  <span className="font-medium">{formatPrice(amountPaid)}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-900">Còn lại</span>
                  <span className="text-xl font-bold text-orange-600">{formatPrice(remaining)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Phương thức thanh toán</h4>
                <div className="grid grid-cols-3 gap-3">
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
                      {selectedMethod === 'Transfer' 
                        ? 'Hiển thị QR Code' 
                        : 'Thanh toán ngay'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <BankQRCodeModal
          amount={remaining}
          billId={invoice.billId}
          onClose={() => setShowQRModal(false)}
          onConfirmPayment={async () => {
            setShowQRModal(false);
            await processPayment();
          }}
        />
      )}
    </div>
  );
}