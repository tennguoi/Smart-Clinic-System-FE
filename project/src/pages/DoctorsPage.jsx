import { useEffect, useState } from 'react';
import { getDoctors } from '../api/doctorApi';
import DoctorsSection from '../components/DoctorsSection';
import Footer from '../components/Footer';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    getDoctors()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setDoctors(arr);
      })
      .catch((e) => setErr(e.message || 'Error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center">Đang tải bác sĩ...</div>;
  }

  if (err) {
    return <div className="py-20 text-center text-red-600">Lỗi: {err}</div>;
  }

  return (
    <div className="bg-gradient-to-b from-white via-cyan-50/30 to-white">
      <section className="bg-gradient-to-br from-cyan-50 via-white to-emerald-50 -mt-4 sm:-mt-6 lg:-mt-8 pt-10 sm:pt-12 lg:pt-14 pb-10 shadow-[0_25px_50px_-25px_rgba(15,118,110,0.15)]">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Gặp gỡ các bác sĩ thông minh</h1>
          <p className="text-gray-600 text-lg">
            Danh sách được cập nhật theo thời gian thực, giúp bạn đặt lịch đúng bác sĩ chỉ với một cú click.
          </p>
        </div>
      </section>

      <DoctorsSection doctors={doctors} showHeading={false} />
      <Footer />
    </div>
  );
}
// src/pages/DoctorsPage.jsx