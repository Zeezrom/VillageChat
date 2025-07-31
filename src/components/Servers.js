import React from 'react';
import './Servers.css';

// Remove SVG imports and use Unicode symbols instead
const Servers = ({ onServerClick, activeServer, isAdmin }) => {
  console.log('Servers component - isAdmin:', isAdmin)
  
  return (
    <div className="servers">
      <div 
        className={`server-icon ${activeServer === 'chat' ? 'active' : ''}`} 
        onClick={() => onServerClick('chat')}
      >
        💬
      </div>
      <div 
        className={`server-icon ${activeServer === 'vote' ? 'active' : ''}`} 
        onClick={() => onServerClick('vote')}
      >
        🗳️
      </div>
      <div 
        className={`server-icon ${activeServer === 'leaders' ? 'active' : ''}`} 
        onClick={() => onServerClick('leaders')}
      >
        👑
      </div>
      <div 
        className={`server-icon ${activeServer === 'marketplace' ? 'active' : ''}`} 
        onClick={() => onServerClick('marketplace')}
      >
        🏪
      </div>
      {/* TODO: This was wrapped with {isAdmin && ( )} but I took it out because it was not working. */}
        <div 
          className={`server-icon ${activeServer === 'chief' ? 'active' : ''}`} 
          onClick={() => onServerClick('chief')}
          title="Chief Admin Panel"
        >
          🛡️
        </div>
    </div>
  );
};

export default Servers;