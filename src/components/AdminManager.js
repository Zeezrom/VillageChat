import React, { useState } from 'react';
import { ethers } from 'ethers';
import './AdminManager.css';

const AdminManager = ({ villageChat, account, isOwner }) => {
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [removeAdminAddress, setRemoveAdminAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addAdmin = async () => {
    if (!newAdminAddress || !ethers.utils.isAddress(newAdminAddress)) {
      setMessage('Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const signer = villageChat.provider.getSigner();
      const contractWithSigner = villageChat.connect(signer);
      
      const tx = await contractWithSigner.addAdmin(newAdminAddress);
      await tx.wait();
      
      setMessage(`Successfully added ${newAdminAddress} as admin`);
      setNewAdminAddress('');
    } catch (error) {
      console.error('Error adding admin:', error);
      setMessage('Failed to add admin. Make sure you are the contract owner.');
    } finally {
      setLoading(false);
    }
  };

  const removeAdmin = async () => {
    if (!removeAdminAddress || !ethers.utils.isAddress(removeAdminAddress)) {
      setMessage('Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const signer = villageChat.provider.getSigner();
      const contractWithSigner = villageChat.connect(signer);
      
      const tx = await contractWithSigner.removeAdmin(removeAdminAddress);
      await tx.wait();
      
      setMessage(`Successfully removed ${removeAdminAddress} as admin`);
      setRemoveAdminAddress('');
    } catch (error) {
      console.error('Error removing admin:', error);
      setMessage('Failed to remove admin. Make sure you are the contract owner.');
    } finally {
      setLoading(false);
    }
  };

  // All features unlocked for everyone

  return (
    <div className="admin-manager">
      <div className="admin-manager-header">
        <h2>🔧 Admin Management</h2>
        <p>Contract Owner Panel</p>
      </div>

      <div className="admin-manager-content">
        <div className="admin-section">
          <h3>Add New Admin</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Ethereum address"
              value={newAdminAddress}
              onChange={(e) => setNewAdminAddress(e.target.value)}
              className="admin-input"
            />
            <button 
              onClick={addAdmin} 
              disabled={loading}
              className="add-admin-btn"
            >
              {loading ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
        </div>

        <div className="admin-section">
          <h3>Remove Admin</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Ethereum address"
              value={removeAdminAddress}
              onChange={(e) => setRemoveAdminAddress(e.target.value)}
              className="admin-input"
            />
            <button 
              onClick={removeAdmin} 
              disabled={loading}
              className="remove-admin-btn"
            >
              {loading ? 'Removing...' : 'Remove Admin'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManager; 