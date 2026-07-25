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
const [error, setError] = useState(null);
 const fetchLead = async () => {
  try {
    const { data } = await API.get(`/api/leads/${id}`);
    setLead(data);
    setError(null);
  } catch (err) {
    console.error('Fetch lead error:', err.response?.status, err.response?.data);
    setError(err.response?.data?.message || 'Failed to load lead');
  }
};
useEffect(() => {
  fetchLead();
}, [id]);
  // Fetch real member list from the API (only for admins)
  useEffect(() => {
    if (user?.role === 'admin') {
      API.get('/api/users/members')
        .then(({ data }) => setMembers(data))
        .catch(err => console.error('Failed to fetch members:', err));
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

  if (error) return <Layout><p style={{color:'red'}}>Error: {error}</p></Layout>;
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

      <p>Assigned to:
        {user?.role === 'admin' ? (
          <select
            value={lead.assignedTo?._id || ''}
            onChange={e => handleAssign(e.target.value)}
          >
            {lead.assignedTo ? (
              <>
                <option value="" disabled>
                  Assigned to: {lead.assignedTo.name}
                </option>
                <option value="">Unassign</option>
              </>
            ) : (
              <option value="" disabled>
                Unassigned
              </option>
            )}
            {members.map(m => (
              <option
                key={m._id}
                value={m._id}
                disabled={lead.assignedTo?._id === m._id}
              >
                {m.name}
              </option>
            ))}
          </select>
        ) : (
          lead.assignedTo ? lead.assignedTo.name : 'Unassigned'
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