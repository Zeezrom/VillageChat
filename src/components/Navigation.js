import { ethers } from 'ethers'
import { useState } from 'react'

const Navigation = ({ account, setAccount }) => {
  const [forceAccountSelection, setForceAccountSelection] = useState(false)
  const connectHandler = async () => {
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
        
        alert(message)
        return
      }

      // Request account access with explicit permission request
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        alert('Please connect your MetaMask wallet!')
        return
      }

      // If we need to force account selection or multiple accounts are available
      if (forceAccountSelection || accounts.length > 1) {
        // Request permissions again to show account selection
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        })
        
        // Get the accounts again after permission request
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setForceAccountSelection(false)
      }

      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      
      if (error.code === 4001) {
        alert('Connection rejected. Please approve the MetaMask connection request.')
      } else {
        alert('Failed to connect to MetaMask. Please make sure MetaMask is installed and unlocked.')
      }
    }
  }

  const disconnectHandler = () => {
    setAccount(null)
    setForceAccountSelection(true)
    
    // Clear MetaMask connection state to force account selection
    if (window.ethereum) {
      // Remove all listeners
      window.ethereum.removeAllListeners()
      
      // Force MetaMask to show account selection by clearing permissions
      try {
        // Method 1: Try to disconnect if the method exists
        if (typeof window.ethereum.disconnect === 'function') {
          window.ethereum.disconnect()
        }
        
        // Method 2: Clear permissions to force re-authorization
        if (window.ethereum.request) {
          window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          }).catch(() => {
            // Ignore errors, we just want to clear the state
          })
        }
        
        // Method 3: Clear any cached account data
        localStorage.removeItem('metamask-accounts')
        sessionStorage.removeItem('metamask-accounts')
        
      } catch (error) {
        console.log('MetaMask disconnect cleanup:', error.message)
      }
    }
  }

  return (
    <nav>
      <div className='nav__brand'>
        <h1>VILLAGE CHAT</h1>
      </div>

      {account ? (
        <div className="nav__account">
          <button
            type="button"
            className='nav__connect'
            onClick={disconnectHandler}
            title="Click to disconnect"
          >
            {account.slice(0, 6) + '...' + account.slice(38, 42)}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className='nav__connect'
          onClick={connectHandler}
        >
          Connect
        </button>
      )}
    </nav>
  );
}

export default Navigation;