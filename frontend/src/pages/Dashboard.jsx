import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const USDT_TO_INR = 106;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [inrBalance, setInrBalance] = useState(user?.inrBalance || 0);
  const [usdtBalance, setUsdtBalance] = useState(user?.usdtBalance || 0);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  const totalWalletInr = inrBalance + (usdtBalance * USDT_TO_INR);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, depositsRes, withdrawalsRes, exchangesRes] = await Promise.all([
        api('/wallet'),
        api('/deposit'),
        api('/withdraw'),
        api('/exchange')
      ]);

      setInrBalance(walletRes.inrBalance || 0);
      setUsdtBalance(walletRes.usdtBalance || 0);

      const formattedDeposits = depositsRes.map(d => ({
        ...d,
        transactionType: 'deposit',
        displayAmount: d.currency === 'INR' ? `₹${d.amount}` : `${d.amount}`,
        displayCurrency: d.currency || 'USDT'
      }));
      const formattedWithdrawals = withdrawalsRes.map(w => ({
        ...w,
        transactionType: 'withdrawal',
        displayAmount: w.currency === 'USDT' ? `${w.amount}` : `₹${w.amount}`,
        displayCurrency: w.currency || 'INR'
      }));
      const formattedExchanges = exchangesRes.map(ex => ({
        ...ex,
        transactionType: 'exchange',
        status: ex.status || 'success',
        displayAmount: ex.fromCurrency === 'USDT'
          ? `${ex.fromAmount} USDT → ₹${Number(ex.toAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : `₹${Number(ex.fromAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} → ${ex.toAmount} USDT`,
        displayCurrency: `${ex.fromCurrency} → ${ex.toCurrency}`
      }));

      const allTransactions = [...formattedDeposits, ...formattedWithdrawals, ...formattedExchanges]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTransactions(allTransactions);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return <span className="badge badge-success"><span className="status-dot"></span>Success</span>;
      case 'failed': return <span className="badge badge-failed"><span className="status-dot"></span>Failed</span>;
      default: return <span className="badge badge-pending"><span className="status-dot"></span>Pending</span>;
    }
  };

  return (
    <div>
      {/* Brand Header */}
      <div className="flex items-center mb-6" style={{ gap: '0.75rem' }}>
        {/* Logo mark */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(59,130,246,0.4)'
        }}>
          {/* U-shaped mark */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 4v8a6 6 0 0 0 12 0V4"
              stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            />
            <line x1="9" y1="18" x2="13" y2="18" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16.5" cy="4.5" r="2" fill="#fff" opacity="0.9" />
          </svg>
        </div>
        {/* Brand name */}
        <div>
          <div style={{
            fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1,
            background: 'linear-gradient(90deg, #ffffff 0%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Urbbn Exchange
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px', marginTop: '1px' }}>
            Your crypto wallet
          </div>
        </div>
      </div>

      {/* Total Wallet Balance — Hero Card */}
      <div className="card card-elevated mb-4 text-center" style={{
        padding: '2.5rem 1.5rem',
        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '280px', height: '160px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div className="flex justify-center mb-3">
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '10px' }}>
            <TrendingUp size={20} color="var(--primary)" />
          </div>
        </div>
        <p style={{ fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
          Total Wallet Value
        </p>
        <h1 style={{
          fontSize: '2.75rem',
          margin: '0 0 0.25rem 0',
          fontWeight: 700,
          background: 'linear-gradient(to right, #ffffff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          ₹{totalWalletInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h1>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          INR + USDT converted @ ₹{USDT_TO_INR}/USDT
        </p>
      </div>

      {/* Split Balance Row */}
      <div className="flex gap-4 mb-6">
        {/* INR Balance */}
        <div className="card flex-1 text-center" style={{
          padding: '1.25rem 1rem',
          background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(110, 231, 183, 0.7)', marginBottom: '0.5rem', fontWeight: 600 }}>
            INR Balance
          </p>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#6ee7b7', letterSpacing: '-0.5px' }}>
            ₹{inrBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>Indian Rupee</p>
        </div>

        {/* USDT Balance */}
        <div className="card flex-1 text-center" style={{
          padding: '1.25rem 1rem',
          background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(147, 197, 253, 0.7)', marginBottom: '0.5rem', fontWeight: 600 }}>
            USDT Balance
          </p>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#93c5fd', letterSpacing: '-0.5px' }}>
            {usdtBalance.toFixed(4)}
          </div>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>Tether (TRC20)</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => navigate('/deposit')}
          className="btn btn-primary"
          style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '16px' }}
        >
          <ArrowDownToLine size={24} />
          <span style={{ fontSize: '0.875rem' }}>Deposit</span>
        </button>
        <button
          onClick={() => navigate('/exchange')}
          className="btn"
          style={{
            flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
            color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.3)'
          }}
        >
          <ArrowRightLeft size={24} />
          <span style={{ fontSize: '0.875rem' }}>Exchange</span>
        </button>
        <button
          onClick={() => navigate('/withdraw')}
          className="btn btn-primary"
          style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '16px' }}
        >
          <ArrowUpFromLine size={24} />
          <span style={{ fontSize: '0.875rem' }}>Withdraw</span>
        </button>
      </div>

      <h3 className="mb-4">Recent Transactions</h3>

      {transactions.length === 0 ? (
        <div className="card text-center text-muted" style={{ padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '50%' }}>
            <ArrowDownToLine size={32} opacity={0.5} />
          </div>
          <p>No recent transactions.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {transactions.map(t => (
            <div key={t._id} className="card card-elevated flex justify-between items-center" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-4">
                <div style={{
                  background: t.transactionType === 'withdrawal'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : t.transactionType === 'exchange'
                    ? 'rgba(139, 92, 246, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
                  padding: '10px',
                  borderRadius: '12px'
                }}>
                  {t.transactionType === 'withdrawal' ? (
                    <ArrowUpFromLine size={20} style={{ color: '#f87171' }} />
                  ) : t.transactionType === 'exchange' ? (
                    <ArrowRightLeft size={20} style={{ color: '#a78bfa' }} />
                  ) : (
                    <ArrowDownToLine size={20} style={{ color: '#6ee7b7' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                    {t.displayAmount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.displayCurrency}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {t.transactionType === 'withdrawal' ? '↑ Withdrawal'
                      : t.transactionType === 'exchange' ? '⇄ Exchange'
                      : '↓ Deposit'}
                    {' · '}
                    {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div>
                {getStatusBadge(t.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
