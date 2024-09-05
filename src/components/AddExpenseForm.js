import React, { useState, useEffect } from 'react';
import '../assets/styles/components/AddExpenseForm.css';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { API_BASE_URL, getHeaders } from '../constant';
import TextField from '@mui/material/TextField';

const AddExpenseForm = ({ onClose, groupId, groupName, onDataSaved, expenseData = null, clearForm = null }) => {
  const { user, token } = useAuth();
  const userMap = useUserContext();
  const [description, setDescription] = useState(expenseData ? expenseData.description : '');
  const [amount, setAmount] = useState(expenseData ? expenseData.amount : '');
  const [date, setDate] = useState(expenseData ? expenseData.transaction_date : new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(expenseData ? expenseData.payer : user.id);

  const [isPaidByModalOpen, setIsPaidByModalOpen] = useState(false);
  const [isSplitEquallyModalOpen, setIsSplitEquallyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(expenseData ? expenseData.payer : user ? user.id : null);
  const [selectedUserName, setSelectedUserName] = useState(expenseData ? userMap[expenseData.payer] : user ? user.name : 'you');
  
  // Initialize splitEquallyAmounts and selectedSplitUsers based on expenseData
  const initialSplitEquallyAmounts = expenseData
    ? Object.fromEntries(expenseData.expense_splits.map((split) => [split.user_id, split.user_amount.toFixed(2)]))
    : {};
  const initialSelectedSplitUsers = expenseData
    ? Object.fromEntries(expenseData.expense_splits.map((split) => [split.user_id, true]))
    : {};
  const [splitEquallyAmounts, setSplitEquallyAmounts] = useState(initialSplitEquallyAmounts);
  const [selectedSplitUsers, setSelectedSplitUsers] = useState(initialSelectedSplitUsers);

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      if (!expenseData) {
        const initialSplitAmounts = {};
        users.forEach((user) => {
          initialSplitAmounts[user.id] = (amount / users.length).toFixed(2);
        });
        setSplitEquallyAmounts(initialSplitAmounts);
  
        const initialSelectedUsers = {};
        users.forEach((user) => {
          initialSelectedUsers[user.id] = true;
        });
        setSelectedSplitUsers(initialSelectedUsers);
      } else {
        const updatedSplitAmounts = {};
        const selectedUserIds = Object.keys(selectedSplitUsers).filter((userId) => selectedSplitUsers[userId]);
  
        selectedUserIds.forEach((userId) => {
          updatedSplitAmounts[userId] = (amount / selectedUserIds.length).toFixed(2);
        });
  
        setSplitEquallyAmounts(updatedSplitAmounts);
      }
    }
  }, [users, amount, expenseData, selectedSplitUsers]);
  

  useEffect(() => {
    if (expenseData) {
      setDescription(expenseData.description);
      setAmount(expenseData.amount);
      setDate(expenseData.transaction_date);
    }
  }, [expenseData]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/get_group_users.json`, { headers: getHeaders(token) });
      const data = await response.json();
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
        console.error('Unexpected API response structure:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedUsers = Object.keys(selectedSplitUsers).filter((userId) => selectedSplitUsers[userId]);
    const splitAmounts = selectedUsers.map((userId) => ({
      userId,
      amount: splitEquallyAmounts[userId],
    }));
  
    const expenseDataPayload = {
      transaction: {
        description,
        amount,
        payer: selectedUser,
        expense_split: splitAmounts,
        transaction_date: date,
        group_id: groupId,
      },
    };
  
    try {
      const url = expenseData 
        ? `${API_BASE_URL}/expenses/${expenseData.id}`
        : `${API_BASE_URL}/expenses`;
  
      const method = expenseData ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: getHeaders(token),
        body: JSON.stringify(expenseDataPayload),
      });
  
      if (response.ok) {
        onDataSaved();
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Error saving expense:', errorData);
        alert('Error saving expense.');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense.');
    }
  };

  const handlePaidByClick = () => {
    setIsPaidByModalOpen(true);
  };

  const handlePaidByModalClose = () => {
    setIsPaidByModalOpen(false);
  };

  const handleUserSelect = (userId, userName) => {
    setSelectedUser(userId);
    setSelectedUserName(userId === user.id ? 'you' : userName);
  };

  const handleSplitEquallyClick = () => {
    setIsSplitEquallyModalOpen(true);
  };

  const handleSplitEquallyModalClose = () => {
    setIsSplitEquallyModalOpen(false);
  };

  const handleSplitEquallyAmountChange = (userId, newAmount) => {
    setSplitEquallyAmounts((prev) => ({
      ...prev,
      [userId]: newAmount,
    }));
  };

  const handleCheckboxChange = (userId) => {
    setSelectedSplitUsers((prev) => {
      const newSelectedUsers = { ...prev, [userId]: !prev[userId] };
      const selectedCount = Object.values(newSelectedUsers).filter((val) => val).length;
      const newSplitAmounts = { ...splitEquallyAmounts };
      Object.keys(newSelectedUsers).forEach((id) => {
        if (newSelectedUsers[id]) {
          newSplitAmounts[id] = (amount / selectedCount).toFixed(2);
        } else {
          delete newSplitAmounts[id];
        }
      });
      setSplitEquallyAmounts(newSplitAmounts);
      return newSelectedUsers;
    });
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };
  const handleCancelClick = () => {
    onClose();
    clearForm()
  };
  return (
    <div>
      <h2>Group: {groupName}</h2>
      <form className="add-expense-form" onSubmit={handleSubmit}>
        <h2>Add an expense</h2>
        <label>
          <TextField id="outlined-basic" type="string" value={description} label="Description" variant="outlined" onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          <TextField id="outlined-basic" type="integer" value={amount} label="Amount" variant="outlined" onChange={(e) => setAmount(e.target.value)} />
        </label>
        <div className="paid-split-container">
          <p>
            Paid by 
            <button type="button" onClick={handlePaidByClick}>
              {selectedUserName}
            </button>
            and split
            <button type="button" onClick={handleSplitEquallyClick}>
              equally
            </button>
          </p>
        </div>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
          />
        </label>
        <div className="button-container">
          <button type="button" onClick={handleCancelClick}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>

      <Modal isOpen={isPaidByModalOpen} onClose={handlePaidByModalClose} className="modal-1">
        <h2>Paid By Modal</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-item ${selectedUser === user.id ? 'selected' : ''}`}
                onClick={() => handleUserSelect(user.id, user.name)}
              >
                {user.name}
              </div>
            ))}
          </div>
        )}
        <br />
        <button onClick={handlePaidByModalClose}>Close</button>
      </Modal>

      <Modal isOpen={isSplitEquallyModalOpen} onClose={handleSplitEquallyModalClose} className="modal-2">
        <h2>Split Equally</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <div key={user.id} className="user-item">
                <div>
                  <input
                    type="checkbox"
                    checked={selectedSplitUsers[user.id]}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                  {user.name}
                </div>
                <TextField id="outlined-basic" type="integer" value={splitEquallyAmounts[user.id] || ''} label="Amount" variant="outlined" onChange={(e) => handleSplitEquallyAmountChange(user.id, e.target.value)} />
              </div>
            ))}
          </div>
        )}
        <br />
        <button onClick={handleSplitEquallyModalClose}>Close</button>
      </Modal>
    </div>
  );
};

export default AddExpenseForm;
