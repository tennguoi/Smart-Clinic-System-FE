import { useState } from 'react';
import { queueApi, formatQueueStatus, formatPriority } from '../api/queueApi';
import { examinationRoomApi, formatRoomStatus } from '../api/examinationRoomApi';
import { paymentApi, formatPaymentMethod, formatPaymentStatus, formatCurrency } from '../api/paymentApi';
import { serviceAssignmentApi, formatServiceAssignmentStatus } from '../api/serviceAssignmentApi';
import { patientApi } from '../api/patientApi';

export default function TestApiPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setResult = (key, value) => {
    setResults(prev => ({ ...prev, [key]: value }));
  };

  // Queue API Tests
  const testCheckIn = async () => {
    setLoadingState('checkIn', true);
    try {
      // Cần patientId - bạn có thể lấy từ danh sách patients
      const result = await queueApi.checkIn({
        patientId: 'YOUR_PATIENT_ID_HERE', // Thay bằng patientId thực tế
        priority: 'Normal'
      });
      setResult('checkIn', { success: true, data: result });
    } catch (error) {
      setResult('checkIn', { success: false, error: error.message });
    } finally {
      setLoadingState('checkIn', false);
    }
  };

  const testGetWaitingQueues = async () => {
    setLoadingState('waitingQueues', true);
    try {
      const result = await queueApi.getWaitingQueues();
      setResult('waitingQueues', { success: true, data: result });
    } catch (error) {
      setResult('waitingQueues', { success: false, error: error.message });
    } finally {
      setLoadingState('waitingQueues', false);
    }
  };

  const testGetInProgressQueues = async () => {
    setLoadingState('inProgressQueues', true);
    try {
      const result = await queueApi.getInProgressQueues();
      setResult('inProgressQueues', { success: true, data: result });
    } catch (error) {
      setResult('inProgressQueues', { success: false, error: error.message });
    } finally {
      setLoadingState('inProgressQueues', false);
    }
  };

  const testAssignRoom = async () => {
    setLoadingState('assignRoom', true);
    try {
      // Cần queueId và roomId
      const result = await queueApi.assignRoom('YOUR_QUEUE_ID', 'YOUR_ROOM_ID');
      setResult('assignRoom', { success: true, data: result });
    } catch (error) {
      setResult('assignRoom', { success: false, error: error.message });
    } finally {
      setLoadingState('assignRoom', false);
    }
  };

  const testCompleteExamination = async () => {
    setLoadingState('completeExamination', true);
    try {
      // Cần queueId và medicalRecordId
      const result = await queueApi.completeExamination('YOUR_QUEUE_ID', 'YOUR_MEDICAL_RECORD_ID');
      setResult('completeExamination', { success: true, data: result });
    } catch (error) {
      setResult('completeExamination', { success: false, error: error.message });
    } finally {
      setLoadingState('completeExamination', false);
    }
  };

  // Examination Room API Tests
  const testGetAllRooms = async () => {
    setLoadingState('allRooms', true);
    try {
      const result = await examinationRoomApi.getAllRooms();
      setResult('allRooms', { success: true, data: result });
    } catch (error) {
      setResult('allRooms', { success: false, error: error.message });
    } finally {
      setLoadingState('allRooms', false);
    }
  };

  const testGetAvailableRooms = async () => {
    setLoadingState('availableRooms', true);
    try {
      const result = await examinationRoomApi.getAvailableRooms();
      setResult('availableRooms', { success: true, data: result });
    } catch (error) {
      setResult('availableRooms', { success: false, error: error.message });
    } finally {
      setLoadingState('availableRooms', false);
    }
  };

  // Payment API Tests
  const testCreatePayment = async () => {
    setLoadingState('createPayment', true);
    try {
      const result = await paymentApi.createPayment({
        patientId: 'YOUR_PATIENT_ID',
        queueId: 'YOUR_QUEUE_ID',
        totalAmount: 500000,
        paidAmount: 500000,
        paymentMethod: 'Cash',
        notes: 'Test payment'
      });
      setResult('createPayment', { success: true, data: result });
    } catch (error) {
      setResult('createPayment', { success: false, error: error.message });
    } finally {
      setLoadingState('createPayment', false);
    }
  };

  const testGetPaymentsByPatient = async () => {
    setLoadingState('paymentsByPatient', true);
    try {
      const result = await paymentApi.getPaymentsByPatient('YOUR_PATIENT_ID');
      setResult('paymentsByPatient', { success: true, data: result });
    } catch (error) {
      setResult('paymentsByPatient', { success: false, error: error.message });
    } finally {
      setLoadingState('paymentsByPatient', false);
    }
  };

  const testCalculateTotalAmount = async () => {
    setLoadingState('calculateTotal', true);
    try {
      const result = await paymentApi.calculateTotalAmount('YOUR_QUEUE_ID');
      setResult('calculateTotal', { success: true, data: result });
    } catch (error) {
      setResult('calculateTotal', { success: false, error: error.message });
    } finally {
      setLoadingState('calculateTotal', false);
    }
  };

  // Service Assignment API Tests
  const testCreateServiceAssignment = async () => {
    setLoadingState('createServiceAssignment', true);
    try {
      const result = await serviceAssignmentApi.createServiceAssignment({
        medicalRecordId: 'YOUR_MEDICAL_RECORD_ID',
        serviceId: 'YOUR_SERVICE_ID',
        patientId: 'YOUR_PATIENT_ID',
        quantity: 1,
        unitPrice: 100000,
        notes: 'Test service assignment'
      });
      setResult('createServiceAssignment', { success: true, data: result });
    } catch (error) {
      setResult('createServiceAssignment', { success: false, error: error.message });
    } finally {
      setLoadingState('createServiceAssignment', false);
    }
  };

  const testGetServiceAssignmentsByMedicalRecord = async () => {
    setLoadingState('serviceAssignmentsByMR', true);
    try {
      const result = await serviceAssignmentApi.getServiceAssignmentsByMedicalRecord('YOUR_MEDICAL_RECORD_ID');
      setResult('serviceAssignmentsByMR', { success: true, data: result });
    } catch (error) {
      setResult('serviceAssignmentsByMR', { success: false, error: error.message });
    } finally {
      setLoadingState('serviceAssignmentsByMR', false);
    }
  };

  // Helper: Get Patients để lấy patientId
  const testGetPatients = async () => {
    setLoadingState('getPatients', true);
    try {
      const result = await patientApi.getPatients(0, 10);
      setResult('getPatients', { success: true, data: result });
    } catch (error) {
      setResult('getPatients', { success: false, error: error.message });
    } finally {
      setLoadingState('getPatients', false);
    }
  };

  const renderResult = (key) => {
    const result = results[key];
    if (!result) return null;

    return (
      <div className={`mt-2 p-3 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`text-sm font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
          {result.success ? '✓ Thành công' : '✗ Lỗi'}
        </div>
        {result.error && (
          <div className="text-xs text-red-600 mt-1">{result.error}</div>
        )}
        {result.data && (
          <pre className="text-xs mt-2 overflow-auto max-h-40 bg-white p-2 rounded border">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  const TestButton = ({ label, onClick, loadingKey, testKey }) => (
    <div className="mb-4">
      <button
        onClick={onClick}
        disabled={loading[loadingKey]}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading[loadingKey] ? 'Đang tải...' : label}
      </button>
      {renderResult(testKey)}
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Test API Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Queue API Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📋 Queue API</h2>
          <TestButton
            label="1. Get Waiting Queues"
            onClick={testGetWaitingQueues}
            loadingKey="waitingQueues"
            testKey="waitingQueues"
          />
          <TestButton
            label="2. Get In-Progress Queues"
            onClick={testGetInProgressQueues}
            loadingKey="inProgressQueues"
            testKey="inProgressQueues"
          />
          <TestButton
            label="3. Check-In Patient"
            onClick={testCheckIn}
            loadingKey="checkIn"
            testKey="checkIn"
          />
          <TestButton
            label="4. Assign Room"
            onClick={testAssignRoom}
            loadingKey="assignRoom"
            testKey="assignRoom"
          />
          <TestButton
            label="5. Complete Examination"
            onClick={testCompleteExamination}
            loadingKey="completeExamination"
            testKey="completeExamination"
          />
        </div>

        {/* Examination Room API Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🏥 Examination Room API</h2>
          <TestButton
            label="1. Get All Rooms"
            onClick={testGetAllRooms}
            loadingKey="allRooms"
            testKey="allRooms"
          />
          <TestButton
            label="2. Get Available Rooms"
            onClick={testGetAvailableRooms}
            loadingKey="availableRooms"
            testKey="availableRooms"
          />
        </div>

        {/* Payment API Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">💳 Payment API</h2>
          <TestButton
            label="1. Create Payment"
            onClick={testCreatePayment}
            loadingKey="createPayment"
            testKey="createPayment"
          />
          <TestButton
            label="2. Get Payments By Patient"
            onClick={testGetPaymentsByPatient}
            loadingKey="paymentsByPatient"
            testKey="paymentsByPatient"
          />
          <TestButton
            label="3. Calculate Total Amount"
            onClick={testCalculateTotalAmount}
            loadingKey="calculateTotal"
            testKey="calculateTotal"
          />
        </div>

        {/* Service Assignment API Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🔧 Service Assignment API</h2>
          <TestButton
            label="1. Create Service Assignment"
            onClick={testCreateServiceAssignment}
            loadingKey="createServiceAssignment"
            testKey="createServiceAssignment"
          />
          <TestButton
            label="2. Get By Medical Record"
            onClick={testGetServiceAssignmentsByMedicalRecord}
            loadingKey="serviceAssignmentsByMR"
            testKey="serviceAssignmentsByMR"
          />
        </div>

        {/* Helper Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🆘 Helper APIs</h2>
          <TestButton
            label="Get Patients (to get patientId)"
            onClick={testGetPatients}
            loadingKey="getPatients"
            testKey="getPatients"
          />
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Lưu ý:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Một số API cần ID (patientId, queueId, roomId, etc.) - hãy lấy từ các API GET trước</li>
          <li>• Đảm bảo bạn đã đăng nhập với quyền phù hợp (TIEP_TAN, BAC_SI, ADMIN)</li>
          <li>• Kiểm tra console để xem chi tiết lỗi nếu có</li>
        </ul>
      </div>
    </div>
  );
}

