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
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { BarChart, Bar } from '@mui/x-charts/BarChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { BarPlot } from '@mui/x-charts/BarChart';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openSettleModal = () => setIsSettleModalOpen(true);
  const closeSettleModal = () => setIsSettleModalOpen(false);
  const [expense, setExpense] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const userMap = useUserContext();
  const [total, setTotal] = useState(0);
  const [debt, setDebt] = useState(0);
  const [credit, setCredit] = useState(0)
  const [graphVisible, setGraphVisible] = useState(false)


  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Error fetching users data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
  };

  const dashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/dashboard_data`);
      if (response.ok) {
        const data = await response.json();
        setExpense(data);
      } else {
        console.error('Error fetching dashboard data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      dashboardData();
    }
  }, [user]);

  useEffect(() => {
    // Use a timeout or a debounce mechanism to handle rapid updates
    const handleCalcData = () => {
      calcData(expense);
    };

    const debounceTimeout = setTimeout(handleCalcData, 0);

    return () => clearTimeout(debounceTimeout); // Cleanup
  }, [expense]);

  const calcData = (expense) => {
    let sum = 0;
    let debt_amount = 0;
    let credit_amount = 0;

    expense.forEach((item) => {
      if (item.to === user.id) {
        sum += item.amount;
        debt_amount += item.amount
      } else if (item.from === user.id) {
        sum -= item.amount;
        credit_amount += item.amount
      }
    });

    setTotal((prevTotal) => {
      if (prevTotal !== sum) {
        return sum;
      }
      return prevTotal;
    });
    setDebt((prevTotal)=>{
      if (prevTotal !== debt_amount){
        return debt_amount;
      }
      return prevTotal;
    });
    setCredit((prevTotal)=>{
      if (prevTotal !== credit_amount){
        return credit_amount;
      }
      return prevTotal;
    });
  };

  const chartSetting = {
    width: 300,
    height: 200,
    margin: { top: 50, right: 0, bottom: 0, left: 100 },
    
  };
  const transformDebtData = () => {
    return expense.filter((item)=>item.from === user.id ).map((item) => ({
      to: userMap[item.to],
      from: userMap[item.from],
      amount: item.amount,
    }));
  };

  const transformCreditData = () => {
    return expense.filter((item)=>item.to === user.id ).map((item) => ({
      to: userMap[item.to],
      from: userMap[item.from],
      amount: item.amount,
    }));
  };

  const displayGraph =()=>{
    if (graphVisible === true){
      setGraphVisible(false)
    }else{setGraphVisible(true)}
  };

  const hideGraph =()=>{
    if (graphVisible === false){
      setGraphVisible(true)
    }
  };
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
      <Card>  
        <div className="content">
          <div className="grid-container">
            <div className="grid-item first-grid">
              <h3 id='heading'>Dashboard</h3>
              <div className="button-container">
                <button className="orange-button" onClick={openModal}>Add an expense</button>
                <button className="green-button" onClick={openSettleModal}>Settle up</button>
              </div>
            </div>
            <CardContent className="grid-item second-grid">
              <div><b>Total balance</b><p>{total}</p></div>
              <Divider orientation="vertical" />
              <div><b>You owe</b><p>{credit}</p></div>
              <Divider orientation="vertical" />
              <div><b>You are owed</b><p>{debt}</p></div>
            </CardContent>
            <div id="dash-exp">
              <div id="left-side">
                <div className='inner-side-div'>
                  <h3><b>YOU OWE</b></h3> 
                  <button value="left" aria-label="left aligned" disabled={!graphVisible} onClick={displayGraph}>View as list</button>
                </div>
                {graphVisible === false ? expense.map((ele) =>{
                  if (ele.from === user.id){
                    return(
                      <>
                      <div className='data-div'>
                        <p>{userMap[ele.to]}</p>
                        <p className='owes'>you owe {ele.amount}</p>
                      </div>
                  </>
                )}})
                  : <div>
                    <BarChart
                    dataset={transformDebtData(expense)}
                    yAxis={[{ scaleType: 'band', dataKey: 'to', categoryGapRatio: 0.3, label: userMap[expense.from]} ]}
                    series={[{ dataKey: 'amount',color: 'red', barWidth:20 }]}
                    layout="horizontal"
                    {...chartSetting}
                  />
                  </div>}
              </div>
              <div id="right-side">
                <div className='inner-side-div'>
                  <button value="center" aria-label="centered" disabled={graphVisible} onClick={displayGraph}>  View as chart</button>
                  <h3><b>YOU ARE OWED</b></h3>
                </div>
                {graphVisible === false ? expense.map((ele) =>{
                  if (ele.to === user.id){
                    return(
                      <>
                      <div className='data-div'>
                      <p>{userMap[ele.from]}</p>
                      <p className='lent'>owes you {ele.amount}</p>
                      </div>
                      </>
                )}})
              : <div>
                    <BarChart
                    dataset={transformCreditData(expense)}
                    yAxis={[{ scaleType: 'band', dataKey: 'from', categoryGapRatio: 0.3} ]}
                    series={[{ dataKey: 'amount' }]}
                    layout="horizontal"
                    {...chartSetting}
                  />
                  </div>}
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
