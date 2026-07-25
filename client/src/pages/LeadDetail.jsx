import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState('');
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', source: '' });

  const fetchLead = async () => {
    try {
      const { data } = await API.get(`/api/leads/${id}`);
      setLead(data);
      setEditForm({ name: data.name, email: data.email, phone: data.phone || '', source: data.source });
    } catch (err) {
      console.error('Fetch lead error:', err);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

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

  const handleEditSave = async (e) => {
    e.preventDefault();
    await API.put(`/api/leads/${id}`, editForm);
    setEditing(false);
    fetchLead();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await API.delete(`/api/leads/${id}`);
      navigate('/dashboard');
    }
  };

  if (!lead) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <h2>{lead.name}</h2>
      {user?.role === 'admin' && (
        <div style={{ marginBottom: '1rem' }}>
          {!editing ? (
            <button onClick={() => setEditing(true)}>Edit Details</button>
          ) : (
            <button onClick={() => setEditing(false)}>Cancel Edit</button>
          )}
          <button onClick={handleDelete} style={{ marginLeft: '1rem', background: 'red', color: 'white' }}>
            Delete Lead
          </button>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleEditSave}>
          <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" required />
          <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email" required />
          <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone" />
          <select value={editForm.source} onChange={e => setEditForm({...editForm, source: e.target.value})}>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
          </select>
          <button type="submit">Save</button>
        </form>
      ) : (
        <p>Email: {lead.email} | Phone: {lead.phone || 'N/A'} | Source: {lead.source}</p>
      )}

      <p>Status:
        <select value={lead.status} onChange={e => handleStatusChange(e.target.value)}>
          <option>New</option><option>Contacted</option><option>Qualified</option>
          <option>Proposal</option><option>Negotiation</option><option>Won</option><option>Lost</option>
        </select>
      </p>

      <p>Assigned to:
        {user?.role === 'admin' ? (
          <select value={lead.assignedTo?._id || ''} onChange={e => handleAssign(e.target.value)}>
            {lead.assignedTo ? (
              <>
                <option value="" disabled>Assigned to: {lead.assignedTo.name}</option>
                <option value="">Unassign</option>
              </>
            ) : (
              <option value="" disabled>Unassigned</option>
            )}
            {members.map(m => (
              <option key={m._id} value={m._id} disabled={lead.assignedTo?._id === m._id}>
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