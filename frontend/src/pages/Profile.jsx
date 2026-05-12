import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, ShieldCheck, LifeBuoy, Info, ChevronRight, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [showSecurity, setShowSecurity] = useState(false);
  const [kycStatus, setKycStatus] = useState(() => {
    const requests = JSON.parse(localStorage.getItem('admin_kyc_requests') || '[]');
    const myReq = requests.find(r => r.email === user?.email);
    return myReq ? myReq.status : 'unverified';
  });
  const [kycForm, setKycForm] = useState({ firstName: '', lastName: '', documentId: '', documentPic: '' });

  const handleKycSubmit = (e) => {
    e.preventDefault();
    const newReq = { ...kycForm, email: user?.email, status: 'pending', id: Date.now() };
    const requests = JSON.parse(localStorage.getItem('admin_kyc_requests') || '[]');
    const filtered = requests.filter(r => r.email !== user?.email);
    localStorage.setItem('admin_kyc_requests', JSON.stringify([newReq, ...filtered]));
    setKycStatus('pending');
  };

  if (showSecurity) {
    return (
      <div className="flex-col gap-4 pb-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setShowSecurity(false)} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2 style={{ margin: 0 }}>Security & KYC</h2>
        </div>

        {kycStatus === 'approved' ? (
           <div className="card card-elevated text-center" style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
             <ShieldCheck size={48} style={{ color: '#10b981' }} />
             <h3 style={{ margin: 0 }}>KYC Completed</h3>
             <p className="text-muted" style={{ fontSize: '0.875rem' }}>Your identity has been successfully verified.</p>
             <span className="badge badge-success mt-2"><CheckCircle2 size={14} /> Verified</span>
           </div>
        ) : kycStatus === 'rejected' ? (
           <div className="card card-elevated text-center" style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
             <ShieldCheck size={48} style={{ color: '#ef4444' }} />
             <h3 style={{ margin: 0 }}>KYC Rejected</h3>
             <p className="text-muted" style={{ fontSize: '0.875rem' }}>Your identity documents could not be verified. Please try again with clear documents.</p>
             <button onClick={() => setKycStatus('unverified')} className="btn btn-primary mt-2">Re-Apply Now</button>
           </div>
        ) : kycStatus === 'pending' ? (
           <div className="card card-elevated text-center" style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
             <ShieldCheck size={48} style={{ color: '#fcd34d' }} />
             <h3 style={{ margin: 0 }}>KYC Under Review</h3>
             <p className="text-muted" style={{ fontSize: '0.875rem' }}>Your identity documents are currently being verified by our team. This usually takes 24-48 hours.</p>
             <span className="badge badge-pending mt-2"><span className="status-dot"></span> Pending Review</span>
           </div>
        ) : (
           <div className="card card-elevated" style={{ padding: '1.5rem' }}>
             <h3 className="mb-4" style={{ fontSize: '1.25rem' }}>Identity Verification</h3>
             <form onSubmit={handleKycSubmit}>
               <div className="form-group">
                 <label className="form-label">First Name</label>
                 <input type="text" className="form-input" required value={kycForm.firstName} onChange={e => setKycForm({...kycForm, firstName: e.target.value})} placeholder="Enter first name" />
               </div>
               <div className="form-group">
                 <label className="form-label">Last Name</label>
                 <input type="text" className="form-input" required value={kycForm.lastName} onChange={e => setKycForm({...kycForm, lastName: e.target.value})} placeholder="Enter last name" />
               </div>
               <div className="form-group">
                 <label className="form-label">Document ID (Passport / National ID)</label>
                 <input type="text" className="form-input" required value={kycForm.documentId} onChange={e => setKycForm({...kycForm, documentId: e.target.value})} placeholder="Enter document number" />
               </div>
               <div className="form-group">
                 <label className="form-label">Document Picture</label>
                 <input type="file" accept="image/*" className="form-input" required style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)' }} onChange={e => setKycForm({...kycForm, documentPic: e.target.value})} />
               </div>
               <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%', borderRadius: '12px' }}>Submit for Verification</button>
             </form>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-col gap-4 pb-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 className="text-center mb-1">My Profile</h2>

      {/* Main Profile Info */}
      <div className="card card-elevated text-center" style={{ padding: '1.5rem 1rem', background: 'linear-gradient(145deg, #1e293b 0%, #172033 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)' }}>
            <User size={36} />
          </div>
        </div>
        <h3 className="mb-1" style={{ fontSize: '1.125rem' }}>{user?.email}</h3>
        <p className="text-muted mb-3" style={{ fontSize: '0.75rem' }}>Member since May 2026</p>
        
        <div className="flex justify-center gap-2">
          <span className="badge badge-success" style={{ padding: '0.35rem 0.75rem' }}>
            <CheckCircle2 size={14} /> Verified User
          </span>
        </div>
      </div>

      {/* Wallet Summary */}
      <div className="card card-elevated text-center" style={{ padding: '2rem 1.5rem', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}>
        <p className="text-muted mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Available Balance</p>
        <h1 style={{ fontSize: '3.5rem', margin: 0, fontWeight: 700, background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
          ₹{(user?.inrBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h1>
      </div>

      {/* Settings Options */}
      <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(30, 41, 59, 0.6)' }}>
        <div onClick={() => setShowSecurity(true)} className="settings-item flex justify-between items-center" style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div className="flex items-center gap-3">
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
              <ShieldCheck size={20} />
            </div>
            <span style={{ fontWeight: 500 }}>Security</span>
          </div>
          <div className="flex items-center gap-2">
            {kycStatus === 'approved' ? (
              <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Verified</span>
            ) : kycStatus === 'rejected' ? (
              <span style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Rejected</span>
            ) : kycStatus === 'pending' ? (
              <span style={{ fontSize: '0.7rem', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Pending</span>
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Unverified</span>
            )}
            <ChevronRight size={20} className="text-muted" />
          </div>
        </div>
        
        <div className="settings-item flex justify-between items-center" style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div className="flex items-center gap-3">
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--success)' }}>
              <LifeBuoy size={20} />
            </div>
            <span style={{ fontWeight: 500 }}>Support</span>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>

        <div className="settings-item flex justify-between items-center" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div className="flex items-center gap-3">
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '8px', color: 'var(--text-muted)' }}>
              <Info size={20} />
            </div>
            <span style={{ fontWeight: 500 }}>About App</span>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={logout} 
        className="btn" 
        style={{ 
          background: 'rgba(153, 27, 27, 0.2)', 
          color: '#f87171', 
          border: '1px solid rgba(153, 27, 27, 0.3)',
          padding: '1rem',
          borderRadius: '16px',
          marginTop: '0.5rem',
          transition: 'all 0.2s',
          boxShadow: 'none'
        }}
      >
        <LogOut size={20} />
        <span style={{ fontWeight: 500 }}>Log Out</span>
      </button>

    </div>
  );
};

export default Profile;
