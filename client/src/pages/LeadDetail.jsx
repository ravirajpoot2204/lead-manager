import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const LeadDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState('');
  const [members, setMembers] = useState([]);

  const fetchLead = async () => {
    const { data } = await API.get(`/api/leads/${id}`);
    setLead(data);
  };

useEffect(() => {
  if (user.role === 'admin') {
    setMembers([
      { _id: '6a64614ee753c41ee56ccf76', name: 'RAM Member One' },
      { _id: '6a64614ee753c41ee56ccf77', name: 'SHYAM Member Two' }
    ]);
  }
}, [user]);

  const handleStatusChange = async (newStatus) => {
    await API.patch(`/api/leads/${id}`, { status: newStatus });
    fetchLead();
  };

  const handleAssign = async (assignTo) => {
    await API.patch(`/api/leads/${id}`, { assignedTo: assignTo || null });
    fetchLead();
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await API.post(`/api/leads/${id}/notes`, { content: note });
    setNote('');
    fetchLead();
  };

  if (!lead) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <h2>{lead.name}</h2>
      <p>Email: {lead.email} | Phone: {lead.phone || 'N/A'} | Source: {lead.source}</p>
      <p>Status: 
        <select value={lead.status} onChange={e => handleStatusChange(e.target.value)}>
          <option>New</option><option>Contacted</option><option>Qualified</option>
          <option>Proposal</option><option>Negotiation</option><option>Won</option><option>Lost</option>
        </select>
      </p>
      <p>Assigned to: {lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}
        {user.role === 'admin' && (
          <select onChange={e => handleAssign(e.target.value)} defaultValue="">
            <option value="" disabled>Reassign</option>
            <option value="">Unassign</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        )}
      </p>

      <h3>Notes</h3>
      <ul>
        {lead.notes?.map(n => (
          <li key={n._id}>{n.content} <small>by {n.createdBy?.name}</small></li>
        ))}
      </ul>
      <form onSubmit={addNote}>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." rows={3} />
        <br/><button type="submit">Add Note</button>
      </form>

      <h3>Activity Timeline</h3>
      <ul>
        {lead.activities?.map(act => (
          <li key={act._id || act.timestamp}>
            <strong>{act.action}</strong>: {act.details} 
            <small> by {act.performedBy?.name || 'System'} at {new Date(act.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default LeadDetail;