import AppointmentForm from '../components/AppointmentForm';
import Footer from '../components/Footer';

export default function AppointmentPage() {
  return (
    <div className="pt-20">
      <div className="pb-16">
        <AppointmentForm />
      </div>
      <Footer />
    </div>
  );
}