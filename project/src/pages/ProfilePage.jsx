import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProfileSection from '../components/admin/ProfileSection';
import SecuritySection from '../components/admin/SecuritySection';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    photoUrl: '',
    twoFactorEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Lấy thông tin người dùng khi trang được tải
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    fetch('http://localhost:8082/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Lỗi khi lấy thông tin người dùng');
        return res.json();
      })
      .then((data) => {
        if (data.userId) {
          setUserData({
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            dateOfBirth: data.dob || '',
            gender: data.gender || '',
            address: data.address || '',
            photoUrl: data.photoUrl || '',
            twoFactorEnabled: data.twoFactorEnabled || false,
          });
          localStorage.setItem('user', JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy thông tin người dùng:', err);
        if (err.message.includes('401')) {
          localStorage.removeItem('token');
          localStorage.setItem('user', JSON.stringify({}));
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  // Xử lý thay đổi thông tin (chỉ update state local)
  const handleFieldChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  // Xử lý cập nhật thông tin (gọi API khi click nút Cập Nhật)
  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          phone: userData.phone,
          dob: userData.dateOfBirth,
          gender: userData.gender,
          address: userData.address,
        }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUpdateSuccess('Cập nhật hồ sơ thành công!');
        setTimeout(() => setUpdateSuccess(''), 3000);
      } else {
        console.error('Cập nhật hồ sơ thất bại:', data.message);
        alert('Cập nhật thất bại: ' + data.message);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật hồ sơ:', error);
      alert('Lỗi khi cập nhật hồ sơ');
    }
  };

  // Xử lý tải ảnh hồ sơ
  const handlePhotoChange = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('photo', file);

        try {
          const response = await fetch('http://localhost:8082/api/auth/upload-photo', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          const data = await response.json();
          if (data.success) {
            setUserData({ ...userData, photoUrl: data.data });
            localStorage.setItem('user', JSON.stringify({ ...userData, photoUrl: data.data }));
            setUpdateSuccess('Tải ảnh lên thành công!');
            setTimeout(() => setUpdateSuccess(''), 3000);
          } else {
            console.error('Tải ảnh thất bại:', data.message);
            alert('Tải ảnh thất bại: ' + data.message);
          }
        } catch (error) {
          console.error('Lỗi khi tải ảnh:', error);
          alert('Lỗi khi tải ảnh');
        }
      }
    };
    fileInput.click();
  };

  // Xử lý bật/tắt 2FA
  const handleToggle2FA = async () => {
    try {
      const apiEndpoint = userData.twoFactorEnabled ? '/api/auth/disable-2fa' : '/api/auth/enable-2fa';
      const body = userData.twoFactorEnabled ? {} : { email: userData.email };
      const response = await fetch(`http://localhost:8082${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success && userData.twoFactorEnabled) {
        setUserData({ ...userData, twoFactorEnabled: false });
        localStorage.setItem('user', JSON.stringify({ ...userData, twoFactorEnabled: false }));
        setUpdateSuccess('Tắt 2FA thành công!');
        setTimeout(() => setUpdateSuccess(''), 3000);
      } else if (data.success) {
        // Không tự động bật 2FA, đợi verify OTP
        setUpdateSuccess('OTP đã được gửi đến email của bạn!');
        setTimeout(() => setUpdateSuccess(''), 3000);
      } else {
        console.error('Bật/tắt 2FA thất bại:', data.message);
        alert('Thao tác thất bại: ' + data.message);
      }
    } catch (error) {
      console.error('Lỗi khi bật/tắt 2FA:', error);
      alert('Lỗi khi thực hiện thao tác');
    }
  };

  // Xử lý xác thực OTP để bật 2FA
  const handleVerify2FA = async (otpCode) => {
    try {
      const response = await fetch('http://localhost:8082/api/auth/verify-2fa-enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userData.email,
          otpCode: otpCode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setUserData({ ...userData, twoFactorEnabled: true });
        localStorage.setItem('user', JSON.stringify({ ...userData, twoFactorEnabled: true }));
        setUpdateSuccess('Bật 2FA thành công!');
        setTimeout(() => setUpdateSuccess(''), 3000);
        return true;
      } else {
        alert(data.message || 'Xác thực OTP thất bại.');
        return false;
      }
    } catch (err) {
      alert('Lỗi khi xác thực OTP: ' + err.message);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với nút quay lại */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Hồ Sơ Người Dùng</h1>
          <div className="w-40"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {updateSuccess && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {updateSuccess}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
              }`}
            >
              Thông Tin Cá Nhân
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
              }`}
            >
              Bảo Mật
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">Đang tải...</div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <>
                  <ProfileSection
                    fullName={userData.fullName}
                    email={userData.email}
                    phone={userData.phone}
                    dateOfBirth={userData.dateOfBirth}
                    gender={userData.gender}
                    address={userData.address}
                    photoUrl={userData.photoUrl}
                    onPhotoChange={handlePhotoChange}
                    onChange={handleFieldChange}
                  />
                  {/* Nút Cập Nhật */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleUpdateProfile}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Cập Nhật Thông Tin
                    </button>
                  </div>
                </>
              )}
              {activeTab === 'security' && (
                <SecuritySection
                  twoFactorEnabled={userData.twoFactorEnabled}
                  onToggle2FA={handleToggle2FA}
                  onVerify2FA={handleVerify2FA}
                  onChangePassword={() => {}}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}