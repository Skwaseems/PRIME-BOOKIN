import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';

import type {ApiPartner} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {PbAlert} from '../pb/components';
import {TextField} from '../pb/forms';
import {PinMap, PlaceField, currentPosition, placeAt} from '../pb/places';
import {compressImage} from '../pb/useSendRequest';
import {rupees} from '../pb/whatsapp';
import type {Place} from '../pb/api';
import {ListingsManager} from './ListingsManager';
import {OrderCard} from './OrderCard';
import {LiveBar, PanelLayout, Tab, useLive} from './PanelLayout';
import {PARTNER_TYPES} from './PartnerHome';
import {Earnings, PanelOrder, panelApi, unlockSound} from './panelApi';

const LOCATION_EVERY_MS = 20000;

// While a rider/driver is online, send their position so nearby jobs reach them.
const useTracking = (partner: ApiPartner | undefined, onError: (m: string) => void) => {
  const last = useRef(0);
  useEffect(() => {
    if (!partner?.online || !['cab', 'delivery'].includes(partner.type) || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (Date.now() - last.current < LOCATION_EVERY_MS) return;
        last.current = Date.now();
        panelApi.presence(partner._id, {lat: pos.coords.latitude, lng: pos.coords.longitude}).catch(() => {});
      },
      () => onError('Location is off. Turn it on so customers nearby can reach you.'),
      {enableHighAccuracy: true, maximumAge: 15000},
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [partner?._id, partner?.online, partner?.type, onError]);
};

const EarningsCards: React.FC<{earnings?: Earnings; showKm?: boolean}> = ({earnings, showKm}) => (
  <div className='pb-stats'>
    {(['today', 'week', 'all'] as const).map((k) => (
      <div key={k}>
        <small>{{today: 'Last 24 h', week: 'Last 7 days', all: 'All time'}[k]}</small>
        <strong>{rupees(earnings?.[k].amount || 0)}</strong>
        <span>
          {earnings?.[k].count || 0} job{earnings?.[k].count === 1 ? '' : 's'}
          {showKm ? ` • ${earnings?.[k].km || 0} km` : ''}
        </span>
      </div>
    ))}
  </div>
);

export const PartnerPanel: React.FC = () => {
  const {pid = ''} = useParams();
  const [partner, setPartner] = useState<ApiPartner>();
  const [loadError, setLoadError] = useState('');
  const [jobs, setJobs] = useState<PanelOrder[]>([]);
  const [orders, setOrders] = useState<PanelOrder[]>([]);
  const [history, setHistory] = useState<PanelOrder[]>();
  const [earnings, setEarnings] = useState<Earnings>();
  const [tab, setTab] = useState('orders');
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState('');
  const [photo, setPhoto] = useState('');

  const type = partner?.type;
  const isMobile = type === 'cab' || type === 'delivery';

  const refresh = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([panelApi.partner(pid), panelApi.orders(pid)]);
      setPartner(p);
      setOrders(o);
      setJobs(['cab', 'delivery', 'pharmacy'].includes(p.type) ? await panelApi.jobs(pid) : []);
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, [pid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (tab === 'history') panelApi.orders(pid, 'history').then(setHistory).catch(() => {});
    if (tab === 'profile' || tab === 'history') panelApi.earnings(pid).then(setEarnings).catch(() => {});
  }, [tab, pid, orders.length]);

  const onError = useCallback((m: string) => setAlert(m), []);
  useTracking(partner, onError);

  // Ring for new orders (stores) or open jobs (riders/drivers without an active job).
  const activeJob = isMobile ? orders.find((o) => !['delivered', 'completed'].includes(o.status)) : undefined;
  const pending = isMobile ? (partner?.online && !activeJob ? jobs.length : 0) : orders.filter((o) => o.status === 'new').length + (type === 'pharmacy' ? jobs.length : 0);
  const live = useLive(partner ? `/panel/${pid}/stream` : null, pending, (e) => {
    if (e.event === 'account') return refresh();
    refresh();
  });

  // Runs an action. If it returns the updated order, show it straight away and
  // refresh everything else in the background (Atlas round trips can be slow).
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      const result = await fn();
      const order = result as PanelOrder | undefined;
      if (order && typeof order === 'object' && '_id' in order && 'status' in order) {
        setJobs((list) => list.filter((j) => j._id !== order._id));
        setOrders((list) => {
          const others = list.filter((o) => o._id !== order._id);
          const finished = ['delivered', 'completed', 'rejected', 'cancelled', 'closed'].includes(order.status);
          return finished ? others : [...others, order].sort((x, y) => x.createdAt.localeCompare(y.createdAt));
        });
      }
      refresh();
    } catch (err) {
      setAlert(errorMessage(err));
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const goOnline = (online: boolean) =>
    run(async () => {
      unlockSound();
      if (!online) return setPartner(await panelApi.presence(pid, {online: false}));
      const pos = await currentPosition();
      setPartner(await panelApi.presence(pid, {online: true, ...pos}));
    });

  const setOpen = (isOpen: boolean) => run(async () => setPartner(await panelApi.presence(pid, {isOpen})));

  const viewPrescription = async (id: string) => {
    try {
      setPhoto(await panelApi.prescription(pid, id));
    } catch (err) {
      setAlert(errorMessage(err));
    }
  };

  if (!partner) {
    return (
      <PanelLayout title='Partner Panel'>
        <p className={loadError ? 'pb-empty' : 'pb-loading'}>{loadError || 'Loading…'}</p>
      </PanelLayout>
    );
  }

  const t = PARTNER_TYPES[partner.type];
  const earningHint = (o: PanelOrder) => {
    if (o.type === 'cab') return `${o.cab?.distanceKm} km ride`;
    if (o.type === 'basket' || o.type === 'medicine') return o.deliveryFee ? `Delivery ${rupees(o.deliveryFee)}${o.distanceKm != null ? ` • ${o.distanceKm} km` : ''}` : '';
    return '';
  };

  const card = (o: PanelOrder, claimable = false) => (
    <OrderCard
      key={o._id}
      order={o}
      claimable={claimable}
      busy={busy}
      earningsHint={earningHint(o)}
      onClaim={(price) => run(() => panelApi.accept(pid, o._id, price))}
      onStatus={(s, otp) => run(() => panelApi.setStatus(pid, o._id, s, otp))}
      onRiderStep={(stage, otp) => run(() => panelApi.riderStep(pid, o._id, stage, otp))}
      onViewPrescription={() => viewPrescription(o._id)}
    />
  );

  const tabs: Tab[] = isMobile
    ? [
        {key: 'orders', label: type === 'cab' ? 'Rides' : 'Deliveries', icon: type === 'cab' ? 'fa-car' : 'fa-motorcycle', badge: pending || undefined},
        {key: 'history', label: 'Earnings', icon: 'fa-wallet'},
        {key: 'profile', label: 'Profile', icon: 'fa-user-gear'},
      ]
    : [
        {key: 'orders', label: type === 'hotel' ? 'Bookings' : 'Orders', icon: 'fa-bell', badge: pending || undefined},
        {key: 'items', label: type === 'hotel' ? 'Rooms' : type === 'restaurant' ? 'Menu' : 'Medicines', icon: type === 'hotel' ? 'fa-bed' : type === 'restaurant' ? 'fa-utensils' : 'fa-pills'},
        {key: 'history', label: 'History', icon: 'fa-clock-rotate-left'},
        {key: 'profile', label: 'Profile', icon: 'fa-store'},
      ];

  const toggle = isMobile ? (
    <button
      className={`pb-toggle${partner.online ? ' is-on' : ''}`}
      disabled={busy}
      onClick={() => goOnline(!partner.online)}
    >
      {partner.online ? 'ONLINE' : 'OFFLINE'}
    </button>
  ) : (
    <button
      className={`pb-toggle${partner.isOpen ? ' is-on' : ''}`}
      disabled={busy}
      onClick={() => setOpen(!partner.isOpen)}
    >
      {partner.isOpen ? 'OPEN' : 'CLOSED'}
    </button>
  );

  const renderOrders = () => {
    if (isMobile) {
      return (
        <>
          {!partner.online && (
            <section className='pb-card pb-offline'>
              <i className={`fa-solid ${t.icon}`} />
              <p>You are offline. Go online to receive {type === 'cab' ? 'ride requests' : 'delivery jobs'} near you.</p>
              <button
                className='pb-btn-solid'
                disabled={busy}
                onClick={() => goOnline(true)}
              >
                Go Online
              </button>
            </section>
          )}
          {activeJob && (
            <>
              <h2 className='pb-section-title'>Current {type === 'cab' ? 'ride' : 'delivery'}</h2>
              {card(activeJob)}
            </>
          )}
          {partner.online && !activeJob && (
            <>
              <h2 className='pb-section-title'>
                {type === 'cab' ? 'Ride requests near you' : 'Delivery jobs near you'} ({jobs.length})
              </h2>
              {jobs.length === 0 && <p className='pb-empty'>Waiting for requests… Keep this screen open. It will ring when one arrives.</p>}
              {jobs.map((j) => card(j, true))}
            </>
          )}
        </>
      );
    }
    const fresh = orders.filter((o) => o.status === 'new');
    const ongoing = orders.filter((o) => o.status !== 'new');
    return (
      <>
        {!partner.isOpen && <p className='pb-note'>You are marked CLOSED. Customers can't order until you open.</p>}
        {type === 'pharmacy' && jobs.length > 0 && (
          <>
            <h2 className='pb-section-title'>Prescription requests ({jobs.length})</h2>
            <p className='pb-detail-text'>First pharmacy to send a price gets the order.</p>
            {jobs.map((j) => card(j, true))}
          </>
        )}
        <h2 className='pb-section-title'>New ({fresh.length})</h2>
        {fresh.length === 0 && <p className='pb-empty'>No new {type === 'hotel' ? 'bookings' : 'orders'}. This screen rings when one arrives.</p>}
        {fresh.map((o) => card(o))}
        {ongoing.length > 0 && <h2 className='pb-section-title'>In progress ({ongoing.length})</h2>}
        {ongoing.map((o) => card(o))}
      </>
    );
  };

  return (
    <PanelLayout
      title={partner.businessName}
      subtitle={t.panel}
      right={toggle}
      tabs={tabs}
      tab={tab}
      onTab={setTab}
    >
      <LiveBar
        connected={live.connected}
        sound={live.sound}
        onEnableSound={live.enableSound}
      />

      {tab === 'orders' && renderOrders()}

      {tab === 'items' && (
        <ListingsManager
          partner={partner}
          onError={setAlert}
        />
      )}

      {tab === 'history' && (
        <>
          <EarningsCards
            earnings={earnings}
            showKm={isMobile}
          />
          <h2 className='pb-section-title'>Completed & cancelled</h2>
          {!history && <p className='pb-loading'>Loading…</p>}
          {history?.length === 0 && <p className='pb-empty'>Nothing yet.</p>}
          {history?.map((o) => card(o))}
        </>
      )}

      {tab === 'profile' && (
        <ProfileEditor
          partner={partner}
          onSaved={setPartner}
          onError={setAlert}
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
      {alert && (
        <PbAlert
          message={alert}
          onClose={() => setAlert('')}
        />
      )}
    </PanelLayout>
  );
};

const ProfileEditor: React.FC<{partner: ApiPartner; onSaved: (p: ApiPartner) => void; onError: (m: string) => void}> = ({
  partner,
  onSaved,
  onError,
}) => {
  const [description, setDescription] = useState(partner.description || '');
  const [address, setAddress] = useState(partner.address || '');
  const [prep, setPrep] = useState(String(partner.prepTimeMin || 20));
  const [pin, setPin] = useState<Place | null>(partner.location ? {label: partner.address || 'Saved location', ...partner.location} : null);
  const [image, setImage] = useState(partner.image || '');
  const [vehicleNumber, setVehicleNumber] = useState(partner.vehicle?.number || '');
  const [vehicleModel, setVehicleModel] = useState(partner.vehicle?.model || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isStore = ['hotel', 'restaurant', 'pharmacy'].includes(partner.type);
  const setPinAt = async (lat: number, lng: number) => setPin(await placeAt(lat, lng));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const body: Partial<ApiPartner> = {description: description.trim() || undefined, address: address.trim() || undefined};
      if (isStore) {
        Object.assign(body, {prepTimeMin: Number(prep) || 20, image: image || undefined});
        if (pin) body.location = {lat: pin.lat, lng: pin.lng};
      }
      if (partner.type === 'cab' && partner.vehicle) {
        body.vehicle = {type: partner.vehicle.type, number: vehicleNumber.trim().toUpperCase(), model: vehicleModel.trim() || undefined};
      }
      const {partner: p} = await panelApi.updateProfile(partner._id, body);
      onSaved(p);
      setSaved(true);
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className='pb-card'>
      <h2 className='pb-form-title'>
        <i className='fa-solid fa-id-card' />
        Profile
      </h2>
      <p className='pb-detail-text'>
        {partner.phone} • {partner.city}
      </p>

      {isStore && (
        <>
          <span className='pb-label'>Photo shown to customers</span>
          <div className='pb-thumbs'>
            {image && (
              <div>
                <img
                  src={image}
                  alt='Business'
                />
              </div>
            )}
            <label className='pb-thumb-add'>
              <i className='fa-solid fa-camera' />
              {image ? 'Change' : 'Add'}
              <input
                type='file'
                accept='image/*'
                hidden={true}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) setImage(await compressImage(file, 1200, 0.75));
                }}
              />
            </label>
          </div>
        </>
      )}

      <TextField
        icon='fa-align-left'
        label={partner.type === 'restaurant' ? 'Cuisine / description' : 'Description'}
        value={description}
        onChange={setDescription}
      />
      <TextField
        icon='fa-house'
        label='Address'
        maxLength={300}
        value={address}
        onChange={setAddress}
      />

      {isStore && (
        <>
          {partner.type !== 'hotel' && (
            <TextField
              icon='fa-stopwatch'
              label='Usual preparation time (minutes)'
              type='number'
              inputMode='numeric'
              value={prep}
              onChange={setPrep}
            />
          )}
          <span className='pb-label'>Exact location (used for delivery distance)</span>
          <PlaceField
            icon='fa-location-dot'
            label='Business location'
            placeholder='Search or tap the map'
            place={pin}
            onPick={setPin}
          />
          <PinMap
            pins={pin ? [{id: 'store', kind: 'store', place: pin, draggable: true}] : []}
            height={180}
            onTap={setPinAt}
            onDrag={(_, lat, lng) => setPinAt(lat, lng)}
          />
        </>
      )}

      {partner.type === 'cab' && (
        <>
          <span className='pb-label'>Vehicle ({partner.vehicle?.type})</span>
          <TextField
            icon='fa-hashtag'
            label='Registration number'
            value={vehicleNumber}
            onChange={setVehicleNumber}
          />
          <TextField
            icon='fa-car-side'
            label='Model'
            value={vehicleModel}
            onChange={setVehicleModel}
          />
        </>
      )}

      <button
        className='pb-btn-solid'
        disabled={saving}
        onClick={save}
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Profile'}
      </button>
    </section>
  );
};

export {EarningsCards};
