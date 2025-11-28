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
        updateInfo: "Vui lòng cập nhật thông tin trong trang quản trị",
        profile: "Hồ Sơ Cá Nhân",
  security: "Bảo Mật & 2FA",
  logout: "Đăng Xuất",
  language: "Ngôn ngữ"
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
//admin sidebar
adminSidebar: {
        title: "Quản Trị Hệ Thống",
        
        statistics: "Thống Kê",
        revenue: "Doanh Thu",
        clinic: "Thông Tin Phòng Khám",
        doctors: "Quản Lý Bác Sĩ",
        staff: "Quản Lý Nhân Sự",
        patients: "Danh Sách Bệnh Nhân",
        services: "Quản Lý Dịch Vụ",
        articles: "Quản Lý Tin Tức",
        invoices: "Hóa Đơn & Thanh Toán",
        medicine: "Quản Lý Thuốc",
        accounts: "Tài Khoản Người Dùng",
      },
      admin: {
      common: {
        loading: "Đang tải...",
        noData: "Không có dữ liệu",
        search: "Tìm kiếm",
        all: "Tất cả",
        clearFilters: "Xóa bộ lọc",
        save: "Lưu thay đổi",
        create: "Tạo mới",
        edit: "Chỉnh sửa",
        view: "Xem chi tiết",
        cancel: "Hủy",
        confirm: "Xác nhận",
        delete: "Xóa",
        active: "Hoạt động",
        inactive: "Vô hiệu hóa",
        processing: "Đang xử lý...",
        success: "Thành công!",
        error: "Có lỗi xảy ra!"
      },

      // Trang Quản Lý Tài Khoản
      accounts: {
        pageTitle: "Quản Lý Tài Khoản",
        createButton: "Tạo tài khoản mới",
        searchPlaceholder: "Tìm theo tên, email, số điện thoại...",
        filterRole: "Vai trò",
        filterStatus: "Trạng thái",
        noAccounts: "Không tìm thấy tài khoản nào",

        table: {
          no: "STT",
          avatar: "Ảnh đại diện",
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
          editTitle: "Chỉnh sửa tài khoản",
          viewTitle: "Chi tiết tài khoản",
          switchToEdit: "Chuyển sang chỉnh sửa",
          avatar: "Ảnh đại diện",
          changePhoto: "Thay đổi ảnh",
          choosePhoto: "Chọn ảnh",
          email: "Email",
          password: "Mật khẩu",
          passwordHint: "Để trống nếu không muốn thay đổi",
          fullName: "Họ và tên",
          phone: "Số điện thoại",
          dob: "Ngày sinh",
          gender: "Giới tính",
          address: "Địa chỉ",
          experienceYears: "Số năm kinh nghiệm",
          bio: "Giới thiệu bản thân",
          role: "Vai trò"
        },

        toast: {
          createSuccess: "Tạo tài khoản thành công!",
          updateSuccess: "Cập nhật tài khoản thành công!",
          toggleActive: "Tài khoản đã được kích hoạt!",
          toggleInactive: "Tài khoản đã bị vô hiệu hóa!",
          invalidImage: "Vui lòng chọn file ảnh hợp lệ",
          loadError: "Không thể tải danh sách tài khoản"
        },

        confirmToggle: {
          activate: "Kích hoạt tài khoản?",
          deactivate: "Vô hiệu hóa tài khoản?",
          activateDesc: "Tài khoản sẽ được phép đăng nhập lại.",
          deactivateDesc: "Tài khoản sẽ không thể đăng nhập nữa."
        },

        gender: { male: "Nam", female: "Nữ", other: "Khác" },
        role: { 
          admin: "Quản trị viên", 
          bac_si: "Bác sĩ", 
          tiep_tan: "Tiếp tân" 
        }
      },
      statistics: {
    pageTitle: "Thống kê tổng quan",
    reportSummary: "Báo cáo tổng hợp",
    range: { day: "Ngày", week: "Tuần", month: "Tháng", custom: "Tùy chỉnh" },
    kpi: {
      appointmentsToday: "Lịch hẹn hôm nay",
      newRecords: "Hồ sơ bệnh án mới",
      monthlyRevenue: "Doanh thu tháng",
      cancelRate: "Tỷ lệ hủy lịch"
    },
    comparedToPrevious: "so với kỳ trước",
    charts: { appointmentTrend: "Xu hướng lịch hẹn", revenueTrend: "Xu hướng doanh thu" },
    appointments: "lịch hẹn",
    times: "lượt",
    topServices: {
      title: "Top 5 Dịch vụ phổ biến",
      byAppointment: "Theo đặt lịch",
      byExamination: "Theo khám thực tế",
      byRevenue: "Theo doanh thu"
    },
    errors: {
      title: "Đã xảy ra lỗi",
      noToken: "Không tìm thấy token đăng nhập",
      unauthorized: "Phiên đăng nhập hết hạn",
      loadFailed: "Không thể tải dữ liệu thống kê"
    }
  },
  clinic: {
    pageTitle: "Quản lý Thông tin Phòng khám",
    noData: { title: "Chưa có thông tin phòng khám", desc: "Vui lòng điền thông tin để tạo mới." },
    form: {
      name: "Tên phòng khám",
      address: "Địa chỉ",
      phone: "Số điện thoại",
      email: "Email liên hệ",
      website: "Website",
      logo: "Logo phòng khám"
    },
    placeholder: { name: "Phòng khám ABC", address: "123 Đường Láng, Hà Nội" },
    websiteHint: "Nhập domain hoặc URL đầy đủ (sẽ tự thêm http:// nếu thiếu)",
    changeLogo: "Đổi ảnh logo",
    chooseLogo: "Chọn ảnh logo",
    noLogo: "Chưa có logo",
    createdAt: "Ngày tạo",
    updatedAt: "Cập nhật lần cuối"
  },
  errors: {
    loadFailed: "Không thể tải thông tin phòng khám",
    invalidImage: "Vui lòng chọn file ảnh hợp lệ",
    fileTooLarge: "File quá lớn (tối đa 10MB)",
    nameRequired: "Tên phòng khám không được để trống",
    updateFailed: "Cập nhật thất bại"
  },
  success: { updated: "Cập nhật thông tin phòng khám thành công!" },
    articles: {
    pageTitle: "Quản lý Bài viết",
    createButton: "Tạo bài viết mới",
    loading: "Đang tải danh sách...",
    noArticles: "Không tìm thấy bài viết nào",
    
    filter: {
      title: "Tiêu đề",
      titlePlaceholder: "Tìm theo tiêu đề...",
      category: "Danh mục",
      allCategories: "Tất cả",
      fromDate: "Từ ngày",
      toDate: "Đến ngày",
      clearFilter: "Xóa lọc"
    },
    categories: {
  health: "Sức khỏe",
  advice: "Tư vấn",
  treatment: "Điều trị",
  warning: "Cảnh báo",
  technology: "Công nghệ"
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
    
    modal: {
      createTitle: "Tạo bài viết mới",
      editTitle: "Chỉnh sửa bài viết",
      title: "Tiêu đề",
      titlePlaceholder: "Nhập tiêu đề bài viết",
      content: "Nội dung",
      contentPlaceholder: "Nhập nội dung bài viết",
      category: "Danh mục",
      selectCategory: "-- Chọn danh mục --",
      author: "Tác giả",
      authorPlaceholder: "Tên tác giả",
      source: "Nguồn (tùy chọn)",
      coverImage: "Ảnh bìa",
      changeImage: "Thay đổi ảnh",
      chooseImage: "Chọn ảnh",
      imageHint: "JPG, PNG, GIF – Tối đa 10MB",
      processing: "Đang xử lý...",
      createButton: "Tạo bài viết",
      updateButton: "Cập nhật"
    },
    
    toast: {
      createSuccess: "Tạo bài viết thành công!",
      updateSuccess: "Cập nhật bài viết thành công!",
      deleteSuccess: "Xóa bài viết thành công!"
    },
    
    errors: {
      loadFailed: "Không thể tải danh sách bài viết",
      invalidImage: "Vui lòng chọn file ảnh hợp lệ",
      imageTooLarge: "Kích thước ảnh không được vượt quá 10MB",
      uploadFailed: "Upload ảnh thất bại",
      saveFailed: "Có lỗi khi lưu bài viết",
      deleteFailed: "Không thể xóa bài viết"
    }

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
        updateInfo: "Please update information in admin panel",
        profile: "Profile",
  security: "Security & 2FA",
  logout: "Log Out",
  language: "Language",
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
//admin sidebar
adminSidebar: {
        title: "Admin Dashboard",

        statistics: "Statistics",
        revenue: "Revenue",
        clinic: "Clinic Information",
        doctors: "Doctors Management",
        staff: "Staff Management",
        patients: "Patients List",
        services: "Services Management",
        articles: "News & Articles",
        invoices: "Invoices & Payments",
        medicine: "Medicine Inventory",
        accounts: "User Accounts",
      },
    admin: {
      common: {
        loading: "Loading...",
        noData: "No data available",
        search: "Search",
        all: "All",
        clearFilters: "Clear filters",
        save: "Save Changes",
        create: "Create New",
        edit: "Edit",
        view: "View Details",
        cancel: "Cancel",
        confirm: "Confirm",
        delete: "Delete",
        active: "Active",
        inactive: "Inactive",
        processing: "Processing...",
        success: "Success!",
        error: "An error occurred!"
      },

      accounts: {
        pageTitle: "Account Management",
        createButton: "Create New Account",
        searchPlaceholder: "Search by name, email, phone...",
        filterRole: "Role",
        filterStatus: "Status",
        noAccounts: "No accounts found",

        table: {
          no: "No.",
          avatar: "Avatar",
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
          editTitle: "Edit Account",
          viewTitle: "Account Details",
          switchToEdit: "Switch to Edit Mode",
          avatar: "Profile Picture",
          changePhoto: "Change Photo",
          choosePhoto: "Choose Photo",
          email: "Email",
          password: "Password",
          passwordHint: "Leave blank to keep current password",
          fullName: "Full Name",
          phone: "Phone Number",
          dob: "Date of Birth",
          gender: "Gender",
          address: "Address",
          experienceYears: "Years of Experience",
          bio: "Bio / Introduction",
          role: "Role"
        },

        toast: {
          createSuccess: "Account created successfully!",
          updateSuccess: "Account updated successfully!",
          toggleActive: "Account activated!",
          toggleInactive: "Account deactivated!",
          invalidImage: "Please select a valid image file",
          loadError: "Failed to load account list"
        },

        confirmToggle: {
          activate: "Activate account?",
          deactivate: "Deactivate account?",
          activateDesc: "The account will be able to log in again.",
          deactivateDesc: "The account will no longer be able to log in."
        },

        gender: { male: "Male", female: "Female", other: "Other" },
        role: { 
          admin: "Administrator", 
          bac_si: "Doctor", 
          tiep_tan: "Receptionist" 
        }
      },
      statistics: {
        pageTitle: "Overview Statistics",
        reportSummary: "Summary Report",
        range: { day: "Day", week: "Week", month: "Month", custom: "Custom Range" },
        kpi: {
          appointmentsToday: "Today's Appointments",
          newRecords: "New Medical Records",
          monthlyRevenue: "Monthly Revenue",
          cancelRate: "Cancellation Rate"
        },
        comparedToPrevious: "vs previous period",
        charts: { appointmentTrend: "Appointment Trend", revenueTrend: "Revenue Trend" },
        appointments: "appointments",
        times: "times",
        topServices: {
          title: "Top 5 Most Popular Services",
          byAppointment: "By Bookings",
          byExamination: "By Actual Visits",
          byRevenue: "By Revenue"
        },
        errors: {
          title: "An Error Occurred",
          noToken: "Login token not found",
          unauthorized: "Session expired or insufficient permissions",
          loadFailed: "Failed to load statistics data"
        }
      },
      clinic: {
    pageTitle: "Clinic Information Management",
    noData: { title: "No clinic information yet", desc: "Please fill in the details below to create." },
    form: {
      name: "Clinic Name",
      address: "Address",
      phone: "Phone Number",
      email: "Contact Email",
      website: "Website",
      logo: "Clinic Logo"
    },
    placeholder: { name: "ABC Clinic", address: "123 Lang Road, Hanoi" },
    websiteHint: "Enter domain or full URL (http:// will be added automatically if missing)",
    changeLogo: "Change logo",
    chooseLogo: "Choose logo",
    noLogo: "No logo uploaded",
    createdAt: "Created At",
    updatedAt: "Last Updated"
  },
  errors: {
    loadFailed: "Failed to load clinic information",
    invalidImage: "Please select a valid image file",
    fileTooLarge: "File too large (max 10MB)",
    nameRequired: "Clinic name is required",
    updateFailed: "Update failed"
  },
  success: { updated: "Clinic information updated successfully!" },
   articles: {
    pageTitle: "Article Management",
    createButton: "Create New Article",
    loading: "Loading articles...",
    noArticles: "No articles found",
    
    filter: {
      title: "Title",
      titlePlaceholder: "Search by title...",
      category: "Category",
      allCategories: "All Categories",
      fromDate: "From Date",
      toDate: "To Date",
      clearFilter: "Clear Filter"
    },
    categories: {
  health: "Health",
  advice: "Consultation & Advice",
  treatment: "Treatment",
  warning: "Warning",
  technology: "Technology"
},
    table: {
      no: "No.",
      image: "Image",
      title: "Title",
      category: "Category",
      author: "Author",
      publishedAt: "Published Date",
      actions: "Actions"
    },
    
    modal: {
      createTitle: "Create New Article",
      editTitle: "Edit Article",
      title: "Title",
      titlePlaceholder: "Enter article title",
      content: "Content",
      contentPlaceholder: "Enter article content",
      category: "Category",
      selectCategory: "-- Select Category --",
      author: "Author",
      authorPlaceholder: "Author name",
      source: "Source (Optional)",
      coverImage: "Cover Image",
      changeImage: "Change Image",
      chooseImage: "Choose Image",
      imageHint: "JPG, PNG, GIF – Max 10MB",
      processing: "Processing...",
      createButton: "Create Article",
      updateButton: "Update"
    },
    
    toast: {
      createSuccess: "Article created successfully!",
      updateSuccess: "Article updated successfully!",
      deleteSuccess: "Article deleted successfully!"
    },
    
    errors: {
      loadFailed: "Failed to load articles",
      invalidImage: "Please select a valid image file",
      imageTooLarge: "Image size must not exceed 10MB",
      uploadFailed: "Image upload failed",
      saveFailed: "Error saving article",
      deleteFailed: "Failed to delete article"
    }
  },
    }
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