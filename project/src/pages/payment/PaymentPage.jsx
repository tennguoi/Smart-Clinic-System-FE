// src/pages/reception/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext'; // ← Thêm import
import BankQRCodeModal from '../../components/receptionist/BankQRCodeModal';
import {
  CreditCard, Banknote, Smartphone, Stethoscope, TestTube,
  Scan, Syringe, User, Calendar, Check, AlertCircle,
  ArrowLeft, CheckCircle, Info
} from 'lucide-react';
import { billingApi } from '../../api/billingApi';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8082';

const paymentMethods = [
  { value: 'Cash', icon: Banknote },
  { value: 'Card', icon: CreditCard },
  { value: 'Transfer', icon: Smartphone }
];

const categoryIcons = { Exam: Stethoscope, Test: TestTube, Imaging: Scan, Procedure: Syringe };
const categoryColors = {
  Exam: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  Test: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  Imaging: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  Procedure: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
};

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { billId } = useParams();
  const { theme } = useTheme(); // ← Thêm hook

  const [invoice, setInvoice] = useState(null);
  const [patient, setPatient] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-gray-50 to-blue-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0ABAB5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {t('invoices.common.loading')}...
          </p>
        </div>
      </div>
    );
  }

  // Không tìm thấy hóa đơn
  if (!invoice) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-gray-50 to-blue-50'
      }`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className={`text-xl font-semibold mb-6 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {t('invoices.common.error')} - Không tìm thấy hóa đơn
          </p>
          <button 
            onClick={handleBack} 
            className="px-6 py-3 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099999] transition"
          >
            ← {t('invoices.common.cancel') || 'Quay lại'}
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = invoice.totalAmount || 0;
  const amountPaid = invoice.amountPaid || 0;
  const discount = invoice.discount || 0;
  const vat = invoice.vat || 0;
  const finalAmount = invoice.finalAmount || totalAmount;
  const remaining = finalAmount - amountPaid;
  const services = invoice.items || [];

  return (
    <div className={`min-h-screen p-6 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 to-blue-50'
    }`}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={handleBack} 
            className={`flex items-center gap-2 mb-4 transition ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('invoices.common.backToList') || 'Quay lại danh sách hóa đơn'}</span>
          </button>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {t('invoices.paymentTitle')}
          </h1>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                i < 2 ? 'bg-[#0ABAB5]' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
              }`}>
                {i < 2 ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`font-medium ${
                i < 2 
                  ? 'text-[#0ABAB5]' 
                  : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {t(`invoices.steps.${i}`)}
              </span>
              {i < 2 && <div className="w-24 h-0.5 bg-[#0ABAB5]" />}
            </div>
          ))}
        </div>

        {/* Thông tin bệnh nhân */}
        <div className={`rounded-2xl shadow-sm p-6 mb-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0ABAB5] to-[#0099FF] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {patient?.fullName || invoice.patientName || t('common.walkInCustomer') || 'Khách lẻ'}
                </h2>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  SĐT: <span className="font-medium text-[#0ABAB5]">
                    {patient?.phone || invoice.patientPhone || 'N/A'}
                  </span>
                </p>
              </div>
            </div>
            <div className={`text-right text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
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
          <div className={`border rounded-xl p-5 mb-6 flex gap-4 items-center animate-pulse ${
            theme === 'dark'
              ? 'bg-green-900/30 border-green-700'
              : 'bg-green-50 border-green-200'
          }`}>
            <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div>
              <p className={`text-lg font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-900'
              }`}>
                {t('invoices.common.success')}
              </p>
              <p className={theme === 'dark' ? 'text-green-300' : 'text-green-700'}>
                Đã thu {formatPrice(remaining)} bằng {t(`createInvoice.paymentMethods.${selectedMethod.toLowerCase()}`)}
              </p>
            </div>
          </div>
        )}

        {/* Lỗi */}
        {error && (
          <div className={`border rounded-xl p-5 mb-6 flex gap-4 ${
            theme === 'dark'
              ? 'bg-red-900/30 border-red-700'
              : 'bg-red-50 border-red-200'
          }`}>
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <p className={`font-medium ${
              theme === 'dark' ? 'text-red-400' : 'text-red-800'
            }`}>
              {error}
            </p>
          </div>
        )}

        {/* Nội dung chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách dịch vụ */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-sm p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {t('invoices.servicesAndCosts')}
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {services.length === 0 ? (
                  <p className={`text-center py-12 text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {t('invoices.noServices') || 'Chưa có dịch vụ nào'}
                  </p>
                ) : (
                  services.map((s, i) => {
                    const Icon = categoryIcons[s.category] || Stethoscope;
                    const color = categoryColors[s.category] || (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600');

                    return (
                      <div 
                        key={i} 
                        className={`border rounded-xl p-5 transition ${
                          theme === 'dark'
                            ? 'border-gray-700 hover:border-[#0ABAB5]'
                            : 'border-gray-200 hover:border-[#0ABAB5]'
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold text-lg ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {s.serviceName}
                            </h4>
                            {s.doctorName && (
                              <p className="text-sm text-[#0ABAB5] mt-1">{s.doctorName}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-xl ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatPrice(s.subTotal || s.unitPrice * s.quantity)}
                            </div>
                            <div className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {s.quantity || 1} × {formatPrice(s.unitPrice)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={`mt-8 pt-6 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex justify-between text-2xl font-bold">
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {t('invoices.subtotal')}
                  </span>
                  <span className="text-[#0ABAB5]">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tổng thanh toán */}
          <div>
            <div className={`rounded-2xl shadow-lg p-6 sticky top-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {t('invoices.paymentSummary')}
              </h3>
              <div className={`px-4 py-2 rounded-full text-sm font-bold inline-block mb-6 ${
                theme === 'dark'
                  ? 'bg-yellow-900/30 text-yellow-400'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {t('invoices.status.pending')}
              </div>

              <div className={`space-y-4 pb-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className={`flex justify-between text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
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
                  <div className={`flex justify-between ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <span>VAT</span>
                    <span>{formatPrice(vat)}</span>
                  </div>
                )}
                <div className={`pt-4 border-t flex justify-between text-2xl font-bold ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {t('invoices.total')}
                  </span>
                  <span className="text-[#0ABAB5]">{formatPrice(finalAmount)}</span>
                </div>
                <div className={`flex justify-between text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
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
                <h4 className={`font-semibold text-lg mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('createInvoice.paymentMethod')}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map(m => {
                    const Icon = m.icon;
                    const active = selectedMethod === m.value;
                    return (
                      <button
                        key={m.value}
                        onClick={() => setSelectedMethod(m.value)}
                        disabled={isLoading || success}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          active 
                            ? 'border-[#0ABAB5] shadow-md' + (theme === 'dark' ? ' bg-[#0ABAB5]/10' : ' bg-[#0ABAB5]/5')
                            : theme === 'dark'
                              ? 'border-gray-700 hover:border-gray-600'
                              : 'border-gray-200 hover:border-gray-400'
                        } disabled:opacity-50`}
                      >
                        <Icon className={`w-8 h-8 ${
                          active 
                            ? 'text-[#0ABAB5]' 
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          active 
                            ? 'text-[#0ABAB5]' 
                            : theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
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