import React, { useEffect, useState, useContext } from 'react';
import { adminApi } from '../utils/adminApi';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { LogOut, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, RefreshCw } from 'lucide-react';

/* ─────────── helpers ─────────── */
const fmt = (d) =>
  new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  color: '#fcd34d' },
    success:  { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: '#6ee7b7' },
    approved: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: '#6ee7b7' },
    failed:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: '#fca5a5' },
    rejected: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: '#fca5a5' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.68rem',
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
      background: s.bg, border: `1px solid ${s.border}`, color: s.color
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: s.color,
        animation: status === 'pending' ? 'pulse-dot 1.5s infinite' : 'none'
      }} />
      {status}
    </span>
  );
};

const TypeBadge = ({ label, color = '#93c5fd', bg = 'rgba(59,130,246,0.12)' }) => (
  <span style={{
    padding: '2px 8px', borderRadius: '5px', fontSize: '0.62rem',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    background: bg, color, border: `1px solid ${color}33`
  }}>
    {label}
  </span>
);

const ActionBtn = ({ label, variant, onClick, disabled }) => {
  const styles = {
    approve: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', color: '#6ee7b7', hbg: 'rgba(16,185,129,0.28)' },
    reject:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',   color: '#fca5a5', hbg: 'rgba(239,68,68,0.22)' },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, padding: '0.55rem 0', fontSize: '0.8rem', fontWeight: 700,
        borderRadius: '10px', border: `1px solid ${s.border}`,
        background: s.bg, color: s.color, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1, transition: 'all 0.18s ease',
        fontFamily: 'var(--font-family)', letterSpacing: '0.01em'
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = s.hbg; }}
      onMouseLeave={e => { e.currentTarget.style.background = s.bg; }}
    >
      {label}
    </button>
  );
};

/* section header */
const SectionHeader = ({ icon, title, count, accentColor = '#3b82f6' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '0.875rem', marginTop: '0.25rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '9px',
        background: `${accentColor}22`, border: `1px solid ${accentColor}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{title}</span>
    </div>
    <span style={{
      padding: '2px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
      background: `${accentColor}18`, border: `1px solid ${accentColor}30`, color: accentColor
    }}>
      {count}
    </span>
  </div>
);

/* detail row inside a card */
const DetailRow = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, paddingTop: '1px' }}>{label}</span>
    <span style={{
      fontSize: '0.72rem', color: 'var(--text-main)', textAlign: 'right',
      fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all', maxWidth: '72%'
    }}>{value}</span>
  </div>
);

/* ─────────── main component ─────────── */
const AdminDashboard = () => {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const { adminLogout } = useContext(AdminAuthContext);

  useEffect(() => {
    fetchDeposits();
    fetchWithdrawals();
    fetchKycRequests();
    fetchWalletSettings();
  }, []);

  const fetchWithdrawals = async () => {
    try { const data = await adminApi('/admin/withdraws'); setWithdrawals(data); }
    catch (err) { console.error(err); }
  };

  const fetchKycRequests = () => {
    const reqs = JSON.parse(localStorage.getItem('admin_kyc_requests') || '[]');
    setKycRequests(reqs);
  };

  const fetchDeposits = async () => {
    try { const data = await adminApi('/admin/deposits'); setDeposits(data); }
    catch (err) { console.error(err); }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try { await adminApi(`/admin/${action}/${id}`, { method: 'POST' }); await fetchDeposits(); }
    catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleWithdrawAction = async (id, action) => {
    setActionLoading(id);
    try { await adminApi(`/admin/${action}-withdraw/${id}`, { method: 'POST' }); await fetchWithdrawals(); }
    catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleKycAction = (id, action) => {
    const reqs = JSON.parse(localStorage.getItem('admin_kyc_requests') || '[]');
    const updatedReqs = reqs.map(r => r.id === id ? { ...r, status: action } : r);
    localStorage.setItem('admin_kyc_requests', JSON.stringify(updatedReqs));
    fetchKycRequests();
  };

  /* derived counts */
  const pendingDeposits    = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const pendingKyc         = kycRequests.filter(k => k.status === 'pending').length;

  /* ── wallet settings state ── */
  const [walletAddress, setWalletAddress] = useState('');
  const [walletNetwork, setWalletNetwork] = useState('TRC20');
  const [walletInput, setWalletInput]     = useState('');
  const [walletSaving, setWalletSaving]   = useState(false);
  const [walletSaved, setWalletSaved]     = useState(false);
  const [walletError, setWalletError]     = useState('');

  const fetchWalletSettings = async () => {
    try {
      const data = await adminApi('/admin/wallet-settings');
      setWalletAddress(data.cryptoDepositAddress || '');
      setWalletNetwork(data.network || 'TRC20');
      setWalletInput(data.cryptoDepositAddress || '');
    } catch (err) { console.error(err); }
  };

  const handleSaveWallet = async () => {
    setWalletError('');
    if (!walletInput.trim()) return setWalletError('Wallet address cannot be empty.');
    setWalletSaving(true);
    try {
      const data = await adminApi('/admin/wallet-settings', {
        method: 'POST',
        body: JSON.stringify({ cryptoDepositAddress: walletInput.trim(), network: walletNetwork })
      });
      setWalletAddress(data.cryptoDepositAddress);
      setWalletNetwork(data.network);
      setWalletSaved(true);
      setTimeout(() => setWalletSaved(false), 3000);
    } catch (err) {
      setWalletError(err.message);
    } finally {
      setWalletSaving(false);
    }
  };

  /* ── render ── */
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', animation: 'fadeIn 0.35s ease-out' }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{
            fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.4px',
            background: 'linear-gradient(90deg, #ffffff 0%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Ops Panel
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
            Urbbn Exchange · Admin
          </div>
        </div>
        <button
          onClick={adminLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.45rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-family)', transition: 'all 0.18s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
        {[
          { label: 'Pending Deposits',    count: pendingDeposits,    icon: <ArrowDownToLine size={15} color="#6ee7b7" />, accent: '#10b981' },
          { label: 'Pending Withdrawals', count: pendingWithdrawals, icon: <ArrowUpFromLine size={15} color="#f87171" />, accent: '#ef4444' },
          { label: 'Pending KYC',         count: pendingKyc,         icon: <ShieldCheck size={15} color="#fcd34d" />,    accent: '#f59e0b' },
        ].map(({ label, count, icon, accent }) => (
          <div key={label} style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: `1px solid ${accent}28`,
            borderRadius: '14px', padding: '1rem 0.875rem',
            display: 'flex', flexDirection: 'column', gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{icon}
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>{label}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: accent, letterSpacing: '-1px', lineHeight: 1 }}>
              {count}
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ WALLET SETTINGS ══════════ */}
      <div style={{
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '16px', padding: '1.25rem',
        marginBottom: '2rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* accent glow */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#93c5fd" strokeWidth="2"/><path d="M16 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="#93c5fd"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Crypto Deposit Address</span>
          <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: '5px', fontSize: '0.62rem', fontWeight: 700, background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TRC20</span>
        </div>

        {/* Current live address */}
        {walletAddress && (
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '9px', padding: '0.6rem 0.875rem', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>Live</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#93c5fd', wordBreak: 'break-all', textAlign: 'right' }}>{walletAddress}</span>
          </div>
        )}

        {/* Error */}
        {walletError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.6rem 0.875rem', marginBottom: '0.875rem', fontSize: '0.78rem', color: '#fca5a5' }}>
            {walletError}
          </div>
        )}

        {/* Success */}
        {walletSaved && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '0.6rem 0.875rem', marginBottom: '0.875rem', fontSize: '0.78rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Wallet address updated successfully.
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
          <input
            type="text"
            value={walletInput}
            onChange={e => { setWalletInput(e.target.value); setWalletError(''); setWalletSaved(false); }}
            placeholder="Paste new TRC20 wallet address…"
            style={{
              flex: 1, padding: '0.7rem 0.875rem',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: 'var(--text-main)',
              fontSize: '0.78rem', fontFamily: 'monospace',
              outline: 'none', transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={handleSaveWallet}
            disabled={walletSaving}
            style={{
              padding: '0.7rem 1.1rem', borderRadius: '10px', border: 'none',
              background: walletSaving ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff', fontWeight: 700, fontSize: '0.8rem',
              cursor: walletSaving ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-family)', whiteSpace: 'nowrap',
              boxShadow: walletSaving ? 'none' : '0 4px 12px rgba(59,130,246,0.35)',
              transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}
          >
            {walletSaving ? (
              <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
            ) : '✓ Save'}
          </button>
        </div>
        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', margin: '0.5rem 0 0 0' }}>
          Changes take effect immediately — QR code on the Deposit page will update automatically.
        </p>
      </div>

      {/* ══════════ DEPOSIT REQUESTS ══════════ */}
      <SectionHeader
        icon={<ArrowDownToLine size={15} color="#6ee7b7" />}
        title="Deposit Requests"
        count={deposits.length}
        accentColor="#10b981"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
        {deposits.length === 0 ? (
          <div style={{
            padding: '2rem', textAlign: 'center', borderRadius: '14px',
            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)',
            color: 'var(--text-muted)', fontSize: '0.85rem'
          }}>No deposit requests</div>
        ) : deposits.map(d => (
          <div key={d._id} style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '1rem 1.125rem',
            borderLeft: d.status === 'pending' ? '3px solid #f59e0b' : d.status === 'success' ? '3px solid #10b981' : '3px solid #ef4444'
          }}>
            {/* row 1: email + badges + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {d.userId?.email || 'Unknown'}
                </span>
                <TypeBadge label={d.type === 'inr' ? 'INR' : 'CRYPTO'} color={d.type === 'inr' ? '#6ee7b7' : '#93c5fd'} bg={d.type === 'inr' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)'} />
                <TypeBadge label="DEPOSIT" color="#a78bfa" bg="rgba(139,92,246,0.1)" />
              </div>
              <StatusBadge status={d.status} />
            </div>

            {/* row 2: amount + date */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: d.type === 'inr' || d.txHash ? '0.75rem' : '0' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                {d.currency === 'INR' ? `₹${d.amount}` : `${d.amount}`}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '5px' }}>
                  {d.currency === 'INR' ? 'INR' : 'USDT'}
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{fmt(d.createdAt)}</span>
            </div>

            {/* detail block */}
            {d.type === 'inr' && (
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '9px',
                padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column',
                gap: '0.35rem', marginBottom: d.status === 'pending' ? '0.75rem' : 0
              }}>
                <DetailRow label="UTR" value={d.utr || '—'} mono />
                {d.upiId && <DetailRow label="UPI" value={d.upiId} />}
                {d.screenshot && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Screenshot</span>
                    <a href={d.screenshot} target="_blank" rel="noreferrer"
                      style={{ fontSize: '0.68rem', color: 'var(--primary)', textDecoration: 'none' }}>
                      View ↗
                    </a>
                  </div>
                )}
              </div>
            )}
            {d.type !== 'inr' && d.txHash && (
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '9px',
                padding: '0.6rem 0.75rem', marginBottom: d.status === 'pending' ? '0.75rem' : 0
              }}>
                <DetailRow label="TX Hash" value={d.txHash} mono />
              </div>
            )}

            {/* action buttons */}
            {d.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ActionBtn label={actionLoading === d._id ? 'Processing…' : '✓ Approve'} variant="approve"
                  onClick={() => handleAction(d._id, 'approve')} disabled={actionLoading === d._id} />
                <ActionBtn label="✕ Reject" variant="reject"
                  onClick={() => handleAction(d._id, 'reject')} disabled={actionLoading === d._id} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.75rem' }} />

      {/* ══════════ WITHDRAW REQUESTS ══════════ */}
      <SectionHeader
        icon={<ArrowUpFromLine size={15} color="#f87171" />}
        title="Withdraw Requests"
        count={withdrawals.length}
        accentColor="#ef4444"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
        {withdrawals.length === 0 ? (
          <div style={{
            padding: '2rem', textAlign: 'center', borderRadius: '14px',
            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)',
            color: 'var(--text-muted)', fontSize: '0.85rem'
          }}>No withdrawal requests</div>
        ) : withdrawals.map(w => (
          <div key={w._id} style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '1rem 1.125rem',
            borderLeft: w.status === 'pending' ? '3px solid #f59e0b' : w.status === 'success' ? '3px solid #10b981' : '3px solid #ef4444'
          }}>
            {/* row 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {w.userId?.email || 'Unknown'}
                </span>
                <TypeBadge label={w.type === 'crypto' ? 'CRYPTO' : 'INR'} color={w.type === 'crypto' ? '#93c5fd' : '#6ee7b7'} bg={w.type === 'crypto' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)'} />
                <TypeBadge label="WITHDRAW" color="#f87171" bg="rgba(239,68,68,0.1)" />
              </div>
              <StatusBadge status={w.status} />
            </div>

            {/* row 2 */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                {w.currency === 'USDT' ? `${w.amount}` : `₹${w.amount}`}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '5px' }}>
                  {w.currency === 'USDT' ? 'USDT' : 'INR'}
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{fmt(w.createdAt)}</span>
            </div>

            {/* detail block */}
            {w.type === 'crypto' ? (
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '9px',
                padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column',
                gap: '0.35rem', marginBottom: w.status === 'pending' ? '0.75rem' : 0
              }}>
                <DetailRow label="Network" value={w.network || 'TRC20'} />
                <DetailRow label="Wallet" value={w.walletAddress} mono />
              </div>
            ) : w.details ? (
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '9px',
                padding: '0.6rem 0.75rem', marginBottom: w.status === 'pending' ? '0.75rem' : 0
              }}>
                <DetailRow label="UPI / Bank" value={w.details} mono />
              </div>
            ) : null}

            {w.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ActionBtn label={actionLoading === w._id ? 'Processing…' : '✓ Approve'} variant="approve"
                  onClick={() => handleWithdrawAction(w._id, 'approve')} disabled={actionLoading === w._id} />
                <ActionBtn label="✕ Reject" variant="reject"
                  onClick={() => handleWithdrawAction(w._id, 'reject')} disabled={actionLoading === w._id} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.75rem' }} />

      {/* ══════════ KYC REQUESTS ══════════ */}
      <SectionHeader
        icon={<ShieldCheck size={15} color="#fcd34d" />}
        title="KYC Requests"
        count={kycRequests.length}
        accentColor="#f59e0b"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingBottom: '3rem' }}>
        {kycRequests.length === 0 ? (
          <div style={{
            padding: '2rem', textAlign: 'center', borderRadius: '14px',
            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)',
            color: 'var(--text-muted)', fontSize: '0.85rem'
          }}>No KYC requests</div>
        ) : kycRequests.map(k => (
          <div key={k.id} style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '1rem 1.125rem',
            borderLeft: k.status === 'pending' ? '3px solid #f59e0b' : k.status === 'approved' ? '3px solid #10b981' : '3px solid #ef4444'
          }}>
            {/* row 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {k.email || 'Unknown'}
                </span>
                <TypeBadge label="KYC" color="#fcd34d" bg="rgba(245,158,11,0.1)" />
              </div>
              <StatusBadge status={k.status === 'approved' ? 'approved' : k.status === 'rejected' ? 'rejected' : 'pending'} />
            </div>

            {/* row 2 */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                {k.firstName} {k.lastName}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{k.documentId}</span>
            </div>

            {k.documentPic && (
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '9px',
                padding: '0.6rem 0.75rem', marginBottom: k.status === 'pending' ? '0.75rem' : 0
              }}>
                <DetailRow label="Doc Photo" value={k.documentPic} mono />
              </div>
            )}

            {k.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ActionBtn label="✓ Approve" variant="approve" onClick={() => handleKycAction(k.id, 'approved')} />
                <ActionBtn label="✕ Reject"  variant="reject"  onClick={() => handleKycAction(k.id, 'rejected')} />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
