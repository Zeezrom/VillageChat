import React, { useState } from 'react';
import './Marketplace.css';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('goods');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [newAuction, setNewAuction] = useState({ item: '', startingPrice: '', description: '' });

  const [goods] = useState([
    {
      id: 1,
      name: "Scrap Metal",
      category: "Materials",
      price: 15,
      quantity: 50,
      seller: "Scavenger Pete",
      description: "High-grade scrap metal salvaged from the old city. Perfect for repairs and crafting.",
      image: "🔧"
    },
    {
      id: 2,
      name: "Medical Supplies",
      category: "Medicine",
      price: 45,
      quantity: 12,
      seller: "Dr. Elena",
      description: "Essential medical supplies including bandages, antiseptics, and painkillers.",
      image: "💊"
    },
    {
      id: 3,
      name: "Energy Cells",
      category: "Technology",
      price: 80,
      quantity: 8,
      seller: "Tech Specialist Jen",
      description: "Rechargeable energy cells for powering equipment and weapons.",
      image: "⚡"
    },
    {
      id: 4,
      name: "Clean Water",
      category: "Survival",
      price: 25,
      quantity: 30,
      seller: "Water Purifier",
      description: "Purified drinking water, essential for survival in the wasteland.",
      image: "💧"
    },
    {
      id: 5,
      name: "Combat Knife",
      category: "Weapons",
      price: 120,
      quantity: 5,
      seller: "Blacksmith Marcus",
      description: "Handcrafted combat knife with razor-sharp edge and durable handle.",
      image: "🔪"
    },
    {
      id: 6,
      name: "Radiation Suit",
      category: "Protection",
      price: 200,
      quantity: 3,
      seller: "Survival Gear Co.",
      description: "Heavy-duty radiation suit for exploring contaminated zones.",
      image: "☢️"
    }
  ]);

  const [auctions] = useState([
    {
      id: 1,
      item: "Rare Energy Weapon",
      currentBid: 350,
      startingPrice: 200,
      timeLeft: "2h 15m",
      bidders: 8,
      description: "Advanced energy weapon salvaged from military bunker. Fully functional.",
      seller: "Explorer Sarah",
      image: "⚡🔫"
    },
    {
      id: 2,
      item: "Pre-War Medicine",
      currentBid: 180,
      startingPrice: 100,
      timeLeft: "45m",
      bidders: 12,
      description: "Unopened pre-war medical supplies. Extremely rare and valuable.",
      seller: "Medic Elena",
      image: "💊🏥"
    },
    {
      id: 3,
      item: "Vehicle Parts",
      currentBid: 420,
      startingPrice: 300,
      timeLeft: "5h 30m",
      bidders: 5,
      description: "Complete set of vehicle parts for rebuilding transportation.",
      seller: "Mechanic Alex",
      image: "🚗🔧"
    }
  ]);

  const [userInventory] = useState([
    {
      id: 1,
      name: "Scrap Metal",
      quantity: 25,
      value: 375
    },
    {
      id: 2,
      name: "Energy Cells",
      quantity: 3,
      value: 240
    },
    {
      id: 3,
      name: "Medical Supplies",
      quantity: 8,
      value: 360
    }
  ]);

  const handleBuyItem = (item) => {
    alert(`Purchased ${item.name} for ${item.price} credits!`);
  };

  const handlePlaceBid = (auction) => {
    const bidAmount = prompt(`Current bid: ${auction.currentBid}. Enter your bid:`);
    if (bidAmount && parseFloat(bidAmount) > auction.currentBid) {
      alert(`Bid placed: ${bidAmount} credits on ${auction.item}!`);
    }
  };

  const createAuction = () => {
    if (!newAuction.item || !newAuction.startingPrice || !newAuction.description) {
      alert('Please fill in all fields');
      return;
    }
    alert(`Auction created for ${newAuction.item} starting at ${newAuction.startingPrice} credits!`);
    setNewAuction({ item: '', startingPrice: '', description: '' });
    setShowAuctionModal(false);
  };

  const renderGoods = () => (
    <div className="marketplace-section">
      <div className="section-header">
        <h2>Available Goods</h2>
        <div className="filters">
          <select className="filter-select">
            <option value="">All Categories</option>
            <option value="Materials">Materials</option>
            <option value="Medicine">Medicine</option>
            <option value="Technology">Technology</option>
            <option value="Survival">Survival</option>
            <option value="Weapons">Weapons</option>
            <option value="Protection">Protection</option>
          </select>
        </div>
      </div>
      
      <div className="goods-grid">
        {goods.map(item => (
          <div key={item.id} className="goods-item" onClick={() => setSelectedItem(item)}>
            <div className="item-image">{item.image}</div>
            <div className="item-info">
              <h3>{item.name}</h3>
              <span className="item-category">{item.category}</span>
              <span className="item-price">{item.price} credits</span>
              <span className="item-quantity">Stock: {item.quantity}</span>
              <span className="item-seller">Seller: {item.seller}</span>
            </div>
            <button className="buy-btn" onClick={(e) => { e.stopPropagation(); handleBuyItem(item); }}>
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuctions = () => (
    <div className="marketplace-section">
      <div className="section-header">
        <h2>Live Auctions</h2>
        <button className="create-auction-btn" onClick={() => setShowAuctionModal(true)}>
          + Create Auction
        </button>
      </div>
      
      <div className="auctions-grid">
        {auctions.map(auction => (
          <div key={auction.id} className="auction-item">
            <div className="auction-image">{auction.image}</div>
            <div className="auction-info">
              <h3>{auction.item}</h3>
              <p className="auction-description">{auction.description}</p>
              <div className="auction-details">
                <span className="current-bid">Current Bid: {auction.currentBid} credits</span>
                <span className="time-left">Time Left: {auction.timeLeft}</span>
                <span className="bidders">{auction.bidders} bidders</span>
                <span className="seller">Seller: {auction.seller}</span>
              </div>
            </div>
            <button className="bid-btn" onClick={() => handlePlaceBid(auction)}>
              Place Bid
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="marketplace-section">
      <div className="section-header">
        <h2>Your Inventory</h2>
        <span className="total-value">Total Value: 975 credits</span>
      </div>
      
      <div className="inventory-grid">
        {userInventory.map(item => (
          <div key={item.id} className="inventory-item">
            <div className="item-info">
              <h3>{item.name}</h3>
              <span className="item-quantity">Quantity: {item.quantity}</span>
              <span className="item-value">Value: {item.value} credits</span>
            </div>
            <div className="inventory-actions">
              <button className="sell-btn">Sell</button>
              <button className="auction-btn">Auction</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1 className="marketplace-title">VILLAGE MARKETPLACE</h1>
        <div className="marketplace-stats">
          <span className="stat">Total Items: {goods.length + auctions.length}</span>
          <span className="stat">Active Auctions: {auctions.length}</span>
        </div>
      </div>

      <div className="marketplace-tabs">
        <button 
          className={`tab ${activeTab === 'goods' ? 'active' : ''}`}
          onClick={() => setActiveTab('goods')}
        >
          Goods & Services
        </button>
        <button 
          className={`tab ${activeTab === 'auctions' ? 'active' : ''}`}
          onClick={() => setActiveTab('auctions')}
        >
          Live Auctions
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Your Inventory
        </button>
      </div>

      <div className="marketplace-content">
        {activeTab === 'goods' && renderGoods()}
        {activeTab === 'auctions' && renderAuctions()}
        {activeTab === 'inventory' && renderInventory()}
      </div>

      {selectedItem && (
        <div className="item-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
            <div className="item-details">
              <div className="item-image-large">{selectedItem.image}</div>
              <h2>{selectedItem.name}</h2>
              <p className="item-description">{selectedItem.description}</p>
              <div className="item-stats">
                <span>Category: {selectedItem.category}</span>
                <span>Price: {selectedItem.price} credits</span>
                <span>Quantity: {selectedItem.quantity}</span>
                <span>Seller: {selectedItem.seller}</span>
              </div>
              <button className="buy-now-btn" onClick={() => { handleBuyItem(selectedItem); setSelectedItem(null); }}>
                Buy Now - {selectedItem.price} credits
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuctionModal && (
        <div className="auction-modal">
          <div className="modal-content">
            <h3>Create New Auction</h3>
            <input
              type="text"
              placeholder="Item Name"
              value={newAuction.item}
              onChange={(e) => setNewAuction({...newAuction, item: e.target.value})}
              className="auction-input"
            />
            <input
              type="number"
              placeholder="Starting Price (credits)"
              value={newAuction.startingPrice}
              onChange={(e) => setNewAuction({...newAuction, startingPrice: e.target.value})}
              className="auction-input"
            />
            <textarea
              placeholder="Item Description"
              value={newAuction.description}
              onChange={(e) => setNewAuction({...newAuction, description: e.target.value})}
              className="auction-textarea"
            />
            <div className="modal-actions">
              <button onClick={createAuction} className="confirm-btn">Create Auction</button>
              <button onClick={() => setShowAuctionModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace; 