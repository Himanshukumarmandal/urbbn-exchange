import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';
import { ArrowUpFromLine, Banknote, Landmark, RefreshCw, Smartphone, AlertCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Withdraw = () => {
  const { user } = useContext(AuthContext);
  const [withdrawType, setWithdrawType] = useState('inr'); // 'inr' or 'crypto'
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusState, setStatusState] = useState(null);

  const navigate = useNavigate();
  const inrBalance = user?.inrBalance || 0;
  const usdtBalance = user?.usdtBalance || 0;
  const activeBalance = withdrawType === 'inr' ? inrBalance : usdtBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return setError('Please enter a valid withdrawal amount.');
    }

    if (withdrawType === 'inr') {
      if (numAmount > inrBalance) return setError('Withdrawal amount exceeds available INR balance.');
      if (!details.trim()) return setError('Please provide your UPI ID or Bank details.');
    } else {
      if (numAmount < 5) return setError('Minimum USDT withdrawal is 5 USDT.');
      if (numAmount > usdtBalance) return setError('Withdrawal amount exceeds available USDT balance.');
      if (!walletAddress.trim()) return setError('Please enter your TRC20 wallet address.');
    }

    setLoading(true);
    try {
      const payload = withdrawType === 'inr'
        ? { type: 'inr', amount: numAmount, details: details.trim() }
        : { type: 'crypto', amount: numAmount, walletAddress: walletAddress.trim() };

      await api('/withdraw', { method: 'POST', body: JSON.stringify(payload) });

      setStatusState('pending');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (statusState === 'pending') {
    return (
      <div className="flex-col items-center justify-center" style={{ minHeight: '70vh', animation: 'fadeIn 0.4s ease-out' }}>
        <div className="card card-elevated text-center flex-col items-center justify-center gap-4" style={{ padding: '4rem 2rem', width: '100%' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <div className="qr-glow" style={{ width: '100%', height: '100%', opacity: 0.5, borderRadius: '50%' }}></div>
            <RefreshCw size={40} className="text-primary" style={{ animation: 'spin 2s linear infinite', position: 'relative', zIndex: 2 }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: '1rem 0 0 0' }}>Request Submitted ⏳</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Your {withdrawType === 'inr' ? 'INR' : 'USDT'} withdrawal is under review.
          </p>
          <span className="badge badge-pending" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <span className="status-dot"></span> Pending Approval
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', position: 'relative', paddingBottom: '2rem' }}>
      <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200%', height: '300px', background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }}></div>

      <h2 className="text-center mb-6" style={{ fontWeight: 600 }}>Withdraw Funds</h2>

      {/* Tab Selection */}
      <div className="flex gap-4 mb-6">
        <div
          onClick={() => { setWithdrawType('inr'); setAmount(''); setError(''); }}
          className={`card flex-1 text-center cursor-pointer transition-all ${withdrawType === 'inr' ? 'card-elevated' : 'opacity-60'}`}
          style={{
            padding: '1.25rem',
            border: withdrawType === 'inr' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
            background: withdrawType === 'inr' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.4)'
          }}
        >
          <div className="flex justify-center mb-2">
            <Landmark size={24} color={withdrawType === 'inr' ? 'var(--primary)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: withdrawType === 'inr' ? 'var(--text-main)' : 'var(--text-muted)' }}>INR Withdraw</div>
        </div>

        <div
          onClick={() => { setWithdrawType('crypto'); setAmount(''); setError(''); }}
          className={`card flex-1 text-center cursor-pointer transition-all ${withdrawType === 'crypto' ? 'card-elevated' : 'opacity-60'}`}
          style={{
            padding: '1.25rem',
            border: withdrawType === 'crypto' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
            background: withdrawType === 'crypto' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.4)'
          }}
        >
          <div className="flex justify-center mb-2">
            <Smartphone size={24} color={withdrawType === 'crypto' ? 'var(--primary)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: withdrawType === 'crypto' ? 'var(--text-main)' : 'var(--text-muted)' }}>Crypto (USDT)</div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="card card-elevated text-center mb-6" style={{ padding: '2rem 1.5rem', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div className="flex justify-center mb-3">
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Banknote size={24} />
          </div>
        </div>
        <p className="text-muted mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Available {withdrawType === 'inr' ? 'INR' : 'USDT'} Balance
        </p>
        <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: 700, background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
          {withdrawType === 'inr'
            ? `₹${inrBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : `${usdtBalance.toFixed(4)} USDT`}
        </h1>
      </div>

      {/* Info Banner */}
      {withdrawType === 'crypto' && (
        <div className="card mb-6" style={{ background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
          <AlertCircle size={24} style={{ color: '#fcd34d', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#fcd34d', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600 }}>TRC20 Network Only</h4>
            <p style={{ color: 'rgba(252, 211, 77, 0.8)', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
              Enter your <strong>USDT TRC20</strong> wallet address. Using any other network will result in permanent loss.
            </p>
          </div>
        </div>
      )}

      {withdrawType === 'inr' && (
        <div className="card mb-6" style={{ background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
          <Landmark size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600 }}>Secure Bank Transfer</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
              Withdrawals are usually processed within <strong>5–30 minutes</strong> directly to your UPI or Bank account.
            </p>
          </div>
        </div>
      )}

      {/* Withdraw Form */}
      <div className="card card-elevated" style={{ padding: '1.5rem' }}>
        {error && <div className="alert alert-danger mb-4" style={{ borderRadius: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="form-group mb-5">
            <div className="flex justify-between items-end mb-2">
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                Withdrawal Amount ({withdrawType === 'inr' ? 'INR' : 'USDT'})
              </label>
              <button
                type="button"
                onClick={() => setAmount(activeBalance.toString())}
                style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                MAX
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                style={{ fontSize: '1.5rem', fontWeight: 600, padding: '1.25rem 4.5rem 1.25rem 1.25rem', height: 'auto', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <span style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-muted)' }}>
                {withdrawType === 'inr' ? 'INR' : 'USDT'}
              </span>
            </div>
          </div>

          {/* Type-specific fields */}
          {withdrawType === 'inr' ? (
            <div className="form-group mb-6">
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>UPI ID or Bank Details</label>
              <input
                type="text"
                className="form-input"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. user@ybl or A/C 1234..."
                required
                style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.875rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          ) : (
            <div className="form-group mb-6">
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>TRC20 Wallet Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Paste your USDT TRC20 address"
                  required
                  style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.875rem', padding: '1rem 3.5rem 1rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Copy size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              </div>
              <p className="text-muted mt-2" style={{ fontSize: '0.7rem' }}>Network: TRC20 (Tron) — Fixed</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || activeBalance <= 0}
            style={{
              padding: '1.25rem',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <RefreshCw size={20} className="text-white" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <ArrowUpFromLine size={20} />
                {withdrawType === 'inr' ? 'Request INR Withdrawal' : 'Request USDT Withdrawal'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
