const Footer = () => (
  <footer style={{
    textAlign: 'center',
    padding: '1.2rem',
    marginTop: '3rem',
    background: '#1a1a2e',
    color: '#e0e0e0',
    fontSize: '0.95rem',
    borderTop: '2px solid #e94560'
  }}>
    <span>Built by </span>
    <a
      href="https://instagram.com/ravirajpoot2204"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#e94560', fontWeight: 'bold', textDecoration: 'none' }}
    >
      Ravi Rajpoot
    </a>
    <span> | </span>
    <a
      href="https://linkedin.com/in/ravirajpoot2204"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#e94560', fontWeight: 'bold', textDecoration: 'none' }}
    >
      LinkedIn
    </a>
  </footer>
);

export default Footer;
