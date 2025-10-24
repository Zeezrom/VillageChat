import React, { useState } from 'react';
import './Chief.css';
import AdminManager from './AdminManager';
import TokenManager from './TokenManager';

const Chief = ({ villageChat, account, isOwner }) => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Smith",
      address: "123 Main St, Wasteland City",
      phone: "+1-555-0123",
      usernames: [
        { id: 1, username: "Wasteland_Wanderer", isActive: true },
        { id: 2, username: "Survivor_John", isActive: false }
      ]
    },
    {
      id: 2,
      name: "Sarah Johnson",
      address: "456 Oak Ave, Settlement District",
      phone: "+1-555-0456",
      usernames: [
        { id: 3, username: "Tech_Sarah", isActive: true },
        { id: 4, username: "Cyber_Queen", isActive: true }
      ]
    },
    {
      id: 3,
      name: "Mike Chen",
      address: "789 Pine Rd, Outpost Zone",
      phone: "+1-555-0789",
      usernames: [
        { id: 5, username: "Outpost_Mike", isActive: true }
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const [newUsername, setNewUsername] = useState({
    username: '',
    isActive: true
  });

  const addUser = () => {
    if (!newUser.name || !newUser.address || !newUser.phone) return;

    const user = {
      id: Date.now(),
      name: newUser.name,
      address: newUser.address,
      phone: newUser.phone,
      usernames: []
    };

    setUsers(prevUsers => [...prevUsers, user]);
    setNewUser({ name: '', address: '', phone: '' });
    setShowAddForm(false);
  };

  const updateUser = () => {
    if (!editingUser || !editingUser.name || !editingUser.address || !editingUser.phone) return;

    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === editingUser.id ? editingUser : user
      )
    );
    setEditingUser(null);
  };

  const deleteUser = (userId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(null);
    }
  };

  const addUsername = () => {
    if (!newUsername.username || !selectedUser) return;

    const username = {
      id: Date.now(),
      username: newUsername.username,
      isActive: newUsername.isActive
    };

    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === selectedUser.id 
          ? { ...user, usernames: [...user.usernames, username] }
          : user
      )
    );

    setNewUsername({ username: '', isActive: true });
    setShowUsernameForm(false);
  };

  const toggleUsername = (userId, usernameId) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? {
              ...user,
              usernames: user.usernames.map(un => 
                un.id === usernameId ? { ...un, isActive: !un.isActive } : un
              )
            }
          : user
      )
    );
  };

  const deleteUsername = (userId, usernameId) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? {
              ...user,
              usernames: user.usernames.filter(un => un.id !== usernameId)
            }
          : user
      )
    );
  };

  const startEdit = (user) => {
    setEditingUser({ ...user });
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  return (
    <div className="chief-container">
      <div className="chief-header">
        <h1 className="chief-title">CHIEF ADMIN PANEL</h1>
        <button 
          className="add-user-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add User
        </button>
      </div>

      <AdminManager 
        villageChat={villageChat} 
        account={account} 
        isOwner={true} 
      />

      <TokenManager 
        villageChat={villageChat} 
        account={account} 
        isOwner={true} 
      />

      <div className="chief-content">
        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="user-info">
                  <h3 className="user-name">{user.name}</h3>
                  <p className="user-address">📍 {user.address}</p>
                  <p className="user-phone">📞 {user.phone}</p>
                  <p className="username-count">
                    🎭 {user.usernames.length} Username{user.usernames.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="user-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => startEdit(user)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="usernames-btn"
                    onClick={() => setSelectedUser(user)}
                  >
                    🎭
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteUser(user.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {editingUser && editingUser.id === user.id && (
                <div className="edit-form">
                  <input
                    type="text"
                    placeholder="Name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="user-input"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={editingUser.address}
                    onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                    className="user-input"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    className="user-input"
                  />
                  <div className="edit-actions">
                    <button onClick={updateUser} className="save-btn">Save</button>
                    <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              )}

              {selectedUser && selectedUser.id === user.id && (
                <div className="usernames-section">
                  <div className="usernames-header">
                    <h4>Usernames for {user.name}</h4>
                    <button 
                      className="add-username-btn"
                      onClick={() => setShowUsernameForm(true)}
                    >
                      + Add Username
                    </button>
                  </div>
                  
                  <div className="usernames-list">
                    {user.usernames.map(username => (
                      <div key={username.id} className="username-item">
                        <span className={`username ${username.isActive ? 'active' : 'inactive'}`}>
                          {username.username}
                        </span>
                        <div className="username-actions">
                          <button 
                            className={`toggle-btn ${username.isActive ? 'active' : 'inactive'}`}
                            onClick={() => toggleUsername(user.id, username.id)}
                          >
                            {username.isActive ? '🟢' : '🔴'}
                          </button>
                          <button 
                            className="delete-username-btn"
                            onClick={() => deleteUsername(user.id, username.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showAddForm && (
          <div className="add-user-modal">
            <div className="modal-content">
              <h3>Add New User</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="user-input"
              />
              <input
                type="text"
                placeholder="Address"
                value={newUser.address}
                onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                className="user-input"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                className="user-input"
              />
              <div className="modal-actions">
                <button onClick={addUser} className="confirm-btn">Add User</button>
                <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showUsernameForm && selectedUser && (
          <div className="add-username-modal">
            <div className="modal-content">
              <h3>Add Username for {selectedUser.name}</h3>
              <input
                type="text"
                placeholder="Username"
                value={newUsername.username}
                onChange={(e) => setNewUsername({...newUsername, username: e.target.value})}
                className="user-input"
              />
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newUsername.isActive}
                  onChange={(e) => setNewUsername({...newUsername, isActive: e.target.checked})}
                  className="user-checkbox"
                />
                <label htmlFor="isActive" className="checkbox-label">Active</label>
              </div>
              <div className="modal-actions">
                <button onClick={addUsername} className="confirm-btn">Add Username</button>
                <button onClick={() => setShowUsernameForm(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chief; 