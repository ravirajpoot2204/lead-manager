import { useState } from 'react';
import API from '../services/api';
import Layout from '../components/Layout';

const PublicForm = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'website' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/leads/public', form);
      setMessage('Thank you! Your information has been submitted.');
      setForm({ name: '', email: '', phone: '', source: 'website' });
    } catch (err) {
      setMessage('Error submitting form.');
    }
  };

  return (
    <Layout>
      <h2>Get in Touch</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <input required placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /><br/><br/>
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /><br/><br/>
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /><br/><br/>
        <select value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social">Social Media</option>
        </select><br/><br/>
        <button type="submit">Submit</button>
      </form>
    </Layout>
  );
};

export default PublicForm;