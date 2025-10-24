import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config.json';

const LandingPage = ({ onLogin, villageChat, account, setAccount }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allowedTokens, setAllowedTokens] = useState([]);
  const [realTokenAddress, setRealTokenAddress] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [checkingNFTs, setCheckingNFTs] = useState(false);

  // Debug logging for props
  console.log('🔍 LandingPage props - villageChat:', !!villageChat, 'account:', account);

  // Fetch allowed tokens and real token address when contract is available
  useEffect(() => {
    const fetchTokenData = async () => {
      if (!villageChat) return;

      try {
        // Get real token address from config
        const network = await villageChat.provider.getNetwork();
        const realToken = config[network.chainId]?.RealToken?.address;
        if (realToken) {
          setRealTokenAddress(realToken);
        }

        // Fetch allowed tokens from contract
        const count = await villageChat.getAllowedTokensCount();
        const tokens = [];
        for (let i = 0; i < count; i++) {
          const tokenAddress = await villageChat.allowedTokens(i);
          tokens.push(tokenAddress);
        }
        setAllowedTokens(tokens);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    };

    fetchTokenData();
  }, [villageChat]);

  // Wallet connection handler
  const connectWallet = async () => {
    setConnecting(true);
    setError('');
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        const message = `MetaMask is not installed!

To use VillageChat, you need to:

1. Install MetaMask from https://metamask.io/
2. Create or import a wallet
3. Add the local network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545/
   - Chain ID: 31337
   - Currency Symbol: ETH
4. Import a test account with private key:
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Then refresh this page and try connecting again.`
        
        alert(message);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        alert('Please connect your MetaMask wallet!');
        return;
      }

      const connectedAccount = ethers.utils.getAddress(accounts[0]);
      setAccount(connectedAccount);
      setSuccess('Wallet connected successfully!');

      try {
        // Show checking NFTs state
        setCheckingNFTs(true);
        setError('');
        
        // Add a timeout to the NFT check to prevent hanging
        const nftCheckPromise = checkUserHasMatchingNFTContract(connectedAccount);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('NFT check timeout')), 10000) // 10 second timeout
        );
        
        const hasMatchingNFT = await Promise.race([nftCheckPromise, timeoutPromise]);

        if (hasMatchingNFT) {
          try {
            const tx = await villageChat.validateAndRegisterUser();
            await tx.wait();
          } catch (registrationError) {
            if (!registrationError.message.includes('User already registered')) {
              throw registrationError;
            }
          }
          setSuccess('Access granted automatically! Redirecting...');
          setTimeout(() => {
            onLogin();
          }, 1500);
          return;
        } else {
          // No matching NFT found - show helpful message
          setError('No qualifying NFT found in your wallet. Please ensure you hold an NFT from one of our approved collections, or click "Check Access" to try again.');
        }
      } catch (nftCheckError) {
        console.error('Automatic NFT access check failed:', nftCheckError);
        if (nftCheckError.message === 'NFT check timeout') {
          setError('NFT check timed out after 10 seconds. Please click "Check Access" to try again.');
        } else {
          setError('Wallet connected, but automatic access check failed. Please click "Check Access" to try again.');
        }
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      
      if (error.code === 4001) {
        setError('Connection rejected. Please approve the MetaMask connection request.');
      } else {
        setError('Failed to connect to MetaMask. Please make sure MetaMask is installed and unlocked.');
      }
    } finally {
      setConnecting(false);
      setCheckingNFTs(false);
    }
  };

  // Check if user holds the real token
  const checkRealTokenBalance = async (userAddress, tokenAddress) => {
    if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
      return false;
    }

    try {
      // Create a simple ERC20/ERC721 contract interface to check balance
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function balanceOf(address owner) view returns (uint256)',
        'function ownerOf(uint256 tokenId) view returns (address)'
      ], villageChat.provider);

      // Try ERC20 balanceOf first
      try {
        const balance = await tokenContract.balanceOf(userAddress);
        return balance.gt(0);
      } catch (error) {
        // If ERC20 fails, try ERC721 (this is a simplified check)
        console.log('ERC20 balance check failed, might be ERC721');
        return false;
      }
    } catch (error) {
      console.error('Error checking real token balance:', error);
      return false;
    }
  };

  // Check if user has NFT contracts that match active tokens in database
  const checkUserHasMatchingNFTContract = async (userAddress) => {
    try {
      console.log('🔐 Starting NFT authentication check for user:', userAddress);
      
      // Fetch active tokens from database
      const response = await fetch('http://localhost:3030/api/user-tokens');
      if (!response.ok) {
        throw new Error('Failed to fetch allowed tokens from database');
      }

      const activeTokens = await response.json();
      console.log('📊 Active tokens from database:', activeTokens);
      
      if (!Array.isArray(activeTokens) || activeTokens.length === 0) {
        console.log('❌ No active tokens found in database');
        return false;
      }

      // Get all NFT contracts owned by the user
      const nftContracts = await getUserNFTContracts(userAddress);
      console.log('🎯 User NFT contracts found:', nftContracts);

      // Check if any of the user's NFT contracts match active tokens
      for (const nftContract of nftContracts) {
        const normalizedContractAddress = ethers.utils.getAddress(nftContract);
        console.log(`🔍 Checking if ${normalizedContractAddress} matches database tokens...`);
        
        const matchingToken = activeTokens.find(token => 
          ethers.utils.getAddress(token.token) === normalizedContractAddress
        );
        
        if (matchingToken) {
          console.log(`✅ Found matching token in database:`, matchingToken);
          if (matchingToken.isActive === 1) {
            console.log('🎉 ACCESS GRANTED! User has matching active NFT contract');
            return true;
          } else {
            console.log('❌ Token found but is not active (isActive = 0)');
          }
        } else {
          console.log(`❌ No matching token found for ${normalizedContractAddress}`);
        }
      }

      console.log('❌ No matching active NFT contracts found');
      return false;
    } catch (error) {
      console.error('❌ Error checking NFT contracts against database:', error);
      return false;
    }
  };

  // Get all NFT contracts owned by the user
  const getUserNFTContracts = async (userAddress) => {
    try {
      console.log('🔍 Scanning for NFT contracts for user:', userAddress);
      
      // This is a simplified approach - in a real implementation, you might want to:
      // 1. Check against known NFT contract addresses
      // 2. Use a service like Alchemy or Moralis to get NFT data
      // 3. Check for ERC721/ERC1155 contracts specifically
      
      // For now, we'll check if the user has any tokens in common NFT contracts
      // You can expand this list with known NFT contract addresses
      const commonNFTContracts = [
        // VillageChat contract itself is an ERC721 NFT
        config[31337]?.VillageChat?.address,
        // Add more known NFT contract addresses here
        // Example: '0x...', '0x...'
      ].filter(Boolean); // Remove any undefined addresses

      console.log('📋 Checking these contracts:', commonNFTContracts);

      const userNFTContracts = [];
      
      // Check each common NFT contract
      for (const contractAddress of commonNFTContracts) {
        try {
          console.log(`🔍 Checking contract: ${contractAddress}`);
          
          const contract = new ethers.Contract(
            contractAddress,
            [
              'function balanceOf(address owner) view returns (uint256)',
              'function supportsInterface(bytes4 interfaceId) view returns (bool)',
              'function name() view returns (string)',
              'function symbol() view returns (string)'
            ],
            villageChat.provider
          );

          // Get contract info for debugging
          try {
            const name = await contract.name().catch(() => 'Unknown');
            const symbol = await contract.symbol().catch(() => 'Unknown');
            console.log(`📄 Contract ${contractAddress}: ${name} (${symbol})`);
          } catch (e) {
            console.log(`📄 Contract ${contractAddress}: No name/symbol`);
          }

          // Check if it's an NFT contract (ERC721 or ERC1155)
          const isERC721 = await contract.supportsInterface('0x80ac58cd').catch(() => false);
          const isERC1155 = await contract.supportsInterface('0xd9b67a26').catch(() => false);
          
          console.log(`🎨 Contract ${contractAddress}: ERC721=${isERC721}, ERC1155=${isERC1155}`);
          
          if (isERC721 || isERC1155) {
            const balance = await contract.balanceOf(userAddress);
            console.log(`💰 Balance for ${contractAddress}: ${balance.toString()}`);
            
            if (balance.gt(0)) {
              userNFTContracts.push(contractAddress);
              console.log(`✅ User owns NFT from contract: ${contractAddress}`);
            } else {
              console.log(`❌ User has no NFTs from contract: ${contractAddress}`);
            }
          } else {
            console.log(`❌ Contract ${contractAddress} is not an NFT (ERC721/ERC1155)`);
          }
        } catch (error) {
          console.log(`❌ Error checking contract ${contractAddress}:`, error.message);
          // Skip contracts that don't exist or aren't accessible
          continue;
        }
      }

      console.log('🎯 Final NFT contracts found:', userNFTContracts);
      return userNFTContracts;
    } catch (error) {
      console.error('Error getting user NFT contracts:', error);
      return [];
    }
  };

  const handleAccessCheck = async () => {
    console.log('🔍 Debug - handleAccessCheck called');
    console.log('🔍 villageChat:', villageChat);
    console.log('🔍 account:', account);
    
    if (!villageChat || !account) {
      console.log('❌ Missing required data - villageChat:', !!villageChat, 'account:', !!account);
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if user has NFT contracts that match active tokens in database
      const hasMatchingNFT = await checkUserHasMatchingNFTContract(account);
      
      if (!hasMatchingNFT) {
        setError('You do not hold any NFT contracts that match the active tokens in our database. Please acquire a qualifying NFT to gain access.');
        setLoading(false);
        return;
      }

      // Register the user
      const tx = await villageChat.validateAndRegisterUser();
      await tx.wait();

      setSuccess('Access granted! Welcome to VillageChat!');
      setTimeout(() => {
        onLogin();
      }, 2000);
    } catch (error) {
      console.error('Access check error:', error);
      if (error.message.includes('User already registered')) {
        setError('You are already registered. You can proceed to the app.');
        setTimeout(() => {
          onLogin();
        }, 2000);
      } else {
        setError('An error occurred while checking your NFT access. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Testing bypass function
  const handleTestingBypass = () => {
    setSuccess('Testing bypass activated! Welcome to VillageChat!');
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      display: 'flex',
      fontFamily: '"Share Tech Mono", monospace',
      color: '#e0e0e0',
      overflowY: 'auto'
    }}>
      {/* Main Content */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px'
      }}>
      <div style={{
        background: 'rgba(26, 26, 26, 0.9)',
        border: '2px solid #00ff41',
        borderRadius: '10px',
        padding: '40px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
        marginBottom: '20px'
      }}>
        <h1 style={{
          color: '#00ff41',
          fontSize: '2.2em',
          marginBottom: '10px',
          textShadow: '0 0 10px #00ff41',
          fontFamily: '"Orbitron", monospace',
          fontWeight: '900'
        }}>
          VILLAGE CHAT
        </h1>
        
        <p style={{
          color: '#a0a0a0',
          fontSize: '1em',
          marginBottom: '25px',
          lineHeight: '1.5'
        }}>
          Welcome to the decentralized chat platform.
          To join the village, you must hold an NFT from one of our approved collections.
        </p>

        {realTokenAddress && realTokenAddress !== '0x0000000000000000000000000000000000000000' && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              color: '#00ff41',
              marginBottom: '10px',
              fontSize: '1.2em'
            }}>
              Required Token:
            </h3>
            <div style={{
              background: 'rgba(0, 255, 65, 0.1)',
              border: '2px solid #00ff41',
              borderRadius: '5px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                color: '#00ff41',
                fontSize: '0.9em',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                fontWeight: 'bold'
              }}>
                {realTokenAddress}
              </div>
              <div style={{
                color: '#a0a0a0',
                fontSize: '0.8em',
                marginTop: '5px'
              }}>
                Hold this token to gain immediate access
              </div>
            </div>
          </div>
        )}

        {allowedTokens.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              color: '#00ff41',
              marginBottom: '10px',
              fontSize: '1.1em'
            }}>
              Allowed Tokens:
            </h3>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid #333',
              borderRadius: '5px',
              padding: '10px',
              marginBottom: '20px'
            }}>
              {allowedTokens.map((token, index) => (
                <div key={index} style={{
                  color: '#a0a0a0',
                  fontSize: '0.9em',
                  fontFamily: 'monospace',
                  marginBottom: '5px'
                }}>
                  {token}
                </div>
              ))}
            </div>
          </div>
        )}

        {!account ? (
          <button
            onClick={connectWallet}
            disabled={connecting}
            style={{
              width: '100%',
              padding: '15px',
              background: connecting ? '#333' : 'linear-gradient(45deg, #0080ff, #1a1a1a)',
              border: '2px solid #0080ff',
              borderRadius: '5px',
              color: connecting ? '#666' : '#ffffff',
              fontSize: '1.1em',
              fontWeight: '700',
              cursor: connecting ? 'not-allowed' : 'pointer',
              fontFamily: '"Share Tech Mono", monospace',
              transition: 'all 0.3s ease'
            }}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <button
            onClick={handleAccessCheck}
            disabled={loading || !villageChat}
            style={{
              width: '100%',
              padding: '15px',
              background: loading || !villageChat ? '#333' : 'linear-gradient(45deg, #00ff41, #1a1a1a)',
              border: '2px solid #00ff41',
              borderRadius: '5px',
              color: loading || !villageChat ? '#666' : '#0a0a0a',
              fontSize: '1.1em',
              fontWeight: '700',
              cursor: loading || !villageChat ? 'not-allowed' : 'pointer',
              fontFamily: '"Share Tech Mono", monospace',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Checking Access...' : !villageChat ? 'Loading Contract...' : 'Check Access'}
          </button>
        )}

        {!account && (
          <div style={{
            background: 'rgba(0, 128, 255, 0.1)',
            border: '1px solid #0080ff',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#0080ff', margin: 0 }}>
              💡 Connect your MetaMask wallet to check if you hold an approved NFT and gain access to VillageChat.
            </p>
          </div>
        )}

        {account && (
          <div style={{
            background: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid #00ff41',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#00ff41', margin: 0 }}>
              ✅ Wallet connected: {account.slice(0, 6)}...{account.slice(38, 42)}
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

        {checkingNFTs && (
          <div style={{
            background: 'rgba(0, 128, 255, 0.1)',
            border: '1px solid #0080ff',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#0080ff', margin: 0 }}>
              🔍 Checking for qualifying NFTs in your wallet...
            </p>
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
            <li>Connect your MetaMask wallet</li>
            <li>Ensure you hold an NFT from one of our approved collections</li>
            <li>Click "Check Access" to verify and register</li>
          </ol>
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid #00ff41',
            borderRadius: '5px'
          }}>
            <p style={{ color: '#00ff41', margin: 0, fontSize: '0.9em' }}>
              💡 <strong>Note:</strong> You need to hold the token in the connected wallet to gain access
            </p>
          </div>
        </div>

        {/* Testing Bypass Button */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 165, 0, 0.1)',
          borderRadius: '5px',
          border: '1px solid #ffa500',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ffa500', marginBottom: '10px', fontSize: '1em' }}>
            🧪 Testing Mode
          </h3>
          <p style={{ color: '#a0a0a0', marginBottom: '15px', fontSize: '0.9em' }}>
            Skip token validation for testing purposes
          </p>
          <button
            onClick={handleTestingBypass}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(45deg, #ffa500, #ff8c00)',
              border: '2px solid #ffa500',
              borderRadius: '5px',
              color: '#000000',
              fontSize: '0.9em',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: '"Share Tech Mono", monospace',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(45deg, #ff8c00, #ffa500)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(45deg, #ffa500, #ff8c00)';
            }}
          >
            🚀 Bypass & Enter App
          </button>
        </div>
      </div>
      </div>

      {/* Teaser Side Panel */}
      <div style={{
        width: '350px',
        background: 'rgba(26, 26, 26, 0.95)',
        border: '2px solid #0080ff',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px',
        marginLeft: '0',
        boxShadow: '0 0 20px rgba(0, 128, 255, 0.3)',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 40px)'
      }}>
        <h2 style={{
          color: '#0080ff',
          fontSize: '1.5em',
          marginBottom: '20px',
          textAlign: 'center',
          borderBottom: '2px solid #0080ff',
          paddingBottom: '10px'
        }}>
          🏘️ Village Preview
        </h2>

        {/* App Features Teaser */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#00ff41', fontSize: '1.1em', marginBottom: '15px' }}>
            ✨ What's Inside
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{
              background: 'rgba(0, 255, 65, 0.1)',
              border: '1px solid #00ff41',
              borderRadius: '5px',
              padding: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ color: '#00ff41', fontWeight: 'bold', marginBottom: '5px' }}>
                💬 Decentralized Chat
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '0.9em' }}>
                Join exclusive channels, discuss village matters, and connect with community members.
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid #ffa500',
              borderRadius: '5px',
              padding: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ color: '#ffa500', fontWeight: 'bold', marginBottom: '5px' }}>
                🗳️ Democratic Voting
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '0.9em' }}>
                Participate in village decisions, vote on infrastructure projects, and shape the future.
              </div>
            </div>

            <div style={{
              background: 'rgba(128, 0, 255, 0.1)',
              border: '1px solid #8000ff',
              borderRadius: '5px',
              padding: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ color: '#8000ff', fontWeight: 'bold', marginBottom: '5px' }}>
                🏪 Marketplace
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '0.9em' }}>
                Trade resources, auction items, and manage the village economy.
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 0, 128, 0.1)',
              border: '1px solid #ff0080',
              borderRadius: '5px',
              padding: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ color: '#ff0080', fontWeight: 'bold', marginBottom: '5px' }}>
                👑 Leadership System
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '0.9em' }}>
                View village hierarchy, track leadership roles, and understand the power structure.
              </div>
            </div>
          </div>
        </div>

        {/* Chiefs Contact Section */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#ffa500', fontSize: '1.1em', marginBottom: '15px' }}>
            🛡️ Contact Chiefs for Access
          </h3>
          
          <div style={{
            background: 'rgba(255, 165, 0, 0.1)',
            border: '1px solid #ffa500',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ color: '#ffa500', fontWeight: 'bold', marginBottom: '10px' }}>
              Chief Sarah - Village Leader
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.9em', marginBottom: '8px' }}>
              📧 sarah@villagechat.eth
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.9em', marginBottom: '8px' }}>
              💬 @ChiefSarah
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.8em' }}>
              Oversees village operations and can grant access to qualified members.
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 128, 255, 0.1)',
            border: '1px solid #0080ff',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ color: '#0080ff', fontWeight: 'bold', marginBottom: '10px' }}>
              Chief Marcus - Infrastructure Lead
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.9em', marginBottom: '8px' }}>
              📧 marcus@villagechat.eth
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.9em', marginBottom: '8px' }}>
              💬 @ChiefMarcus
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.8em' }}>
              Manages technical infrastructure and can assist with access requests.
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid #00ff41',
            borderRadius: '5px',
            padding: '15px'
          }}>
            <div style={{ color: '#00ff41', fontWeight: 'bold', marginBottom: '10px' }}>
              Chief Alex - Security Lead
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.9em', marginBottom: '8px' }}>
              📧 alex@villagechat.eth
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.9em', marginBottom: '8px' }}>
              💬 @ChiefAlex
            </div>
            <div style={{ color: '#a0a0a0', fontSize: '0.8em' }}>
              Handles security matters and can verify new member credentials.
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{
          background: 'rgba(0, 128, 255, 0.1)',
          border: '2px solid #0080ff',
          borderRadius: '5px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#0080ff', fontWeight: 'bold', marginBottom: '8px' }}>
            🚀 Ready to Join?
          </div>
          <div style={{ color: '#a0a0a0', fontSize: '0.9em', marginBottom: '10px' }}>
            Contact any Chief above to request access to the village!
          </div>
          <div style={{ color: '#0080ff', fontSize: '0.8em' }}>
            Or hold the required token to gain instant access
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 