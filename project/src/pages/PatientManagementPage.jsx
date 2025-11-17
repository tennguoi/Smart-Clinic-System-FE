import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import PatientList from '../components/PatientList';
import PatientForm from '../components/PatientForm';
import PatientDetail from '../components/PatientDetail';

const PatientManagementPage = () => {
  const { t } = useTranslation();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Handle add new patient
  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  // Handle edit patient
  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
    setShowDetail(false); // Close detail view if open
  };

  // Handle view patient detail
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowDetail(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  // Handle close detail
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedPatient(null);
  };

  // Handle save patient (create or update)
  const handleSavePatient = (savedPatient) => {
    console.log('Patient saved:', savedPatient);
    // The PatientList component will reload automatically
    // You might want to show a success message here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('patientManagement.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin bệnh nhân và hồ sơ y tế
          </p>
        </div>

        <PatientList
          onAddPatient={handleAddPatient}
          onEditPatient={handleEditPatient}
          onViewPatient={handleViewPatient}
        />

        {/* Patient Form Modal */}
        {showForm && (
          <PatientForm
            patient={editingPatient}
            onClose={handleCloseForm}
            onSave={handleSavePatient}
          />
        )}

        {/* Patient Detail Modal */}
        {showDetail && selectedPatient && (
          <PatientDetail
            patient={selectedPatient}
            onClose={handleCloseDetail}
            onEdit={handleEditPatient}
          />
        )}
      </div>
    </div>
  );
};

export default PatientManagementPage;
