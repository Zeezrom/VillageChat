import { ethers } from 'ethers'

const Navigation = ({ account, setAccount }) => {
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

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        alert('Please connect your MetaMask wallet!')
        return
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

  return (
    <nav>
      <div className='nav__brand'>
        <h1>VILLAGE CHAT</h1>
      </div>

      {account ? (
        <button
          type="button"
          className='nav__connect'
        >
          {account.slice(0, 6) + '...' + account.slice(38, 42)}
        </button>
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