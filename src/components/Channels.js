import React, { useState, useEffect } from 'react';

const Channels = ({ account, currentChannel, setCurrentChannel }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

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