import React, { useState } from 'react';
import '../assets/styles/pages/Dashboard.css';
import Modal from '../components/Modal';
import AddExpenseForm from '../components/AddExpenseForm';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="content">
          <h2>Welcome to your Dashboard</h2>
          <p>Here's where you can manage your finances, groups, and settings.</p>
          <div className="grid-container">
            <div className="grid-item first-grid">
              <h3>Dashboard</h3>
              <div className="button-container">
                <button className="orange-button" onClick={openModal}>Add an expense</button>
                <button className="green-button">Settle up</button>
              </div>
            </div>
            <div className="grid-item second-grid">
              <div><p>Total balance</p><p>0</p></div>
              <div><p>You owe</p><p>0</p></div>
              <div><p>You are owed</p><p>0</p></div>
            </div>
            <div className="grid-item">
              <h3>Section 3</h3>
              <p>Content for section 3</p>
            </div>
            <div className="grid-item">
              <h3>Section 4</h3>
              <p>Content for section 4</p>
            </div>
          </div>
        </div>
      </div>
      <div className='additional-content'></div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AddExpenseForm onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default Dashboard;
