import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, adminUser } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (adminUser) {
      navigate('/admin/dashboard');
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      // navigation handled by useEffect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col justify-center items-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
        <div className="text-center mb-6">
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>Admin Portal</h1>
          <p>Secure login for administrators only</p>
        </div>

        <div className="card card-elevated" style={{ borderTop: '4px solid var(--primary)' }}>
          {error && <div className="alert alert-danger mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group mb-6">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
