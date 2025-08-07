import React, { useState } from 'react';
import { ethers } from 'ethers';

const LandingPage = ({ onLogin, villageChat, account }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    // Special case for testing token "0000" - allow access without wallet connection
    if (token === '0000') {
      setSuccess('Testing token accepted! Please connect your wallet to continue.');
      setTimeout(() => {
        onLogin();
      }, 2000);
      return;
    }

    if (!villageChat || !account) {
      setError('Please connect your wallet first to validate this token');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert the token string to bytes32
      const tokenBytes32 = ethers.utils.formatBytes32String(token);
      
      // Call the smart contract to validate and register the user
      const tx = await villageChat.validateAndRegisterUser(tokenBytes32);
      await tx.wait();
      
      setSuccess('Token validated successfully! Welcome to VillageChat!');
      setTimeout(() => {
        onLogin();
      }, 2000);
    } catch (error) {
      console.error('Token validation error:', error);
      if (error.message.includes('Invalid token')) {
        setError('Invalid token. Please check your token and try again.');
      } else if (error.message.includes('Token already used')) {
        setError('This token has already been used. Please request a new token from an admin.');
      } else if (error.message.includes('User already registered')) {
        setError('You are already registered. You can proceed to the app.');
        setTimeout(() => {
          onLogin();
        }, 2000);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Share Tech Mono", monospace',
      color: '#e0e0e0'
    }}>
      <div style={{
        background: 'rgba(26, 26, 26, 0.9)',
        border: '2px solid #00ff41',
        borderRadius: '10px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
      }}>
        <h1 style={{
          color: '#00ff41',
          fontSize: '2.5em',
          marginBottom: '10px',
          textShadow: '0 0 10px #00ff41',
          fontFamily: '"Orbitron", monospace',
          fontWeight: '900'
        }}>
          VILLAGE CHAT
        </h1>
        
        <p style={{
          color: '#a0a0a0',
          fontSize: '1.1em',
          marginBottom: '30px',
          lineHeight: '1.5'
        }}>
          Welcome to the decentralized chat platform. 
          Enter your access token to join the village.
        </p>

        <form onSubmit={handleTokenSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="token" style={{
              display: 'block',
              color: '#00ff41',
              marginBottom: '10px',
              fontSize: '1.1em',
              fontWeight: '600'
            }}>
              Access Token
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your access token..."
              style={{
                width: '100%',
                padding: '15px',
                background: '#0a0a0a',
                border: '2px solid #333',
                borderRadius: '5px',
                color: '#e0e0e0',
                fontSize: '1em',
                fontFamily: '"Share Tech Mono", monospace',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token.trim()}
            style={{
              width: '100%',
              padding: '15px',
              background: loading ? '#333' : 'linear-gradient(45deg, #00ff41, #1a1a1a)',
              border: '2px solid #00ff41',
              borderRadius: '5px',
              color: loading ? '#666' : '#0a0a0a',
              fontSize: '1.1em',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Share Tech Mono", monospace',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Validating Token...' : 'Enter Village'}
          </button>
        </form>

        {!account && (
          <div style={{
            background: 'rgba(255, 165, 0, 0.1)',
            border: '1px solid #ffa500',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#ffa500', margin: 0 }}>
              💡 After token validation, you can access the app. Connect your MetaMask wallet for full features like sending messages and joining channels.
            </p>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255, 0, 64, 0.1)',
            border: '1px solid #ff0040',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#ff0040', margin: 0 }}>❌ {error}</p>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid #00ff41',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#00ff41', margin: 0 }}>✅ {success}</p>
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '5px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#0080ff', marginBottom: '10px' }}>How to get access:</h3>
          <ol style={{ textAlign: 'left', color: '#a0a0a0', lineHeight: '1.6' }}>
            <li>Enter your access token (or use "0000" for testing)</li>
            <li>Access the app with basic functionality</li>
            <li>Optionally connect your MetaMask wallet for full features</li>
            <li>Request an access token from a VillageChat admin if you don't have one</li>
          </ol>
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: 'rgba(0, 255, 65, 0.1)', 
            border: '1px solid #00ff41', 
            borderRadius: '5px' 
          }}>
            <p style={{ color: '#00ff41', margin: 0, fontSize: '0.9em' }}>
              🧪 <strong>Testing:</strong> Use token "0000" for immediate access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 