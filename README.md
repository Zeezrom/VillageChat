# VillageChat
A Web3 Discord Clone with blockchain-based channel access

## 🚀 Overview

VillageChat is a decentralized chat application that combines blockchain technology with real-time messaging. Users connect their MetaMask wallets to access exclusive chat channels, where joining requires paying ETH to mint an NFT.

## 🛠️ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Hardhat** (for smart contract development)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VillageChat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## 🔧 Setup

### 1. Smart Contract Deployment

1. **Start a local Hardhat network**
   ```bash
   npx hardhat node
   ```
   This will start a local blockchain on `http://127.0.0.1:8545/`

2. **Deploy the smart contract** (in a new terminal)
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   This will deploy the VillageChat contract and create 3 channels:
   - `general` (cost: 1 ETH)
   - `intro` (cost: 0 ETH)
   - `jobs` (cost: 0.25 ETH)

3. **Copy the deployed contract address** from the deployment output and update `src/config.json`:
   ```json
   {
     "31337": {
       "VillageChat": {
         "address": "YOUR_DEPLOYED_CONTRACT_ADDRESS"
       }
     }
   }
   ```

### 2. Backend Server

1. **Start the backend server** (in a new terminal)
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:3030`

### 3. Frontend Application

1. **Start the React development server** (in a new terminal)
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

## 🎯 Usage

### Connecting Your Wallet

1. **Open the application** in your browser at `http://localhost:3000`
2. **Click "Connect"** in the navigation bar
3. **Approve the MetaMask connection** when prompted
4. **Switch to the local network** in MetaMask:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545/`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

### Joining Channels

1. **Browse available channels** in the left sidebar
2. **Click on a channel** to join
3. **If you haven't joined yet**, you'll need to:
   - Pay the required ETH fee
   - Confirm the transaction in MetaMask
   - Wait for the transaction to be mined
4. **Once joined**, you can send and receive messages in real-time

### Sending Messages

1. **Select a channel** you've joined
2. **Type your message** in the input field at the bottom
3. **Press Enter** or click the send button
4. **Your message will appear** in real-time for all users in that channel

## 🧪 Testing

Run the smart contract tests:
```bash
npx hardhat test
```

## 📁 Project Structure

```
VillageChat/
├── contracts/
│   └── VillageChat.sol          # Smart contract
├── scripts/
│   └── deploy.js                # Deployment script
├── src/
│   ├── components/
│   │   ├── Navigation.js        # Wallet connection
│   │   ├── Channels.js          # Channel management
│   │   ├── Messages.js          # Real-time messaging
│   │   └── Servers.js           # Server list
│   ├── abis/
│   │   └── VillageChat.json     # Contract ABI
│   ├── App.js                   # Main application
│   └── config.json              # Contract addresses
├── server.js                    # Backend server
├── test/
│   └── VillageChat.js           # Smart contract tests
└── package.json
```

## 🔗 Technologies Used

- **Frontend**: React.js, Socket.io-client
- **Backend**: Express.js, Socket.io
- **Blockchain**: Ethereum, Hardhat, Ethers.js
- **Smart Contract**: Solidity, OpenZeppelin
- **Wallet Integration**: MetaMask

## 🚨 Troubleshooting

### Common Issues

1. **"Contract not found" error**
   - Make sure you've deployed the contract and updated `src/config.json`
   - Verify you're connected to the correct network in MetaMask

2. **"Transaction failed" error**
   - Ensure you have enough ETH in your wallet
   - Check that you're connected to the local Hardhat network

3. **Messages not appearing**
   - Verify the backend server is running on port 3030
   - Check browser console for connection errors

4. **MetaMask connection issues**
   - Make sure MetaMask is installed and unlocked
   - Try refreshing the page and reconnecting

### Network Configuration

If you need to use a different network, update the `config.json` file with the appropriate contract address and network ID.

## 📝 License

This project is for educational purposes. Feel free to modify and extend it for your own use.
