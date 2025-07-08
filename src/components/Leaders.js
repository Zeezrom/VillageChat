import React, { useState } from 'react';
import './Leaders.css';

const Leaders = () => {
  const [leaders, setLeaders] = useState([
    {
      id: 1,
      name: "Commander Sarah",
      role: "Village Chief",
      level: 1,
      subordinates: [
        {
          id: 2,
          name: "Scout Master Alex",
          role: "Security Lead",
          level: 2,
          subordinates: [
            { id: 5, name: "Guard Mike", role: "Perimeter Defense", level: 3, subordinates: [] },
            { id: 6, name: "Guard Lisa", role: "Perimeter Defense", level: 3, subordinates: [] }
          ]
        },
        {
          id: 3,
          name: "Engineer Marcus",
          role: "Infrastructure Lead",
          level: 2,
          subordinates: [
            { id: 7, name: "Tech Specialist Jen", role: "Power Systems", level: 3, subordinates: [] },
            { id: 8, name: "Tech Specialist Tom", role: "Communication Systems", level: 3, subordinates: [] }
          ]
        },
        {
          id: 4,
          name: "Medic Dr. Elena",
          role: "Medical Lead",
          level: 2,
          subordinates: [
            { id: 9, name: "Nurse Rachel", role: "Emergency Care", level: 3, subordinates: [] },
            { id: 10, name: "Nurse David", role: "Emergency Care", level: 3, subordinates: [] }
          ]
        }
      ]
    }
  ]);

  const [expandedNodes, setExpandedNodes] = useState(new Set([1, 2, 3, 4]));
  const [newLeader, setNewLeader] = useState({ name: '', role: '', parentId: null });
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const addLeader = () => {
    if (!newLeader.name || !newLeader.role) return;

    const newId = Date.now();
    const newLeaderNode = {
      id: newId,
      name: newLeader.name,
      role: newLeader.role,
      level: newLeader.parentId ? findLeaderLevel(leaders, newLeader.parentId) + 1 : 1,
      subordinates: []
    };

    if (newLeader.parentId) {
      setLeaders(prevLeaders => addLeaderToParent(prevLeaders, newLeader.parentId, newLeaderNode));
    } else {
      setLeaders(prevLeaders => [...prevLeaders, newLeaderNode]);
    }

    setNewLeader({ name: '', role: '', parentId: null });
    setShowAddForm(false);
    setExpandedNodes(prev => new Set([...prev, newId]));
  };

  const findLeaderLevel = (leaders, parentId) => {
    for (const leader of leaders) {
      if (leader.id === parentId) return leader.level;
      const found = findLeaderInSubordinates(leader.subordinates, parentId);
      if (found !== null) return found;
    }
    return 0;
  };

  const findLeaderInSubordinates = (subordinates, parentId) => {
    for (const sub of subordinates) {
      if (sub.id === parentId) return sub.level;
      const found = findLeaderInSubordinates(sub.subordinates, parentId);
      if (found !== null) return found;
    }
    return null;
  };

  const addLeaderToParent = (leaders, parentId, newLeader) => {
    return leaders.map(leader => {
      if (leader.id === parentId) {
        return { ...leader, subordinates: [...leader.subordinates, newLeader] };
      }
      return {
        ...leader,
        subordinates: addLeaderToParent(leader.subordinates, parentId, newLeader)
      };
    });
  };

  const removeLeader = (leaderId) => {
    setLeaders(prevLeaders => removeLeaderFromHierarchy(prevLeaders, leaderId));
  };

  const removeLeaderFromHierarchy = (leaders, leaderId) => {
    return leaders
      .filter(leader => leader.id !== leaderId)
      .map(leader => ({
        ...leader,
        subordinates: removeLeaderFromHierarchy(leader.subordinates, leaderId)
      }));
  };

  const getAllLeaders = (leaders) => {
    let all = [];
    leaders.forEach(leader => {
      all.push(leader);
      all = all.concat(getAllLeaders(leader.subordinates));
    });
    return all;
  };

  const renderLeader = (leader, depth = 0) => {
    const isExpanded = expandedNodes.has(leader.id);
    const hasSubordinates = leader.subordinates.length > 0;

    return (
      <div key={leader.id} className="leader-node" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="leader-card">
          <div className="leader-header">
            <div className="leader-info">
              <h3 className="leader-name">{leader.name}</h3>
              <span className="leader-role">{leader.role}</span>
              <span className="leader-level">Level {leader.level}</span>
            </div>
            <div className="leader-actions">
              {hasSubordinates && (
                <button 
                  className="expand-btn"
                  onClick={() => toggleNode(leader.id)}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <button 
                className="remove-btn"
                onClick={() => removeLeader(leader.id)}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        {isExpanded && hasSubordinates && (
          <div className="subordinates">
            {leader.subordinates.map(sub => renderLeader(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const allLeaders = getAllLeaders(leaders);

  return (
    <div className="leaders-container">
      <div className="leaders-header">
        <h1 className="leaders-title">VILLAGE LEADERSHIP</h1>
        <button 
          className="add-leader-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Leader
        </button>
      </div>

      <div className="leaders-content">
        <div className="hierarchy-display">
          {leaders.map(leader => renderLeader(leader))}
        </div>

        {showAddForm && (
          <div className="add-leader-modal">
            <div className="modal-content">
              <h3>Add New Leader</h3>
              <input
                type="text"
                placeholder="Leader Name"
                value={newLeader.name}
                onChange={(e) => setNewLeader({...newLeader, name: e.target.value})}
                className="leader-input"
              />
              <input
                type="text"
                placeholder="Role"
                value={newLeader.role}
                onChange={(e) => setNewLeader({...newLeader, role: e.target.value})}
                className="leader-input"
              />
              <select
                value={newLeader.parentId || ''}
                onChange={(e) => setNewLeader({...newLeader, parentId: e.target.value ? parseInt(e.target.value) : null})}
                className="leader-select"
              >
                <option value="">No Parent (Top Level)</option>
                {allLeaders.map(leader => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name} - {leader.role}
                  </option>
                ))}
              </select>
              <div className="modal-actions">
                <button onClick={addLeader} className="confirm-btn">Add Leader</button>
                <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaders; 