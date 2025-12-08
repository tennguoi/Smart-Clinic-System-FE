import { useState, useEffect, useRef, useMemo } from 'react';
import { Mail, Edit, RotateCcw, X, Eye, Copy, Check, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import EmailTemplateApi from '../../api/EmailTemplateApi';
import { useTheme } from '../../contexts/ThemeContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function EmailTemplateManagement() {
  const { theme } = useTheme();
  const quillRef = useRef(null);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view | edit
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [formData, setFormData] = useState({
    subject: '',
    bodyContent: '',
    isHtml: true
  });

  // React Quill modules configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ]
  }), []);

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align', 'link'
  ];

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
      bodyContent: template.bodyContent || template.content,
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

  const handleQuillChange = (value) => {
    setFormData(prev => ({ ...prev, bodyContent: value }));
  };

  const insertPlaceholder = (placeholder) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      const placeholderText = `{{${placeholder}}}`;
      quill.insertText(range.index, placeholderText);
      quill.setSelection(range.index + placeholderText.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.bodyContent.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      await EmailTemplateApi.updateTemplate(selectedTemplate.templateId, {
        subject: formData.subject,
        bodyContent: formData.bodyContent,
        isHtml: formData.isHtml
      });
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

  const getSampleData = (placeholders) => {
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

    // Build full preview with header + bodyContent + footer
    const header = `
      <div style="text-align:center;padding:20px;background:#0056b3;color:white;border-radius:8px 8px 0 0;">
        <img src="${samples.logoUrl}" alt="Logo" style="max-width:150px;height:auto;margin-bottom:10px;">
        <h2>${selectedTemplate?.templateName || 'Email'}</h2>
      </div>
    `;
    const footer = `
      <div style="text-align:center;padding:20px;color:#666;font-size:12px;">
        <p>Trân trọng,<br><strong>Phòng khám Tai-Mũi-Họng 2CTW</strong></p>
        <p style="font-size:11px;color:#999;">Email này được gửi tự động, vui lòng không trả lời.</p>
      </div>
    `;

    let bodyResult = formData.bodyContent;
    placeholders.forEach(placeholder => {
      const value = samples[placeholder] || `[${placeholder}]`;
      bodyResult = bodyResult.replace(new RegExp(`{{${placeholder}}}`, 'g'), value);
    });

    return `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;">
        ${header}
        <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px;">
          ${bodyResult}
        </div>
        ${footer}
      </div>
    `;
  };

  return (
    <>
      <Toaster {...toastConfig} />
      <style>{`
        .quill-dark .ql-toolbar {
          background: #374151;
          border-color: #4B5563;
        }
        .quill-dark .ql-container {
          background: #1F2937;
          border-color: #4B5563;
          color: #E5E7EB;
        }
        .quill-dark .ql-editor {
          color: #E5E7EB;
        }
        .quill-dark .ql-editor.ql-blank::before {
          color: #9CA3AF;
        }
        .quill-dark .ql-stroke {
          stroke: #E5E7EB;
        }
        .quill-dark .ql-fill {
          fill: #E5E7EB;
        }
        .quill-dark .ql-picker-label {
          color: #E5E7EB;
        }
        .quill-dark .ql-picker-options {
          background: #374151;
          border-color: #4B5563;
        }
        .quill-dark .ql-picker-item {
          color: #E5E7EB;
        }
        .quill-dark .ql-picker-item:hover {
          color: #60A5FA;
        }
        .quill-view .ql-toolbar {
          display: none;
        }
        .quill-view .ql-container {
          border-top: 1px solid #ccc;
          border-radius: 8px;
        }
        .quill-dark.quill-view .ql-container {
          border-color: #4B5563;
        }
      `}</style>
      <div className={`px-4 md:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3`}>
            <Mail className="w-9 h-9 text-blue-600" />
            <span>Quản Lý Email Templates</span>
          </h1>
        </div>

        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Tùy chỉnh nội dung email gửi cho khách hàng. Sử dụng các nút placeholder để chèn dữ liệu động như <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{'{{patientName}}'}</code>.
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
                        Nội dung Email <span className="text-red-500">*</span>
                      </label>
                      <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Header và Footer sẽ được tự động thêm vào khi gửi email.
                      </p>
                      <div className={`${theme === 'dark' ? 'quill-dark' : ''} ${modalMode === 'view' ? 'quill-view' : ''}`}>
                        <ReactQuill
                          ref={quillRef}
                          theme="snow"
                          value={formData.bodyContent}
                          onChange={handleQuillChange}
                          modules={quillModules}
                          formats={quillFormats}
                          readOnly={modalMode === 'view'}
                          style={{ height: modalMode === 'view' ? 'auto' : '300px', marginBottom: modalMode === 'view' ? '0' : '50px' }}
                        />
                      </div>
                    </div>


                    {modalMode === 'edit' && (
                      <div
                        className={`mt-4 sticky bottom-0 z-10 border-t pt-3 ${theme === 'dark'
                            ? 'bg-gray-800/80 border-gray-700 backdrop-blur'
                            : 'bg-white/80 border-gray-200 backdrop-blur'
                          }`}
                      >
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                          >
                            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                          </button>
                        </div>
                      </div>
                    )}

                  </form>
                </div>

                {/* Right: Placeholders & Preview */}
                <div className="space-y-4">
                  {/* Placeholders */}


                  {/* Preview */}
                  {(
                    modalMode === 'edit' || modalMode === 'view'
                  ) && (
                      <div className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                        <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          Email Preview (Real-time)
                        </h3>

                        <div >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: getSampleData(selectedTemplate.availablePlaceholders || [])
                            }}
                          />
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
