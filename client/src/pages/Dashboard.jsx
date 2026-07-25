import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Dashboard = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ status: '', search: '', assignedTo: '' });
    const [members, setMembers] = useState([]);

    // Set real member IDs
 useEffect(() => {
  if (user?.role === 'admin') {
    API.get('/api/users/members')
      .then(({ data }) => setMembers(data))
      .catch(err => console.error('Failed to fetch members:', err));
  }
}, [user]);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 10 });
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);
            if (user?.role === 'admin' && filters.assignedTo) params.append('assignedTo', filters.assignedTo);

            const { data } = await API.get(`/api/leads?${params.toString()}`);
            setLeads(data.leads);
            setTotalPages(data.pages);
        } catch (err) {
            console.error('Fetch leads error:', err);
        } finally {
            setLoading(false);
        }
    }, [page, filters, user?.role]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            await API.patch(`/api/leads/${leadId}`, { status: newStatus });
            fetchLeads();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

const handleAssign = async (leadId, assignTo) => {
  console.log('Assigning lead:', leadId, 'to:', assignTo);
  try {
    const payload = assignTo ? { assignedTo: assignTo } : { assignedTo: null };
    await API.patch(`/api/leads/${leadId}`, payload);
    fetchLeads();
  } catch (err) {
    console.error('Assign error:', err.response);
    alert('Assignment failed: ' + (err.response?.data?.message || err.message));
  }
};
    return (
        <Layout>
            <h2>Dashboard</h2>
            <div style={{ marginBottom: '1rem' }}>
                <input
                    placeholder="Search..."
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                />
                <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All Status</option>
                    <option>New</option><option>Contacted</option><option>Qualified</option>
                    <option>Proposal</option><option>Negotiation</option><option>Won</option><option>Lost</option>
                </select>
                {user?.role === 'admin' && (
                    <select value={filters.assignedTo} onChange={e => setFilters({ ...filters, assignedTo: e.target.value })}>
                        <option value="">All Members</option>
                        <option value="unassigned">Unassigned</option>
                        {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                )}
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Name</th><th>Email</th><th>Status</th><th>Assigned To</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr key={lead._id}>
                                <td><Link to={`/leads/${lead._id}`}>{lead.name}</Link></td>
                                <td>{lead.email}</td>
                                <td>
                                    <select
                                        value={lead.status}
                                        onChange={e => handleStatusChange(lead._id, e.target.value)}
                                    >
                                        <option>New</option><option>Contacted</option><option>Qualified</option>
                                        <option>Proposal</option><option>Negotiation</option><option>Won</option><option>Lost</option>
                                    </select>
                                </td>
                               <td>
  {user?.role === 'admin' ? (
    <select
      value={lead.assignedTo?._id || ''}
      onChange={e => handleAssign(lead._id, e.target.value)}
    >
      {/* If assigned, show a disabled label + Unassign option */}
      {lead.assignedTo ? (
        <>
          <option value="" disabled>
            Assigned to: {lead.assignedTo.name}
          </option>
          <option value="">Unassign</option>
        </>
      ) : (
        /* If unassigned, show only a disabled placeholder */
        <option value="" disabled>
          Unassigned
        </option>
      )}
      {/* List all members, disable the currently assigned one */}
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
    /* For members – just show plain text */
    lead.assignedTo ? lead.assignedTo.name : 'Unassigned'
  )}
</td> <td><Link to={`/leads/${lead._id}`}>View</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div style={{ marginTop: '1rem' }}>
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span> Page {page} of {totalPages} </span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
        </Layout>
    );
};

export default Dashboard;