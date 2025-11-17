import React, { useState, useEffect } from 'react';

const Channels = ({ account, currentChannel, setCurrentChannel, isAdmin, isOwner }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('http://localhost:3030/api/channels');
      const data = await response.json();
      setChannels(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setLoading(false);
    }
  };

  const createChannel = async (e) => {
    e.preventDefault();

    if (!newChannelName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('http://localhost:3030/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChannelName.trim(),
          description: newChannelDescription.trim(),
          isAdmin,
          isOwner
        }),
      });

      if (response.ok) {
        const newChannel = await response.json();
        setChannels(prev => [...prev, newChannel]);
        setNewChannelName('');
        setNewChannelDescription('');
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create channel');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel');
    } finally {
      setCreating(false);
    }
  };

  const channelHandler = (channel) => {
    setCurrentChannel(channel);
  };

  if (loading) {
    return (
      <div className="channels">
        <div className="channels__text">
          <h2>Text Channels</h2>
          <div style={{ color: '#a0a0a0', padding: '20px' }}>Loading channels...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="channels">
      <div className="channels__text">
        <h2>Text Channels</h2>
        <div style={{ color: '#a0a0a0', fontSize: '0.9em', marginBottom: '15px' }}>
          Click a channel to join the conversation
        </div>

        {(isAdmin || isOwner) && (
          <div style={{ marginBottom: '15px' }}>
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'linear-gradient(45deg, #00ff41, #1a1a1a)',
                  border: '2px solid #00ff41',
                  borderRadius: '5px',
                  color: '#0a0a0a',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9em'
                }}
              >
                + Create Channel
              </button>
            ) : (
              <form onSubmit={createChannel} style={{
                background: 'rgba(26, 26, 26, 0.8)',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '15px',
                border: '1px solid #333'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Channel name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '3px',
                      color: '#e0e0e0',
                      fontSize: '0.9em',
                      marginBottom: '8px'
                    }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Channel description (optional)"
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={creating}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'linear-gradient(45deg, #00ff41, #1a1a1a)',
                      border: '2px solid #00ff41',
                      borderRadius: '3px',
                      color: '#0a0a0a',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9em'
                    }}
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewChannelName('');
                      setNewChannelDescription('');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#333',
                      border: '1px solid #666',
                      borderRadius: '3px',
                      color: '#e0e0e0',
                      cursor: 'pointer',
                      fontSize: '0.9em'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <ul>
          {channels.map((channel) => (
            <li
              key={channel.id}
              onClick={() => channelHandler(channel)}
              className={currentChannel && currentChannel.id === channel.id ? "active" : ""}
              style={{
                padding: '10px',
                marginBottom: '5px',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: currentChannel && currentChannel.id === channel.id ? '2px solid #00ff41' : '1px solid #333'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#00ff41' }}>
                #{channel.name}
              </div>
              <div style={{ fontSize: '0.8em', color: '#a0a0a0', marginTop: '2px' }}>
                {channel.description}
              </div>
              {channel.cost > 0 && (
                <div style={{ fontSize: '0.7em', color: '#ffa500', marginTop: '2px' }}>
                  Cost: {channel.cost} ETH
                </div>
              )}
            </li>
          ))}
        </ul>

        {channels.length === 0 && (
          <div style={{ color: '#a0a0a0', padding: '20px', textAlign: 'center' }}>
            No channels available. Check your connection.
          </div>
        )}
      </div>
    </div>
  );
};

export default Channels;