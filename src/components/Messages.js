import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";

// Assets
import person from '../assets/person.svg';
import send from '../assets/send.svg';

// Socket
const socket = io('ws://localhost:3030');

const Messages = ({ account, currentChannel }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (currentChannel) {
      fetchMessages();
      socket.emit('join channel', currentChannel.id);
    }

    return () => {
      if (currentChannel) {
        socket.emit('leave channel', currentChannel.id);
      }
    };
  }, [currentChannel]);

  useEffect(() => {
    socket.on('get messages', (channelMessages) => {
      setMessages(channelMessages);
    });

    socket.on('new message', (newMessage) => {
      if (newMessage.channelId === currentChannel?.id) {
        setMessages(prev => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off('get messages');
      socket.off('new message');
    };
  }, [currentChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!currentChannel) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3030/api/messages/${currentChannel.id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !currentChannel || !account) return;

    const messageObj = {
      channelId: currentChannel.id,
      account: account,
      text: message.trim(),
      username: username || account.slice(0, 6) + '...' + account.slice(38, 42)
    };

    try {
      // Send via socket for real-time updates
      socket.emit('new message', messageObj);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!currentChannel) {
    return (
      <div className="text">
        <div className="messages" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          color: '#a0a0a0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Welcome to VillageChat</h3>
            <p>Select a channel to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text">
      <div className="messages">
        <div style={{ 
          padding: '15px', 
          borderBottom: '1px solid #333',
          background: 'rgba(0, 255, 65, 0.1)'
        }}>
          <h3 style={{ color: '#00ff41', margin: 0 }}>
            #{currentChannel.name}
          </h3>
          <p style={{ color: '#a0a0a0', margin: '5px 0 0 0', fontSize: '0.9em' }}>
            {currentChannel.description}
          </p>
        </div>

        {loading ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#a0a0a0' 
          }}>
            Loading messages...
          </div>
        ) : (
          <div style={{ padding: '10px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className="message" style={{
                display: 'flex',
                marginBottom: '15px',
                padding: '10px',
                borderRadius: '5px',
                background: 'rgba(26, 26, 26, 0.5)'
              }}>
                <img 
                  src={person} 
                  alt="Person" 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    marginRight: '10px',
                    borderRadius: '50%'
                  }} 
                />
                <div className="message_content" style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '5px' 
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      color: '#00ff41', 
                      fontSize: '0.9em',
                      marginRight: '10px'
                    }}>
                      {msg.username || msg.account.slice(0, 6) + '...' + msg.account.slice(38, 42)}
                    </h3>
                    <span style={{ 
                      color: '#666', 
                      fontSize: '0.8em' 
                    }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    color: '#e0e0e0',
                    lineHeight: '1.4'
                  }}>
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} style={{
        display: 'flex',
        padding: '15px',
        borderTop: '1px solid #333',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        {account ? (
          <>
            <input 
              type="text" 
              value={message} 
              placeholder={`Message #${currentChannel.name}`} 
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '5px',
                color: '#e0e0e0',
                marginRight: '10px'
              }}
            />
            <button 
              type="submit"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #00ff41, #1a1a1a)',
                border: '2px solid #00ff41',
                borderRadius: '5px',
                color: '#0a0a0a',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              <img src={send} alt="Send Message" style={{ width: '16px', height: '16px' }} />
            </button>
          </>
        ) : (
          <input 
            type="text" 
            value="" 
            placeholder="Please connect your wallet to chat" 
            disabled
            style={{
              flex: 1,
              padding: '10px',
              background: '#333',
              border: '1px solid #666',
              borderRadius: '5px',
              color: '#666',
              marginRight: '10px'
            }}
          />
        )}
      </form>

      {account && (
        <div style={{
          padding: '10px 15px',
          background: 'rgba(0, 128, 255, 0.1)',
          borderTop: '1px solid #0080ff'
        }}>
          <input
            type="text"
            placeholder="Set your username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '3px',
              color: '#e0e0e0',
              fontSize: '0.9em'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Messages;