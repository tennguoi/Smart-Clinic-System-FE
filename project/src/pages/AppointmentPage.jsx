import AppointmentForm from '../components/AppointmentForm';
import Footer from '../components/Footer';

export default function AppointmentPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="pb-16">
        <AppointmentForm />
      </div>
      <Footer />
    </div>
  );
}