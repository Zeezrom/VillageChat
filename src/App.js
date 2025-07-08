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
  const [currentPage, setCurrentPage] = useState('chat') // 'chat', 'vote', 'leaders', or 'marketplace'
  const [activeServer, setActiveServer] = useState('chat')

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

  const handleServerClick = (server) => {
    setCurrentPage(server)
    setActiveServer(server)
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <main>
        <Servers onServerClick={handleServerClick} activeServer={activeServer} />

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
        ) : (
          <Marketplace />
        )}
      </main>
    </div>
  );
}

export default App;
