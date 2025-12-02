// src/pages/reception/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BankQRCodeModal from '../../components/receptionist/BankQRCodeModal';
import {
  CreditCard, Banknote, Smartphone, Stethoscope, TestTube,
  Scan, Syringe, User, Calendar, Check, AlertCircle,
  ArrowLeft, CheckCircle, Info
} from 'lucide-react';
import { billingApi } from '../../api/billingApi';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast'; // ← react-hot-toast

const API_BASE_URL = 'http://localhost:8082';

// Phương thức thanh toán
const paymentMethods = [
  { value: 'Cash', icon: Banknote },
  { value: 'Card', icon: CreditCard },
  { value: 'Transfer', icon: Smartphone }
];

// Icon theo loại dịch vụ
const categoryIcons = { Exam: Stethoscope, Test: TestTube, Imaging: Scan, Procedure: Syringe };
const categoryColors = {
  Exam: 'bg-blue-50 text-blue-600',
  Test: 'bg-purple-50 text-purple-600',
  Imaging: 'bg-emerald-50 text-emerald-600',
  Procedure: 'bg-orange-50 text-orange-600'
};

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { billId } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [patient, setPatient] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch hóa đơn + bệnh nhân
  useEffect(() => {
    const fetchData = async () => {
      if (!billId) return;

      try {
        setIsFetching(true);

        const invoiceData = await billingApi.getById(billId);
        setInvoice(invoiceData);

        if (invoiceData.patientId) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/public/patients/${invoiceData.patientId}`);
            if (res.ok) {
              const patientData = await res.json();
              setPatient(patientData);
            }
          } catch (err) {
            console.warn('Không lấy được thông tin bệnh nhân:', err);
          }
        }
      } catch (err) {
        console.error(err);
        setError(t('invoices.common.error'));
        toast.error(t('invoices.common.error'));
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [billId, t]);

  // Xử lý thanh toán
  const processPayment = async () => {
    const remaining = (invoice?.finalAmount || invoice?.totalAmount || 0) - (invoice?.amountPaid || 0);

    setIsLoading(true);
    setError(null);

    try {
      await billingApi.pay(invoice.billId, remaining, selectedMethod);

      setSuccess(true);
      toast.success(t('invoices.paySuccess'), {
        icon: <CheckCircle className="w-6 h-6" />,
      });

      setTimeout(() => {
        navigate('/reception/invoices');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t('common.error');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = () => {
    const remaining = (invoice?.finalAmount || invoice?.totalAmount || 0) - (invoice?.amountPaid || 0);

    if (remaining <= 0) {
      toast(t('invoices.alreadyPaid'), {
        icon: <Info className="w-6 h-6 text-blue-600" />,
        style: { background: '#DBEAFE', color: '#1E40AF' },
      });
      return;
    }

    if (selectedMethod === 'Transfer') {
      setShowQRModal(true);
    } else {
      processPayment();
    }
  };

  const handleBack = () => navigate('/reception/invoices');

  // Loading
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0ABAB5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('invoices.common.loading')}...</p>
        </div>
      </div>
    );
  }

  // Không tìm thấy hóa đơn
  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-800 mb-6">
            {t('invoices.common.error')} - Không tìm thấy hóa đơn
          </p>
          <button onClick={handleBack} className="px-6 py-3 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099999] transition">
            ← {t('invoices.common.cancel') || 'Quay lại'}
          </button>
        </div>
      </div>
    );
  }

  // Tính toán
  const totalAmount = invoice.totalAmount || 0;
  const amountPaid = invoice.amountPaid || 0;
  const discount = invoice.discount || 0;
  const vat = invoice.vat || 0;
  const finalAmount = invoice.finalAmount || totalAmount;
  const remaining = finalAmount - amountPaid;
  const services = invoice.items || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('common.backToList') || 'Quay lại danh sách hóa đơn'}</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('invoices.paymentTitle')}</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i < 2 ? 'bg-[#0ABAB5]' : 'bg-gray-300'}`}>
                {i < 2 ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`font-medium ${i < 2 ? 'text-[#0ABAB5]' : 'text-gray-500'}`}>
                {t(`invoices.steps.${i}`)}
              </span>
              {i < 2 && <div className="w-24 h-0.5 bg-[#0ABAB5]" />}
            </div>
          ))}
        </div>

        {/* Thông tin bệnh nhân */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0ABAB5] to-[#0099FF] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {patient?.fullName || invoice.patientName || t('common.walkInCustomer') || 'Khách lẻ'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  SĐT: <span className="font-medium text-[#0ABAB5]">
                    {patient?.phone || invoice.patientPhone || 'N/A'}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-2 justify-end">
                <Calendar className="w-4 h-4" />
                {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('vi-VN') : '—'}
              </div>
              <div className="mt-1">Mã: #{invoice.billId?.slice(-8).toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Thành công */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 flex gap-4 items-center animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-green-900">{t('invoices.common.success')}</p>
              <p className="text-green-700">
                Đã thu {formatPrice(remaining)} bằng {t(`createInvoice.paymentMethods.${selectedMethod.toLowerCase()}`)}
              </p>
            </div>
          </div>
        )}

        {/* Lỗi */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 flex gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Nội dung chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách dịch vụ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-6">{t('invoices.servicesAndCosts')}</h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {services.length === 0 ? (
                  <p className="text-center text-gray-500 py-12 text-lg">
                    {t('invoices.noServices') || 'Chưa có dịch vụ nào'}
                  </p>
                ) : (
                  services.map((s, i) => {
                    const Icon = categoryIcons[s.category] || Stethoscope;
                    const color = categoryColors[s.category] || 'bg-gray-100 text-gray-600';

                    return (
                      <div key={i} className="border rounded-xl p-5 hover:border-[#0ABAB5] transition">
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{s.serviceName}</h4>
                            {s.doctorName && <p className="text-sm text-[#0ABAB5] mt-1">{s.doctorName}</p>}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl">{formatPrice(s.subTotal || s.unitPrice * s.quantity)}</div>
                            <div className="text-sm text-gray-500">
                              {s.quantity || 1} × {formatPrice(s.unitPrice)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-between text-2xl font-bold">
                  <span>{t('invoices.subtotal')}</span>
                  <span className="text-[#0ABAB5]">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tổng thanh toán */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">{t('invoices.paymentSummary')}</h3>
              <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
                {t('invoices.status.pending')}
              </div>

              <div className="space-y-4 pb-6 border-b">
                <div className="flex justify-between text-lg">
                  <span>{t('invoices.subtotal')}</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>{t('invoices.discount')}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                {vat > 0 && (
                  <div className="flex justify-between">
                    <span>VAT</span>
                    <span>{formatPrice(vat)}</span>
                  </div>
                )}
                <div className="pt-4 border-t flex justify-between text-2xl font-bold">
                  <span>{t('invoices.total')}</span>
                  <span className="text-[#0ABAB5]">{formatPrice(finalAmount)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>{t('invoices.paid')}</span>
                  <span>{formatPrice(amountPaid)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold pt-3">
                  <span className="text-orange-600">{t('invoices.remaining')}</span>
                  <span className="text-orange-600">{formatPrice(remaining)}</span>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-4">{t('createInvoice.paymentMethod')}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map(m => {
                    const Icon = m.icon;
                    const active = selectedMethod === m.value;
                    return (
                      <button
                        key={m.value}
                        onClick={() => setSelectedMethod(m.value)}
                        disabled={isLoading || success}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                          ${active ? 'border-[#0ABAB5] bg-[#0ABAB5]/5 shadow-md' : 'border-gray-200 hover:border-gray-400'}
                          disabled:opacity-50`}
                      >
                        <Icon className={`w-8 h-8 ${active ? 'text-[#0ABAB5]' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${active ? 'text-[#0ABAB5]' : ''}`}>
                          {t(`createInvoice.paymentMethods.${m.value.toLowerCase()}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút thanh toán */}
              <button
                onClick={handlePay}
                disabled={isLoading || remaining <= 0 || success}
                className="mt-8 w-full bg-gradient-to-r from-[#0ABAB5] to-[#0099FF] text-white py-5 rounded-2xl font-bold text-xl
                  hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    {t('invoices.common.processing')}
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-7 h-7" />
                    {t('invoices.common.success')}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-7 h-7" />
                    {selectedMethod === 'Transfer' ? t('invoices.showQR') : t('invoices.payNow')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal QR */}
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