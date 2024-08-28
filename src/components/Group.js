import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import AddExpenseForm from './AddExpenseForm';
import "../assets/styles/components/Group.css";
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constant';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Pagination from './Pagination';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useUserContext } from '../context/UserContext';
import SettleUpForm from './SettleUpForm';

const Group = () => {
  const userMap = useUserContext(); 
  const { user } = useAuth();
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
  const perPage = 10;

  const handleToggle = () => {
    setShowBalances(!showBalances);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openSettleModal = () => setIsSettleModalOpen(true);
  const closeSettleModal = () => setIsSettleModalOpen(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/groups/${id}`);
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
          fetch(`${API_BASE_URL}/groups/${id}/get_group_users`),
          fetch(`${API_BASE_URL}/groups/${id}/expenses?page=${page}&limit=${perPage}`),
          fetch(`${API_BASE_URL}/groups/${id}/settle_up?page=${settle_page}&limit=${perPage}`)
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
        const response = await fetch(`${API_BASE_URL}/groups/${id}/balances`);
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

  const handleDeleteExpense = async (expenseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'DELETE',
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
            <>
              <div key={expense.id} className="expense-item" onClick={() => handleExpenseClick(expense.id)}>
                <div className="expense-date">{new Date(expense.transaction_date).toLocaleDateString()}</div>
                <div className="expense-description">{expense.description}</div>
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
                  <button className="delete-button" onClick={() => handleDeleteExpense(expense.id)}>
                    <DeleteOutlineIcon />
                  </button>
                </div>
              </div>
              {openExpenseId === expense.id && (
                <div key={`${expense.id}+collapse`} className='collapsible-content'>
                  {expense.expense_splits.map((split) => (
                    <p key={split.user_id}>
                      {userMap[split.user_id]} {split.owes === false ? 'paid' : 'owes'} {split.user_amount}
                    </p>
                  ))}
                </div>
              )}
            </>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
            <>
              <div key={settle.id} className="expense-item">
                <div className="expense-date">{new Date(settle.settle_date).toLocaleDateString()}</div>
                <div className="expense-payer">{userMap[settle.sender]}</div>
                <div className="expense-payer">{userMap[settle.receiver]}</div>
                <div className="expense-payer">{settle.amount}</div>
                <div className='delete-div'>
                  <button className="delete-button" onClick={() => handleDeleteSettle(settle.id)}>
                    <DeleteOutlineIcon />
                  </button>
                </div>
                </div>
                </>))}
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
        <AddExpenseForm onClose={closeModal} groupId={group.id} groupName={group.name} onDataSaved={handleDataSaved} />
      </Modal>
      <Modal isOpen={isSettleModalOpen} onClose={closeSettleModal}>
        <SettleUpForm onClose={closeSettleModal} groupId={group.id} groupName={group.name} onDataSaved={handleDataSaved} />
      </Modal>
    </div>
  );
};

export default Group;
