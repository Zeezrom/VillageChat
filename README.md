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

## 🚀 Deployment

### Docker Deployment

To deploy the application using Docker for production:

1. **Ensure Docker and Docker Compose are installed**

2. **Build and run the application**
   ```bash
   npm run docker
   ```
   Or manually:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - The app will be available at `http://localhost:3030`
   - For external access, ensure port 3030 is open and accessible

4. **Database persistence**
   - The SQLite database is stored in the `./data` directory
   - Data persists between container restarts

### Production Considerations

- **Security**: Update CORS settings in `server.js` for specific domains in production
- **Environment Variables**: Set `PORT` environment variable if needed
- **SSL/TLS**: Add reverse proxy (nginx) for HTTPS in production
- **Scaling**: For multiple users, consider using a managed database instead of SQLite

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

### Admin Access Control

The application implements a hierarchical access control system:

#### **For Regular Users:**
1. Connect wallet → No admin icon visible
2. Try to access Chief page → Access denied message
3. Can use all other features normally

#### **For Admins:**
1. Connect wallet → Admin icon (🛡️) appears in sidebar
2. Click admin icon → Access to Chief Admin Panel
3. Can manage users and usernames
4. Cannot manage other admins (only owner can)

#### **For Contract Owner:**
1. Connect wallet → Admin icon appears + owner privileges
2. Access Chief Admin Panel → See AdminManager section
3. Can add/remove admins via blockchain transactions
4. Full control over the entire system

### Admin Management

#### **Adding Admins:**
1. Connect as contract owner
2. Go to Chief Admin Panel
3. Use AdminManager section
4. Enter Ethereum address
5. Click "Add Admin"

#### **Removing Admins:**
1. Connect as contract owner
2. Go to Chief Admin Panel
3. Use AdminManager section
4. Enter admin's Ethereum address
5. Click "Remove Admin"

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

5. **Admin access issues**
   - **Disconnect and reconnect**: Click on your wallet address to disconnect, then reconnect
   - **Check deployment**: Ensure you've deployed the updated contract with admin functionality
   - **Verify admin status**: Use the contract's `isAdmin(address)` function to check if your address is an admin
   - **Owner vs Admin**: Remember that only the contract owner can add/remove admins
   - **Test accounts**: Use the Hardhat test accounts for testing admin functionality:
     - Account 0: Contract owner (full admin privileges) - `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
     - Account 1: Regular admin (can access Chief panel, manage users) - `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
     - Account 2: Regular user (no admin access) - `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

### Testing Admin Access

To test the admin functionality:

1. **Deploy the contract** with the updated script
2. **Import test accounts** into MetaMask:
   - Account 0 (Owner): `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - Account 1 (Admin): `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - Account 2 (Regular User): `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
3. **Switch between accounts** in MetaMask to test different permission levels
4. **Disconnect/reconnect** if admin status doesn't update immediately

**Note:** Account 0 is the contract owner and Account 1 is a regular admin. This makes testing easier since Account 0 is typically the default account in MetaMask.

### Network Configuration

If you need to use a different network, update the `config.json` file with the appropriate contract address and network ID.

## 📝 License

This project is for educational purposes. Feel free to modify and extend it for your own use.
