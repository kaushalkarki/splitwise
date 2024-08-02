import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import AddExpenseForm from './AddExpenseForm';
import "../assets/styles/components/Group.css"
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constant';

const Group = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [groupUsers, setGroupUsers] = useState({});
  const [balances, setBalances] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/groups/${id}`);
        if (response.ok) {
          const data = await response.json();
          setGroup(data.group);
        } else {
          console.error('Error fetching group data:', response.statusText);
          navigate(-1);  // Navigate back to the previous page
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
      }
    };

    // Fetch group users and expenses concurrently
    const fetchGroupUsersAndExpenses = async () => {
      try {
        const [usersResponse, expensesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/groups/${id}/get_group_users`),
          fetch(`${API_BASE_URL}/groups/${id}/expenses`)
        ]);

        const data = await usersResponse.json();
        const expensesData = await expensesResponse.json();
        const userDict = data.users.reduce((acc, u) => {
          if (u.id === user.id){
            acc[u.id] = "you"
          }
          else{
          acc[u.id] = u.name;}
          return acc;
        }, {});
        setGroupUsers(userDict);
        const expensesWithUsernames = expensesData.expenses.map(expense => ({
          ...expense,
          payerName: userDict[expense.payer] || 'Unknown User'
        }));
        setExpenses(expensesWithUsernames);
      } catch (error) {
        console.error('Error fetching group users or expenses:', error);
      }
    };

    const fetchBalances = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/groups/${id}/balances`);
        const data = await response.json();
        setBalances(data.total);
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchGroup();
    fetchGroupUsersAndExpenses();
    fetchBalances();
  }, [id]);

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
            <button className="green-button">Settle up</button>
          </div>
        </div>
        <div className="expenses-list">
          {expenses.map((expense) => {
            // const lentAmount = expense.payerName === user.name ? expense.amount - userAmount : userAmount;
            return (
            <div key={expense.id} className="expense-item">
              <div className="expense-date">{new Date(expense.transaction_date).toLocaleDateString()}</div>
              <div className="expense-description">{expense.description}</div>
              <div>
              <div className="expense-payer">{expense.payerName + " paid"}</div>
              <div className="expense-amount">{expense.amount}</div>
              </div>
                <div>
                {expense.payer === user.id && !expense.expense_splits.some(split => split.user_id === user.id) ? (
  // Case 2: If I paid and I am not a participant
  <div>
    <div className="expense-payer">{expense.payerName + " lent"}</div>
    <div className="expense-amount">{expense.amount}</div>
  </div>
) : expense.expense_splits.some(split => split.user_id === user.id) ? (
  // Case 1 and 3: If I paid and I am a participant OR If I didn't pay but I am a participant
  expense.expense_splits.map((ele) => {
    if (expense.payer === user.id && ele.user_id === user.id) {
      // Case 1: If I paid and I am a participant
      return (
        <div key={ele.user_id}>
          <div className="expense-payer">{expense.payerName + " lent"}</div>
          <div className="expense-amount">{expense.amount - ele.user_amount}</div>
        </div>
      );
    } else if (ele.user_id === user.id) {
      // Case 3: If I didn't pay but I am a participant
      return (
        <div key={ele.user_id}>
          <div className="expense-payer">{expense.payerName + " lent you"}</div>
          <div className="expense-amount">{ele.user_amount}</div>
        </div>
      );
    }
    return null;
  })
) : (
  // Case 4: If I didn't pay and neither am I a participant
  <div>
    <div className="expense-payer">Not involved</div>
    {/* <div className="expense-amount">0</div> */}
  </div>
)}

                </div>
            </div>
          )})}
        </div>
      </div>
      <div className="additional-content">
        {balances.map((balance) => (
          <div key={balance[0]} className="balance-item">
            {/* <img src={balance.avatar_url} alt={`${balance.user_name} avatar`} className="user-avatar" /> */}
            <div className="user-info">
              <div className="user-name">{balance[1]}</div>
              <div className="user-balance" style={{ color: balance[2] < 0 ? 'red' : 'green' }}>
                {balance[2] < 0 ? `owes INR ${Math.abs(balance[2])}` : `gets back INR ${balance[2]}`}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AddExpenseForm onClose={closeModal} groupId={group.id} groupName={group.name} />
      </Modal>
    </div>
  );
};

export default Group;
