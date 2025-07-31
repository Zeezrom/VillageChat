import React from 'react';

const DebugInfo = ({ account, isAdmin, isOwner, villageChat }) => {
  if (!account) return null;

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
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔧 Debug Info</h4>
      <div>Account: {account}</div>
      <div>Is Admin: {isAdmin ? '✅ Yes' : '❌ No'}</div>
      <div>Is Owner: {isOwner ? '✅ Yes' : '❌ No'}</div>
      <div>Contract: {villageChat ? '✅ Loaded' : '❌ Not Loaded'}</div>
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>
        Check browser console for detailed logs
      </div>
    </div>
  );
};

export default DebugInfo; 