import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FileDown, CalendarDays, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast";
import adminStatisticsApi from "../../api/adminStatisticsApi";

const RANGE_OPTIONS = [
  { label: "Ngày", value: "day", en: "Day" },
  { label: "Tuần", value: "week", en: "Week" },
  { label: "Tháng", value: "month", en: "Month" },
  { label: "Tùy chỉnh", value: "custom", en: "Custom" },
];

const AdminExportExcel = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const currentLang = i18n.language;

  const [rangeType, setRangeType] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Derived startDate and endDate
  const { startDate, endDate, period } = useMemo(() => {
    let start = new Date(selectedDate);
    let end = new Date(selectedDate);
    let periodType = "month";

    if (rangeType === "day") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      periodType = "day";
    } else if (rangeType === "week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      periodType = "week";
    } else if (rangeType === "month") {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      periodType = "month";
    } else if (rangeType === "custom") {
      start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      periodType = "month"; // Default period for custom range
    }

    const formatDate = (date) => {
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().split("T")[0];
    };

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
      period: periodType,
    };
  }, [rangeType, selectedDate, customStartDate, customEndDate]);

  const datePickerConfig = useMemo(() => {
    if (rangeType === "month")
      return {
        showMonthYearPicker: true,
        dateFormat: currentLang === "vi" ? "MM/yyyy" : "MM/yyyy",
      };
    if (rangeType === "week")
      return {
        showWeekNumbers: true,
        dateFormat:
          currentLang === "vi" ? "'Tuần' ww, yyyy" : "'Week' ww, yyyy",
      };
    return { dateFormat: "dd/MM/yyyy" };
  }, [rangeType, currentLang]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {
        period: rangeType === "custom" ? undefined : period,
        date: rangeType === "custom" ? undefined : startDate,
        startDate: rangeType === "custom" ? startDate : undefined,
        endDate: rangeType === "custom" ? endDate : undefined,
      };

      // Remove undefined values
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const blob = await adminStatisticsApi.exportStatisticsToExcel(params);

      // Tạo URL từ blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Tạo tên file dựa trên khoảng thời gian
      let fileName = "ThongKe.xlsx";
      if (rangeType === "custom") {
        fileName = `ThongKe_${startDate}_${endDate}.xlsx`;
      } else if (rangeType === "day") {
        fileName = `ThongKe_Ngay_${startDate.replace(/-/g, "")}.xlsx`;
      } else if (rangeType === "week") {
        fileName = `ThongKe_Tuan_${startDate.replace(/-/g, "")}.xlsx`;
      } else if (rangeType === "month") {
        fileName = `ThongKe_Thang_${startDate.substring(0, 7).replace(/-/g, "")}.xlsx`;
      }

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Giải phóng URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success(
        t("statistics.exportSuccess", {
          defaultValue: "Xuất file Excel thành công!",
        })
      );
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t("statistics.exportError", {
          defaultValue: "Không thể xuất file Excel. Vui lòng thử lại.",
        });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <header
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        } p-6 shadow-sm transition-colors duration-300`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`rounded-full p-3 ${
              isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"
            }`}
          >
            <FileDown className="h-6 w-6" />
          </div>
          <div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t("statistics.export", { defaultValue: "Xuất thống kê" })}
            </p>
            <h2
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {t("statistics.exportExcel", {
                defaultValue: "Xuất báo cáo Excel",
              })}
            </h2>
          </div>
        </div>
      </header>

      {/* Export Form */}
      <div
        className={`rounded-2xl border ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        } p-6 shadow-sm transition-colors duration-300`}
      >
        <div className="space-y-6">
          {/* Range Type Selection */}
          <div>
            <label
              className={`block text-sm font-semibold mb-3 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("statistics.periodType", {
                defaultValue: "Loại thống kê",
              })}
            </label>
            <div
              className={`flex flex-wrap gap-2 rounded-lg p-1 ${
                isDark ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRangeType(option.value)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    option.value === rangeType
                      ? `${
                          isDark
                            ? "bg-gray-600 text-green-300"
                            : "bg-white text-green-600"
                        } shadow`
                      : `${
                          isDark
                            ? "text-gray-400 hover:text-gray-200"
                            : "text-gray-500 hover:text-gray-700"
                        }`
                  }`}
                >
                  {currentLang === "vi" ? option.label : option.en}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label
              className={`block text-sm font-semibold mb-3 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("statistics.selectDate", {
                defaultValue: "Chọn thời gian",
              })}
            </label>
            <div
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 shadow-sm ${
                isDark
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <CalendarDays className="h-5 w-5 text-green-600" />
              {rangeType === "custom" ? (
                <div className="flex items-center gap-2 flex-1">
                  <DatePicker
                    selected={customStartDate}
                    onChange={(date) => date && setCustomStartDate(date)}
                    className={`flex-1 bg-transparent text-sm font-semibold focus:outline-none ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                    dateFormat="dd/MM/yyyy"
                    placeholderText={t("common.fromDate", {
                      defaultValue: "Từ ngày",
                    })}
                    calendarClassName={`rounded-xl border shadow-lg ${
                      isDark
                        ? "border-gray-700 bg-gray-800 text-white"
                        : "border-gray-200 bg-white"
                    }`}
                  />
                  <span className={isDark ? "text-gray-400" : "text-gray-400"}>
                    -
                  </span>
                  <DatePicker
                    selected={customEndDate}
                    onChange={(date) => date && setCustomEndDate(date)}
                    className={`flex-1 bg-transparent text-sm font-semibold focus:outline-none ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                    dateFormat="dd/MM/yyyy"
                    placeholderText={t("common.toDate", {
                      defaultValue: "Đến ngày",
                    })}
                    minDate={customStartDate}
                    calendarClassName={`rounded-xl border shadow-lg ${
                      isDark
                        ? "border-gray-700 bg-gray-800 text-white"
                        : "border-gray-200 bg-white"
                    }`}
                  />
                </div>
              ) : (
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  className={`flex-1 bg-transparent text-sm font-semibold focus:outline-none ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                  calendarClassName={`rounded-xl border shadow-lg ${
                    isDark
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-200 bg-white"
                  }`}
                  {...datePickerConfig}
                />
              )}
            </div>
          </div>

          {/* Date Range Info */}
          <div
            className={`rounded-lg p-4 ${
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span className="font-semibold">
                {t("statistics.exportRange", { defaultValue: "Khoảng thời gian:" })}
              </span>{" "}
              {new Date(startDate).toLocaleDateString(
                currentLang === "vi" ? "vi-VN" : "en-US",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              )}{" "}
              -{" "}
              {new Date(endDate).toLocaleDateString(
                currentLang === "vi" ? "vi-VN" : "en-US",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              )}
            </p>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:scale-95"
            } shadow-sm`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>
                  {t("statistics.exporting", {
                    defaultValue: "Đang xuất file...",
                  })}
                </span>
              </>
            ) : (
              <>
                <FileDown className="h-5 w-5" />
                <span>
                  {t("statistics.exportExcel", {
                    defaultValue: "Xuất file Excel",
                  })}
                </span>
              </>
            )}
          </button>

          {/* Info Box */}
          <div
            className={`rounded-lg p-4 border ${
              isDark
                ? "bg-blue-900/20 border-blue-800 text-blue-300"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <p className="text-sm">
              <span className="font-semibold">
                {t("statistics.exportInfo", {
                  defaultValue: "Thông tin:",
                })}
              </span>{" "}
              {t("statistics.exportDescription", {
                defaultValue:
                  "File Excel sẽ chứa 5 sheet: Tổng quan, Doanh thu theo ngày, Top dịch vụ, Lịch hẹn theo ngày, và Hồ sơ bệnh án hoàn thành.",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExportExcel;