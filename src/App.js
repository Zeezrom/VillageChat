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

  // Check admin status
  const checkAdminStatus = async (villageChatContract, userAccount) => {
    if (!villageChatContract || !userAccount) return
    
    try {
      console.log('Checking admin status for account:', userAccount)
      const isAdminStatus = await villageChatContract.isAdmin(userAccount)
      const ownerAddress = await villageChatContract.owner()
      const isOwnerStatus = userAccount.toLowerCase() === ownerAddress.toLowerCase()
      
      console.log('Admin status:', isAdminStatus)
      console.log('Owner status:', isOwnerStatus)
      console.log('Owner address:', ownerAddress)
      
      setIsAdmin(isAdminStatus)
      setIsOwner(isOwnerStatus)
    } catch (error) {
      console.error('Error checking admin/owner status:', error)
      setIsAdmin(false)
      setIsOwner(false)
    }
  }

  //creating an ether provider
  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const villageChat = new ethers.Contract(config[network.chainId].VillageChat.address, VillageChat, provider)
    setVillageChat(villageChat)

    const totalChannels = await villageChat.totalChannels()
    const channels = []

    for (var i = 1; i <= totalChannels; i++) {
      const channel = await villageChat.getChannel(i)
      channels.push(channel)
      console.log(channel)
    }

    setChannels(channels)

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
    // Check if user is trying to access admin page
    if (server === 'chief' && !isAdmin) {
      alert('Access denied. Only administrators can access the Chief Admin Panel.')
      return
    }
    
    setCurrentPage(server)
    setActiveServer(server)
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <DebugInfo account={account} isAdmin={isAdmin} isOwner={isOwner} villageChat={villageChat} />

      <main>
        <Servers onServerClick={handleServerClick} activeServer={activeServer} isAdmin={isAdmin} />

        {currentPage === 'chat' ? (
          <>
            <Channels
              provider={provider}
              account={account}
              villageChat={villageChat}
              channels={channels}
              currentChannel={currentChannel}
              setCurrentChannel={setCurrentChannel}
            />

            <Messages account={account} messages={messages} currentChannel={currentChannel} />
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
    </div>
  );
}

export default App;
