// src/pages/DoctorsPage.jsx
import { useEffect, useState } from 'react';
import { getDoctors } from "../api/doctorApi";
import DoctorsSection from '../components/DoctorsSection';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    getDoctors()
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setDoctors(arr);
      })
      .catch(e => setErr(e.message || 'Error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center">Đang tải bác sĩ...</div>;
  if (err) return <div className="py-20 text-center text-red-600">Lỗi: {err}</div>;

  return <DoctorsSection doctors={doctors} />;
}