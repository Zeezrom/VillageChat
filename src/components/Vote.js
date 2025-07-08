import { useState } from 'react'

const Vote = () => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  const voteOptions = [
    {
      id: 1,
      title: "Expand Settlement Walls",
      description: "Allocate resources to strengthen our perimeter defenses",
      votes: 12,
      cost: "50 scrap metal"
    },
    {
      id: 2,
      title: "Establish Medical Bay",
      description: "Create a dedicated healing station for wounded survivors",
      votes: 8,
      cost: "30 medical supplies"
    },
    {
      id: 3,
      title: "Upgrade Power Grid",
      description: "Improve electrical infrastructure for better living conditions",
      votes: 15,
      cost: "75 circuit boards"
    },
    {
      id: 4,
      title: "Scout New Territory",
      description: "Send exploration team to search for additional resources",
      votes: 6,
      cost: "25 fuel units"
    }
  ]

  const handleVote = (optionId) => {
    setSelectedOption(optionId)
    setHasVoted(true)
    // Here you could add blockchain voting logic
  }

  const totalVotes = voteOptions.reduce((sum, option) => sum + option.votes, 0)

  return (
    <div className="vote-container">
      <div className="vote-header">
        <h1>VILLAGE VOTING SYSTEM</h1>
        <p className="vote-subtitle">Decide the future of our settlement</p>
      </div>

      <div className="vote-content">
        <div className="vote-info">
          <h2>Active Proposals</h2>
          <p>Current voting period: 24 hours remaining</p>
          <p>Total votes cast: {totalVotes}</p>
        </div>

        <div className="vote-options">
          {voteOptions.map((option) => (
            <div 
              key={option.id} 
              className={`vote-option ${selectedOption === option.id ? 'selected' : ''}`}
              onClick={() => handleVote(option.id)}
            >
              <div className="vote-option-header">
                <h3>{option.title}</h3>
                <span className="vote-count">{option.votes} votes</span>
              </div>
              <p className="vote-description">{option.description}</p>
              <div className="vote-details">
                <span className="vote-cost">Cost: {option.cost}</span>
                <div className="vote-progress">
                  <div 
                    className="vote-progress-bar" 
                    style={{ width: `${(option.votes / totalVotes) * 100}%` }}
                  ></div>
                </div>
              </div>
              {selectedOption === option.id && (
                <div className="vote-confirmation">
                  ✓ Vote recorded
                </div>
              )}
            </div>
          ))}
        </div>

        {hasVoted && (
          <div className="vote-message">
            <p>Your vote has been recorded on the blockchain. Thank you for participating in our democracy.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Vote 