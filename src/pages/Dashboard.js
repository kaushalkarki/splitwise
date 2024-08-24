import React, { useState, useEffect } from 'react';
import '../assets/styles/pages/Dashboard.css';
import Modal from '../components/Modal';
import AddExpenseForm from '../components/AddExpenseForm';
import SettleUpForm from '../components/SettleUpForm';
import { API_BASE_URL } from '../constant';
import Sidebar from '../components/Sidebar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openSettleModal = () => setIsSettleModalOpen(true);
  const closeSettleModal = () => setIsSettleModalOpen(false);
  const [expense, setExpense] = useState([]);
  const [users, setUsers] = useState([])
  const { user } = useAuth()
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setUsers(data);
        } else {
          console.error('Error fetching group data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
      }
    };
    fetchUsers();
  },[])
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
      <Card>  
        <div className="content">
          <div className="grid-container">
            <div className="grid-item first-grid">
              <h3>Dashboard</h3>
              <div className="button-container">
                <button className="orange-button" onClick={openModal}>Add an expense</button>
                <button className="green-button" onClick={openSettleModal}>Settle up</button>
              </div>
            </div>
            <Divider/>
            <CardContent className="grid-item second-grid">
              <div><p>Total balance</p><p>0</p></div>
              <Divider orientation="vertical" />
              <div><p>You owe</p><p>0</p></div>
              <Divider orientation="vertical" />
              <div><p>You are owed</p><p>0</p></div>
            </CardContent>
            <Divider/>
            <div id="dash-exp"> 
              <div id="exp-header" >
                <p>YOU OWE</p> 
                <div> 
                  <ToggleButton value="left" aria-label="left aligned" id='dash-btn'>
                    view as list
                  </ToggleButton>
                  <ToggleButton value="center" aria-label="centered">
                    view as chart
                  </ToggleButton>
                  </div>
                <p>YOU ARE OWED</p>
                 
              </div>
            </div>
          </div>
        </div>
        </Card>
      </div>
      <div className='additional-content'></div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AddExpenseForm onClose={closeModal} />
      </Modal>
      <Modal isOpen={isSettleModalOpen} onClose={closeSettleModal}>
        <SettleUpForm onClose={closeSettleModal} />
      </Modal>
    </div>
  );
};

export default Dashboard;
