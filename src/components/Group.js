import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import AddExpenseForm from './AddExpenseForm';
import "../assets/styles/components/Group.css";
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getHeaders } from '../constant';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Pagination from './Pagination';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useUserContext } from '../context/UserContext';
import SettleUpForm from './SettleUpForm';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const Group = () => {
  const userMap = useUserContext();
  const { user, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [groupUsers, setGroupUsers] = useState({});
  const [balances, setBalances] = useState([]);
  const [settle, setSettle] = useState([]);
  const [summary, setSummary] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [openExpenseId, setOpenExpenseId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSettlePage, setCurrentSettlePage] = useState(1);
  const [totalSettlePages, setTotalSettlePages] = useState(1);
  const [refetchData, setRefetchData] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [currentSettle, setCurrentSettle] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);  // Updated state
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedSettleId, setSelectedSettleId] = useState(null);
  const open = Boolean(menuAnchor);
  const perPage = 10;

  const handleToggle = () => {
    setShowBalances(!showBalances);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openSettleModal = () => setIsSettleModalOpen(true);
  const closeSettleModal = () => setIsSettleModalOpen(false);

  useEffect(() => {
    setCurrentPage(1);
    setCurrentSettlePage(1);
  }, [id]); 

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/groups/${id}`, {headers: getHeaders(token)});
        if (response.ok) {
          const data = await response.json();
          setGroup(data.group);
        } else {
          console.error('Error fetching group data:', response.statusText);
          navigate(-1);
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
      }
    };

    const fetchGroupUsersAndExpenses = async (page,settle_page ) => {
      try {
        const [usersResponse, expensesResponse, settleResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/groups/${id}/get_group_users`, {headers: getHeaders(token)}),
          fetch(`${API_BASE_URL}/groups/${id}/expenses?page=${page}&limit=${perPage}`, {headers: getHeaders(token)}),
          fetch(`${API_BASE_URL}/groups/${id}/settle_up?page=${settle_page}&limit=${perPage}`, {headers: getHeaders(token)})
        ]);

        const data = await usersResponse.json();
        const expensesData = await expensesResponse.json();
        const settleData = await settleResponse.json();
        setGroupUsers(data.users);
        setExpenses(expensesData.expenses);
        const total_page = Math.ceil((expensesData.meta.count / expensesData.meta.per_page));
        setTotalPages(total_page);
        setSettle(settleData.settle)
      } catch (error) {
        console.error('Error fetching group users or expenses:', error);
      }
    };

    const fetchBalances = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/groups/${id}/balances`, {headers: getHeaders(token)});
        const data = await response.json();
        setBalances(data.total);
        setSummary(data.summary);
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchGroup();
    fetchGroupUsersAndExpenses(currentPage, currentSettlePage);
    fetchBalances();
    setRefetchData(false);
  }, [id, currentPage, currentSettlePage, refetchData]);

  const handleDataSaved = () => {
    setRefetchData(true);
  };

  const clearExpenseData = () =>{
    setCurrentExpense(null)
    setCurrentSettle(null)
  }
  const handleDeleteExpense = async (expenseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: getHeaders(token)
      });
      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== expenseId));
        setRefetchData(true);
      } else {
        console.error('Error deleting expense:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleDeleteSettle = async (settleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settles/${settleId}`, {
        method: 'DELETE',
        headers: getHeaders(token)
      });
      if (response.ok) {
        setSettle(settle.filter(settle => settle.id !== settleId));
        setRefetchData(true);
      } else {
        console.error('Error deleting settle:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting settle:', error);
    }
  };

  const handleExpenseClick = (expenseId) => {
    setOpenExpenseId(openExpenseId === expenseId ? null : expenseId);
  };

  if (!group) {
    return <div>Loading...</div>;
  }

  const handleEditExpense = async (expenseId) => {
    try {
      console.log(expenseId);
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, { headers: getHeaders(token) });
      if (response.ok) {
        const expenseData = await response.json();
        setCurrentExpense(expenseData);
        console.log(currentExpense);
        openModal();
      } else {
        console.error('Error fetching expense data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching expense data:', error);
    }
  };

  const handleEditSettle = async (expenseId) => {
    try {
      console.log(expenseId);
      const response = await fetch(`${API_BASE_URL}/settles/${expenseId}`, { headers: getHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setCurrentSettle(data);
        openSettleModal();
        console.log(data);
        console.log(currentSettle);
      } else {
        console.error('Error fetching expense data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching expense data:', error);
    }
  };

  const handleClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuClick = (event, id) => {
    setMenuAnchor(event.currentTarget);
    setSelectedExpenseId(id);
    setSelectedSettleId(id)
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="grid-item first-grid">
          <h3 id='room-name'>{group.name}</h3>
          <div className="button-container">
            <button className="orange-button" onClick={openModal}>
              Add an expense
            </button>
            <button className="green-button" onClick={openSettleModal}>Settle up</button>
          </div>
        </div>
        <Tabs>
          <TabList id='tabs'>
            <Tab>Expenses</Tab>
            <Tab>Settle Up</Tab>
          </TabList>

          <TabPanel>
            <div className="expenses-list">
          {expenses.map((expense) => (
            <div key={expense.id}>
              <div className="expense-item">
                <div className="expense-date">{new Date(expense.transaction_date).toLocaleDateString()}</div>
                <div className="expense-description" onClick={() => handleExpenseClick(expense.id)}>{expense.description}</div>
                <div>
                  <div className="expense-payer">{expense.payer === user.id ? 'You paid' : userMap[expense.payer]   + " paid"}</div>
                  <div className="expense-amount">{expense.amount}</div>
                </div>
                <div>
                  {expense.payer === user.id && !expense.expense_splits.some(split => split.user_id === user.id) ? (
                    <div>
                      <div className="expense-payer">{expense.payer === user.id ? 'You lent' : userMap[expense.payer] + " lent"}</div>
                      <div className="expense-amount lent">{expense.amount}</div>
                    </div>
                  ) : expense.expense_splits.some(split => split.user_id === user.id) ? (
                    expense.expense_splits.map((ele) => {
                      if (expense.payer === user.id && ele.user_id === user.id) {
                        return (
                          <div key={ele.user_id}>
                            <div className="expense-payer">{expense.payer === user.id ? 'You lent' : userMap[expense.payer] + " lent"}</div>
                            <div className="expense-amount lent">{expense.amount - ele.user_amount}</div>
                          </div>
                        );
                      } else if (ele.user_id === user.id) {
                        return (
                          <div key={ele.user_id}>
                            <div className="expense-payer">{userMap[expense.payer] + " lent you"}</div>
                            <div className="expense-amount owes">{ele.user_amount}</div>
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <div>
                      <div className="expense-payer">Not involved</div>
                    </div>
                  )}
                </div>
                <div className='delete-div'>
                  <button className="delete-button" onClick={handleClick}>
                  <MoreVertIcon 
                              aria-controls={`simple-menu-${expense.id}`} 
                              aria-haspopup="true" 
                              onClick={(event) => handleMenuClick(event, expense.id)}
                            />
                  </button>
                  <Menu
                    id={`simple-menu-${expense.id}`}
                    anchorEl={menuAnchor}
                    open={open && selectedExpenseId === expense.id}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => {
                      handleEditExpense(expense.id);
                      handleClose();
                    }}>
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => {
                      handleDeleteExpense(expense.id);
                      handleClose();
                    }}>
                      Delete
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              {openExpenseId === expense.id && (
                <div key={`${expense.id}+collapse`} className='collapsible-content'>
                  {expense.expense_splits.map((split) => (
                    <p key={split.user_id}>
                      {userMap[split.user_id]} owes {split.user_amount}
                    </p>
                  ))}
                  <div>
                  </div>
                </div>
              )}
            </div>
          ))}
            </div>
        {expenses.length > 0 &&  <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />}
          </TabPanel>
          <TabPanel>
          <div className="expense-item">
            <div className="expense-date">Date</div>
            <div className="expense-payer">Sender</div>
            <div className="expense-payer">Receiver</div>
            <div className="expense-payer">Amount</div>
            <div></div>
          </div>
          {settle.map((settle) => (
            <div key={settle.id}>
              <div className="expense-item">
                <div className="expense-date">{new Date(settle.settle_date).toLocaleDateString()}</div>
                <div className="settle-payer">{userMap[settle.sender]}</div>
                <div className="settle-payer">{userMap[settle.receiver]}</div>
                <div className="settle-payer">{settle.amount}</div>
                <div className='delete-div'>
                  <button className="delete-button" onClick={handleClick}>
                  <MoreVertIcon 
                    aria-controls={`simple-menu-${settle.id}`} 
                    aria-haspopup="true" 
                    onClick={(event) => handleMenuClick(event, settle.id)}
                  />
                  </button>
                  <Menu
                    id={`simple-menu-${settle.id}`}
                    anchorEl={menuAnchor}
                    open={open && selectedSettleId === settle.id}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => {
                      handleEditSettle(settle.id);
                      handleClose();
                    }}>
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => {
                      handleDeleteSettle(settle.id);
                      handleClose();
                    }}>
                      Delete
                    </MenuItem>
                  </Menu>
                </div>
                </div>
                </div>))}
          </TabPanel>
        </Tabs>
        <div>
        
        </div>
      </div>
      <div className="additional-content">
        <button onClick={handleToggle} className='toggle-btn'>
          {showBalances ? 'Show Summary' : 'Show Balances'}
        </button>

        {showBalances ? (
          <div>
            {balances.map((balance) => (
              <div key={balance[0]} className="balance-item">
                <div className="user-info">
                  <div className="user-name">{userMap[balance[0]]}</div>
                  <div className="user-balance" style={{ color: balance[1] < 0 ? 'red' : 'green' }}>
                    {balance[1] < 0 ? `owes INR ${Math.abs(balance[1])}` : `gets back INR ${balance[1]}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {summary.length > 0 ? summary.map((summary, index) => (
              <div className="summary-item" key={index}>
                <div className="summary-balance">
                  <div><b>{userMap[summary[0]]}</b> will pay <b>{userMap[summary[1]]}</b> Rs.{summary[2]}</div>
                </div>
              </div>
            )): <div className="summary-item">
            <div className="summary-balance">
              <div><b>Congrats! <br/>All are settled up </b></div>
            </div>
          </div>}
          </div>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AddExpenseForm onClose={closeModal} groupId={group.id} groupName={group.name} onDataSaved={handleDataSaved} expenseData={currentExpense} clearForm={clearExpenseData}/>
      </Modal>
      <Modal isOpen={isSettleModalOpen} onClose={closeSettleModal}>
        <SettleUpForm onClose={closeSettleModal} groupId={group.id} groupName={group.name} onDataSaved={handleDataSaved} settleData={currentSettle} clearForm={clearExpenseData} />
      </Modal>
    </div>
  );
};

export default Group;
