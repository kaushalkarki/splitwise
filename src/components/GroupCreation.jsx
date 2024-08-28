import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/components/GroupCreation.css'
import TextField from '@mui/material/TextField';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constant';

const GroupCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [open, setOpen] = useState(false);
  const [memberVisible, setMemberVisible] = useState(false)
  const [members, setMembers] = useState([ user.email ]);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
    setMemberVisible(true)
  }
  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members,[] ]);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const groupData = {
      group:{
        name: groupName,
        members: members
      }
    };
    try {
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });
  
      if (response.ok) {
        const data = await response.json();
        handleClick()
        navigate('/dashboard')
      } else {
        console.error('Failed to create group:', response.status);
      }
    } catch (error) {
      console.error('Error while creating group:', error);
    }
  };
  

  return (
    <div className="group-creation-container">
      <h2>START A NEW GROUP</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group group-div">
          <label>My group shall be called...</label>
           <TextField id="outlined-basic" type='string' autoComplete="off" label="Group Name" variant="outlined" required onChange={handleGroupNameChange}/>
        </div>
        {memberVisible && <div className="form-group">
          <label>GROUP MEMBERS</label>
          <div className="member-inputs">
          <TextField id="outlined-basic" type='string' disabled autoComplete="off" label="Name" variant="standard" value={user.name} />
          <TextField id="outlined-basic" type='string' disabled autoComplete="off" label="Email address" variant="standard" value={members[0]} />
          </div>
          {members.slice(1).map((member, index) => (
            <div key={index} className="member-inputs">
              <TextField id="outlined-basic"  type='string' autoComplete="off" label="Name" variant="standard"  required />
              <TextField
                  id="outlined-basic"
                  type="email"
                  autoComplete="off"
                  label="Email address"
                  variant="standard"
                  value={member}
                  required
                  onChange={(e) => handleMemberChange(index + 1, e.target.value)}
                />
              <button type="button" onClick={() => removeMember(index+1)}>X</button>
            </div>
          ))}
          <button type="button" onClick={addMember}>+ Add a person</button>
        </div>
        }
        <button type="submit" className="save-button">Save</button>
      </form>
    </div>
  );
};

export default GroupCreation;
