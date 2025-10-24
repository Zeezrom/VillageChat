import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const TokenManager = ({ villageChat, account, isOwner }) => {
  const [generatedToken, setGeneratedToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenToRevoke, setTokenToRevoke] = useState('');

  const generateToken = async () => {
    if (!villageChat || !account) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setGeneratedToken('');

    try {
      // Call the generateToken function as a transaction
      const tx = await villageChat.generateToken();
      const receipt = await tx.wait();
      
      // Get the generated token from the event logs
      const event = receipt.events?.find(e => e.event === 'TokenGenerated');
      if (event) {
        const token = event.args.token;
        // Convert the bytes32 token to a readable string
        const tokenString = ethers.utils.parseBytes32String(token);
        setGeneratedToken(tokenString);
        setSuccess('Token generated successfully!');
      } else {
        setError('Token generated but could not retrieve the token value.');
      }
    } catch (error) {
      console.error('Token generation error:', error);
      if (error.message.includes('Not authorized')) {
        setError('You need admin privileges to generate tokens.');
      } else {
        setError('Failed to generate token. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const revokeToken = async () => {
    if (!tokenToRevoke.trim()) {
      setError('Please enter a token to revoke');
      return;
    }

    if (!villageChat || !account) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tokenBytes32 = ethers.utils.formatBytes32String(tokenToRevoke);
      const tx = await villageChat.revokeToken(tokenBytes32);
      await tx.wait();
      
      setSuccess('Token revoked successfully!');
      setTokenToRevoke('');
    } catch (error) {
      console.error('Token revocation error:', error);
      setError('Failed to revoke token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Token copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }).catch(() => {
      setError('Failed to copy token');
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
      border: '2px solid #00ff41',
      borderRadius: '10px',
      padding: '30px',
      margin: '20px',
      color: '#e0e0e0',
      fontFamily: '"Share Tech Mono", monospace'
    }}>
      <h2 style={{
        color: '#00ff41',
        fontSize: '1.8em',
        marginBottom: '20px',
        textAlign: 'center',
        textShadow: '0 0 10px #00ff41'
      }}>
        🔑 Token Management
      </h2>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#0080ff', marginBottom: '15px' }}>Generate Access Token</h3>
        <p style={{ color: '#a0a0a0', marginBottom: '20px', lineHeight: '1.5' }}>
          Generate a new access token that can be given to new users. 
          Each token can only be used once.
        </p>
        
        <button
          onClick={generateToken}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#333' : 'linear-gradient(45deg, #00ff41, #1a1a1a)',
            border: '2px solid #00ff41',
            borderRadius: '5px',
            color: loading ? '#666' : '#0a0a0a',
            fontSize: '1em',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: '"Share Tech Mono", monospace',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? 'Generating...' : 'Generate New Token'}
        </button>

        {generatedToken && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid #00ff41',
            borderRadius: '5px'
          }}>
            <h4 style={{ color: '#00ff41', marginBottom: '10px' }}>Generated Token:</h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#0a0a0a',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #333'
            }}>
              <code style={{ 
                color: '#00ff41', 
                fontSize: '1.1em',
                flex: 1,
                wordBreak: 'break-all'
              }}>
                {generatedToken}
              </code>
              <button
                onClick={() => copyToClipboard(generatedToken)}
                style={{
                  padding: '8px 12px',
                  background: '#0080ff',
                  border: 'none',
                  borderRadius: '3px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }}
              >
                Copy
              </button>
            </div>
            <p style={{ 
              color: '#a0a0a0', 
              fontSize: '0.9em', 
              marginTop: '10px',
              fontStyle: 'italic'
            }}>
              ⚠️ Save this token securely. It can only be used once and cannot be retrieved later.
            </p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#ff8000', marginBottom: '15px' }}>Revoke Token</h3>
          <p style={{ color: '#a0a0a0', marginBottom: '20px', lineHeight: '1.5' }}>
            Revoke a token to prevent it from being used. This action cannot be undone.
          </p>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={tokenToRevoke}
              onChange={(e) => setTokenToRevoke(e.target.value)}
              placeholder="Enter token to revoke..."
              style={{
                flex: 1,
                padding: '10px',
                background: '#0a0a0a',
                border: '2px solid #333',
                borderRadius: '5px',
                color: '#e0e0e0',
                fontSize: '1em',
                fontFamily: '"Share Tech Mono", monospace'
              }}
            />
            <button
              onClick={revokeToken}
              disabled={loading || !tokenToRevoke.trim()}
              style={{
                padding: '10px 20px',
                background: loading ? '#333' : 'linear-gradient(45deg, #ff8000, #1a1a1a)',
                border: '2px solid #ff8000',
                borderRadius: '5px',
                color: loading ? '#666' : '#0a0a0a',
                fontSize: '1em',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '"Share Tech Mono", monospace',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Revoking...' : 'Revoke Token'}
            </button>
          </div>
        </div>
      )}

      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '20px',
        borderRadius: '5px',
        border: '1px solid #333'
      }}>
        <h4 style={{ color: '#0080ff', marginBottom: '15px' }}>Token Management Guidelines:</h4>
        <ul style={{ 
          color: '#a0a0a0', 
          lineHeight: '1.6',
          textAlign: 'left',
          paddingLeft: '20px'
        }}>
          <li>Tokens are single-use and cannot be reused</li>
          <li>Share tokens securely with new users</li>
          <li>Only the contract owner can revoke tokens</li>
          <li>Keep track of generated tokens for security</li>
          <li>Tokens are tied to the blockchain for verification</li>
        </ul>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 0, 64, 0.1)',
          border: '1px solid #ff0040',
          borderRadius: '5px',
          padding: '15px',
          marginTop: '20px'
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
          marginTop: '20px'
        }}>
          <p style={{ color: '#00ff41', margin: 0 }}>✅ {success}</p>
        </div>
      )}
    </div>
  );
};

export default TokenManager; 