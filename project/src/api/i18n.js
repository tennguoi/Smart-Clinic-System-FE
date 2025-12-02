// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  vi: {
    translation: {
      // Header & Navigation
      header: {
        home: "Trang Chủ",
        services: "Dịch Vụ",
        team: "Đội Ngũ",
        reviews: "Đánh Giá",
        contact: "Liên Hệ",
        bookNow: "Đặt Lịch Nhanh",
        defaultName: "Chưa cập nhật tên phòng khám",
        updateInfo: "Vui lòng cập nhật thông tin trong trang quản trị"
      },
      nav: {
        about: "Giới Thiệu",
        doctors: "Đội Ngũ Bác Sĩ",
        news: "Tin Tức",
        clinicName: "Tên phòng khám"
      },

      // Hero
      hero: {
        title: "Chăm Sóc Sức Khỏe Tai-Mũi-Họng",
        subtitle: "Đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm, thiết bị hiện đại",
        bookAppointment: "Đặt Lịch Khám",
        learnMore: "Tìm Hiểu Thêm"
      },

      // Core Values
      values: {
        title: "Giá Trị Cốt Lõi",
        professional: "Chuyên Nghiệp",
        professionalDesc: "Bác sĩ chuyên khoa I, II với nhiều năm kinh nghiệm điều trị",
        modern: "Hiện Đại",
        modernDesc: "Trang thiết bị y tế tiên tiến, công nghệ chẩn đoán và điều trị mới nhất",
        caring: "Tận Tâm",
        caringDesc: "Chăm sóc chu đáo, thân thiện, luôn đặt sức khỏe bệnh nhân lên hàng đầu"
      },

      // Services
      services: {
        title: "Dịch Vụ Y Tế",
        subtitle: "Chúng tôi cung cấp đa dạng dịch vụ chăm sóc sức khỏe",
        viewAll: "Xem Tất Cả Dịch Vụ"
      },

      // Doctors (general)
      doctors: {
        title: "Đội Ngũ Bác Sĩ",
        subtitle: "Bác sĩ chuyên khoa giàu kinh nghiệm",
        viewAll: "Xem Tất Cả Bác Sĩ",
        yearsExp: "năm kinh nghiệm"
      },

      // Doctors Section (trang chủ + trang bác sĩ)
      doctorsSection: {
        title: "Bác Sĩ Chuyên Khoa Hàng Đầu",
        certifiedText: "Tất cả bác sĩ đều được Bộ Y Tế chứng nhận và có chứng chỉ hành nghề hợp lệ",
        noDoctors: "Không có bác sĩ nào để hiển thị.",
        doctorAlt: "Bác sĩ",
        noName: "Chưa có tên",
        yearsExperience: "năm kinh nghiệm",
        viewAll: "Xem tất cả bác sĩ"
      },

      // Testimonials
      testimonials: {
        title: "Đánh Giá Từ Bệnh Nhân",
        subtitle: "Những chia sẻ chân thực từ người đã trải nghiệm",
        loading: "Đang tải đánh giá...",
        errorLoad: "Không thể tải đánh giá",
        noReviews: "Chưa có đánh giá nào.",
        recommendation: "Khuyến nghị",
        noDate: "Không rõ",
        today: "Hôm nay",
        yesterday: "Hôm qua",
        daysAgo: "{{count}} ngày trước",
        weeksAgo: "{{count}} tuần trước",
        monthsAgo: "{{count}} tháng trước",
        yearsAgo: "{{count}} năm trước"
      },

      // Contact
      contact: {
        title: "Thông Tin Liên Hệ",
        description: "Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn",
        address: "Địa Chỉ",
        phone: "Điện Thoại",
        email: "Email",
        hours: "Giờ Làm Việc",
        noInfo: "Chưa có thông tin liên hệ. Vui lòng cập nhật tại trang quản trị.",
        workingHours: "Thứ 2 - Thứ 6: 8:00 - 20:00<br />Thứ 7 - Chủ Nhật: 8:00 - 17:00",
        emergencyTitle: "Hỗ Trợ Khẩn Cấp",
        emergencyText: "Nếu bạn gặp tình trạng khẩn cấp, vui lòng gọi ngay:"
      },

      // About Page (toàn bộ)
      about: {
        heroTitle: "Về Chúng Tôi",
        heroSubtitle: "Hành trình 15 năm xây dựng niềm tin và chất lượng dịch vụ chăm sóc sức khỏe Tai-Mũi-Họng",
        certifiedBy: "Bộ Y Tế chứng nhận",
        storyTitle: "Câu chuyện của chúng tôi",
        story: {
          p1: "Được thành lập từ năm 2009, chúng tôi bắt đầu với mục tiêu đơn giản nhưng đầy ý nghĩa: mang đến dịch vụ chăm sóc Tai-Mũi-Họng chất lượng cao với sự tận tâm và chuyên nghiệp.",
          p2: "Qua hơn 15 năm phát triển, chúng tôi đã phục vụ hơn 50.000 bệnh nhân, không ngừng đầu tư vào công nghệ y tế hiện đại và đào tạo đội ngũ y bác sĩ chuyên sâu. Mỗi bệnh nhân đến với chúng tôi không chỉ được khám chữa bệnh mà còn được chăm sóc như người thân trong gia đình.",
          p3: "Hôm nay, chúng tôi tự hào là một trong những phòng khám thông minh tiên phong ứng dụng công nghệ số vào quản lý và chăm sóc bệnh nhân, mang đến trải nghiệm khám chữa bệnh hiện đại và tiện lợi nhất."
        },
        mvv: { title: "Sứ mệnh - Tầm nhìn - Giá trị", subtitle: "Những giá trị cốt lõi định hướng mọi hoạt động của chúng tôi" },
        mission: { title: "Sứ Mệnh", desc: "Mang đến dịch vụ chăm sóc Tai-Mũi-Họng chuẩn quốc tế với chi phí hợp lý và trải nghiệm tận tâm, giúp mỗi bệnh nhân an tâm và hài lòng." },
        vision: { title: "Tầm Nhìn", desc: "Trở thành phòng khám thông minh dẫn đầu về công nghệ và chất lượng khám chữa ENT tại Việt Nam, được bệnh nhân tin tưởng lựa chọn hàng đầu." },
        values: { title: "Giá Trị Cốt Lõi", core: "Chuyên nghiệp – Minh bạch – Nhân ái.", desc: "Luôn đặt sức khỏe bệnh nhân ở vị trí trung tâm trong mọi quyết định." },
        whyChoose: { title: "Tại sao chọn chúng tôi?", subtitle: "Những con số và thành tích ấn tượng qua 15 năm hoạt động" },
        stats: {
          years: "Năm kinh nghiệm",
          yearsDesc: "Đội ngũ bác sĩ chuyên khoa với hơn 15 năm làm việc trong ngành, tích lũy kinh nghiệm điều trị hàng nghìn ca bệnh phức tạp.",
          patients: "Bệnh nhân phục vụ",
          patientsDesc: "Hơn 50.000 bệnh nhân đã tin tưởng và lựa chọn chúng tôi để giải quyết các vấn đề về Tai-Mũi-Họng, với tỷ lệ hài lòng 98%.",
          certified: "Bộ Y Tế chứng nhận",
          certifiedDesc: "Phòng khám được chứng nhận và cấp phép bởi Bộ Y Tế, đạt chuẩn ISO 9001:2015, đảm bảo chất lượng dịch vụ y tế."
        },
        different: {
          title: "Chúng tôi khác biệt như thế nào?",
          subtitle: "Công nghệ hiện đại và quy trình chăm sóc chuyên nghiệp",
          features: {
            smartSystem: { title: "Hệ thống phòng khám thông minh", desc: "Nền tảng số giúp quản lý hồ sơ bệnh án, kết quả khám chữa bệnh và theo dõi tình trạng bệnh nhân một cách chính xác và nhanh chóng." },
            modernEquipment: { title: "Trang thiết bị chuẩn quốc tế", desc: "Đầu tư thiết bị y tế hiện đại nhất, được nhập khẩu từ các thương hiệu hàng đầu thế giới, đảm bảo độ chính xác cao." },
            onlineBooking: { title: "Đặt lịch online & nhắc hẹn tự động", desc: "Hệ thống quản trị lịch hẹn thời gian thực giúp giảm tối đa thời gian chờ, bệnh nhân có thể đặt lịch mọi lúc mọi nơi." },
            followUpCare: { title: "Tư vấn & theo dõi sau khám", desc: "Bệnh nhân được tư vấn hậu khám qua nền tảng chăm sóc từ xa, đảm bảo quá trình phục hồi đúng hướng." }
          }
        },
        process: {
          title: "Quy trình khám chữa bệnh",
          step1: { title: "Đặt lịch online", desc: "Nhanh chóng, tiện lợi" },
          step2: { title: "Khám & chẩn đoán", desc: "Chính xác, chi tiết" },
          step3: { title: "Điều trị hiệu quả", desc: "An toàn, chuyên nghiệp" },
          step4: { title: "Theo dõi sau khám", desc: "Tận tâm, chu đáo" }
        }
      },

      // Footer
    footer: {
  servicesTitle: "Dịch Vụ",           // en: "Services"
  serviceEntConsultation: "Khám Tai-Mũi-Họng",     // en: "ENT Consultation"
  serviceEndoscopy: "Nội Soi Chẩn Đoán",           // en: "Diagnostic Endoscopy"
  serviceProcedures: "Thủ Thuật ENT",              // en: "ENT Procedures"

  aboutTitle: "Về Chúng Tôi",         // en: "About Us"
  doctorsTeam: "Đội Ngũ Bác Sĩ",      // en: "Our Doctors"
  patientReviews: "Đánh Giá",         // en: "Patient Reviews"
  news: "Tin Tức",                    // en: "News & Articles"

  contactTitle: "Liên Hệ",            // en: "Contact Info"

  updateInfo: "Vui lòng cập nhật thông tin phòng khám trong trang quản trị để hiển thị đúng.",
  rights: "Mọi quyền được bảo lưu.",

  privacyPolicy: "Chính Sách Bảo Mật",
  termsOfService: "Điều Khoản Sử Dụng"
},

      // Common
      common: {
        loading: "Đang tải...",
        error: "Đã có lỗi xảy ra",
        success: "Thành công",
        cancel: "Hủy",
        confirm: "Xác nhận",
        save: "Lưu",
        edit: "Sửa",
        delete: "Xóa",
        search: "Tìm kiếm"
      },

      // SEO
      seo: {
        title: "Phòng Khám Tai-Mũi-Họng | Chăm Sóc Sức Khỏe ENT Chuyên Nghiệp",
        description: "Phòng khám chuyên khoa Tai-Mũi-Họng uy tín với đội ngũ bác sĩ giàu kinh nghiệm, thiết bị hiện đại. Đặt lịch khám ngay!"
      },
      servicesSection: {
  title: "Bảng Giá Dịch Vụ Tai Mũi Họng",
  subtitle: "Cập nhật mới nhất • Minh bạch • Chuyên sâu",
  loading: "Đang tải dịch vụ...",
  error: "Không thể tải dịch vụ. Vui lòng thử lại.",
  noServices: "Không có dịch vụ nào trong danh mục này.",
  viewAll: "Xem tất cả dịch vụ",
  categories: {
    all: "Tất cả",
    consultation: "Khám bệnh",
    test: "Thăm dò chức năng",
    procedure: "Thủ thuật"
  }
},
fullServices: {
  title: "Danh Mục Dịch Vụ Tai - Mũi - Họng",
  subtitle: "Lựa chọn phù hợp cho từng nhu cầu khám – từ tư vấn, chẩn đoán đến thủ thuật chuyên sâu.",
  loading: "Đang tải dịch vụ...",
  error: "Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.",
  noServices: "Không có dịch vụ nào trong danh mục này.",
  categories: {
    all: "Tất cả",
    consultation: "Khám bệnh",
    test: "Thăm dò chức năng",
    procedure: "Thủ thuật"
  },
  
},
doctorsPage: {
  title: "Gặp Gỡ Các Bác Sĩ Chuyên Khoa",
  subtitle: "Danh sách được cập nhật theo thời gian thực, giúp bạn đặt lịch đúng bác sĩ chỉ với một cú click.",
  loading: "Đang tải danh sách bác sĩ...",
  error: "Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.",

},
newsPage: {
  title: "Bản Tin Sức Khỏe Cập Nhật Mỗi Ngày",
  subtitle: "Theo dõi thông tin mới nhất về công nghệ, điều trị và chăm sóc sức khỏe Tai-Mũi-Họng.",
  searchPlaceholder: "Tìm kiếm theo tiêu đề...",
  allCategories: "Tất cả chuyên mục",
  clearFilter: "Xóa bộ lọc",
  clear: "Xóa lọc",
  noArticles: "Không có bài viết nào.",
categories: {
    technology: "Công nghệ",
    health: "Sức khỏe",
    treatment: "Điều trị",
    warning: "Cảnh báo",
    advice: "Tư vấn"
  }
},
hero: {
  topBadge: "Phòng Khám Chuyên Khoa Hàng Đầu",
  titleLine1: "Chăm Sóc",
  highlight: "Tai-Mũi-Họng",
  titleLine3: "Toàn Diện",
  description: "Đội ngũ bác sĩ chuyên môn cao, thiết bị hiện đại, mang đến dịch vụ chăm sóc sức khỏe ENT tốt nhất cho bạn và gia đình",
  bookButton: "Đặt Lịch Khám Ngay",
  servicesButton: "Xem Dịch Vụ",
  imageAlt: "Phòng khám Tai Mũi Họng",
  certificate: {
    title: "Chứng Nhận",
    by: "Bộ Y Tế công nhận"
  },
  stats: {
    years: "Năm kinh nghiệm",
    patients: "Bệnh nhân",
    satisfaction: "Hài lòng"
  }
},
appointment: {
  formTitle: "ĐẶT LỊCH HẸN & MÔ TẢ TRIỆU CHỨNG",
  fullName: "Họ và Tên",
  fullNamePlaceholder: "Nhập họ và tên",
  phone: "Số Điện Thoại",
  email: "Địa chỉ Email",
  date: "Ngày Mong Muốn",
  time: "Giờ Mong Muốn",
  symptomsLabel: "Mô tả Triệu chứng (không bắt buộc)",
  symptomsPlaceholder: "Bạn có thể mô tả tình trạng (tuỳ chọn)",
  servicesLabel: "Chọn dịch vụ (tùy chọn)",
  selectServicePlaceholder: "Chọn dịch vụ...",
  selectedServices: "Đã chọn {{count}} dịch vụ",
  selectedLabel: "Dịch vụ đã chọn:",
  searchPlaceholder: "Tìm kiếm dịch vụ...",
  noResults: "Không tìm thấy dịch vụ phù hợp",
  workingHoursHint: "Khung giờ làm việc: 8:00-12:00 và 14:00-18:00",
  timeError: "Vui lòng chọn thời gian trong khung giờ: 8:00-12:00 hoặc 14:00-18:00",
  phoneError: "Vui lòng nhập số điện thoại hợp lệ (9–11 chữ số).",
  phoneTooLong: "Số điện thoại tối đa 10 chữ số.",
  submitting: "Đang gửi...",
  submitButton: "GỬI YÊU CẦU ĐẶT LỊCH",
  successTitle: "Đặt lịch thành công!",
  successMessage: "Chúng tôi đã ghi nhận yêu cầu của bạn. Bạn sẽ được chuyển về trang chủ trong giây lát...",
  errorTitle: "Có lỗi xảy ra!",
  confirmationNote: "Chúng tôi sẽ xác nhận lịch khám trong vòng 30 phút"
},

//ADMIN ACCOUNT MANAGEMENT//
accountManagement: {
        title: "Quản Lý Tài Khoản",
        createButton: "Tạo tài khoản",
        searchPlaceholder: "Tên, SĐT, Email...",
        roleFilter: "Vai trò",
        statusFilter: "Trạng thái",
        allRoles: "Tất cả",
        allStatuses: "Tất cả",
        activeStatus: "Hoạt động",
        disabledStatus: "Vô hiệu hóa",
        clearFilter: "Xóa lọc",
        noAccounts: "Không tìm thấy tài khoản nào",
        table: {
          stt: "STT",
          photo: "Ảnh",
          fullName: "Họ tên",
          gender: "Giới tính",
          phone: "SĐT",
          email: "Email",
          role: "Vai trò",
          status: "Trạng thái",
          actions: "Thao tác"
        },
        modal: {
          createTitle: "Tạo tài khoản mới",
          viewTitle: "Chi tiết tài khoản",
          editTitle: "Chỉnh sửa tài khoản",
          editButton: "Chỉnh sửa",
          close: "Đóng",
          avatarLabel: "Ảnh đại diện",
          changePhoto: "Thay đổi ảnh",
          choosePhoto: "Chọn ảnh",
          email: "Email",
          password: "Mật khẩu",
          passwordPlaceholderCreate: "Nhập mật khẩu",
          passwordPlaceholderEdit: "Nhập mật khẩu mới (tuỳ chọn)",
          fullName: "Họ và tên",
          phone: "Số điện thoại",
          dob: "Ngày sinh",
          gender: "Giới tính",
          experienceYears: "Số năm kinh nghiệm",
          role: "Vai trò",
          address: "Địa chỉ",
          bio: "Mô tả / Giới thiệu",
          bioCounter: "{{count}}/1000",
          saveButton: "Lưu thay đổi",
          createAccountButton: "Tạo tài khoản",
          cancel: "Hủy",
          processing: "Đang xử lý..."
        },
        gender: { male: "Nam", female: "Nữ", other: "Khác" },
        roleLabels: { admin: "Quản trị viên", bac_si: "Bác sĩ", tiep_tan: "Tiếp tân" },
        status: { active: "Hoạt động", disabled: "Vô hiệu hóa" },
        
        confirmToggle: {
          disableTitle: "Vô hiệu hóa tài khoản?",
          enableTitle: "Kích hoạt tài khoản?",
          disableText: "Tài khoản sẽ không thể đăng nhập nữa.",
          enableText: "Tài khoản sẽ được phép đăng nhập lại.",
          confirm: "Xác nhận",
          cancel: "Hủy"
        },

        toast: {
          createSuccess: "Tạo tài khoản thành công!",
          updateSuccess: "Cập nhật tài khoản thành công!",
          toggleSuccessActive: "Tài khoản đã được kích hoạt!",
          toggleSuccessDisabled: "Tài khoản đã bị vô hiệu hóa!",
          error: "Có lỗi xảy ra",
          loadError: "Không thể tải danh sách người dùng",
          imageError: "Chỉ chấp nhận file ảnh"
        }
      },
      // ADMIN SIDEBAR - Thêm vào cuối phần translation của vi và en
      adminSidebar: {
        statistics: "Thống kê",
        clinic: "Thông Tin Phòng Khám",
        accounts: "Tài Khoản",
        articles: "Quản Lý Tin Tức",
        services: "Quản Lý Dịch Vụ",
        appointments: "Quản Lý Lịch Hẹn",
        rooms: "Quản Lý Phòng Khám",
        medicalRecords: "Lịch Sử Khám Bệnh",
        invoices: "Quản Lý Hóa Đơn"
      },
      articles: {
    pageTitle: "Quản Lý Tin Tức",
    createButton: "Tạo Tin Tức",
    modal: {
      createTitle: "Tạo Tin Tức Mới",
      editTitle: "Chỉnh Sửa Tin Tức",
      title: "Tiêu Đề",
      titlePlaceholder: "Nhập tiêu đề tin tức",
      content: "Nội Dung",
      contentPlaceholder: "Nhập nội dung chi tiết...",
      category: "Danh Mục",
      selectCategory: "-- Chọn danh mục --",
      author: "Tác Giả",
      authorPlaceholder: "Nhập tên tác giả",
      source: "Nguồn",
      coverImage: "Ảnh Bìa",
      chooseImage: "Chọn Ảnh",
      changeImage: "Thay Đổi Ảnh",
      imageHint: "Kích thước tối đa 10MB, định dạng JPG, PNG, WEBP"
    },
    filter: {
      title: "Tìm kiếm tiêu đề",
      titlePlaceholder: "Nhập từ khóa...",
      category: "Danh mục",
      allCategories: "Tất cả danh mục",
      fromDate: "Từ ngày",
      toDate: "Đến ngày",
      clearFilter: "Xóa bộ lọc"
    },
    table: {
      no: "STT",
      image: "Ảnh",
      title: "Tiêu đề",
      category: "Danh mục",
      author: "Tác giả",
      publishedAt: "Ngày đăng",
      actions: "Thao tác"
    },
    noArticles: "Không tìm thấy tin tức nào",
    categories: {
      health: "Sức khỏe",
      advice: "Tư vấn",
      treatment: "Điều trị",
      warning: "Cảnh báo",
      technology: "Công nghệ"
    },
    toast: {
      createSuccess: "Tạo tin tức thành công!",
      updateSuccess: "Cập nhật tin tức thành công!",
      deleteSuccess: 'Đã xóa tin tức "{{title}}"'
    },
    errors: {
      loadFailed: "Không thể tải danh sách tin tức",
      saveFailed: "Lưu tin tức thất bại",
      deleteFailed: "Xóa tin tức thất bại",
      uploadFailed: "Tải ảnh lên thất bại",
      invalidImage: "Vui lòng chọn file ảnh hợp lệ",
      imageTooLarge: "Kích thước ảnh không được vượt quá 10MB"
    }
  },
  common: {
    loading: "Đang tải...",
    processing: "Đang xử lý..."
  },
  clinic: {
  title: "Quản Lý Thông Tin Phòng Khám",
  loading: "Đang tải thông tin phòng khám...",
  updating: "Đang cập nhật thông tin...",
  noData: "Chưa có thông tin phòng khám",
  noDataHint: "Vui lòng điền thông tin bên dưới để tạo mới.",
  saving: "Đang lưu...",
  saveButton: "Lưu thông tin",
    common: {
  // ... các key hiện tại ...
  stt: "STT",
  actions: "Thao tác",
  view: "Xem chi tiết",
  edit: "Chỉnh sửa",
  delete: "Xóa",
  cancel: "Hủy",
  all: "Tất cả",
  clearFilter: "Xóa lọc",
  search: "Tìm kiếm"
},
  form: {
    logo: "Logo Phòng Khám",
    selectLogo: "Chọn ảnh từ máy",
    changeLogo: "Đổi ảnh",
    removeLogo: "Xóa logo",
    logoPreview: "Xem trước logo:",
    currentLogo: "Logo hiện tại:",
    noLogo: "Chưa có logo. Vui lòng chọn file ảnh từ máy tính.",
    newBadge: "Mới",
    fileInfo: "File: {{name}} ({{size}} KB)",
    
    name: "Tên phòng khám",
    namePlaceholder: "Nhập tên phòng khám",
    address: "Địa chỉ",
    addressPlaceholder: "Nhập địa chỉ phòng khám",
    phone: "Số điện thoại",
    phonePlaceholder: "Nhập số điện thoại",
    email: "Email",
    emailPlaceholder: "Nhập email phòng khám",
    website: "Website",
    websitePlaceholder: "www.example.com hoặc https://example.com",
    websiteHint: "Có thể nhập domain (www.example.com) hoặc URL đầy đủ (https://example.com)",
    
    morningHours: "Giờ làm việc buổi sáng",
    afternoonHours: "Giờ làm việc buổi chiều",
    startTime: "Giờ bắt đầu",
    endTime: "Giờ kết thúc",
    hoursHint: "Để trống nếu phòng khám không làm việc buổi đó",
    
    createdAt: "Ngày tạo",
    updatedAt: "Cập nhật lần cuối"
  },
  
  toast: {
    updateSuccess: "Cập nhật thông tin phòng khám thành công!"
  },
  
  errors: {
    loadFailed: "Không thể tải thông tin phòng khám",
    updateFailed: "Có lỗi xảy ra khi cập nhật",
    invalidImage: "Vui lòng chọn file ảnh (PNG, JPG, JPEG, GIF, WebP)",
    imageTooLarge: "Kích thước file quá lớn ({{size}}MB). Vui lòng chọn file nhỏ hơn 10MB.",
    uploadFailed: "Không thể upload logo. Vui lòng thử lại.",
    nameRequired: "Tên phòng khám không được để trống",
    invalidEmail: "Email không hợp lệ",
    morningTimeInvalid: "Giờ kết thúc buổi sáng phải sau giờ bắt đầu",
    afternoonTimeInvalid: "Giờ kết thúc buổi chiều phải sau giờ bắt đầu",
    timeRangeInvalid: "Giờ kết thúc buổi sáng phải trước giờ bắt đầu buổi chiều"
  }
},
servicesManagement: {
  title: "Quản Lý Dịch Vụ",
  createButton: "Tạo dịch vụ",
  searchLabel: "Tìm kiếm dịch vụ",
  searchPlaceholder: "Nhập tên dịch vụ...",
  category: "Danh mục",
  status: "Trạng thái",
  priceRange: "Khoảng giá",
  active: "Hoạt động",
  inactive: "Ngưng hoạt động",
  name: "Tên dịch vụ",
  label: "dịch vụ",
  clearFilters: "Xóa lọc",
  noServices: "Không tìm thấy dịch vụ nào phù hợp.",

  categories: {
    consultation: "Khám Bệnh",
    test: "Thăm Dò",
    procedure: "Thủ Thuật"
  },

  common: {
    "photo": "Hình ảnh",
    all: "Tất cả",
    clearFilter: "Xóa lọc",
    name: "Tên",
    category: "Danh mục",
    status: "Trạng thái",
      description: "Mô tả",
  price: "Giá",
  actions: "Thao tác",
    edit: "Chỉnh sửa",
     cancel: "Hủy",
       delete: "Xóa",
       confirm: "Xác nhận",

  },
  modal: {
    createTitle: "Tạo dịch vụ mới",
    viewTitle: "Chi tiết dịch vụ",
    editTitle: "Chỉnh sửa dịch vụ",
    image: "Ảnh dịch vụ",
    chooseImage: "Chọn ảnh",
    changeImage: "Thay đổi ảnh",
    maxSize: "tối đa 10MB"
  },

  toast: {
    createSuccess: "Tạo dịch vụ thành công!",
    updateSuccess: "Cập nhật dịch vụ thành công!",
    deleteSuccess: "Đã xóa dịch vụ thành công!",
    activated: "Dịch vụ đã được kích hoạt ",
    deactivated: "Dịch vụ đã bị vô hiệu hoá"
  },

  error: {
    load: "Không thể tải danh sách dịch vụ",
    invalidImage: "Vui lòng chọn file ảnh",
    imageTooLarge: "Ảnh không được quá 10MB"
  },

  confirm: {
    deleteText: "Xóa dịch vụ \"{{name}}\"? Thao tác này không thể hoàn tác.",
    deactivateTitle: "Ngưng hoạt động dịch vụ?",
    activateTitle: "Kích hoạt dịch vụ?",
    toggleText: "Dịch vụ: {{name}}"
  },

  deactivate: "Ngưng hoạt động",
  activate: "Kích hoạt",
   priceRanges: {
    "under500k": "Dưới 500.000 ₫",
    "500k_1m": "500.000 ₫ - 1.000.000 ₫",
    "1m_1_5m": "1.000.000 ₫ - 1.500.000 ₫",
    "over1_5m": "Trên 1.500.000 ₫"
  },
},
// ==================== THÊM VÀO resources.vi.translation ====================
statistics: {
  overview: "Thống kê tổng quan",
  
  // KPI Cards
  todayAppointments: "Lịch Hẹn Hôm Nay",
  newRecords: "Hồ Sơ Bệnh Án Mới",
  monthRevenue: "Doanh Thu Tháng",
  cancelRate: "Tỷ Lệ Hủy Lịch",

  // Xu hướng
  appointmentTrend: "Xu Hướng Lịch Hẹn (7 Ngày)",
  revenueTrend: "Xu Hướng Doanh Thu (7 Ngày)",

  // Top 5 dịch vụ
  topServices: "Top 5 Dịch Vụ Phổ Biến",
  byAppointment: "Đặt lịch",
  byExamination: "Khám thật",
  byRevenue: "Doanh thu",

  // Tooltip & chung
  times: "lượt", // đã có trong common.times nhưng để chắc chắn
},

common: {
  // Các key đã dùng nhiều nơi trong component
  vsPrevious: "vs kỳ trước",
  appointments: "Lịch hẹn",
  revenue: "Doanh thu",
  quantity: "Số lượng",
  fromDate: "Từ ngày",
  toDate: "Đến ngày",
  sessionExpired: "Phiên đăng nhập hết hạn",
  loadError: "Không thể tải dữ liệu thống kê",
},
appointmentManagement: {
  appointment: "lịch hẹn",
    appointments: "lịch hẹn",
  title: "Quản Lý Lịch Hẹn",
  createButton: "Tạo lịch hẹn",
  createTitle: "Tạo lịch hẹn mới",
  viewTitle: "Chi tiết lịch hẹn",
  editTitle: "Chỉnh sửa lịch hẹn",
  editButton: "Chỉnh sửa",
  searchLabel: "Tìm kiếm",
  searchPlaceholder: "Tên bệnh nhân hoặc số điện thoại...",
  statusLabel: "Trạng thái",
  statusPending: "Chờ xác nhận",
  statusConfirmed: "Đã xác nhận",
  statusCancelled: "Đã hủy",
  fromDate: "Từ ngày",
  toDate: "Đến ngày",
  clearFilters: "Xóa lọc",
  loadingList: "Đang tải danh sách lịch hẹn...",
  noAppointments: "Chưa có lịch hẹn nào",
  moreServices: "dịch vụ",
  noService: "Chưa chọn dịch vụ",
  viewDetail: "Xem chi tiết",
  patientName: "Họ tên",
  namePlaceholder: "Nguyễn Văn A",
  nameRequired: "Vui lòng nhập họ tên",
  phone: "Số điện thoại",
  phonePlaceholder: "0901234567",
  phoneRequired: "Vui lòng nhập số điện thoại",
  phoneLength: "Số điện thoại phải đúng 10 chữ số",
  email: "Email (tùy chọn)",
  emailPlaceholder: "example@gmail.com",
  date: "Ngày hẹn",
  datePlaceholder: "Chọn ngày",
  dateRequired: "Vui lòng chọn ngày hẹn",
  time: "Giờ hẹn",
  timeError: "Chỉ được chọn giờ từ 08:00–12:00 hoặc 14:00–18:00",
  timeInvalid: "Giờ không hợp lệ",
  pastTime: "Không thể đặt lịch vào thời gian đã qua. Vui lòng chọn giờ trong tương lai.",
  servicesLabel: "Dịch vụ (tùy chọn)",
  searchServices: "Tìm kiếm dịch vụ...",
  loadingServices: "Đang tải danh sách dịch vụ...",
  noServicesFound: "Không tìm thấy dịch vụ nào",
  notes: "Ghi chú (tùy chọn)",
  notesPlaceholder: "Triệu chứng, yêu cầu đặc biệt...",
  confirming: "Đang xác nhận...",
  confirm: "Xác nhận",
  cancel: "Hủy lịch",
  processing: "Đang xử lý...",
  saveChanges: "Lưu thay đổi",
  confirmSuccess: "Đã xác nhận lịch hẹn thành công!",
  confirmFailed: "Xác nhận thất bại",
  cancelSuccess: "Đã hủy lịch hẹn",
  cancelFailed: "Hủy thất bại",
  createSuccess: "Tạo lịch hẹn thành công! Mã lịch: {{code}}",
  updateSuccess: "Cập nhật lịch hẹn thành công!",
  loadError: "Không thể tải danh sách lịch hẹn",
  loadServicesError: "Không thể tải danh sách dịch vụ",
  dateRangeError: "Từ ngày phải nhỏ hơn hoặc bằng Đến ngày",
  dateRangeError2: "Đến ngày phải lớn hơn hoặc bằng Từ ngày",
  cancelConfirmTitle: "Hủy lịch hẹn này?",
  cancelConfirmText: "Lịch hẹn sẽ được chuyển sang trạng thái",
  cancelConfirmQuestion: "Bạn có chắc chắn muốn tiếp tục?",
  confirmCancel: "Xác nhận hủy",
  keep: "Giữ lại",
  table: {
    stt: "STT",
    code: "Mã lịch",
    patient: "Bệnh nhân",
    phone: "Số điện thoại",
    time: "Thời gian",
    services: "Dịch vụ",
    status: "Trạng thái",
    actions: "Thao tác"
  },
  common: {
  // ... các key hiện tại ...
  stt: "STT",
  actions: "Thao tác",
  view: "Xem chi tiết",
  edit: "Chỉnh sửa",
  delete: "Xóa",
  cancel: "Hủy",
  all: "Tất cả",
  clearFilter: "Xóa lọc",
  search: "Tìm kiếm"
},
},


// === THÊM VÀO resources.en.translation ===
roomManagement: {
  title: "Quản Lý Phòng Khám",
  createButton: "Thêm phòng mới",
  updateButton: "Cập nhật",           // ← mới thêm
  room: "phòng",
  searchPlaceholder: "Tên phòng hoặc tên bác sĩ...",
  statusLabel: "Trạng thái",
  statusAvailable: "Sẵn sàng",
  statusOccupied: "Đang sử dụng",
  activeLabel: "Hoạt động",
  active: "Hoạt động",
  inactive: "Ngưng hoạt động",
  loading: "Đang tải danh sách phòng khám...",
  noRooms: "Chưa có phòng khám nào",
  noDoctor: "Chưa gán bác sĩ",
  noDoctorSelect: "-- Chưa gán bác sĩ --",
  loadingDoctors: "Đang tải danh sách bác sĩ...",
  roomName: "Tên phòng",
  roomNamePlaceholder: "VD: Phòng khám Tai-Mũi-Họng số 1",
  doctorLabel: "Bác sĩ phụ trách (Tùy chọn)",
  activeCheckbox: "Phòng đang hoạt động",
  nameRequired: "Vui lòng nhập tên phòng",
  createSuccess: "Tạo phòng khám thành công!",
  updateSuccess: "Cập nhật phòng khám thành công!",
  deleteSuccess: "Xóa phòng khám thành công!",
  deleteError: "Không thể xóa phòng khám",
  loadError: "Không thể tải danh sách phòng khám",
  loadDoctorsError: "Không thể tải danh sách bác sĩ",
  modal: {
    create: "Thêm phòng khám mới",
    view: "Chi tiết phòng khám",
    edit: "Chỉnh sửa phòng khám"
  },
  table: {
    roomName: "Tên phòng",
    doctor: "Bác sĩ",
    status: "Trạng thái",
    active: "Hoạt động"
  },
  confirmDelete: {
    title: "Xóa phòng khám?",
    text1: "Bạn có chắc chắn muốn xóa phòng khám",
    warning: "Hành động này không thể hoàn tác.",
    confirm: "Xóa"
  },
  common: {
  // ... các key hiện tại ...
  stt: "STT",
  actions: "Thao tác",
  view: "Xem chi tiết",
  edit: "Chỉnh sửa",
  delete: "Xóa",
  cancel: "Hủy",
  all: "Tất cả",
  clearFilter: "Xóa lọc",
  search: "Tìm kiếm"
},
},
medicalRecords: {
  title: "Lịch Sử Khám Bệnh",
  allRecords: "Tất cả",
  recordLabel: "hồ sơ",

  filters: {
    search: "Tìm kiếm",
    searchPlaceholder: "Tên bệnh nhân hoặc chẩn đoán...",
    fromDate: "Từ ngày",
    toDate: "Đến ngày",
    clear: "Xóa lọc"
  },

  table: {
    stt: "STT",
    examDate: "Ngày khám",
    patient: "Bệnh nhân",
    diagnosis: "Chẩn đoán",
    treatmentNotes: "Ghi chú điều trị"
  },

  noResults: "Không tìm thấy kết quả phù hợp.",
  noRecords: "Chưa có lịch sử khám bệnh nào.",
  na: "N/A",
  walkInPatient: "Khách vãng lai",

  errors: {
    loadFailed: "Không thể tải lịch sử khám bệnh.",
    startDateAfterEnd: "Từ ngày phải nhỏ hơn hoặc bằng Đến ngày",
    endDateBeforeStart: "Đến ngày phải lớn hơn hoặc bằng Từ ngày"
  }
},
invoices: {
      label: "hóa đơn",
      createButton: "Tạo hóa đơn",
      loading: "Đang tải danh sách hóa đơn...",
      noInvoices: "Chưa có hóa đơn nào",
      noResults: "Không tìm thấy hóa đơn nào phù hợp",
      tryDifferentFilter: "Thử thay đổi bộ lọc",
      createFirstInvoice: "Vui lòng tạo hóa đơn mới",

      status: {
        search: "Tìm kiếm",
        searchPlaceholder: "Tên bệnh nhân, số điện thoại...",
        status: "Trạng thái",
        allStatus: "Tất cả trạng thái",
        paid: "Đã thanh toán",
        pending: "Chưa thanh toán / Chưa đủ",
        unpaidOnly: "Chỉ chưa thanh toán",
        clear: "Xóa lọc"
      },
      filters: {
  search: "Tìm kiếm",
  searchPlaceholder: "Tên bệnh nhân, số điện thoại...",
  status: "Trạng thái",
  allStatus: "Tất cả trạng thái",
  paid: "Đã thanh toán",
  pending: "Đang chờ / Thanh toán một phần",
  unpaidOnly: "Chỉ chưa thanh toán",
  clear: "Xóa bộ lọc"
},

modal: {
        "title": "Chi tiết hóa đơn",
    "code": "Mã",
    "patient": "Bệnh nhân",
    "noPatientName": "Chưa có tên",
    "noPhone": "Không có SĐT",
    "invoiceInfo": "Thông tin hóa đơn",
    "createdDate": "Ngày tạo",
    "status": "Trạng thái",
    "servicesAndCosts": "Dịch vụ & Chi phí",
    "addService": "Thêm dịch vụ",
    "saving": "Đang lưu...",
    "atLeastOneService": "Hóa đơn phải có ít nhất 1 dịch vụ",
    "missingServiceInfo": "Có dịch vụ bị thiếu thông tin. Vui lòng kiểm tra lại.",
    "updateSuccess": "Cập nhật hóa đơn thành công!",
    "serviceAlreadyExists": "Dịch vụ đã tồn tại trong hóa đơn",
    "addedService": "Đã thêm",
    "searchServicePlaceholder": "Tìm kiếm dịch vụ...",
    "loadingServices": "Đang tải dịch vụ...",
    "noServiceFound": "Không tìm thấy dịch vụ nào",
    "noServices": "Chưa có dịch vụ nào",
    "remaining": "Còn lại",
    "total": "Tổng tiền",
    "paid": "Đã thu",
    "payNow": "Thanh toán ngay",
    "statusMap": {
      "pending": "Chờ thanh toán",
      "paid": "Đã thanh toán",
      "partiallyPaid": "Thanh toán 1 phần"
    }
  },
  common: {
  // ... các key hiện tại
  close: "Đóng",  // ← THÊM
  cancel: "Hủy",
  save: "Lưu",
  edit: "Sửa",
  // ...
},
      table: {
        stt: "STT",
        invoiceCode: "Mã hóa đơn",
        patient: "Bệnh nhân",
        createdDate: "Ngày lập",
        totalAmount: "Tổng tiền",
        status: "Trạng thái",
        actions: "Thao tác"
      },

      status: {
        paid: "Đã thanh toán",
        pending: "Chưa thanh toán",
        partiallyPaid: "Thanh toán 1 phần"
      },

      tooltips: {
        viewDetail: "Xem chi tiết",
        pay: "Thu tiền"
      },

      errors: {
        loadFailed: "Không thể tải danh sách hóa đơn"
      }
    },
    createInvoice: {
  title: "Tạo hóa đơn mới",
  subtitle: "Nhanh chóng lập hóa đơn cho bệnh nhân",
  selectPatient: "Tìm & chọn bệnh nhân",
  searchPlaceholder: "Nhập tên hoặc số điện thoại...",
  noPatientFound: "Không tìm thấy bệnh nhân",
  selectServices: "Chọn dịch vụ",
  added: "Đã thêm",
  selectedServices: "Dịch vụ đã chọn ({{count}})",
  paymentMethod: "Phương thức thanh toán",
  totalAmount: "Tổng tiền",
  creating: "Đang tạo...",
  createButton: "Tạo hóa đơn",
  
  paymentMethods: {
    cash: "Tiền mặt",
    card: "Thẻ tín dụng/ghi nợ",
    transfer: "Chuyển khoản"
  },
    common: {
  // ... các key hiện tại
  close: "Đóng",  // ← THÊM
  cancel: "Hủy",
  save: "Lưu",
  edit: "Sửa",
  // ...
},
  errors: {
    loadFailed: "Không tải được dữ liệu",
    noRecord: "Không tìm thấy hồ sơ khám",
    selectPatient: "Vui lòng chọn bệnh nhân",
    selectService: "Vui lòng chọn ít nhất 1 dịch vụ",
    createFailed: "Tạo hóa đơn thất bại"
  },
  
  success: "Tạo hóa đơn thành công!"
},
// Thêm vào cuối phần translation của tiếng Việt (trước dấu ngoặc đóng cuối)
queueManagement: {
  title: "Quản Lý Hàng Đợi",
  noQueue: "Chưa có bệnh nhân nào trong hàng đợi",
  noQueueNumber: "—",
  notAssigned: "Đang phân phòng...",
  unknown: "Chưa xác định",
  
  table: {
    stt: "STT",
    queueCode: "Mã hàng đợi",
    patient: "Bệnh nhân",
    dob: "Ngày sinh",
    contact: "Liên hệ",
    room: "Phòng khám",
    priority: "Ưu tiên",
    status: "Trạng thái",
    checkIn: "Check-in",
    actions: "Thao tác"
  },
    patientForm: {
    addTitle: "Thêm bệnh nhân mới",
    editTitle: "Chỉnh sửa thông tin bệnh nhân",
    viewTitle: "Xem chi tiết bệnh nhân",
    editButton: "Chỉnh sửa",
    
    patientName: "Tên bệnh nhân",
    namePlaceholder: "Nhập tên đầy đủ",
    phone: "Số điện thoại",
    phonePlaceholder: "VD: 0912345678",
    email: "Email",
    emailPlaceholder: "example@email.com",
    dob: "Ngày sinh",
    
    gender: {
      label: "Giới tính",
      male: "Nam",
      female: "Nữ",
      other: "Khác"
    },
    
    priority: "Mức độ ưu tiên",
    idNumber: "Số căn cước / CMND",
    idPlaceholder: "VD: 001234567890",
    insurance: "Số thẻ BHYT",
    insurancePlaceholder: "VD: HS4010012345678",
    address: "Địa chỉ",
    addressPlaceholder: "Nhập địa chỉ đầy đủ",
    notes: "Triệu chứng / Ghi chú",
    notesPlaceholder: "Mô tả triệu chứng hoặc lý do khám bệnh...",
    
    addButton: "Thêm bệnh nhân",
    updateButton: "Cập nhật",
    cancelButton: "Hủy"
  },
  priority: {
    normal: "Thường",
    urgent: "Ưu tiên",
    emergency: "Khẩn cấp"
  },
  
  status: {
    waiting: "Chờ khám",
    inProgress: "Đang khám",
    completed: "Đã hoàn thành",
    cancelled: "Hủy"
  },
  
  actions: {
    view: "Xem chi tiết",
    edit: "Chỉnh sửa"
  },
    filters: {
    search: "Tìm kiếm",
    searchPlaceholder: "Nhập số điện thoại...",
    status: "Trạng thái",
    allStatus: "Tất cả trạng thái",
    clear: "Xóa bộ lọc"
  },
  doctor: "BS: {{name}}"
},
patientRecords: {
  title: "Quản Lý Bệnh Nhân",
  label: "bệnh nhân",
  addButton: "Thêm bệnh nhân",
  loading: "Đang tải danh sách bệnh nhân...",
  
  stats: {
    total: "Tổng cộng"
  },
  
  confirmDelete: "Bạn có chắc chắn muốn xóa bệnh nhân này?",
  
  toast: {
    deleteSuccess: "Đã xóa bệnh nhân thành công!",
    deleteFailed: "Không thể xóa bệnh nhân!",
    updateSuccess: "Cập nhật bệnh nhân thành công!",
    addSuccess: "Đã thêm bệnh nhân thành công!",
    addSuccessWithRoom: "Đã thêm bệnh nhân!\nPhòng: {{room}}{{doctor}}",
    statusUpdateSuccess: "Cập nhật trạng thái thành công!",
    statusUpdateFailed: "Cập nhật trạng thái thất bại!"
  },
  
  errors: {
    loadFailed: "Không thể tải danh sách bệnh nhân",
    loadPatientFailed: "Không tải được thông tin bệnh nhân!",
    phoneInvalid: "Số điện thoại phải đúng 10 chữ số!",
    nameRequired: "Vui lòng nhập tên bệnh nhân!",
    dobRequired: "Vui lòng chọn ngày sinh!",
    submitFailed: "Có lỗi xảy ra!"
  }
},
receptionSidebar: {
  appointments: "Lịch Hẹn",
  records: "Danh Sách Bệnh Nhân",
  rooms: "Quản Lý Phòng",
  invoices: "Hóa Đơn"
},
doctorStats: {
  header: {
    subtitle: "Thống kê hiệu suất",
    title: "Bác sĩ – Báo cáo ca khám"
  },
  range: {
    day: "Ngày",
    week: "Tuần",
    month: "Tháng"
  },
  kpi: {
    totalVisits: {
      title: "Tổng số ca khám",
      unit: "ca",
      subtitle: "Số ca đã xử lý"
    },
    avgTime: {
      title: "Thời gian khám trung bình",
      unit: "phút/ca",
      subtitle: "Tính theo dữ liệu thực tế",
      noData: "Chưa có dữ liệu"
    },
    completionRate: {
      title: "Tỉ lệ hoàn thành",
      subtitle: "So với lịch khám"
    }
  },
  chart: {
    visitsByPeriod: "Số ca khám theo {{#if (eq context 'hour')}}giờ{{else}}ngày{{/if}}",
    trend: "Xu hướng số ca khám"
  },
  table: {
    title: "Bảng thống kê theo khung giờ",
    time: "Thời gian",
    visits: "Số ca",
    change: "% thay đổi",
    note: "Ghi chú"
  },
  loading: "Đang tải dữ liệu thống kê...",
  empty: {
    title: "Không có dữ liệu",
    message: "Không có thống kê cho khoảng thời gian đã chọn."
  },
  error: {
    title: "Lỗi tải dữ liệu",
    retry: "Thử lại",
    noPermission: "Bạn không có quyền xem thống kê. Chỉ bác sĩ mới được phép.",
    noDoctorInfo: "Không tìm thấy thông tin bác sĩ",
    loadFailed: "Không thể tải dữ liệu thống kê"
  }
},
doctorSidebar: {
  stats: "Thống kê",
  currentPatient: "Bệnh nhân hiện tại",
  records: "Quản lý Hồ sơ",
  history: "Lịch sử khám",
  invoices: "Hóa đơn"
},
doctorExamination: {
  // Tabs
  tabExamination: "Khám & Kê đơn",
  tabServices: "Chỉ định dịch vụ",

  // Patient info
  queueNumber: "Số thứ tự",
  checkInTime: "Vào lúc",
  symptomsTitle: "Triệu chứng / Lý do đến khám",
  noSymptoms: "Chưa có ghi chú từ lễ tân",

  // Waiting queue
  waitingQueueTitle: "Hàng đợi tiếp theo",
  nextPatientBadge: "Tiếp theo",
  noPatientsInQueue: "Không còn bệnh nhân nào",

  // Examination tab
  diagnosisLabel: "Chẩn đoán",
  diagnosisRequired: "Vui lòng nhập chẩn đoán",
  treatmentNotesLabel: "Ghi chú điều trị",
  prescriptionTitle: "Kê đơn thuốc",
  drugName: "TÊN THUỐC",
  instructions: "HƯỚNG DẪN SỬ DỤNG",
  drugPlaceholder: "VD: Paracetamol 500mg (10 viên)",
  instructionsPlaceholder: "VD: Uống 1 viên/lần, 3 lần/ngày sau ăn",
  addDrug: "Thêm thuốc mới",
  prescriptionPreviewTitle: "Đơn thuốc hiện tại:",
  completeButton: "Hoàn thành khám",
  processing: "Đang xử lý...",

  // Services tab
  searchServicePlaceholder: "Tìm kiếm dịch vụ...",
  selectedServicesTitle: "Dịch vụ đã chọn",
  totalAmount: "Tổng:",

  // Buttons & actions
  callNextPatient: "Gọi vào khám",
  calling: "Đang gọi...",

  // Toast messages
  serviceAdded: "Đã thêm:",
  serviceRemoved: "Đã bỏ chọn:",
  completeSuccess: "Hoàn thành khám thành công!",
  callNextSuccess: "Đã gọi bệnh nhân tiếp theo!",
  noMorePatients: "Không còn bệnh nhân trong hàng chờ",
  invoiceCreated: "Tạo hóa đơn thành công: {{code}}",
  drugInstructionsRequired: "Vui lòng nhập hướng dẫn sử dụng cho tất cả các thuốc",
  drugNameRequired: "Vui lòng nhập tên thuốc",

  // Empty state (no current patient)
  noPatientTitle: "Phòng khám của tôi",
  patientsWaiting: "{{count}} bệnh nhân đang chờ khám",
  noPatientsToday: "Hiện chưa có bệnh nhân nào",
  waitingForNext: "Hệ thống đang chờ bệnh nhân tiếp theo...",
  queueTitle: "Hàng chờ khám bệnh"
},
doctorRecords: {
  title: "Quản lý Hồ sơ & Hoàn thành khám",
  listTitle: "Danh sách hồ sơ đã tạo",
  noRecords: "Chưa có hồ sơ nào. Hãy nhấn \"Tạo hồ sơ mới\" để hoàn thành ca khám.",
  noResults: "Không tìm thấy hồ sơ nào phù hợp với bộ lọc.",
  errors: {
    loadFailed: "Không thể tải hồ sơ khám"
  },
  filters: {
    keyword: "Từ khóa tìm kiếm",
    keywordPlaceholder: "Nhập tên bệnh nhân, SĐT...",
    fromDate: "Từ ngày",
    toDate: "Đến ngày",
    clear: "Xóa bộ lọc"
  },
  table: {
    patient: "Tên bệnh nhân",
    diagnosis: "Chẩn đoán",
    treatmentNotes: "Ghi chú điều trị"
  },
  create: {
    success: "Đã hoàn thành và lưu hồ sơ khám bệnh!",
    failed: "Tạo hồ sơ khám thất bại",
    diagnosisRequired: "Chẩn đoán là bắt buộc",
    treatmentNotesRequired: "Ghi chú điều trị là bắt buộc"
  },
    common: {
  // ... các key hiện tại ...
  stt: "STT",
  actions: "Thao tác",
  view: "Xem chi tiết",
  edit: "Chỉnh sửa",
  delete: "Xóa",
  cancel: "Hủy",
  all: "Tất cả",
  clearFilter: "Xóa lọc",
  search: "Tìm kiếm"
},
modal: {
    title: "Chỉnh sửa hồ sơ bệnh án",
    pdfTitle: "Xuất PDF hồ sơ bệnh án",
    pdfButton: "PDF Hồ sơ",
    pdfExporting: "Đang xuất...",
    pdfSuccess: "Xuất PDF hồ sơ thành công!",
    pdfFailed: "Xuất PDF thất bại: ",
    patientName: "Tên bệnh nhân",
    diagnosis: "Chẩn đoán",
    diagnosisPlaceholder: "Nhập chẩn đoán...",
    treatmentNotes: "Ghi chú điều trị",
    treatmentNotesPlaceholder: "Nhập ghi chú điều trị...",
    prescriptionTitle: "Đơn thuốc",
    prescriptionDrugs: "Toa thuốc",
    prescriptionDrugsPlaceholder: "Nhập danh sách thuốc (mỗi thuốc một dòng)...",
    prescriptionInstructions: "Hướng dẫn sử dụng",
    prescriptionInstructionsPlaceholder: "Nhập hướng dẫn sử dụng thuốc...",
    prescriptionIssuedAt: "Ngày tạo đơn: {{date}}",
    createdAt: "Ngày tạo hồ sơ: {{date}}",
    saveButton: "Lưu thay đổi"
  },
},
    }
  },


  //Tiếng Anh//
  en: {
    translation: {
      header: {
        home: "Home",
        services: "Services",
        team: "Team",
        reviews: "Reviews",
        contact: "Contact",
        bookNow: "Book Now",
        defaultName: "Clinic name not updated",
        updateInfo: "Please update information in admin panel"
      },
      nav: {
        about: "About Us",
        doctors: "Our Doctors",
        news: "News",
        clinicName: "Clinic Name"
      },

      hero: {
        title: "ENT Healthcare Excellence",
        subtitle: "Experienced specialist doctors with modern equipment",
        bookAppointment: "Book Appointment",
        learnMore: "Learn More"
      },

      values: {
        title: "Core Values",
        professional: "Professional",
        professionalDesc: "Highly qualified specialist doctors with years of experience",
        modern: "Modern",
        modernDesc: "Advanced medical equipment and latest diagnostic & treatment technologies",
        caring: "Caring",
        caringDesc: "Compassionate and friendly care, always putting patient health first"
      },

      services: {
        title: "Medical Services",
        subtitle: "We provide diverse healthcare services",
        viewAll: "View All Services"
      },

      doctors: {
        title: "Our Doctors",
        subtitle: "Experienced specialist doctors",
        viewAll: "View All Doctors",
        yearsExp: "years of experience"
      },

      doctorsSection: {
        title: "Leading Specialist Doctors",
        certifiedText: "All doctors are certified by the Ministry of Health with valid practicing certificates",
        noDoctors: "No doctors available to display.",
        doctorAlt: "Doctor",
        noName: "Name not available",
        yearsExperience: "years of experience",
        viewAll: "View All Doctors"
      },

      testimonials: {
        title: "Patient Reviews",
        subtitle: "Genuine feedback from our patients",
        loading: "Loading reviews...",
        errorLoad: "Failed to load reviews",
        noReviews: "No reviews yet.",
        recommendation: "Would Recommend",
        noDate: "Unknown date",
        today: "Today",
        yesterday: "Yesterday",
        daysAgo: "{{count}} day ago",
        weeksAgo: "{{count}} week ago",
        monthsAgo: "{{count}} month ago",
        yearsAgo: "{{count}} year ago"
      },

      contact: {
        title: "Contact Us",
        description: "We are always ready to assist and advise you",
        address: "Address",
        phone: "Phone",
        email: "Email",
        hours: "Working Hours",
        noInfo: "No contact information available. Please update in the admin panel.",
        workingHours: "Monday - Friday: 8:00 AM - 8:00 PM<br />Saturday - Sunday: 8:00 AM - 5:00 PM",
        emergencyTitle: "Emergency Support",
        emergencyText: "In case of emergency, please call immediately:"
      },

      about: {
        heroTitle: "About Us",
        heroSubtitle: "15 years of building trust and excellence in ENT healthcare",
        certifiedBy: "Certified by Ministry of Health",
        storyTitle: "Our Story",
        story: {
          p1: "Established in 2009, we began with a simple yet meaningful goal: to deliver high-quality ENT care with dedication and professionalism.",
          p2: "Over 15 years of growth, we've served more than 50,000 patients, continuously investing in modern medical technology and specialized training. Every patient is treated like family.",
          p3: "Today, we proudly stand as one of Vietnam's leading smart clinics, pioneering digital healthcare management for a modern, convenient patient experience."
        },
        mvv: { title: "Mission - Vision - Values", subtitle: "The core principles that guide everything we do" },
        mission: { title: "Our Mission", desc: "To provide international-standard ENT care at reasonable costs with compassionate service, ensuring every patient feels confident and satisfied." },
        vision: { title: "Our Vision", desc: "To become Vietnam's leading smart ENT clinic in technology and quality, the top choice for patients nationwide." },
        values: { title: "Core Values", core: "Professional – Transparent – Compassionate.", desc: "We always put patient health at the center of every decision." },
        whyChoose: { title: "Why Choose Us?", subtitle: "Impressive milestones from 15 years of dedicated service" },
        stats: {
          years: "Years of Experience",
          yearsDesc: "Our specialist doctors bring over 15 years of expertise, successfully treating thousands of complex cases.",
          patients: "Patients Served",
          patientsDesc: "Over 50,000 patients have trusted us with their ENT care, with a 98% satisfaction rate.",
          certified: "Ministry of Health Certified",
          certifiedDesc: "Fully licensed and certified by Vietnam's Ministry of Health, meeting ISO 9001:2015 international standards."
        },
        different: {
          title: "What Makes Us Different?",
          subtitle: "Modern technology and professional care process",
          features: {
            smartSystem: { title: "Smart Clinic System", desc: "Digital platform for accurate, real-time medical records and patient follow-up management." },
            modernEquipment: { title: "International Standard Equipment", desc: "Latest medical technology imported from world-leading brands, ensuring highest diagnostic accuracy." },
            onlineBooking: { title: "Online Booking & Auto Reminders", desc: "Real-time appointment system minimizes wait times – book anytime, anywhere." },
            followUpCare: { title: "Post-Treatment Care & Consultation", desc: "Remote follow-up care ensures proper recovery and ongoing support after treatment." }
          }
        },
        process: {
          title: "Treatment Process",
          step1: { title: "Online Booking", desc: "Fast & convenient" },
          step2: { title: "Examination & Diagnosis", desc: "Accurate & detailed" },
          step3: { title: "Effective Treatment", desc: "Safe & professional" },
          step4: { title: "Post-Treatment Follow-up", desc: "Caring & thorough" }
        }
      },

    footer: {
  servicesTitle: "Services",
  serviceEntConsultation: "ENT Consultation",
  serviceEndoscopy: "Diagnostic Endoscopy",
  serviceProcedures: "ENT Procedures",

  aboutTitle: "About Us",
  doctorsTeam: "Our Doctors",
  patientReviews: "Patient Reviews",
  news: "News & Articles",

  contactTitle: "Contact Info",

  updateInfo: "Please update clinic information in the admin panel to display properly.",
  rights: "All rights reserved.",

  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service"
},

      common: {
        loading: "Loading...",
        error: "An error occurred",
        success: "Success",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        search: "Search"
      },

      seo: {
        title: "ENT Clinic | Professional Healthcare Services",
        description: "Trusted ENT clinic with experienced doctors and modern equipment. Book your appointment today!"
      },
      
      servicesSection: {
  title: "ENT Services Price List",
  subtitle: "Latest update • Transparent • Specialized",
  loading: "Loading services...",
  error: "Unable to load services. Please try again.",
  noServices: "No services found in this category.",
  viewAll: "View All Services",
  categories: {
    all: "All",
    consultation: "Consultation",
    test: "Diagnostic Tests",
    procedure: "Procedures"
    }
},
fullServices: {
  title: "ENT Services Catalog",
  subtitle: "Tailored solutions for every need – from consultation and diagnostics to advanced procedures.",
  loading: "Loading services...",
  error:  "Unable to load service list. Please try again later.",
  noServices: "No services found in this category.",
  categories: {
    all: "All",
    consultation: "Consultation",
    test: "Diagnostic Tests",
    procedure: "Procedures"
    },
},
doctorsPage: {
  title: "Meet Our Specialist Doctors",
  subtitle: "Real-time updated list – book the right doctor with just one click.",
  loading: "Loading doctors...",
  error: "Unable to load doctor list. Please try again later.",

},
newsPage: {
  title: "Daily Health News Updates",
  subtitle: "Stay updated with the latest in technology, treatment, and ENT healthcare.",
  searchPlaceholder: "Search by title...",
  allCategories: "All categories",
  clearFilter: "Clear filters",
  clear: "Clear",
  noArticles: "No articles found.",
categories: {
    technology: "Technology",
    health: "Health",
    treatment: "Treatment",
    warning: "Warning",
    advice: "Consultation & Advice"
  }
},
hero: {
  topBadge: "Leading Specialty Clinic",
  titleLine1: "Comprehensive",
  highlight: "ENT Care",
  titleLine3: "Solutions",
  description: "Highly qualified doctors and state-of-the-art equipment delivering the best ENT healthcare for you and your family",
  bookButton: "Book Appointment Now",
  servicesButton: "View Services",
  imageAlt: "ENT Clinic",
  certificate: {
    title: "Certified",
    by: "Recognized by Ministry of Health"
  },
  stats: {
    years: "Years of Experience",
    patients: "Patients Served",
    satisfaction: "Satisfaction Rate"
  }
    },
    
// English
appointment: {
  formTitle: "BOOK APPOINTMENT & DESCRIBE SYMPTOMS",
  fullName: "Full Name",
  fullNamePlaceholder: "Enter your full name",
  phone: "Phone Number",
  email: "Email Address",
  date: "Preferred Date",
  time: "Preferred Time",
  symptomsLabel: "Describe Symptoms (Optional)",
  symptomsPlaceholder: "You can describe your condition (optional)",
  servicesLabel: "Select Services (Optional)",
  selectServicePlaceholder: "Select services...",
  selectedServices: "{{count}} service(s) selected",
  selectedLabel: "Selected services:",
  searchPlaceholder: "Search services...",
  noResults: "No services found",
  workingHoursHint: "Working hours: 8:00 AM–12:00 PM and 2:00 PM–6:00 PM",
  timeError: "Please select a time between 8:00–12:00 or 14:00–18:00",
  phoneError: "Please enter a valid phone number (9–11 digits).",
  phoneTooLong: "Phone number must not exceed 10 digits.",
  submitting: "Submitting...",
  submitButton: "SUBMIT APPOINTMENT REQUEST",
  successTitle: "Appointment booked successfully!",
  successMessage: "We have received your request. You will be redirected to homepage shortly...",
  errorTitle: "Something went wrong!",
  confirmationNote: "We will confirm your appointment within 30 minutes"
},

//ADMIN ACCOUNT MANAGEMENT//
accountManagement: {
        title: "Account Management",
        createButton: "Create Account",
        searchPlaceholder: "Name, Phone, Email...",
        roleFilter: "Role",
        statusFilter: "Status",
        allRoles: "All",
        allStatuses: "All",
        activeStatus: "Active",
        disabledStatus: "Disabled",
        clearFilter: "Clear Filter",
        noAccounts: "No accounts found",
        table: {
          stt: "No.",
          photo: "Photo",
          fullName: "Full Name",
          gender: "Gender",
          phone: "Phone",
          email: "Email",
          role: "Role",
          status: "Status",
          actions: "Actions"
        },
        
        modal: {
          createTitle: "Create New Account",
          viewTitle: "Account Details",
          editTitle: "Edit Account",
          editButton: "Edit",
          close: "Close",
          avatarLabel: "Profile Picture",
          changePhoto: "Change Photo",
          choosePhoto: "Choose Photo",
          email: "Email",
          password: "Password",
          passwordPlaceholderCreate: "Enter password",
          passwordPlaceholderEdit: "Enter new password (optional)",
          fullName: "Full Name",
          phone: "Phone Number",
          dob: "Date of Birth",
          gender: "Gender",
          experienceYears: "Years of Experience",
          role: "Role",
          address: "Address",
          bio: "Bio / Introduction",
          bioCounter: "{{count}}/1000",
          saveButton: "Save Changes",
          createAccountButton: "Create Account",
          cancel: "Cancel",
          processing: "Processing..."
        },
        gender: { male: "Male", female: "Female", other: "Other" },
        roleLabels: { admin: "Administrator", bac_si: "Doctor", tiep_tan: "Receptionist" },
        status: { active: "Active", disabled: "Disabled" },
        confirmToggle: {
          disableTitle: "Disable account?",
          enableTitle: "Enable account?",
          disableText: "This account will no longer be able to log in.",
          enableText: "This account will be allowed to log in again.",
          confirm : "Confirm",
          cancel: "Cancel"
        },
        
        toast: {
          createSuccess: "Account created successfully!",
          updateSuccess: "Account updated successfully!",
          toggleSuccessActive: "Account has been activated!",
          toggleSuccessDisabled: "Account has been disabled!",
          error: "An error occurred",
          loadError: "Unable to load user list",
          imageError: "Only image files are accepted"
        }
      },
            adminSidebar: {
        statistics: "Statistics",
        clinic: "Clinic Information",
        accounts: "Accounts",
        articles: "News & Articles",
        services: "Services Management",
        appointments: "Appointment Management",
        rooms: "Examination Rooms",
        medicalRecords: "Medical Records",
        invoices: "Invoice Management"
      },
    articles: {
    pageTitle: "Article Management",
    createButton: "Create Article",
    modal: {
      createTitle: "Create New Article",
      editTitle: "Edit Article",
      title: "Title",
      titlePlaceholder: "Enter article title",
      content: "Content",
      contentPlaceholder: "Enter detailed content...",
      category: "Category",
      selectCategory: "-- Select Category --",
      author: "Author",
      authorPlaceholder: "Enter author name",
      source: "Source",
      coverImage: "Cover Image",
      chooseImage: "Choose Image",
      changeImage: "Change Image",
      imageHint: "Max 10MB, JPG, PNG, WEBP formats"
    },
    filter: {
      title: "Search title",
      titlePlaceholder: "Enter keyword...",
      category: "Category",
      allCategories: "All categories",
      fromDate: "From Date",
      toDate: "To Date",
      clearFilter: "Clear filters"
    },
    table: {
      no: "No.",
      image: "Image",
      title: "Title",
      category: "Category",
      author: "Author",
      publishedAt: "Published",
      actions: "Actions"
    },
    noArticles: "No articles found",
    categories: {
      health: "Health",
      advice: "Advice",
      treatment: "Treatment",
      warning: "Warning",
      technology: "Technology"
    },
    toast: {
      createSuccess: "Article created successfully!",
      updateSuccess: "Article updated successfully!",
      deleteSuccess: 'Article "{{title}}" deleted'
    },
    errors: {
      loadFailed: "Failed to load articles",
      saveFailed: "Failed to save article",
      deleteFailed: "Failed to delete article",
      uploadFailed: "Image upload failed",
      invalidImage: "Please select a valid image file",
      imageTooLarge: "Image size must not exceed 10MB"
    }
  },
  common: {
    loading: "Loading...",
    processing: "Processing..."
  },
  clinic: {
  title: "Clinic Information Management",
  loading: "Loading clinic information...",
  updating: "Updating information...",
  noData: "No clinic information available",
  noDataHint: "Please fill in the information below to create new.",
  saving: "Saving...",
  saveButton: "Save Information",
  
  form: {
    logo: "Clinic Logo",
    selectLogo: "Select image",
    changeLogo: "Change image",
    removeLogo: "Remove logo",
    logoPreview: "Logo preview:",
    currentLogo: "Current logo:",
    noLogo: "No logo yet. Please select an image file.",
    newBadge: "New",
    fileInfo: "File: {{name}} ({{size}} KB)",
    
    name: "Clinic Name",
    namePlaceholder: "Enter clinic name",
    address: "Address",
    addressPlaceholder: "Enter clinic address",
    phone: "Phone Number",
    phonePlaceholder: "Enter phone number",
    email: "Email",
    emailPlaceholder: "Enter clinic email",
    website: "Website",
    websitePlaceholder: "www.example.com or https://example.com",
    websiteHint: "You can enter domain (www.example.com) or full URL (https://example.com)",
    
    morningHours: "Morning Working Hours",
    afternoonHours: "Afternoon Working Hours",
    startTime: "Start Time",
    endTime: "End Time",
    hoursHint: "Leave blank if the clinic is closed during that session",
    
    createdAt: "Created At",
    updatedAt: "Last Updated"
  },
    common: {
  // ... existing keys ...
  stt: "No.",
  actions: "Actions",
  view: "View Details",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
  all: "All",
  clearFilter: "Clear Filters",
  search: "Search"
},
  toast: {
    updateSuccess: "Clinic information updated successfully!"
  },
  
  errors: {
    loadFailed: "Unable to load clinic information",
    updateFailed: "An error occurred while updating",
    invalidImage: "Please select an image file (PNG, JPG, JPEG, GIF, WebP)",
    imageTooLarge: "File size too large ({{size}}MB). Please select a file smaller than 10MB.",
    uploadFailed: "Failed to upload logo. Please try again.",
    nameRequired: "Clinic name is required",
    invalidEmail: "Invalid email address",
    morningTimeInvalid: "Morning end time must be after start time",
    afternoonTimeInvalid: "Afternoon end time must be after start time",
    timeRangeInvalid: "Morning end time must be before afternoon start time"
  }
},
servicesManagement: {
  title: "Service Management",
  createButton: "Create Service",
  searchLabel: "Search services",
  searchPlaceholder: "Enter service name...",
  category: "Category",
  status: "Status",
  priceRange: "Price Range",
  active: "Active",
  inactive: "Inactive",
  name: "Service Name",
  label: "services",
  clearFilters: "Clear Filters",
  noServices: "No services found.",

  categories: {
    consultation: "Consultation",
    test: "Diagnostic Tests",
    procedure: "Procedures"
  },

  modal: {
    createTitle: "Create New Service",
    viewTitle: "Service Details",
    editTitle: "Edit Service",
    image: "Service Image",
    chooseImage: "Choose Image",
    changeImage: "Change Image",
    maxSize: "max 10MB"
  },
common: {
   "photo": "Photo",
  "all": "All",
  "clearFilter": "Clear filter",
  "name": "Name",
  "category": "Category",
  "status": "Status",
    description: "Description",
  price: "Price",
  actions: "Actions",
   edit: "Edit",
     delete: "Delete",
       cancel: "Cancel",
       confirm: "Confirm",
  },
  toast: {
    createSuccess: "Service created successfully!",
    updateSuccess: "Service updated successfully!",
    deleteSuccess: "Service deleted successfully!",
    activated: "Service activated",
    deactivated: "Service deactivated"
  },

  error: {
    load: "Failed to load services",
    invalidImage: "Please select an image file",
    imageTooLarge: "Image must not exceed 10MB"
  },

  confirm: {
    deleteText: "Delete service \"{{name}} \"? This action cannot be undone.",
    deactivateTitle: "Deactivate service?",
    activateTitle: "Activate service?",
    toggleText: "Service: {{name}}",
     
  },

  deactivate: "Deactivate",
  activate: "Activate",
 priceRanges: {
  
    "under500k": "Under 500,000 ₫",
    "500k_1m": "500,000 ₫ - 1,000,000 ₫",
    "1m_1_5m": "1,000,000 ₫ - 1,500,000 ₫",
    "over1_5m": "Over 1,500,000 ₫"
  },
},
// ==================== THÊM VÀO resources.en.translation ====================
statistics: {
  overview: "Statistics Overview",

  // KPI Cards
  todayAppointments: "Today's Appointments",
  newRecords: "New Medical Records",
  monthRevenue: "Monthly Revenue",
  cancelRate: "Cancellation Rate",

  // Trends
  appointmentTrend: "Appointment Trend (7 Days)",
  revenueTrend: "Revenue Trend (7 Days)",

  // Top 5 services
  topServices: "Top 5 Popular Services",
  byAppointment: "By Appointments",
  byExamination: "By Examinations",
  byRevenue: "By Revenue",
},

common: {
  vsPrevious: "vs previous period",
  appointments: "Appointments",
  revenue: "Revenue",
  quantity: "Quantity",
  fromDate: "From",
  toDate: "To",
  sessionExpired: "Session expired",
  loadError: "Unable to load statistics data",
},
appointmentManagement: {
  "appointment": "appointment",
    "appointments": "appointments",
  title: "Appointment Management",
  createButton: "Create Appointment",
  createTitle: "Create New Appointment",
  viewTitle: "Appointment Details",
  editTitle: "Edit Appointment",
  editButton: "Edit",
  searchLabel: "Search",
  searchPlaceholder: "Patient name or phone number...",
  statusLabel: "Status",
  statusPending: "Pending",
  statusConfirmed: "Confirmed",
  statusCancelled: "Cancelled",
  fromDate: "From Date",
  toDate: "To Date",
  clearFilters: "Clear Filters",
  loadingList: "Loading appointment list...",
  noAppointments: "No appointments yet",
  moreServices: "services",
  noService: "No service selected",
  viewDetail: "View Details",
  patientName: "Full Name",
  namePlaceholder: "Nguyen Van A",
  nameRequired: "Please enter full name",
  phone: "Phone Number",
  phonePlaceholder: "0901234567",
  phoneRequired: "Please enter phone number",
  phoneLength: "Phone number must be exactly 10 digits",
  email: "Email (optional)",
  emailPlaceholder: "example@gmail.com",
  date: "Appointment Date",
  datePlaceholder: "Select date",
  dateRequired: "Please select appointment date",
  time: "Appointment Time",
  timeError: "Only time between 08:00–12:00 or 14:00–18:00 is allowed",
  timeInvalid: "Invalid time",
  pastTime: "Cannot book in the past. Please select a future time.",
  servicesLabel: "Services (optional)",
  searchServices: "Search services...",
  loadingServices: "Loading service list...",
  noServicesFound: "No services found",
  notes: "Notes (optional)",
  notesPlaceholder: "Symptoms, special requests...",
  confirming: "Confirming...",
  confirm: "Confirm",
  cancel: "Cancel Appointment",
  processing: "Processing...",
  saveChanges: "Save Changes",
  confirmSuccess: "Appointment confirmed successfully!",
  confirmFailed: "Confirmation failed",
  cancelSuccess: "Appointment cancelled",
  cancelFailed: "Cancellation failed",
  createSuccess: "Appointment created successfully! Code: {{code}}",
  updateSuccess: "Appointment updated successfully!",
  loadError: "Unable to load appointment list",
  loadServicesError: "Unable to load service list",
  dateRangeError: "From date must be less than or equal to To date",
  dateRangeError2: "To date must be greater than or equal to From date",
  cancelConfirmTitle: "Cancel this appointment?",
  cancelConfirmText: "The appointment will be changed to",
  cancelConfirmQuestion: "Are you sure you want to continue?",
  confirmCancel: "Confirm Cancel",
  keep: "Keep",
  table: {
    stt: "No.",
    code: "Code",
    patient: "Patient",
    phone: "Phone",
    time: "Time",
    services: "Services",
    status: "Status",
    actions: "Actions"
  }
},
roomManagement: {
  title: "Examination Room Management",
  "appointment": "appointment",
  "appointments": "appointments",
  createButton: "Add New Room",
   updateButton: "Update",
  room: "rooms",
  searchPlaceholder: "Room name or doctor name...",
  statusLabel: "Status",
  statusAvailable: "Available",
  statusOccupied: "Occupied",
  activeLabel: "Active",
  active: "Active",
  inactive: "Inactive",
  loading: "Loading room list...",
  noRooms: "No examination rooms yet",
  noDoctor: "No doctor assigned",
  noDoctorSelect: "-- No doctor assigned --",
  loadingDoctors: "Loading doctor list...",
  roomName: "Room Name",
  roomNamePlaceholder: "E.g: ENT Examination Room 1",
  doctorLabel: "Assigned Doctor (Optional)",
  activeCheckbox: "Room is active",
  nameRequired: "Please enter room name",
  createSuccess: "Room created successfully!",
  updateSuccess: "Room updated successfully!",
  deleteSuccess: "Room deleted successfully!",
  deleteError: "Cannot delete room",
  deleteConfirm: "Are you sure you want to delete this room?",
  loadError: "Unable to load room list",
  loadDoctorsError: "Unable to load doctor list",
  modal: {
    create: "Add New Examination Room",
    view: "Room Details",
    edit: "Edit Room"
  },
  table: {
    roomName: "Room Name",
    doctor: "Doctor",
    status: "Status",
    active: "Active"
  },
  confirmDelete: {
    title: "Delete Room?",
    text1: "Are you sure you want to delete the room",
    warning: "This action cannot be undone.",
    confirm: "Delete"
  },
  common: {
  // ... existing keys ...
  stt: "No.",
  actions: "Actions",
  view: "View Details",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
  all: "All",
  clearFilter: "Clear Filters",
  search: "Search"
},
},
medicalRecords: {
  title: "Medical Record History",
  allRecords: "All Records",
  recordLabel: "records",

  filters: {
    search: "Search",
    searchPlaceholder: "Patient name or diagnosis...",
    fromDate: "From Date",
    toDate: "To Date",
    clear: "Clear Filters"
  },

  table: {
    stt: "No.",
    examDate: "Examination Date",
    patient: "Patient",
    diagnosis: "Diagnosis",
    treatmentNotes: "Treatment Notes"
  },

  noResults: "No matching results found.",
  noRecords: "No medical records yet.",
  na: "N/A",
  walkInPatient: "Walk-in Patient",

  errors: {
    loadFailed: "Failed to load medical history.",
    startDateAfterEnd: "Start date must be before or equal to End date",
    endDateBeforeStart: "End date must be after or equal to Start date"
  }
},
invoices: {
      label: "invoices",
      createButton: "Create Invoice",
      loading: "Loading invoice list...",
      noInvoices: "No invoices yet",
      noResults: "No invoices found matching your filters",
      tryDifferentFilter: "Try different filters",
      createFirstInvoice: "Please create the first invoice",

      filters: {
        search: "Search",
        searchPlaceholder: "Patient name, phone number...",
        status: "Status",
        allStatus: "All statuses",
        paid: "Paid",
        pending: "Pending / Partial",
        unpaidOnly: "Unpaid only",
        clear: "Clear filters"
      },

      table: {
        stt: "No.",
        invoiceCode: "Invoice Code",
        patient: "Patient",
        createdDate: "Created Date",
        totalAmount: "Total Amount",
        status: "Status",
        actions: "Actions"
      },

      status: {
        paid: "Paid",
        pending: "Pending",
        partiallyPaid: "Partially Paid"
      },

      tooltips: {
        viewDetail: "View Details",
        pay: "Receive Payment"
      },

  modal: {
       "title": "Invoice Details",
    "code": "Code",
    "patient": "Patient",
    "noPatientName": "No name",
    "noPhone": "No phone",
    "invoiceInfo": "Invoice Information",
    "createdDate": "Created Date",
    "status": "Status",
    "servicesAndCosts": "Services & Costs",
    "addService": "Add Service",
    "saving": "Saving...",
    "atLeastOneService": "Invoice must have at least one service",
    "missingServiceInfo": "Some services are missing information. Please check again.",
    "updateSuccess": "Invoice updated successfully!",
    "serviceAlreadyExists": "Service already exists in invoice",
    "addedService": "Added",
    "searchServicePlaceholder": "Search service...",
    "loadingServices": "Loading services...",
    "noServiceFound": "No service found",
    "noServices": "No services yet",
    "remaining": "Remaining",
    "total": "Total Amount",
    "paid": "Paid",
    "payNow": "Pay Now",
    "statusMap": {
      "pending": "Pending",
      "paid": "Paid",
      "partiallyPaid": "Partially Paid"
    }
  },
  common: {
  // ... các key hiện tại
  close: "Close",  // ← THÊM
  cancel: "Cancel",
  save: "Save",
  edit: "Edit",
  // ...
},
      errors: {
        loadFailed: "Failed to load invoice list"
      }
      
    },
createInvoice: {
  title: "Create New Invoice",
  subtitle: "Quickly create invoice for patient",
  selectPatient: "Search & Select Patient",
  searchPlaceholder: "Enter name or phone number...",
  noPatientFound: "No patient found",
  selectServices: "Select Services",
  added: "Added",
  selectedServices: "Selected Services ({{count}})",
  paymentMethod: "Payment Method",
  totalAmount: "Total Amount",
  creating: "Creating...",
  createButton: "Create Invoice",
  
  paymentMethods: {
    cash: "Cash",
    card: "Credit/Debit Card",
    transfer: "Bank Transfer"
  },
  common: {
  // ... các key hiện tại
  close: "Close",  // ← THÊM
  cancel: "Cancel",
  save: "Save",
  edit: "Edit",
  // ...
},
  errors: {
    loadFailed: "Failed to load data",
    noRecord: "Medical record not found",
    selectPatient: "Please select a patient",
    selectService: "Please select at least 1 service",
    createFailed: "Failed to create invoice"
  },
  
  success: "Invoice created successfully!"
},
// Thêm vào cuối phần translation của tiếng Anh (trước dấu ngoặc đóng cuối)
queueManagement: {
  title: "Queue Management",
  noQueue: "No patients in queue yet",
  noQueueNumber: "—",
  notAssigned: "Assigning room...",
  unknown: "Unknown",
  
  table: {
    stt: "No.",
    queueCode: "Queue Code",
    patient: "Patient",
    dob: "Date of Birth",
    contact: "Contact",
    room: "Examination Room",
    priority: "Priority",
    status: "Status",
    checkIn: "Check-in",
    actions: "Actions"
  },
    filters: {
    search: "Search",
    searchPlaceholder: "Enter phone number...",
    status: "Status",
    allStatus: "All statuses",
    clear: "Clear filters"
  },
  priority: {
    normal: "Normal",
    urgent: "Urgent",
    emergency: "Emergency"
  },
  
  status: {
    waiting: "Waiting",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled"
  },
  patientForm: {
    addTitle: "Add New Patient",
    editTitle: "Edit Patient Information",
    viewTitle: "Patient Details",
    editButton: "Edit",
    
    patientName: "Patient Name",
    namePlaceholder: "Enter full name",
    phone: "Phone Number",
    phonePlaceholder: "e.g., 0912345678",
    email: "Email",
    emailPlaceholder: "example@email.com",
    dob: "Date of Birth",
    
    gender: {
      label: "Gender",
      male: "Male",
      female: "Female",
      other: "Other"
    },
    
    priority: "Priority Level",
    idNumber: "ID Number / Citizen ID",
    idPlaceholder: "e.g., 001234567890",
    insurance: "Health Insurance Number",
    insurancePlaceholder: "e.g., HS4010012345678",
    address: "Address",
    addressPlaceholder: "Enter full address",
    notes: "Symptoms / Notes",
    notesPlaceholder: "Describe symptoms or reason for visit...",
    
    addButton: "Add Patient",
    updateButton: "Update",
    cancelButton: "Cancel"
  },
  actions: {
    view: "View Details",
    edit: "Edit"
  },
  
  doctor: "Dr. {{name}}"
},
patientRecords: {
  title: "Patient Management",
  label: "patients",
  addButton: "Add Patient",
  loading: "Loading patient list...",
  
  stats: {
    total: "Total"
  },
  
  confirmDelete: "Are you sure you want to delete this patient?",
  
  toast: {
    deleteSuccess: "Patient deleted successfully!",
    deleteFailed: "Cannot delete patient!",
    updateSuccess: "Patient updated successfully!",
    addSuccess: "Patient added successfully!",
    addSuccessWithRoom: "Patient added!\nRoom: {{room}}{{doctor}}",
    statusUpdateSuccess: "Status updated successfully!",
    statusUpdateFailed: "Failed to update status!"
  },
  
  errors: {
    loadFailed: "Cannot load patient list",
    loadPatientFailed: "Cannot load patient information!",
    phoneInvalid: "Phone number must be exactly 10 digits!",
    nameRequired: "Please enter patient name!",
    dobRequired: "Please select date of birth!",
    submitFailed: "An error occurred!"
  }
},
receptionSidebar: {
  appointments: "Appointments",
  records: "Patient Records",
  rooms: "Room Management",
  invoices: "Invoices"
},
doctorStats: {
  header: {
    subtitle: "Performance Statistics",
    title: "Doctor – Examination Report"
  },
  range: {
    day: "Day",
    week: "Week",
    month: "Month"
  },
  kpi: {
    totalVisits: {
      title: "Total Examinations",
      unit: "cases",
      subtitle: "Completed cases"
    },
    avgTime: {
      title: "Average Examination Time",
      unit: "mins/case",
      subtitle: "Based on actual data",
      noData: "No data yet"
    },
    completionRate: {
      title: "Completion Rate",
      subtitle: "Compared to schedule"
    }
  },
  chart: {
    visitsByPeriod: "Examinations by {{#if (eq context 'hour')}}hour{{else}}day{{/if}}",
    trend: "Examination Trend"
  },
  table: {
    title: "Statistics Table by Time Slot",
    time: "Time",
    visits: "Cases",
    change: "% Change",
    note: "Note"
  },
  loading: "Loading statistics data...",
  empty: {
    title: "No Data",
    message: "No statistics available for the selected period."
  },
  error: {
    title: "Data Load Error",
    retry: "Retry",
    noPermission: "You do not have permission to view statistics. Only doctors are allowed.",
    noDoctorInfo: "Doctor information not found",
    loadFailed: "Unable to load statistics data"
  }
},
doctorSidebar: {
  stats: "Statistics",
  currentPatient: "Current Patient",
  records: "Medical Records",
  history: "Examination History",
  invoices: "Invoices"
},
doctorExamination: {
  tabExamination: "Examination & Prescription",
  tabServices: "Service Indications",

  queueNumber: "Queue No.",
  checkInTime: "Checked in at",
  symptomsTitle: "Symptoms / Reason for visit",
  noSymptoms: "No notes from receptionist yet",

  waitingQueueTitle: "Next in queue",
  nextPatientBadge: "Next",
  noPatientsInQueue: "No more patients",

  diagnosisLabel: "Diagnosis",
  diagnosisRequired: "Please enter diagnosis",
  treatmentNotesLabel: "Treatment notes",
  prescriptionTitle: "Prescription",
  drugName: "DRUG NAME",
  instructions: "INSTRUCTIONS",
  drugPlaceholder: "E.g: Paracetamol 500mg (10 tablets)",
  instructionsPlaceholder: "E.g: Take 1 tablet 3 times daily after meals",
  addDrug: "Add new drug",
  prescriptionPreviewTitle: "Current prescription:",
  completeButton: "Complete Examination",
  processing: "Processing...",

  searchServicePlaceholder: "Search services...",
  selectedServicesTitle: "Selected services",
  totalAmount: "Total:",

  callNextPatient: "Call Next Patient",
  calling: "Calling...",

  serviceAdded: "Added:",
  serviceRemoved: "Removed:",
  completeSuccess: "Examination completed successfully!",
  callNextSuccess: "Next patient called!",
  noMorePatients: "No more patients in queue",
  invoiceCreated: "Invoice created successfully: {{code}}",
  drugInstructionsRequired: "Please enter usage instructions for all drugs",
  drugNameRequired: "Please enter drug name",

  noPatientTitle: "My Clinic",
  patientsWaiting: "{{count}} patients waiting",
  noPatientsToday: "No patients yet",
  waitingForNext: "Waiting for next patient...",
  queueTitle: "Examination Queue"
},
doctorRecords: {
  title: "Medical Records & Complete Examination",
  listTitle: "Created Records",
  noRecords: "No records yet. Click \"Create New Record\" to complete an examination.",
  noResults: "No records match the current filters.",
  errors: {
    loadFailed: "Failed to load medical records"
  },
  filters: {
    keyword: "Search Keyword",
    keywordPlaceholder: "Enter patient name, phone...",
    fromDate: "From Date",
    toDate: "To Date",
    clear: "Clear Filters"
  },
  table: {
    patient: "Patient Name",
    diagnosis: "Diagnosis",
    treatmentNotes: "Treatment Notes"
  },
  create: {
    success: "Examination completed and record saved!",
    failed: "Failed to create medical record",
    diagnosisRequired: "Diagnosis is required",
    treatmentNotesRequired: "Treatment notes are required"
  },
  common: {
  // ... existing keys ...
  stt: "No.",
  actions: "Actions",
  view: "View Details",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
  all: "All",
  clearFilter: "Clear Filters",
  search: "Search"
},
modal: {
    title: "Edit Medical Record",
    pdfTitle: "Export Medical Record as PDF",
    pdfButton: "PDF Record",
    pdfExporting: "Exporting...",
    pdfSuccess: "PDF exported successfully!",
    pdfFailed: "Export failed: ",
    patientName: "Patient Name",
    diagnosis: "Diagnosis",
    diagnosisPlaceholder: "Enter diagnosis...",
    treatmentNotes: "Treatment Notes",
    treatmentNotesPlaceholder: "Enter treatment notes...",
    prescriptionTitle: "Prescription",
    prescriptionDrugs: "Prescription List",
    prescriptionDrugsPlaceholder: "Enter drugs (one per line)...",
    prescriptionInstructions: "Usage Instructions",
    prescriptionInstructionsPlaceholder: "Enter usage instructions...",
    prescriptionIssuedAt: "Prescription issued on: {{date}}",
    createdAt: "Medical record created on: {{date}}",
    saveButton: "Save Changes"
  },
},
}
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    lng: localStorage.getItem('language') || 'vi',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;