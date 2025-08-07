import React, { useState, useEffect } from 'react';

const DebugInfo = ({ account, isAdmin, isOwner, villageChat, isVisible, onClose }) => {
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getOwnerAddress = async () => {
      if (villageChat && !ownerAddress) {
        setLoading(true);
        try {
          const owner = await villageChat.owner();
          setOwnerAddress(owner);
        } catch (error) {
          console.error('Error getting owner address:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    getOwnerAddress();
  }, [villageChat, ownerAddress]);

  if (!account || !isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10%',
      right: '50%',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid #00ff41',
      borderRadius: '5px',
      padding: '10px',
      color: '#00ff41',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '400px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h4 style={{ margin: 0 }}>🔧 Debug Info</h4>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#00ff41',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close debug panel"
        >
          ✕
        </button>
      </div>
      <div>Account: {account}</div>
      <div>Is Admin: {isAdmin ? '✅ Yes' : '❌ No'}</div>
      <div>Is Owner: {isOwner ? '✅ Yes' : '❌ No'}</div>
      <div>Contract: {villageChat ? '✅ Loaded' : '❌ Not Loaded'}</div>
      {loading ? (
        <div>Owner Address: Loading...</div>
      ) : ownerAddress ? (
        <div>Owner Address: {ownerAddress}</div>
      ) : null}
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>
        Check browser console for detailed logs
      </div>
    </div>
  );
};

export default DebugInfo; 