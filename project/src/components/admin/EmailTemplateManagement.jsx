import { useState, useEffect, useRef, useMemo } from 'react';
import { Mail, Edit, RotateCcw, X, Eye } from 'lucide-react';
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
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
 
  const [formData, setFormData] = useState({
    subject: '',
    bodyContent: '',
    isHtml: true,
  });
 
  // React Quill modules configuration
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );
 
  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'link',
  ];
 
  // Fetch all templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await EmailTemplateApi.getAllTemplates();
      setTemplates(Array.isArray(data) ? data : []);
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
      subject: template?.subject ?? '',
      bodyContent: template?.bodyContent ?? template?.content ?? '',
      isHtml: !!template?.isHtml,
    });
    setShowModal(true);
  };
 
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTemplate(null);
  };
 
  const handleSwitchToEdit = () => setModalMode('edit');
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, bodyContent: value }));
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
        isHtml: formData.isHtml,
      });
      toast.success('Cập nhật template thành công');
      handleCloseModal();
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };
 
  const handleReset = async (template) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn khôi phục template "${template.templateName}" về mặc định?`
      )
    ) {
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
 
  return (
    <>
      <Toaster {...toastConfig} />
      {/* Quill theme customizations + layout fixes */}
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
        .quill-dark .ql-stroke { stroke: #E5E7EB; }
        .quill-dark .ql-fill { fill: #E5E7EB; }
        .quill-dark .ql-picker-label { color: #E5E7EB; }
        .quill-dark .ql-picker-options {
          background: #374151;
          border-color: #4B5563;
        }
        .quill-dark .ql-picker-item { color: #E5E7EB; }
        .quill-dark .ql-picker-item:hover { color: #60A5FA; }
 
        /* View mode: hide toolbar */
        .quill-view .ql-toolbar { display: none; }
        .quill-view .ql-container {
          border-top: 1px solid #ccc;
          border-radius: 8px;
        }
        .quill-dark.quill-view .ql-container { border-color: #4B5563; }
 
        /* ===== Thu gọn chiều cao editor ===== */
        /* Khi EDIT (modalMode !== 'view') */
        .quill-editor-wrapper .ql-container {
          height: 24vh;           /* nhỏ gọn khi edit */
          overflow-y: auto;       /* cuộn bên trong editor */
          z-index: 0;
        }
        /* Khi VIEW (modalMode === 'view') */
        .quill-view .ql-container {
          height: 25vh;           /* nhỏ hơn nữa khi xem */
          overflow-y: auto;
        }
      `}</style>
 
      <div
        className={`px-4 md:px-8 pt-4 pb-8 min-h-screen ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        } transition-colors duration-300`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <h1
            className={`text-4xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            } flex items-center gap-3`}
          >
            <Mail className="w-9 h-9 text-blue-600" />
            <span>Quản Lý Email </span>
          </h1>
        </div>
 
     
 
        {/* Templates Grid */}
        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className={`mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Đang tải...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.templateId}
                className={`${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border rounded-lg shadow-md p-6 hover:shadow-lg transition`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {template.templateName}
                  </h3>
               
                </div>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  } mb-4 truncate`}
                >
                  <strong>Tiêu đề :</strong> {template.subject}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal('view', template)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Eye className="w-4 h-4" /> Xem
                  </button>
              
                </div>
              </div>
            ))}
          </div>
        )}
 
        {/* Modal View/Edit */}
        {showModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div
              className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden`}
            >
              {/* Modal Header */}
              <div
                className={`flex justify-between items-center p-6 border-b sticky top-0 z-10 ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'
                } backdrop-blur`}
              >
                <h2
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-blue-700'
                  }`}
                >
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
                  <button
                    onClick={handleCloseModal}
                    className={`p-2 rounded-full ${
                      theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>
 
              {/* Modal Body: Đã XÓA min-h-[60vh] để co lại theo nội dung */}
              <div className="p-6 flex items-start justify-center">
                <div className="w-full max-w-xl">
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Nội dung form, đã XÓA class overflow-y-auto pr-1 */}
                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          } mb-1`}
                        >
                          Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
 
                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          } mb-1`}
                        >
                          Nội dung Email <span className="text-red-500">*</span>
                        </label>
                     
 
                        {/* Editor */}
                        <div
                          className={`${theme === 'dark' ? 'quill-dark' : ''} ${
                            modalMode === 'view' ? 'quill-view' : ''
                          } quill-editor-wrapper`}
                        >
                          <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={formData.bodyContent}
                            onChange={handleQuillChange}
                            modules={quillModules}
                            formats={quillFormats}
                            readOnly={modalMode === 'view'}
                            // Không đặt height inline để dùng CSS ở trên (nhỏ gọn theo mode)
                          />
                        </div>
                      </div>
                    </div>
 
                    {/* Sticky Action Bar - luôn hiện, không bị editor đè */}
                    {modalMode === 'edit' && (
                      <div
                        className={`mt-4 sticky bottom-0 z-10 border-t pt-3 ${
                          theme === 'dark'
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
              </div>
              {/* End Modal Body */}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
 