import React, { useState, useEffect } from 'react';
import '../assets/styles/components/AddExpenseForm.css';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { API_BASE_URL, getHeaders } from '../constant';
import TextField from '@mui/material/TextField';

const SettleUpForm = ({ onClose, groupId, groupName, onDataSaved, settleData = null, clearForm = null }) => {
  const { user, token } = useAuth();
  const userMap = useUserContext();
  const [amount, setAmount] = useState(settleData ? settleData.amount : '' );
  const [date, setDate] = useState(settleData ? new Date(settleData.settle_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  const [isPaidByModalOpen, setIsPaidByModalOpen] = useState(false);
  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(settleData ? settleData.sender :user ? user.id : null);
  const [selectedUserName, setSelectedUserName] = useState(settleData ? userMap[settleData.sender] : user ? user.name : 'you');
  const [receiverUser, setReceiverUser] = useState(settleData ? settleData.receiver : user ? user.id : null);
  const [receiverUserName, setReceiverUserName] = useState(settleData ? userMap[settleData.receiver] : user ? user.name : 'you');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/get_group_users.json`, {headers: getHeaders(token)});
      const data = await response.json();
      console.log(settleData.settle_date);
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
    
    const settleDataPayload = {
      settle: {
        amount,
        sender: selectedUser,
        receiver: receiverUser,
        settle_date: date,
        group_id: groupId,
      },
    };

    try {
      const url = settleData 
        ? `${API_BASE_URL}/settles/${settleData.id}`
        : `${API_BASE_URL}/settles`;
    
      const method = settleData ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: getHeaders(token),
        body: JSON.stringify(settleDataPayload),
      });
    
      if (response.ok) {
        onDataSaved();
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Error settling up:', errorData);
        alert('Error settling up.');
      }
    } catch (error) {
      console.error('Error settling up:', error);
      alert('Error settling up.');
    }
};


  const handlePaidByClick = () => {
    setIsPaidByModalOpen(true);
  };

  const handlePaidByModalClose = () => {
    setIsPaidByModalOpen(false);
  };


  const handleReceiverClick = () => {
    setIsReceiverModalOpen(true);
  };

  const handleReceiverModalClose = () => {
    setIsReceiverModalOpen(false);
  };

  const handleUserSelect = (userId, userName) => {
    setSelectedUser(userId);
    setSelectedUserName(userId === user.id ? 'you' : userName);
  };

  const handleReceiverSelect = (userId, userName) => {
    setReceiverUser(userId);
    setReceiverUserName(userId === user.id ? 'you' : userName);
    console.log(receiverUser);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <div>
      <h2>Group: {groupName}</h2>
      <form className="add-expense-form" onSubmit={handleSubmit}>
        <h2>Settle Up</h2>
        <label>
          <TextField
            id="outlined-basic"
            type="number"
            label="Amount"
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <div className="paid-split-container">
          <p>
            <div>
            Paid by{' '}
            <button type="button" onClick={handlePaidByClick}>
              {selectedUserName}
            </button>
            </div>
            Receiver{' '}
            <button type="button" onClick={handleReceiverClick}>
              {receiverUserName}
            </button>
          </p>
        </div>
        <div className="paid-container">
          
        </div>
        <label>
          Date
          <input type="date" value={date} onChange={handleDateChange} />
        </label>
        <div className="button-container">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Settle</button>
        </div>
      </form>

      {/* Paid By Modal */}
      <Modal
        isOpen={isPaidByModalOpen}
        onClose={handlePaidByModalClose}
        className="modal-1"
      >
        <h2>Select Payer</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-item ${
                  selectedUser === user.id ? 'selected' : ''
                }`}
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

      <Modal
        isOpen={isReceiverModalOpen}
        onClose={handleReceiverModalClose}
        className="modal-1"
      >
        <h2>Select Receiver</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-item ${
                  receiverUser === user.id ? 'selected' : ''
                }`}
                onClick={() => handleReceiverSelect(user.id, user.name)}
              >
                {user.name}
              </div>
            ))}
          </div>
        )}
        <br />
        <button onClick={handleReceiverModalClose}>Close</button>
      </Modal>
    </div>
  );
};

export default SettleUpForm;
