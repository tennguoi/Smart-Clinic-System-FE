import { useState, useEffect } from 'react';
import { Mail, Edit, RotateCcw, X, Eye, Copy, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import EmailTemplateApi from '../../api/EmailTemplateApi';
import { useTheme } from '../../contexts/ThemeContext';

export default function EmailTemplateManagement() {
  const { theme } = useTheme();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view | edit
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    isHtml: true
  });

  // Fetch all templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await EmailTemplateApi.getAllTemplates();
      setTemplates(data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách email templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (mode, template) => {
    setModalMode(mode);
    setSelectedTemplate(template);
    setFormData({
      subject: template.subject,
      content: template.content,
      isHtml: template.isHtml
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTemplate(null);
    setShowPreview(false);
  };

  const handleSwitchToEdit = () => setModalMode('edit');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      await EmailTemplateApi.updateTemplate(selectedTemplate.templateId, formData);
      toast.success('Cập nhật template thành công');
      handleCloseModal();
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (template) => {
    if (!window.confirm(`Bạn có chắc muốn khôi phục template "${template.templateName}" về mặc định?`)) {
      return;
    }

    setLoading(true);
    try {
      await EmailTemplateApi.resetTemplate(template.templateId);
      toast.success('Đã khôi phục template mặc định');
      fetchTemplates();
    } catch (err) {
      toast.error('Khôi phục thất bại');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getSampleData = (placeholders) =>  {
    const samples = {
      'patientName': 'Nguyễn Văn A',
      'otp': '123456',
      'appointmentCode': 'APT2024001',
      'appointmentTime': '15/12/2024 10:30',
      'confirmedByName': 'Nguyễn Thị B',
      'phone': '0901234567',
      'serviceNames': 'Khám tai, Khám mũi',
      'notes': 'Đau tai nhẹ',
      'hoursUntilAppointment': '24',
      'clinicEmail': 'clinic@example.com',
      'oldTime': '14/12/2024 14:00',
      'newTime': '15/12/2024 10:30',
      'newStatus': 'Đã Xác Nhận',
      'magicLink': 'http://localhost:5173/appointments/tracking',
      'logoUrl': 'http://localhost:8082/images/logo.png'
    };

    let result = formData.content;
    placeholders.forEach(placeholder => {
      const value = samples[placeholder] || `[${placeholder}]`;
      result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), value);
    });
    return result;
  };

  return (
    <>
      <Toaster {...toastConfig} />
      <div className={`px-4 md:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3`}>
            <Mail className="w-9 h-9 text-blue-600" />
            <span>Quản Lý Email Templates</span>
          </h1>
        </div>

        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Tùy chỉnh nội dung email gửi cho khách hàng. Sử dụng placeholders như <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{'{{patientName}}'}</code> để thay thế dữ liệu động.
        </p>

        {/* Templates Grid */}
        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className={`mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Đang tải...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.templateId} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-md p-6 hover:shadow-lg transition`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {template.templateName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${template.isHtml ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {template.isHtml ? 'HTML' : 'Text'}
                  </span>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4 truncate`}>
                  <strong>Subject:</strong> {template.subject}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal('view', template)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Eye className="w-4 h-4" /> Xem
                  </button>
                  <button
                    onClick={() => handleReset(template)}
                    className={`p-2 rounded-lg transition ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    title="Reset về mặc định"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal View/Edit */}
        {showModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`flex justify-between items-center p-6 border-b sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'} backdrop-blur`}>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`}>
                  {selectedTemplate.templateName}
                </h2>
                <div className="flex items-center gap-3">
                  {modalMode === 'view' && (
                    <button
                      onClick={handleSwitchToEdit}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit className="w-5 h-5" /> Chỉnh sửa
                    </button>
                  )}
                  <button onClick={handleCloseModal} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Form */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleInputChange} 
                        required 
                        disabled={modalMode === 'view'} 
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} 
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        HTML Content <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        name="content" 
                        value={formData.content} 
                        onChange={handleInputChange} 
                        rows="18" 
                        required 
                        disabled={modalMode === 'view'} 
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 font-mono text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      ></textarea>
                    </div>

                    {modalMode === 'edit' && (
                      <div className="flex gap-3">
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition">
                          {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                        <button type="button" onClick={() => setShowPreview(!showPreview)} className={`flex-1 py-2.5 rounded-lg transition ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'}`}>
                          {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Right: Placeholders & Preview */}
                <div className="space-y-4">
                  {/* Placeholders */}
                  <div className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                    <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Available Placeholders
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedTemplate.availablePlaceholders?.map((placeholder, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <code className={`text-sm px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'}`}>
                            {'{{' + placeholder + '}}'}
                          </code>
                          <button
                            onClick={() => copyToClipboard(`{{${placeholder}}}`, idx)}
                            className={`p-1.5 rounded transition ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            title="Copy to clipboard"
                          >
                            {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  {(showPreview || modalMode === 'view') && (
                    <div className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                      <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Email Preview
                      </h3>
                      <div className="bg-white rounded border border-gray-300 p-4 max-h-96 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: getSampleData(selectedTemplate.availablePlaceholders || []) }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
