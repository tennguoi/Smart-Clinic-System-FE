import { useState, useEffect } from 'react';
import { Save, Building2, Loader2, Upload, X, Edit } from 'lucide-react';
import { clinicApi } from '../../api/clinicApi';
import { useClinic } from '../../contexts/ClinicContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

const toAbsoluteLogoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

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
  const { refreshClinicInfo } = useClinic();

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
        const normalizedLogoUrl = toAbsoluteLogoUrl(data.logoUrl || '');
        
        setFormData({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          logoUrl: normalizedLogoUrl,
        });
        if (normalizedLogoUrl) {
          setLogoPreview(normalizedLogoUrl);
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

  // Helper function to resize image - đảm bảo file < 2MB
  const resizeImage = (file, targetSizeMB = 1.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Bắt đầu với kích thước hợp lý cho logo (tối đa 500x500)
          const maxDimension = 500;
          let quality = 0.9;
          
          // Tính toán kích thước mới
          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          const tryResize = (q) => {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                const sizeMB = blob.size / (1024 * 1024);
                // Nếu vẫn lớn hơn target, giảm quality và thử lại
                if (sizeMB > targetSizeMB && q > 0.3) {
                  tryResize(q - 0.1);
                } else {
                  const resizedFile = new File([blob], file.name, {
                    type: 'image/jpeg', // Chuyển sang JPEG để giảm kích thước
                    lastModified: Date.now(),
                  });
                  resolve(resizedFile);
                }
              },
              'image/jpeg', // Luôn dùng JPEG để giảm kích thước
              q
            );
          };

          tryResize(quality);
        };
        img.onerror = () => {
          // Nếu resize thất bại, trả về file gốc
          resolve(file);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 10MB - cho phép file lớn, sẽ tự động resize)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`Kích thước file quá lớn (${fileSizeMB} MB). Vui lòng chọn file nhỏ hơn 10MB.`);
      return;
    }

    setError('');
    
    // Chỉ resize nếu file thực sự lớn hơn 1.8MB
    // File nhỏ hơn 1.8MB (như 100KB) sẽ được upload trực tiếp
    let processedFile = file;
    if (file.size > 1.8 * 1024 * 1024) {
      try {
        processedFile = await resizeImage(file, 1.8); // Resize xuống < 1.8MB
        const originalSize = (file.size / (1024 * 1024)).toFixed(2);
        const newSize = (processedFile.size / (1024 * 1024)).toFixed(2);
        console.log(`Đã tự động resize logo từ ${originalSize}MB xuống ${newSize}MB`);
      } catch (err) {
        console.error('Lỗi khi resize ảnh:', err);
        // Nếu resize thất bại, vẫn dùng file gốc
        processedFile = file;
      }
    } else {
      // File nhỏ hơn 1.8MB, không cần resize
      console.log(`File logo ${(file.size / 1024).toFixed(2)}KB - không cần resize`);
    }

    setLogoFile(processedFile);
    
    // Log file info để debug
    const fileSizeKB = (processedFile.size / 1024).toFixed(2);
    console.log(`File logo đã chọn: ${file.name}, kích thước: ${fileSizeKB}KB`);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(processedFile);
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
          const uploadResult = await clinicApi.uploadLogo(logoFile);
          finalLogoUrl = uploadResult.logoUrl;
          
          // Backend returns updated clinicInfo after upload
          if (uploadResult.clinicInfo) {
            updatedClinicData = uploadResult.clinicInfo;
          }
        } catch (uploadError) {
          setError(uploadError.message || 'Không thể upload logo. Vui lòng thử lại.');
          setSaving(false);
          return;
        } finally {
          setUploadingLogo(false);
        }
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
      if (typeof refreshClinicInfo === 'function') {
        refreshClinicInfo();
      }
      
      // Ưu tiên dùng logoUrl từ updatedClinicData (backend trả về)
      // Nếu URL là relative path, cần thêm base URL
      const newLogoUrl = toAbsoluteLogoUrl(updatedClinicData?.logoUrl || finalLogoUrl);
      
      setFormData((prev) => ({
        ...prev,
        logoUrl: newLogoUrl,
      }));
      setLogoFile(null); // Clear file after successful upload
      setLogoPreview(newLogoUrl || null); // Update preview with new URL from backend
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
                      const normalizedLogoUrl = toAbsoluteLogoUrl(clinicInfo.logoUrl || '');
                      setFormData({
                        name: clinicInfo.name || '',
                        address: clinicInfo.address || '',
                        phone: clinicInfo.phone || '',
                        email: clinicInfo.email || '',
                        website: clinicInfo.website || '',
                        logoUrl: normalizedLogoUrl,
                      });
                      setLogoPreview(normalizedLogoUrl || null);
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

