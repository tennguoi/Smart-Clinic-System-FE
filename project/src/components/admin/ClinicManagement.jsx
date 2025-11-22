import { useState, useEffect } from 'react';
import { Save, Building2, Loader2, Upload, X, Edit } from 'lucide-react';
import { clinicApi } from '../../api/clinicApi';
import axiosInstance from '../../utils/axiosConfig';

export default function ClinicManagement() {
  const [clinicInfo, setClinicInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchClinicInfo();
  }, []);

  const fetchClinicInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await clinicApi.getClinicInfo();
      if (data) {
        setClinicInfo(data);
        setFormData({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          logoUrl: data.logoUrl || '',
        });
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl);
        }
        setIsEditing(false); // Reset to view mode when loading data
      } else {
        // Chưa có dữ liệu, form sẽ trống - allow editing immediately
        setClinicInfo(null);
        setIsEditing(true);
      }
    } catch (err) {
      // Không redirect nếu lỗi 401 - để ProtectedRoute xử lý
      if (err.response?.status === 401) {
        // Token hết hạn, ProtectedRoute sẽ tự động redirect
        // Không cần set error ở đây
        return;
      }
      setError(err.response?.data?.message || err.message || 'Không thể tải thông tin phòng khám');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 2MB - giảm để tránh lỗi 413)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`Kích thước file quá lớn (${fileSizeMB} MB). Vui lòng chọn file nhỏ hơn 2MB.`);
      return;
    }

    setLogoFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    // Chỉ xóa file mới chọn, giữ nguyên logo hiện tại nếu có
    setLogoFile(null);
    // Nếu có logo hiện tại, giữ lại preview
    if (formData.logoUrl) {
      setLogoPreview(formData.logoUrl);
    } else {
      setLogoPreview(null);
    }
  };

  const uploadLogo = async (file) => {
    const formData = new FormData();
    formData.append('logo', file); // Backend expects parameter name "logo"

    try {
      const response = await axiosInstance.post('/api/admin/clinic/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Backend returns: { success: true, logoUrl: "...", clinicInfo: {...} }
      return {
        logoUrl: response.data?.logoUrl || response.data?.url,
        clinicInfo: response.data?.clinicInfo,
      };
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle specific error codes
      if (error.response?.status === 413) {
        throw new Error('File quá lớn. Vui lòng chọn file nhỏ hơn 2MB hoặc nén ảnh trước khi upload.');
      }
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'File không hợp lệ';
        throw new Error(message);
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Không thể upload logo. Vui lòng thử lại.';
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Tên phòng khám không được để trống');
        setSaving(false);
        return;
      }

      // Validate email format if provided
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Email không hợp lệ');
        setSaving(false);
        return;
      }

      // Normalize website URL - add http:// if missing
      let normalizedWebsite = formData.website;
      if (normalizedWebsite && normalizedWebsite.trim()) {
        normalizedWebsite = normalizedWebsite.trim();
        // If it doesn't start with http:// or https://, add http://
        if (!normalizedWebsite.match(/^https?:\/\//i)) {
          normalizedWebsite = 'http://' + normalizedWebsite;
        }
      }

      // Upload logo if new file is selected
      let finalLogoUrl = formData.logoUrl;
      let updatedClinicData = null;
      
      if (logoFile) {
        setUploadingLogo(true);
        try {
          const uploadResult = await uploadLogo(logoFile);
          finalLogoUrl = uploadResult.logoUrl;
          
          // Backend returns updated clinicInfo after upload
          if (uploadResult.clinicInfo) {
            updatedClinicData = uploadResult.clinicInfo;
          }
        } catch (uploadError) {
          setError(uploadError.message || 'Không thể upload logo. Vui lòng thử lại.');
          setSaving(false);
          setUploadingLogo(false);
          return;
        }
        setUploadingLogo(false);
      }

      // If logo was uploaded, backend already updated the clinic info
      // Otherwise, update other fields
      if (!updatedClinicData) {
        const dataToSubmit = {
          ...formData,
          logoUrl: finalLogoUrl,
          website: normalizedWebsite || formData.website,
        };
        updatedClinicData = await clinicApi.updateClinicInfo(dataToSubmit);
      }
      
      setClinicInfo(updatedClinicData);
      setFormData((prev) => ({
        ...prev,
        logoUrl: finalLogoUrl,
      }));
      setLogoFile(null); // Clear file after successful upload
      setLogoPreview(finalLogoUrl); // Update preview with new URL
      setIsEditing(false); // Exit edit mode after successful save
      setSuccess('Cập nhật thông tin phòng khám thành công!');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setSaving(false);
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Đang tải thông tin phòng khám...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Thông tin Phòng khám</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        {!clinicInfo && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Chưa có thông tin phòng khám</p>
            <p className="text-sm mt-1">Vui lòng điền thông tin bên dưới để tạo mới.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên phòng khám */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên phòng khám <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Nhập tên phòng khám"
              required
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="3"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Nhập địa chỉ phòng khám"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Nhập email phòng khám"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="www.example.com hoặc https://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Có thể nhập domain (www.example.com) hoặc URL đầy đủ (https://example.com)
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Phòng Khám
            </label>
            
            {/* File Input */}
            <div className="flex items-center gap-3 mb-3">
              <label className={`flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg transition-colors ${
                isEditing ? 'cursor-pointer hover:bg-blue-100' : 'cursor-not-allowed opacity-50'
              }`}>
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {logoFile ? 'Đổi ảnh' : 'Chọn ảnh từ máy'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  disabled={!isEditing}
                  className="hidden"
                />
              </label>
              
              {logoPreview && isEditing && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa logo"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Preview */}
            {logoPreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Xem trước logo:</p>
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-xs h-32 object-contain border border-gray-200 rounded-lg p-2 bg-gray-50"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {logoFile && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Mới
                    </div>
                  )}
                </div>
                {logoFile && (
                  <p className="text-xs text-gray-500 mt-2">
                    File: {logoFile.name} ({(logoFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            )}

            {/* Current logo info */}
            {!logoPreview && formData.logoUrl && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Logo hiện tại:</p>
                <img
                  src={formData.logoUrl}
                  alt="Current logo"
                  className="max-w-xs h-32 object-contain border border-gray-200 rounded-lg p-2 bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {!logoPreview && !formData.logoUrl && (
              <p className="text-sm text-gray-500 mt-2">
                Chưa có logo. Vui lòng chọn file ảnh từ máy tính.
              </p>
            )}
          </div>

          {/* Thông tin bổ sung (nếu có) */}
          {clinicInfo && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Ngày tạo:</span>{' '}
                  {clinicInfo.createdAt
                    ? new Date(clinicInfo.createdAt).toLocaleString('vi-VN')
                    : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Cập nhật lần cuối:</span>{' '}
                  {clinicInfo.updatedAt
                    ? new Date(clinicInfo.updatedAt).toLocaleString('vi-VN')
                    : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-5 h-5" />
                Cập nhật
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setLogoFile(null);
                    // Reset form data to original clinic info
                    if (clinicInfo) {
                      setFormData({
                        name: clinicInfo.name || '',
                        address: clinicInfo.address || '',
                        phone: clinicInfo.phone || '',
                        email: clinicInfo.email || '',
                        website: clinicInfo.website || '',
                        logoUrl: clinicInfo.logoUrl || '',
                      });
                      setLogoPreview(clinicInfo.logoUrl || null);
                    }
                    setError('');
                  }}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingLogo}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving || uploadingLogo ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Lưu thông tin
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

