import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { io } from "socket.io-client"

// Components
import Navigation from './components/Navigation'
import Servers from './components/Servers'
import Channels from './components/Channels'
import Messages from './components/Messages'
import Vote from './components/Vote'
import Leaders from './components/Leaders'
import Marketplace from './components/Marketplace'
import Chief from './components/Chief'
import AdminManager from './components/AdminManager'
import DebugInfo from './components/DebugInfo'
import LandingPage from './components/LandingPage'

// ABIs
import VillageChat from './abis/VillageChat.json'

// Config
import config from './config.json';

// Socket
const socket = io('ws://localhost:3030');

//react hook to load in the data
function App() {
  //create a state and set it to react
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)

  const [villageChat, setVillageChat] = useState(null)
  const [channels, setChannels] = useState([])

  const [currentChannel, setCurrentChannel] = useState(null)
  const [messages, setMessages] = useState([])

  // New state for page navigation
  const [currentPage, setCurrentPage] = useState('chat') // 'chat', 'vote', 'leaders', 'marketplace', or 'chief'
  const [activeServer, setActiveServer] = useState('chat')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [debugVisible, setDebugVisible] = useState(true)
  const [isUserRegistered, setIsUserRegistered] = useState(false)
  const [showLandingPage, setShowLandingPage] = useState(true)


  // Check admin status and user registration
  const checkAdminStatus = async (villageChatContract, userAccount) => {
    if (!villageChatContract || !userAccount) return
    
    try {
      console.log('Checking admin status for account:', userAccount)
      
      // Check if isAdmin function exists and is callable
      let isAdminStatus = false
      if (typeof villageChatContract.isAdmin === 'function') {
        try {
          isAdminStatus = await villageChatContract.isAdmin(userAccount)
        } catch (error) {
          console.warn('Error calling isAdmin:', error.message)
          isAdminStatus = false
        }
      } else {
        console.warn('isAdmin function not available on contract')
      }
      
      // Check owner status
      let isOwnerStatus = false
      let ownerAddress = null
      if (typeof villageChatContract.owner === 'function') {
        try {
          ownerAddress = await villageChatContract.owner()
          isOwnerStatus = userAccount.toLowerCase() === ownerAddress.toLowerCase()
        } catch (error) {
          console.warn('Error calling owner:', error.message)
        }
      } else {
        console.warn('owner function not available on contract')
      }
      
      // Check user registration
      let userRegisteredStatus = false
      if (typeof villageChatContract.isUserRegistered === 'function') {
        try {
          userRegisteredStatus = await villageChatContract.isUserRegistered(userAccount)
        } catch (error) {
          console.warn('Error calling isUserRegistered:', error.message)
        }
      }
      
      console.log('Admin status:', isAdminStatus)
      console.log('Owner status:', isOwnerStatus)
      console.log('User registered status:', userRegisteredStatus)
      console.log('Owner address:', ownerAddress)
      
      setIsAdmin(isAdminStatus)
      setIsOwner(isOwnerStatus)
      setIsUserRegistered(userRegisteredStatus)
      
      // If user is admin/owner, they don't need to go through token validation
      if (isAdminStatus || isOwnerStatus) {
        setShowLandingPage(false)
      } else if (userRegisteredStatus) {
        setShowLandingPage(false)
      } else {
        setShowLandingPage(true)
      }
    } catch (error) {
      console.error('Error checking admin/owner status:', error)
      setIsAdmin(false)
      setIsOwner(false)
      setIsUserRegistered(false)
      setShowLandingPage(true)
    }
  }

  // Bypass function to set admin and owner status
  const handleBypassAdmin = () => {
    console.log('Bypassing admin check - setting admin and owner to true')
    setIsAdmin(true)
    setIsOwner(true)
    setIsUserRegistered(true)
    setShowLandingPage(false)
  }

  //creating an ether provider
  const loadBlockchainData = async () => {
    console.log('🔍 Loading blockchain data...');
    
    if (!window.ethereum) {
      console.log('❌ window.ethereum not available');
      return;
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    console.log('✅ Provider created');

    const network = await provider.getNetwork()
    console.log('🌐 Network:', network);
    
    const contractAddress = config[network.chainId]?.VillageChat?.address;
    console.log('📄 Contract address:', contractAddress);
    
    if (!contractAddress) {
      console.log('❌ No contract address found for network', network.chainId);
      return;
    }
    
    const villageChat = new ethers.Contract(contractAddress, VillageChat, provider)
    setVillageChat(villageChat)
    console.log('✅ VillageChat contract created:', villageChat.address);

    // Channels are now loaded from the database via the Channels component
    setChannels([])

    window.ethereum.on('accountsChanged', async () => {
      window.location.reload()
    })

    // Check admin status after contract is loaded
    if (account) {
      await checkAdminStatus(villageChat, account)
    }
  }

  //react hook to load in the data
  useEffect(() => {
    loadBlockchainData()

    // --> https://socket.io/how-to/use-with-react-hooks

    socket.on("connect", () => {
      socket.emit('get messages')
    })

    socket.on('new message', (messages) => {
      setMessages(messages)
    })

    socket.on('get messages', (messages) => {
      setMessages(messages)
    })

    return () => {
      socket.off('connect')
      socket.off('new message')
      socket.off('get messages')
    }
  }, [])

  // Check admin status when account or contract changes
  useEffect(() => {
    if (villageChat && account) {
      checkAdminStatus(villageChat, account)
    }
  }, [villageChat, account])

  const handleServerClick = (server) => {
    // All features are now unlocked for everyone
    setCurrentPage(server)
    setActiveServer(server)
  }

  const toggleDebug = () => {
    setDebugVisible(!debugVisible)
  }

  const handleLogin = () => {
    setShowLandingPage(false)
    setIsUserRegistered(true)
  }

  const handleLogout = () => {
    setShowLandingPage(true)
    setIsUserRegistered(false)
    setAccount(null)
  }

  const handleDisconnect = () => {
    // Reset all user state when wallet is disconnected
    setIsAdmin(false)
    setIsOwner(false)
    setIsUserRegistered(false)
    setAccount(null)
  }

  return (
    <div>
      {showLandingPage ? (
        <LandingPage 
          onLogin={handleLogin}
          onBypassAdmin={handleBypassAdmin}
          villageChat={villageChat}
          account={account}
          setAccount={setAccount}
        />
      ) : (
        <>
          <Navigation account={account} setAccount={setAccount} onToggleDebug={toggleDebug} onLogout={handleLogout} onDisconnect={handleDisconnect} />
          <DebugInfo 
            account={account} 
            isAdmin={isAdmin} 
            isOwner={isOwner} 
            villageChat={villageChat} 
            isVisible={debugVisible}
            onClose={() => setDebugVisible(false)}
          />

          <main>
            <Servers onServerClick={handleServerClick} activeServer={activeServer} isAdmin={isAdmin} />

            {currentPage === 'chat' ? (
              <>
                <Channels
                  account={account}
                  currentChannel={currentChannel}
                  setCurrentChannel={setCurrentChannel}
                  isAdmin={isAdmin}
                  isOwner={isOwner}
                />

                <Messages account={account} currentChannel={currentChannel} />
              </>
            ) : currentPage === 'vote' ? (
              <Vote />
            ) : currentPage === 'leaders' ? (
              <Leaders />
            ) : currentPage === 'chief' ? (
              <Chief 
                villageChat={villageChat}
                account={account}
                isOwner={isOwner}
              />
            ) : (
              <Marketplace />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
