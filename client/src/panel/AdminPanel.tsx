import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import type {RootState} from '../store';
import type {ApiPartner, PartnerTypeKey} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {PbAlert, PbConfirm} from '../pb/components';
import {PinMap, MapPin} from '../pb/places';
import {rupees} from '../pb/whatsapp';
import {OrderCard, STATUS_LABEL} from './OrderCard';
import {LiveBar, PanelLayout, useLive} from './PanelLayout';
import {PARTNER_TYPES} from './PartnerHome';
import {AdminRequest, AdminStats, Settings, panelApi} from './panelApi';

const TYPES = Object.keys(PARTNER_TYPES) as PartnerTypeKey[];

// ---------- Dashboard ----------

const Dashboard: React.FC<{stats?: AdminStats; onGo: (tab: string) => void; onError: (m: string) => void}> = ({stats, onGo, onError}) => {
  const [privacy, setPrivacy] = useState('');
  if (!stats) return <p className='pb-loading'>Loading…</p>;
  const cards: [string, string | number, string?][] = [
    ['Requests today', stats.requestsToday],
    ['Active now', stats.activeRequests, 'orders'],
    ['Pending approvals', stats.pendingApprovals, 'approvals'],
    ['Gross value', rupees(stats.grossValue)],
    ['Primebookin earnings', rupees(stats.platformEarnings)],
    ['Customers & partners', stats.users],
    ['Riders online', stats.online.delivery || 0, 'map'],
    ['Drivers online', stats.online.cab || 0, 'map'],
  ];
  return (
    <>
      <div className='pb-stats pb-stats-grid'>
        {cards.map(([label, value, tab]) => (
          <button
            key={label}
            disabled={!tab}
            onClick={() => tab && onGo(tab)}
          >
            <small>{label}</small>
            <strong>{value}</strong>
          </button>
        ))}
      </div>

      <h2 className='pb-section-title'>Partners</h2>
      <section className='pb-card'>
        {TYPES.map((t) => {
          const c = stats.partners[t] || {};
          return (
            <div
              key={t}
              className='pb-summary-row'
            >
              <span>
                <i className={`fa-solid ${PARTNER_TYPES[t].icon}`} /> {PARTNER_TYPES[t].label}
              </span>
              <span>
                {c.approved || 0} approved{c.pending ? ` • ${c.pending} pending` : ''}
              </span>
            </div>
          );
        })}
      </section>

      <h2 className='pb-section-title'>Requests by service</h2>
      <section className='pb-card'>
        {Object.entries({basket: 'Food orders', medicine: 'Medicine', stay: 'Room bookings', cab: 'Rides', 'food-custom': 'Custom requests'}).map(([k, label]) => (
          <div
            key={k}
            className='pb-summary-row'
          >
            <span>{label}</span>
            <span>{stats.requestsByType[k] || 0}</span>
          </div>
        ))}
      </section>

      <h2 className='pb-section-title'>Privacy</h2>
      <section className='pb-card'>
        <p className='pb-detail-text'>
          Customer details are removed automatically after the retention period (see Settings). Run it now to clean up
          immediately.
        </p>
        <button
          className='pb-btn-outline'
          onClick={async () => {
            try {
              const r = await panelApi.runPrivacy();
              setPrivacy(`Removed personal data from ${r.requests} request(s) and ${r.applications} rejected application(s) older than ${r.retentionDays} days.`);
            } catch (err) {
              onError(errorMessage(err));
            }
          }}
        >
          <i className='fa-solid fa-user-lock' /> Run privacy cleanup now
        </button>
        {privacy && <p className='pb-note'>{privacy}</p>}
      </section>
    </>
  );
};

// ---------- Approvals ----------

const Approvals: React.FC<{onChanged: () => void; onError: (m: string) => void; refreshKey: number}> = ({onChanged, onError, refreshKey}) => {
  const [status, setStatus] = useState('pending');
  const [type, setType] = useState('');
  const [list, setList] = useState<ApiPartner[]>();
  const [doc, setDoc] = useState<{url: string; pdf: boolean} | null>(null);
  const [rejecting, setRejecting] = useState<{p: ApiPartner; status: 'rejected' | 'suspended'} | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    panelApi
      .partners({status: status || undefined, type: type || undefined})
      .then(setList)
      .catch((err) => onError(errorMessage(err)));
  }, [status, type, onError]);

  useEffect(load, [load, refreshKey]);

  const decide = async (p: ApiPartner, next: string, statusNote?: string) => {
    try {
      await panelApi.setPartnerStatus(p._id, next, statusNote);
      load();
      onChanged();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const openDoc = async (p: ApiPartner, i: number) => {
    try {
      const url = await panelApi.documentUrl(p._id, i);
      const blob = await fetch(url).then((r) => r.blob());
      if (blob.type === 'application/pdf') window.open(url, '_blank', 'noopener');
      else setDoc({url, pdf: false});
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <>
      <div className='pb-filter-row'>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label='Status'
        >
          <option value='pending'>Pending</option>
          <option value='approved'>Approved</option>
          <option value='rejected'>Rejected</option>
          <option value='suspended'>Suspended</option>
          <option value=''>All</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label='Partner type'
        >
          <option value=''>All types</option>
          {TYPES.map((t) => (
            <option
              key={t}
              value={t}
            >
              {PARTNER_TYPES[t].label}
            </option>
          ))}
        </select>
      </div>

      {!list && <p className='pb-loading'>Loading…</p>}
      {list?.length === 0 && <p className='pb-empty'>Nothing here.</p>}
      {list?.map((p) => {
        const owner = typeof p.owner === 'object' ? p.owner : undefined;
        return (
          <article
            key={p._id}
            className='pb-card'
          >
            <div className='pb-booking-head'>
              <span className='pb-tag'>
                <i className={`fa-solid ${PARTNER_TYPES[p.type].icon}`} /> {PARTNER_TYPES[p.type].label}
              </span>
              <span className={`pb-account-status is-${p.status}`}>{p.status}</span>
            </div>
            <h3 className='pb-detail-title'>{p.businessName}</h3>
            <ul className='pb-booking-lines'>
              {owner && (
                <li>
                  <i className='fa-solid fa-user' /> {owner.name} • <a href={`tel:+91${owner.phone}`}>{owner.phone}</a>
                  {owner.email ? ` • ${owner.email}` : ''}
                </li>
              )}
              {(p.address || p.city) && (
                <li>
                  <i className='fa-solid fa-location-dot' /> {[p.address, p.city].filter(Boolean).join(', ')}
                  {p.location && (
                    <>
                      {' '}
                      •{' '}
                      <a
                        href={`https://maps.google.com/?q=${p.location.lat},${p.location.lng}`}
                        target='_blank'
                        rel='noreferrer'
                      >
                        map
                      </a>
                    </>
                  )}
                </li>
              )}
              {p.vehicle && (
                <li>
                  <i className='fa-solid fa-car' /> {p.vehicle.type} • {p.vehicle.number} {p.vehicle.model ? `• ${p.vehicle.model}` : ''}
                </li>
              )}
              {p.createdAt && <li className='pb-booking-meta'>Applied {new Date(p.createdAt).toLocaleString('en-IN')}</li>}
              {p.statusNote && <li className='pb-booking-meta'>Note: {p.statusNote}</li>}
            </ul>

            {!!p.documents?.length && (
              <div className='pb-docs'>
                {p.documents.map((d, i) => (
                  <button
                    key={d.label}
                    className='pb-btn-soft'
                    disabled={!d.hasFile}
                    onClick={() => openDoc(p, i)}
                  >
                    <i className='fa-solid fa-file-lines' /> {d.label}
                    {d.number ? ` • ${d.number}` : ''}
                  </button>
                ))}
              </div>
            )}
            {p.status === 'pending' && !p.documents?.length && <p className='pb-note'>No documents uploaded.</p>}

            <div className='pb-order-actions'>
              {p.status !== 'approved' && (
                <button
                  className='pb-btn-solid'
                  onClick={() => decide(p, 'approved')}
                >
                  Approve
                </button>
              )}
              {p.status === 'pending' && (
                <button
                  className='pb-btn-outline'
                  onClick={() => {
                    setNote('');
                    setRejecting({p, status: 'rejected'});
                  }}
                >
                  Reject
                </button>
              )}
              {p.status === 'approved' && (
                <button
                  className='pb-btn-outline'
                  onClick={() => {
                    setNote('');
                    setRejecting({p, status: 'suspended'});
                  }}
                >
                  Suspend
                </button>
              )}
            </div>
          </article>
        );
      })}

      {rejecting && (
        <div
          className='pb-overlay'
          onClick={() => setRejecting(null)}
        >
          <div
            className='pb-sheet'
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='pb-detail-title'>
              {rejecting.status === 'rejected' ? 'Reject' : 'Suspend'} {rejecting.p.businessName}?
            </h3>
            <p className='pb-detail-text'>The partner will see this reason.</p>
            <textarea
              className='pb-textarea'
              placeholder='e.g. FSSAI licence photo is not readable. Please re-apply with a clear photo.'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className='pb-order-actions'>
              <button
                className='pb-btn-outline'
                onClick={() => setRejecting(null)}
              >
                Back
              </button>
              <button
                className='pb-btn-solid'
                onClick={() => {
                  decide(rejecting.p, rejecting.status, note.trim() || undefined);
                  setRejecting(null);
                }}
              >
                {rejecting.status === 'rejected' ? 'Reject' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
      {doc && (
        <div
          className='pb-overlay'
          onClick={() => {
            URL.revokeObjectURL(doc.url);
            setDoc(null);
          }}
        >
          <img
            className='pb-photo-view'
            src={doc.url}
            alt='Document'
          />
        </div>
      )}
    </>
  );
};

// ---------- Orders ----------

const Orders: React.FC<{onError: (m: string) => void; refreshKey: number}> = ({onError, refreshKey}) => {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('active');
  const [q, setQ] = useState('');
  const [list, setList] = useState<AdminRequest[]>();
  const [partners, setPartners] = useState<ApiPartner[]>([]);
  const [confirm, setConfirm] = useState<{r: AdminRequest; status: string} | null>(null);
  const [photo, setPhoto] = useState('');

  const load = useCallback(() => {
    panelApi
      .requests({type: type || undefined, status: status || undefined, q: q.trim() || undefined})
      .then(setList)
      .catch((err) => onError(errorMessage(err)));
    panelApi
      .live()
      .then(setPartners)
      .catch(() => {});
  }, [type, status, q, onError]);

  useEffect(load, [load, refreshKey]);

  const assignable = (r: AdminRequest) => {
    if ((r.type === 'basket' || r.type === 'medicine') && ['accepted', 'preparing', 'ready'].includes(r.status) && !r.rider) {
      return partners.filter((p) => p.type === 'delivery');
    }
    if (r.type === 'cab' && r.status === 'new') return partners.filter((p) => p.type === 'cab');
    return [];
  };

  return (
    <>
      <div className='pb-filter-row'>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label='Status'
        >
          <option value='active'>Active</option>
          <option value=''>All</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option
              key={k}
              value={k}
            >
              {v}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label='Type'
        >
          <option value=''>All services</option>
          <option value='basket'>Food</option>
          <option value='medicine'>Medicine</option>
          <option value='stay'>Stays</option>
          <option value='cab'>Cabs</option>
          <option value='food-custom'>Custom</option>
        </select>
      </div>
      <label className='pb-search pb-search-light'>
        <i className='fa-solid fa-magnifying-glass' />
        <input
          type='search'
          placeholder='Search code, name or phone'
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      {!list && <p className='pb-loading'>Loading…</p>}
      {list?.length === 0 && <p className='pb-empty'>No requests.</p>}
      {list?.map((r) => {
        const options = assignable(r);
        return (
          <OrderCard
            key={r._id}
            order={{...r, role: null, actions: []}}
            earningsHint={[r.partner?.businessName, r.rider && `Rider: ${r.rider.businessName}`, r.driver && `Driver: ${r.driver.businessName}`]
              .filter(Boolean)
              .join(' • ')}
            onViewPrescription={async () => {
              try {
                setPhoto(await panelApi.adminPrescription(r._id));
              } catch (err) {
                onError(errorMessage(err));
              }
            }}
            extraActions={
              <>
                {r.otp && !['delivered', 'completed', 'cancelled', 'rejected', 'closed'].includes(r.status) && (
                  <p className='pb-booking-meta'>Customer OTP (for support): {r.otp}</p>
                )}
                {options.length > 0 && (
                  <label className='pb-field'>
                    <i className={`fa-solid ${r.type === 'cab' ? 'fa-car' : 'fa-motorcycle'}`} />
                    <select
                      defaultValue=''
                      aria-label='Assign'
                      onChange={async (e) => {
                        if (!e.target.value) return;
                        try {
                          await panelApi.assign(r._id, e.target.value);
                          load();
                        } catch (err) {
                          onError(errorMessage(err));
                        }
                      }}
                    >
                      <option value=''>Assign {r.type === 'cab' ? 'driver' : 'rider'}…</option>
                      {options.map((p) => (
                        <option
                          key={p._id}
                          value={p._id}
                        >
                          {p.businessName} {p.online ? '(online)' : '(offline)'}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {r.actions.length > 0 && (
                  <div className='pb-order-actions'>
                    {r.actions.map((a) => (
                      <button
                        key={a}
                        className={a === 'cancelled' ? 'pb-btn-outline' : 'pb-btn-soft'}
                        onClick={() => setConfirm({r, status: a})}
                      >
                        {a === 'cancelled' ? 'Cancel' : `Mark ${STATUS_LABEL[a] || a}`}
                      </button>
                    ))}
                  </div>
                )}
              </>
            }
          />
        );
      })}

      {confirm && (
        <PbConfirm
          message={`Change ${confirm.r.code} to "${STATUS_LABEL[confirm.status] || confirm.status}"?`}
          confirmLabel='YES'
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            const c = confirm;
            setConfirm(null);
            try {
              await panelApi.adminStatus(c.r._id, c.status);
              load();
            } catch (err) {
              onError(errorMessage(err));
            }
          }}
        />
      )}
      {photo && (
        <div
          className='pb-overlay'
          onClick={() => {
            URL.revokeObjectURL(photo);
            setPhoto('');
          }}
        >
          <img
            className='pb-photo-view'
            src={photo}
            alt='Prescription'
          />
        </div>
      )}
    </>
  );
};

// ---------- Live map ----------

const LiveMap: React.FC<{refreshKey: number}> = ({refreshKey}) => {
  const [partners, setPartners] = useState<ApiPartner[]>([]);

  useEffect(() => {
    const load = () =>
      panelApi
        .live()
        .then(setPartners)
        .catch(() => {});
    load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [refreshKey]);

  const pins: MapPin[] = partners.flatMap((p): MapPin[] => {
    if ((p.type === 'cab' || p.type === 'delivery') && p.lastLocation) {
      return [{id: p._id, kind: p.online ? (p.type === 'cab' ? 'driver' : 'rider') : 'offline', place: p.lastLocation, title: p.businessName}];
    }
    if (p.location && p.type !== 'cab' && p.type !== 'delivery') return [{id: p._id, kind: 'store', place: p.location, title: p.businessName}];
    return [];
  });
  const mobile = partners.filter((p) => p.type === 'cab' || p.type === 'delivery');

  return (
    <>
      <PinMap
        pins={pins}
        height={340}
        hint='Riders 🏍  Drivers 🚗  Stores 🏪'
      />
      <h2 className='pb-section-title'>Riders & drivers</h2>
      {mobile.map((p) => (
        <div
          key={p._id}
          className='pb-card pb-summary-row'
        >
          <span>
            <i className={`fa-solid ${p.type === 'cab' ? 'fa-car' : 'fa-motorcycle'}`} /> {p.businessName}
            {p.vehicle ? ` • ${p.vehicle.number}` : ''}
          </span>
          <span className={p.online ? 'pb-online' : 'pb-booking-meta'}>
            {p.online ? 'Online' : 'Offline'}
            {p.lastLocation?.at ? ` • seen ${new Date(p.lastLocation.at).toLocaleTimeString('en-IN', {timeStyle: 'short'})}` : ''}
          </span>
        </div>
      ))}
    </>
  );
};

// ---------- Settings ----------

const SettingsForm: React.FC<{onError: (m: string) => void}> = ({onError}) => {
  const [s, setS] = useState<Settings>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    panelApi
      .settings()
      .then(setS)
      .catch((err) => onError(errorMessage(err)));
  }, [onError]);

  if (!s) return <p className='pb-loading'>Loading…</p>;

  const num = <K extends keyof Settings>(group: K, key: string, label: string, suffix = '') => (
    <label className='pb-setting'>
      <span>{label}</span>
      <span>
        <input
          type='number'
          inputMode='decimal'
          value={(s[group] as any)[key]}
          onChange={(e) => {
            setSaved(false);
            setS({...s, [group]: {...(s[group] as any), [key]: Number(e.target.value)}});
          }}
        />
        {suffix}
      </span>
    </label>
  );

  return (
    <>
      <h2 className='pb-section-title'>Food & medicine delivery</h2>
      <section className='pb-card'>
        {num('delivery', 'baseFare', 'Charge for first km(s)', '₹')}
        {num('delivery', 'baseKm', 'First km(s) covered', 'km')}
        {num('delivery', 'perKm', 'Each further km', '₹')}
        {num('delivery', 'foodMaxKm', 'Max distance for food', 'km')}
        {num('delivery', 'medicineMaxKm', 'Max distance for medicines', 'km')}
        {num('delivery', 'riderSharePct', 'Rider share of delivery charge', '%')}
        {num('delivery', 'dispatchRadiusKm', 'Alert riders within', 'km')}
      </section>

      <h2 className='pb-section-title'>Commission kept by Primebookin</h2>
      <section className='pb-card'>
        {num('commission', 'food', 'Food', '%')}
        {num('commission', 'medicine', 'Medicine', '%')}
        {num('commission', 'stay', 'Stays', '%')}
        {num('commission', 'cab', 'Cabs', '%')}
      </section>

      <h2 className='pb-section-title'>Cab fares</h2>
      <section className='pb-card'>
        {num('cab', 'dispatchRadiusKm', 'Alert drivers within', 'km')}
        {s.cab.vehicles.map((v, i) => (
          <div
            key={v.key}
            className='pb-vehicle-row'
          >
            <strong>{v.label}</strong>
            {(['perKm', 'minFare'] as const).map((k) => (
              <label key={k}>
                <small>{k === 'perKm' ? '₹ / km' : 'Min fare ₹'}</small>
                <input
                  type='number'
                  value={v[k]}
                  onChange={(e) => {
                    setSaved(false);
                    const vehicles = s.cab.vehicles.map((x, j) => (j === i ? {...x, [k]: Number(e.target.value)} : x));
                    setS({...s, cab: {...s.cab, vehicles}});
                  }}
                />
              </label>
            ))}
          </div>
        ))}
      </section>

      <h2 className='pb-section-title'>Privacy</h2>
      <section className='pb-card'>{num('privacy', 'retentionDays', 'Delete customer details after', 'days')}</section>

      <button
        className='pb-btn-solid'
        onClick={async () => {
          try {
            setS(await panelApi.saveSettings(s));
            setSaved(true);
          } catch (err) {
            onError(errorMessage(err));
          }
        }}
      >
        {saved ? 'Saved ✓' : 'Save Settings'}
      </button>
    </>
  );
};

// ---------- Shell ----------

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.userSlice.user);
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats>();
  const [alert, setAlert] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const onError = useCallback((m: string) => setAlert(m), []);
  const loadStats = useCallback(() => {
    panelApi
      .stats()
      .then(setStats)
      .catch((err) => setAlert(errorMessage(err)));
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadStats();
  }, [user, loadStats]);

  const live = useLive(user?.role === 'admin' ? '/admin/stream' : null, 0, () => {
    loadStats();
    setRefreshKey((k) => k + 1);
  });

  if (user?.role !== 'admin') {
    return (
      <PanelLayout title='Admin'>
        <section className='pb-card'>
          <p className='pb-empty'>Sign in with an admin account to open the admin panel.</p>
          <button
            className='pb-btn-solid'
            onClick={() => navigate('/partner')}
          >
            Sign in
          </button>
        </section>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title='Admin Panel'
      subtitle='Primebookin control centre'
      tabs={[
        {key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line'},
        {key: 'approvals', label: 'Approvals', icon: 'fa-user-check', badge: stats?.pendingApprovals || undefined},
        {key: 'orders', label: 'Orders', icon: 'fa-receipt', badge: stats?.activeRequests || undefined},
        {key: 'map', label: 'Live Map', icon: 'fa-map-location-dot'},
        {key: 'settings', label: 'Settings', icon: 'fa-sliders'},
      ]}
      tab={tab}
      onTab={setTab}
    >
      <LiveBar
        connected={live.connected}
        sound={true}
        onEnableSound={live.enableSound}
      />
      {tab === 'dashboard' && (
        <Dashboard
          stats={stats}
          onGo={setTab}
          onError={onError}
        />
      )}
      {tab === 'approvals' && (
        <Approvals
          onChanged={loadStats}
          onError={onError}
          refreshKey={refreshKey}
        />
      )}
      {tab === 'orders' && (
        <Orders
          onError={onError}
          refreshKey={refreshKey}
        />
      )}
      {tab === 'map' && <LiveMap refreshKey={refreshKey} />}
      {tab === 'settings' && <SettingsForm onError={onError} />}
      {alert && (
        <PbAlert
          message={alert}
          onClose={() => setAlert('')}
        />
      )}
    </PanelLayout>
  );
};
