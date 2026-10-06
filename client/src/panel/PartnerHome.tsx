import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import type {RootState} from '../store';
import type {ApiPartner, PartnerTypeKey} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {logOut, setSession} from '../store/slices/userSlice';
import {PhoneField, TextField, cleanPhone} from '../pb/forms';
import {PanelLayout} from './PanelLayout';
import {panelApi} from './panelApi';

export const PARTNER_TYPES: Record<PartnerTypeKey, {label: string; icon: string; panel: string}> = {
  hotel: {label: 'Hotel / Villa / Homestay', icon: 'fa-hotel', panel: 'Stay Partner Panel'},
  restaurant: {label: 'Restaurant / Cafe', icon: 'fa-utensils', panel: 'Restaurant Panel'},
  pharmacy: {label: 'Medical Store', icon: 'fa-prescription-bottle-medical', panel: 'Medical Panel'},
  cab: {label: 'Cab / Taxi Driver', icon: 'fa-car', panel: 'Cab Driver Panel'},
  delivery: {label: 'Delivery Partner', icon: 'fa-motorcycle', panel: 'Delivery Panel'},
};

const STATUS_TEXT: Record<ApiPartner['status'], string> = {
  pending: 'Waiting for admin approval',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      dispatch(setSession(await panelApi.login(cleanPhone(phone), password)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className='pb-card'
      onSubmit={submit}
      noValidate={true}
    >
      <h2 className='pb-detail-title'>Partner & Admin Login</h2>
      <p className='pb-detail-text'>Hotels, restaurants, medical stores, cab drivers, delivery partners and the Primebookin team.</p>
      <PhoneField
        label='Registered Mobile Number'
        value={phone}
        onChange={setPhone}
      />
      <TextField
        icon='fa-key'
        label='Password'
        type='password'
        autoComplete='current-password'
        value={password}
        onChange={setPassword}
      />
      {error && <p className='pb-error'>{error}</p>}
      <button
        className='pb-btn-solid'
        type='submit'
        disabled={loading}
      >
        {loading ? 'Please wait...' : 'Sign In'}
      </button>
      <p
        className='pb-detail-text'
        style={{textAlign: 'center', marginTop: 14}}
      >
        New partner?{' '}
        <button
          type='button'
          className='pb-link-btn'
          style={{color: 'var(--pb-red)', fontWeight: 600}}
          onClick={() => navigate('/partner/register')}
        >
          Register your business
        </button>
      </p>
    </form>
  );
};

export const PartnerHome: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.userSlice.user);
  const [partners, setPartners] = useState<ApiPartner[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    panelApi
      .mine()
      .then(setPartners)
      .catch((err) => setError(errorMessage(err)));
  }, [user]);

  return (
    <PanelLayout
      title='Primebookin Partners'
      onBack={() => navigate('/')}
      right={
        user && (
          <button
            className='pb-call'
            onClick={() => dispatch(logOut())}
          >
            <i className='fa-solid fa-right-from-bracket' /> Sign out
          </button>
        )
      }
    >
      {!user ? (
        <Login />
      ) : (
        <>
          <h2 className='pb-page-title'>Hello, {user.name}</h2>
          <p className='pb-page-sub'>{user.phone}</p>

          {user.role === 'admin' && (
            <button
              className='pb-card pb-account'
              onClick={() => navigate('/admin')}
            >
              <span className='pb-tile-icon'>
                <i className='fa-solid fa-user-shield' />
              </span>
              <span>
                <strong>Admin Panel</strong>
                <small>Approvals, orders, live map, fares, settings</small>
              </span>
              <i className='fa-solid fa-chevron-right' />
            </button>
          )}

          {error && <p className='pb-error'>{error}</p>}
          {partners?.map((p) => {
            const t = PARTNER_TYPES[p.type];
            const open = p.status === 'approved';
            return (
              <button
                key={p._id}
                className='pb-card pb-account'
                disabled={!open}
                onClick={() => navigate(`/partner/${p._id}`)}
              >
                <span className='pb-tile-icon'>
                  <i className={`fa-solid ${t.icon}`} />
                </span>
                <span>
                  <strong>{p.businessName}</strong>
                  <small>{t.panel}</small>
                  <em className={`pb-account-status is-${p.status}`}>
                    {STATUS_TEXT[p.status]}
                    {p.statusNote ? ` — ${p.statusNote}` : ''}
                  </em>
                </span>
                {open && <i className='fa-solid fa-chevron-right' />}
              </button>
            );
          })}
          {partners && !partners.length && user.role !== 'admin' && (
            <p className='pb-empty'>You have no partner accounts yet.</p>
          )}

          <button
            className='pb-btn-outline'
            style={{width: '100%', marginTop: 4}}
            onClick={() => navigate('/partner/register')}
          >
            <i className='fa-solid fa-plus' /> Register a business / as a driver or rider
          </button>
        </>
      )}
    </PanelLayout>
  );
};
