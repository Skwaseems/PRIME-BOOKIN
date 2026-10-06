import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import type {RootState} from '../store';
import {LiveEvent, openStream, ring, soundReady, unlockSound} from './panelApi';

export type Tab = {key: string; label: string; icon: string; badge?: number};

type Props = {
  title: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  tabs?: Tab[];
  tab?: string;
  onTab?: (key: string) => void;
  onBack?: () => void;
  children: React.ReactNode;
};

// Frame for partner and admin panels: red header, content, bottom tabs.
export const PanelLayout: React.FC<Props> = ({title, subtitle, right, tabs, tab, onTab, onBack, children}) => {
  const navigate = useNavigate();
  return (
    <div className={`pb pb-panel${tabs?.length ? '' : ' no-tabs'}`}>
      <header className='pb-header pb-panel-header'>
        <div className='pb-header-row is-detail'>
          <div className='pb-header-title'>
            <button
              onClick={onBack || (() => navigate('/partner'))}
              aria-label='Back'
            >
              <i className='fa-solid fa-arrow-left' />
            </button>
            <div style={{minWidth: 0}}>
              <h1>{title}</h1>
              {subtitle && <div className='pb-panel-sub'>{subtitle}</div>}
            </div>
          </div>
          {right}
        </div>
      </header>
      <main className='pb-body'>{children}</main>
      {tabs && tabs.length > 0 && (
        <nav
          className='pb-nav'
          style={{gridTemplateColumns: `repeat(${tabs.length}, 1fr)`}}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`pb-nav-item${tab === t.key ? ' is-active' : ''}`}
              onClick={() => onTab?.(t.key)}
              aria-current={tab === t.key ? 'page' : undefined}
            >
              <i className={`fa-solid ${t.icon}`} />
              {t.label}
              {!!t.badge && <span className='pb-badge'>{t.badge}</span>}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

// Keeps a panel live: listens for alerts, calls onChange, and rings while
// `pending` > 0 (new orders / open jobs) until they're handled.
export const useLive = (path: string | null, pending: number, onChange: (e: LiveEvent) => void) => {
  const token = useSelector((s: RootState) => s.userSlice.token);
  const [connected, setConnected] = useState(false);
  const [sound, setSound] = useState(soundReady());
  const handler = useRef(onChange);
  handler.current = onChange;

  useEffect(() => {
    if (!path || !token) return;
    return openStream(path, token, (e) => handler.current(e), setConnected);
  }, [path, token]);

  // Fallback refresh in case an event is missed.
  useEffect(() => {
    const timer = setInterval(() => handler.current({event: 'poll', data: {}}), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!pending) return;
    ring();
    const timer = setInterval(ring, 4000);
    return () => clearInterval(timer);
  }, [pending]);

  const enableSound = () => {
    unlockSound();
    setSound(true);
    ring();
  };

  return {connected, sound, enableSound};
};

export const LiveBar: React.FC<{connected: boolean; sound: boolean; onEnableSound: () => void}> = ({
  connected,
  sound,
  onEnableSound,
}) => (
  <div className='pb-livebar'>
    <span className={connected ? 'is-on' : ''}>
      <i className='fa-solid fa-circle' /> {connected ? 'Live alerts on' : 'Connecting…'}
    </span>
    {!sound && (
      <button onClick={onEnableSound}>
        <i className='fa-solid fa-volume-high' /> Turn on ringing
      </button>
    )}
  </div>
);
