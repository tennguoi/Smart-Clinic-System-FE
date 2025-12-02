import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Download, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { billingApi } from '../../api/billingApi';
import { useTheme } from '../../contexts/ThemeContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function BankQRCodeModal({ amount, billId, onClose, onConfirmPayment }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  // CẬP NHẬT THÔNG TIN NGÂN HÀNG TẠI ĐÂY
  const bankInfo = {
    bankCode: 'MB',
    accountNo: '0332763869094',
    accountName: 'PHAM MINH DAN',
    template: 'compact2'
  };

  useEffect(() => {
    const transferContent = `Thanh toan ${billId?.slice(0, 8).toUpperCase()}`;
    const qrApiUrl = `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNo}-${bankInfo.template}.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
    setQrUrl(qrApiUrl);
  }, [amount, billId]);

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankInfo.accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${billId?.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkPaymentStatusFromBackend = async () => {
    try {
      setIsCheckingPayment(true);
      setError(null);
      const status = await billingApi.checkPaymentStatus(billId);
      setPaymentStatus(status);
      return status.isPaid;
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError(t('bankQRModal.checkError'));
      return false;
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const startPaymentPolling = () => {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      const isPaid = await checkPaymentStatusFromBackend();

      if (isPaid) {
        clearInterval(interval);
        setPollInterval(null);
        if (onConfirmPayment) await onConfirmPayment();
        window.dispatchEvent(new CustomEvent('paymentCompleted', {
          detail: { billId, amount, paymentMethod: 'BankTransfer', timestamp: new Date().toISOString() }
        }));
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPollInterval(null);
        setError(t('bankQRModal.timeoutError'));
      }
    }, 10000);

    setPollInterval(interval);
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      const currentStatus = await checkPaymentStatusFromBackend();
      if (currentStatus.isPaid) {
        if (onConfirmPayment) await onConfirmPayment();
        window.dispatchEvent(new CustomEvent('paymentCompleted', {
          detail: { billId, amount, paymentMethod: 'BankTransfer', timestamp: new Date().toISOString() }
        }));
      } else {
        startPaymentPolling();
      }
    } catch (err) {
      setError(t('bankQRModal.confirmError'));
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    return () => pollInterval && clearInterval(pollInterval);
  }, [pollInterval]);

  const billCode = billId?.slice(0, 8).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
        {/* Header - Compact */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">{t('bankQRModal.title')}</h2>
                <p className="text-blue-100 text-xs">{t('bankQRModal.billId')}: #{billCode}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount */}
          <div className={`bg-gradient-to-br ${theme === 'dark' ? 'from-emerald-900/30 to-teal-900/30 border-emerald-800' : 'from-emerald-50 to-teal-50 border-emerald-200'} rounded-xl p-4 text-center border-2`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('bankQRModal.amountToPay')}</div>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatPrice(amount)}</div>
          </div>

          {/* QR Code */}
          <div className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border-2 p-4`}>
            <div className="text-center mb-3">
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('bankQRModal.scanQR')}
              </p>
            </div>
            
            {qrUrl ? (
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl border-4 border-blue-500 shadow-lg">
                  <img src={qrUrl} alt="QR Code" className="w-80 h-80 object-contain" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-80">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <button
              onClick={handleDownloadQR}
              className={`w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded-lg font-medium transition-colors text-sm`}
            >
              <Download className="w-4 h-4" />
              {t('bankQRModal.downloadQR')}
            </button>
          </div>

          {/* Bank Info */}
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 space-y-3`}>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-center text-sm mb-2`}>
              {t('bankQRModal.manualTransfer')}
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('bankQRModal.bank')}:</span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{bankInfo.bankCode}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('bankQRModal.accountHolder')}:</span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{bankInfo.accountName}</span>
              </div>

              <div className={`flex justify-between items-center gap-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} p-2.5 rounded-lg border`}>
                <div className="flex-1">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>{t('bankQRModal.accountNumber')}</div>
                  <div className={`font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm`}>{bankInfo.accountNo}</div>
                </div>
                <button
                  onClick={handleCopyAccountNumber}
                  className={`p-1.5 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
                  title={t('bankQRModal.copy')}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('bankQRModal.amount')}:</span>
                <span className={`font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatPrice(amount)}</span>
              </div>

              <div className={`${theme === 'dark' ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'} border rounded-lg p-2.5`}>
                <div className={`text-xs ${theme === 'dark' ? 'text-amber-300' : 'text-amber-800'} mb-0.5 font-semibold`}>{t('bankQRModal.transferContent')}:</div>
                <div className={`font-mono text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-900'} font-bold`}>
                  {t('bankQRModal.paymentFor')} {billId?.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus && (
            <div className={`rounded-xl p-4 border-2 ${
              paymentStatus.isPaid 
                ? (theme === 'dark' ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-300') 
                : (theme === 'dark' ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-300')
            }`}>
              <div className="flex items-start gap-3">
                {paymentStatus.isPaid ? (
                  <CheckCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} flex-shrink-0 mt-0.5`} />
                ) : (
                  <AlertCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} flex-shrink-0 mt-0.5`} />
                )}
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${
                    paymentStatus.isPaid 
                      ? (theme === 'dark' ? 'text-green-300' : 'text-green-900') 
                      : (theme === 'dark' ? 'text-yellow-300' : 'text-yellow-900')
                  }`}>
                    {paymentStatus.isPaid ? t('bankQRModal.paymentSuccess') : t('bankQRModal.waitingPayment')}
                  </p>
                  <div className={`text-xs mt-2 space-y-1 ${
                    paymentStatus.isPaid 
                      ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') 
                      : (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700')
                  }`}>
                    <p>{t('bankQRModal.status')}: <strong>{paymentStatus.paymentStatus}</strong></p>
                    <p>{t('bankQRModal.paidAmount')}: <strong>{formatPrice(paymentStatus.amountPaid)}</strong></p>
                    <p>{t('bankQRModal.remainingAmount')}: <strong>{formatPrice(paymentStatus.remainingAmount)}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={`${theme === 'dark' ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-300'} border rounded-xl p-4 flex items-start gap-3`}>
              <AlertCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} flex-shrink-0 mt-0.5`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
            </div>
          )}

          {/* Notes */}
          <div className={`${theme === 'dark' ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-xl p-3`}>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'} mb-1.5 flex items-center gap-1.5 text-sm`}>
              <span className="text-base">💡</span>
              {t('bankQRModal.importantNote')}
            </h4>
            <ul className={`text-xs ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'} space-y-0.5 list-disc list-inside`}>
              <li>{t('bankQRModal.note1')}</li>
              <li>{t('bankQRModal.note2')}</li>
              <li>{t('bankQRModal.note3')}</li>
              <li>{t('bankQRModal.note4')}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-xl font-semibold transition text-sm`}
            >
              {t('bankQRModal.cancel')}
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={isConfirming || isCheckingPayment}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
            >
              {(isConfirming || isCheckingPayment) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('bankQRModal.processing')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t('bankQRModal.confirmPayment')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}