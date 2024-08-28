import React, { useState, useEffect } from 'react';
import '../assets/styles/components/AddExpenseForm.css';
import Modal from '../components/Modal'; // Import the Modal component
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constant';
import TextField from '@mui/material/TextField';

const AddExpenseForm = ({ onClose, groupId, groupName, onDataSaved }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [isPaidByModalOpen, setIsPaidByModalOpen] = useState(false);
  const [isSplitEquallyModalOpen, setIsSplitEquallyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(user ? user.id : null);
  const [selectedUserName, setSelectedUserName] = useState(user ? user.name : 'you');
  const [splitEquallyAmounts, setSplitEquallyAmounts] = useState({});
  const [selectedSplitUsers, setSelectedSplitUsers] = useState({});
  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      // Default select all users and set initial split amounts
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
    }
  }, [users, amount]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/get_group_users.json`); // Adjust API endpoint as needed
      const data = await response.json();
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]); // Handle unexpected response structure
        console.error('Unexpected API response structure:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Reset users to an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Gather all the data into an object
    const selectedUsers = Object.keys(selectedSplitUsers).filter((userId) => selectedSplitUsers[userId]);
    const splitAmounts = selectedUsers.map((userId) => ({
      userId,
      amount: splitEquallyAmounts[userId],
    }));

    const expenseData = {
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
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        onDataSaved();
        onClose();
      } else {
        // Handle error
        const errorData = await response.json();
        console.error('Error adding expense:', errorData);
        alert('Error adding expense.');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense.');
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

  return (
    <div>
      <h2>Group: {groupName}</h2>
      <form className="add-expense-form" onSubmit={handleSubmit}>
        <h2>Add an expense</h2>
        <label>
           <TextField id="outlined-basic" type='string' label="Description" variant="outlined" onChange={(e) => setDescription(e.target.value)}/>
        </label>
        <label>
           <TextField id="outlined-basic" type='integer'  label="Amount" variant="outlined" onChange={(e) =>  setAmount(e.target.value)}/>
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
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>

      {/* Paid By Modal */}
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

      {/* Split Equally Modal */}
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
                 <TextField id="outlined-basic" type='integer' value={splitEquallyAmounts[user.id] || ''} label="Amount" variant="outlined" onChange={(e) => handleSplitEquallyAmountChange(user.id, e.target.value)}/>
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
