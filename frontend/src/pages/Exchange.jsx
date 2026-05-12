import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';
import { ArrowRightLeft, RefreshCw, CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';

const USDT_TO_INR = 106;

const Exchange = () => {
  const { user, setUser } = useContext(AuthContext);
  const [pair, setPair] = useState('USDT_TO_INR'); // 'USDT_TO_INR' or 'INR_TO_USDT'
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [inrBalance, setInrBalance] = useState(user?.inrBalance || 0);
  const [usdtBalance, setUsdtBalance] = useState(user?.usdtBalance || 0);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api('/wallet');
      setInrBalance(res.inrBalance || 0);
      setUsdtBalance(res.usdtBalance || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const numAmount = Number(amount);
  const isUsdtToInr = pair === 'USDT_TO_INR';
  const fromCurrency = isUsdtToInr ? 'USDT' : 'INR';
  const toCurrency = isUsdtToInr ? 'INR' : 'USDT';
  const activeBalance = isUsdtToInr ? usdtBalance : inrBalance;

  const preview = amount && !isNaN(numAmount) && numAmount > 0
    ? isUsdtToInr
      ? (numAmount * USDT_TO_INR).toFixed(2)
      : (numAmount / USDT_TO_INR).toFixed(6)
    : null;

  const handleSwitch = () => {
    setPair(p => p === 'USDT_TO_INR' ? 'INR_TO_USDT' : 'USDT_TO_INR');
    setAmount('');
    setError('');
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return setError('Please enter a valid amount.');
    }

    if (numAmount > activeBalance) {
      return setError(`Insufficient ${fromCurrency} balance.`);
    }

    setLoading(true);
    try {
      const res = await api('/exchange', {
        method: 'POST',
        body: JSON.stringify({ fromCurrency, amount: numAmount })
      });

      setInrBalance(res.newInrBalance);
      setUsdtBalance(res.newUsdtBalance);

      // Update user context balances too
      if (setUser) {
        setUser(prev => prev ? { ...prev, inrBalance: res.newInrBalance, usdtBalance: res.newUsdtBalance } : prev);
      }

      setSuccess({
        fromAmount: numAmount,
        toAmount: res.exchange.toAmount,
        fromCurrency,
        toCurrency
      });
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (val, currency) =>
    currency === 'INR'
      ? `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`
      : `${Number(val).toFixed(4)} USDT`;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingBottom: '1rem' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', height: '250px',
        background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6" style={{ position: 'relative', zIndex: 1 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Exchange</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
            Instant currency conversion
          </p>
        </div>
        <div style={{
          background: 'rgba(139,92,246,0.15)', padding: '8px', borderRadius: '10px',
          border: '1px solid rgba(139,92,246,0.3)'
        }}>
          <ArrowRightLeft size={20} color="#a78bfa" />
        </div>
      </div>

      {/* Rate Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '12px', padding: '0.875rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div className="flex items-center gap-2">
          <Zap size={16} color="#a78bfa" />
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Live Rate</span>
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#c4b5fd' }}>
          1 USDT = ₹{USDT_TO_INR} INR
        </div>
      </div>

      {/* Pair Selector */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem'
      }}>
        {/* From Card */}
        <div
          onClick={() => setPair('USDT_TO_INR')}
          style={{
            background: isUsdtToInr
              ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 100%)'
              : 'rgba(30,41,59,0.6)',
            border: isUsdtToInr ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '1.25rem 1rem', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.25s ease',
            boxShadow: isUsdtToInr ? '0 4px 20px rgba(139,92,246,0.2)' : 'none'
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>💵</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isUsdtToInr ? '#c4b5fd' : 'var(--text-muted)' }}>USDT</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>→ INR</div>
        </div>

        {/* Switch Button */}
        <button
          onClick={handleSwitch}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
            border: 'none', borderRadius: '50%', width: '42px', height: '42px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease', flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}
        >
          <ArrowRightLeft size={18} color="#fff" />
        </button>

        {/* To Card */}
        <div
          onClick={() => setPair('INR_TO_USDT')}
          style={{
            background: !isUsdtToInr
              ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 100%)'
              : 'rgba(30,41,59,0.6)',
            border: !isUsdtToInr ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '1.25rem 1rem', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.25s ease',
            boxShadow: !isUsdtToInr ? '0 4px 20px rgba(139,92,246,0.2)' : 'none'
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🇮🇳</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: !isUsdtToInr ? '#c4b5fd' : 'var(--text-muted)' }}>INR</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>→ USDT</div>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px',
        padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontWeight: 600 }}>
          Available {fromCurrency} Balance
        </p>
        <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-1px', color: isUsdtToInr ? '#93c5fd' : '#6ee7b7' }}>
          {isUsdtToInr
            ? `${usdtBalance.toFixed(4)} USDT`
            : `₹${inrBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>INR Balance</div>
            <div style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 600 }}>₹{inrBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>USDT Balance</div>
            <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 600 }}>{usdtBalance.toFixed(4)} USDT</div>
          </div>
        </div>
      </div>

      {/* Exchange Card */}
      <div style={{
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem'
      }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#fca5a5', fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <CheckCircle size={20} color="#6ee7b7" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6ee7b7' }}>Exchange Successful!</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(110,231,183,0.7)', marginTop: '2px' }}>
                {formatAmount(success.fromAmount, success.fromCurrency)} → {formatAmount(success.toAmount, success.toCurrency)}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                You Send ({fromCurrency})
              </label>
              <button
                type="button"
                onClick={() => setAmount(activeBalance.toString())}
                style={{
                  background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                  color: '#c4b5fd', fontSize: '0.65rem', padding: '0.2rem 0.6rem',
                  borderRadius: '5px', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.5px'
                }}
              >
                MAX
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.000001"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(''); setSuccess(null); }}
                placeholder="0.00"
                style={{
                  width: '100%', padding: '1.25rem 5rem 1.25rem 1.25rem',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: '#fff', fontSize: '1.75rem', fontWeight: 700,
                  fontFamily: 'var(--font-family)', outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <span style={{
                position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)',
                fontWeight: 700, fontSize: '0.875rem',
                color: isUsdtToInr ? '#93c5fd' : '#6ee7b7'
              }}>
                {fromCurrency}
              </span>
            </div>
          </div>

          {/* Live Preview Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TrendingUp size={14} color="#a78bfa" />
            </div>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* You Receive */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
              You Receive ({toCurrency})
            </label>
            <div style={{
              padding: '1.25rem',
              background: preview
                ? 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.05) 100%)'
                : 'rgba(0,0,0,0.2)',
              border: preview ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '1.75rem', fontWeight: 700,
                color: preview ? (isUsdtToInr ? '#6ee7b7' : '#93c5fd') : 'rgba(255,255,255,0.2)'
              }}>
                {preview
                  ? (isUsdtToInr ? `₹${Number(preview).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : preview)
                  : '0.00'}
              </span>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isUsdtToInr ? '#6ee7b7' : '#93c5fd' }}>
                {toCurrency}
              </span>
            </div>

            {/* Live rate hint */}
            {preview && (
              <div style={{
                marginTop: '0.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)',
                textAlign: 'center', animation: 'fadeIn 0.3s ease'
              }}>
                {isUsdtToInr
                  ? `${numAmount} USDT ≈ ₹${Number(preview).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`
                  : `₹${numAmount.toLocaleString('en-IN')} INR ≈ ${preview} USDT`}
                {' · '}Rate: 1 USDT = ₹{USDT_TO_INR}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !amount || numAmount <= 0 || numAmount > activeBalance}
            style={{
              width: '100%', padding: '1.1rem',
              background: loading || !amount || numAmount <= 0 || numAmount > activeBalance
                ? 'rgba(124,58,237,0.3)'
                : 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
              border: 'none', borderRadius: '14px',
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              cursor: loading || !amount || numAmount <= 0 || numAmount > activeBalance ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: loading || !amount ? 'none' : '0 8px 24px rgba(124,58,237,0.4)',
              transition: 'all 0.25s ease', fontFamily: 'var(--font-family)'
            }}
          >
            {loading ? (
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <ArrowRightLeft size={20} />
                Convert {fromCurrency} → {toCurrency}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Exchange;
