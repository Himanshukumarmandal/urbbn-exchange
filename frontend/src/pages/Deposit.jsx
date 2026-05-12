import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Smartphone, Landmark, UploadCloud, Info } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Deposit = () => {
  const [depositType, setDepositType] = useState('crypto'); // 'crypto' or 'inr'
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [upiId, setUpiId] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');

  // Dynamic wallet address fetched from backend
  const [depositAddress, setDepositAddress] = useState('');
  const [depositNetwork, setDepositNetwork] = useState('TRC20');
  const [addressLoading, setAddressLoading] = useState(true);

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusState, setStatusState] = useState(null);

  const navigate = useNavigate();

  const EXCHANGE_RATE = 106;

  // Fetch admin-configured deposit address on mount
  useEffect(() => {
    api('/wallet/deposit-address')
      .then(data => {
        setDepositAddress(data.cryptoDepositAddress || '');
        setDepositNetwork(data.network || 'TRC20');
      })
      .catch(err => console.error('Could not load deposit address:', err))
      .finally(() => setAddressLoading(false));
  }, []);

  const handleCopy = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusState(null);

    const numAmount = Number(amount);
    
    if (depositType === 'inr') {
      if (!amount || isNaN(numAmount) || numAmount < 100) {
        return setError('Minimum INR deposit is 100');
      }
      if (!utr) {
        return setError('UTR / Transaction ID is required');
      }
    } else {
      if (!amount || isNaN(numAmount) || numAmount < 5 || numAmount > 100000) {
        return setError('Deposit amount must be between 5 and 100,000 USDT');
      }
    }

    setLoading(true);
    try {
      const payload = depositType === 'inr' 
        ? { type: 'inr', amount: numAmount, utr, upiId, screenshot }
        : { type: 'crypto', amount: numAmount, txHash };

      await api('/deposit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setStatusState('pending');
      setAmount('');
      setTxHash('');
      setUpiId('');
      setUtr('');
      setScreenshot('');

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const previewInr = amount && !isNaN(Number(amount)) ? (Number(amount) * EXCHANGE_RATE).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0';

  if (statusState === 'pending') {
    return (
      <div className="flex-col items-center justify-center" style={{ minHeight: '70vh', animation: 'fadeIn 0.4s ease-out' }}>
        <div className="card card-elevated text-center flex-col items-center justify-center gap-4" style={{ padding: '4rem 2rem', width: '100%' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <div className="qr-glow" style={{ width: '100%', height: '100%', opacity: 0.5, borderRadius: '50%' }}></div>
            <RefreshCw size={40} className="text-primary" style={{ animation: 'spin 2s linear infinite', position: 'relative', zIndex: 2 }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: '1rem 0 0 0' }}>Request Under Review</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Usually reviewed within 5–30 minutes</p>
          <span className="badge badge-pending" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}><span className="status-dot"></span> Pending Approval</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', position: 'relative', paddingBottom: '2rem' }}>
      
      <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200%', height: '300px', background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }}></div>

      <h2 className="text-center mb-6" style={{ fontWeight: 600 }}>Deposit Funds</h2>

      {/* Tab Selection */}
      <div className="flex gap-4 mb-6">
        <div 
          onClick={() => setDepositType('crypto')}
          className={`card flex-1 text-center cursor-pointer transition-all ${depositType === 'crypto' ? 'card-elevated' : 'opacity-60'}`}
          style={{ 
            padding: '1.25rem', 
            border: depositType === 'crypto' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
            background: depositType === 'crypto' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.4)'
          }}
        >
          <div className="flex justify-center mb-2">
            <Smartphone size={24} color={depositType === 'crypto' ? 'var(--primary)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: depositType === 'crypto' ? 'var(--text-main)' : 'var(--text-muted)' }}>Crypto (USDT)</div>
        </div>

        <div 
          onClick={() => setDepositType('inr')}
          className={`card flex-1 text-center cursor-pointer transition-all ${depositType === 'inr' ? 'card-elevated' : 'opacity-60'}`}
          style={{ 
            padding: '1.25rem', 
            border: depositType === 'inr' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
            background: depositType === 'inr' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.4)'
          }}
        >
          <div className="flex justify-center mb-2">
            <Landmark size={24} color={depositType === 'inr' ? 'var(--primary)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: depositType === 'inr' ? 'var(--text-main)' : 'var(--text-muted)' }}>INR Deposit</div>
        </div>
      </div>

      {depositType === 'crypto' ? (
        <>
          {/* Crypto Hero Section */}
          <div className="card card-elevated text-center mb-6" style={{ padding: '2rem 1.25rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div className="flex justify-center mb-5">
              <span className="badge badge-success" style={{ padding: '0.35rem 1rem', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7' }}>
                <ShieldCheck size={14} style={{ marginRight: '4px' }} /> Secure TRC20 Deposit
              </span>
            </div>

            <div className="qr-container mb-6" style={{ padding: '1rem', background: 'transparent', border: 'none', position: 'relative' }}>
              <div className="qr-glow" style={{ opacity: 0.6, background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(0, 0, 0, 0) 70%)', transform: 'translate(-50%, -50%) scale(1.2)' }}></div>
              <div className="qr-box" style={{ padding: '1rem', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block' }}>
                {addressLoading ? (
                  <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', borderRadius: '8px' }}>
                    <RefreshCw size={28} color="#0f172a" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : depositAddress ? (
                  <QRCodeSVG value={depositAddress} size={160} fgColor="#0f172a" />
                ) : (
                  <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', borderRadius: '8px', fontSize: '0.7rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                    Address not configured
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{depositNetwork} (Tron) Network</h3>

            <div className="address-box flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}>
              <span className="address-text" style={{ fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.9, letterSpacing: '0.5px' }}>
                {addressLoading ? 'Loading address…' : depositAddress || 'Not configured'}
              </span>
              <button className="copy-btn" onClick={handleCopy} title="Copy Address" disabled={!depositAddress} style={{ background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#6ee7b7' : 'var(--primary)', padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: depositAddress ? 'pointer' : 'not-allowed', transition: 'all 0.2s', marginLeft: '0.75rem' }}>
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Crypto Warning */}
          <div className="card mb-6" style={{ background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
            <AlertCircle size={24} style={{ color: '#fcd34d', flexShrink: 0 }} />
            <div>
              <h4 style={{ color: '#fcd34d', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600 }}>Network Warning</h4>
              <p style={{ color: 'rgba(252, 211, 77, 0.8)', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
                Only send USDT via <strong>TRC20</strong>. Other networks will result in permanent loss.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Razorpay Payment Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Subtle glow */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Header row */}
            <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,130,246,0.35)'
              }}>
                {/* Razorpay-style bolt icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="white" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Pay via Razorpay</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Secure · Instant · UPI / Cards / NetBanking</div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.25rem' }} />

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {[
                { step: '1', text: 'Click the button below to open the Razorpay payment link.' },
                { step: '2', text: 'Complete your INR payment using UPI, Card, or NetBanking.' },
                { step: '3', text: 'Copy the UTR / Transaction ID from your payment receipt.' },
                { step: '4', text: 'Fill in the deposit amount and UTR below and submit.' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3">
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, color: '#93c5fd'
                  }}>{step}</div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{text}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <a
              href="https://razorpay.me/@kumar9943"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none', borderRadius: '14px',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                textDecoration: 'none', fontFamily: 'var(--font-family)',
                boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
                transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(59,130,246,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="white" />
              </svg>
              Pay INR using Razorpay
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '2px', opacity: 0.8 }}>
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            {/* Trust note */}
            <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', margin: '0.75rem 0 0 0' }}>
              🔒 Powered by Razorpay · PCI DSS Compliant
            </p>
          </div>
        </>
      )}

      {/* Main Form */}
      <div className="card card-elevated" style={{ padding: '1.5rem' }}>
        {error && <div className="alert alert-danger mb-4" style={{ borderRadius: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-5">
            <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {depositType === 'inr' ? 'Deposit Amount (INR)' : 'Deposit Amount (USDT)'}
            </label>
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
                {depositType === 'inr' ? 'INR' : 'USDT'}
              </span>
            </div>
            
            {depositType === 'crypto' && (
              <div className="flex items-center gap-2 mt-3" style={{ paddingLeft: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>≈</span>
                <span style={{ color: amount ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>₹{previewInr}</span>
              </div>
            )}
          </div>

          {depositType === 'crypto' ? (
            <div className="form-group mb-6">
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Transaction Hash (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste 64-character TXID"
                style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.875rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          ) : (
            <>
              <div className="form-group mb-4">
                <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>UTR / Transaction ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="12-digit Ref No."
                  required
                  style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.875rem', padding: '1rem 1.25rem' }}
                />
              </div>
              <div className="form-group mb-6">
                <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Screenshot URL / Path <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>(Optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={screenshot}
                    onChange={(e) => setScreenshot(e.target.value)}
                    placeholder="Paste link or path (optional)"
                    style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.875rem', padding: '1rem 3.5rem 1rem 1.25rem' }}
                  />
                  <UploadCloud size={20} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
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
            {loading ? <RefreshCw size={20} className="text-white" style={{ animation: 'spin 1s linear infinite' }} /> : 'Submit Request'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Deposit;
