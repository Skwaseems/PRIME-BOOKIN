import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {RootState} from '../store';
import {errorMessage} from '../api';
import {Enquiry, EnquiryStatus, pbApi} from './api';
import {PbAlert, PbConfirm, PbLayout} from './components';
import {forgetRequest} from './pbSlice';
import {buildMessage, openWhatsApp, rupees} from './whatsapp';

const TYPE_LABEL: Record<Enquiry['type'], string> = {
  basket: 'Food Order',
  stay: 'Room Reservation',
  medicine: 'Medicine Request',
  'food-custom': 'Custom Dish',
  cab: 'Taxi Ride',
};

const STEPS: Partial<Record<Enquiry['type'], EnquiryStatus[]>> = {
  basket: ['new', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'],
  medicine: ['new', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'],
  stay: ['new', 'confirmed', 'checked_in', 'completed'],
  cab: ['new', 'accepted', 'arrived', 'started', 'completed'],
};

const statusText = (e: Enquiry): string => {
  const store = e.partner?.businessName;
  if (e.status === 'cancelled') return 'Cancelled';
  if (e.status === 'rejected') return `Declined${store ? ` by ${store}` : ''}${e.statusNote ? `: ${e.statusNote}` : ''}`;
  const pick = (map: Record<string, string>) => map[e.status] || e.status;
  if (e.type === 'cab') {
    return pick({new: 'Finding a nearby driver…', accepted: 'Driver on the way', arrived: 'Driver has arrived', started: 'On the trip', completed: 'Trip completed'});
  }
  if (e.type === 'stay') {
    return pick({new: `Waiting for ${store || 'the hotel'} to confirm`, confirmed: 'Booking confirmed', checked_in: 'Checked in', completed: 'Stay completed'});
  }
  if (e.type === 'basket' || e.type === 'medicine') {
    if (e.status === 'new') return e.type === 'medicine' ? 'Finding a pharmacy…' : `Waiting for ${store} to accept`;
    if (e.riderStage === 'at_customer') return 'Rider is at your door';
    if (e.riderStage === 'at_store' && e.status !== 'picked_up') return 'Rider is at the store';
    return pick({accepted: 'Order accepted', preparing: 'Being prepared', ready: 'Ready, waiting for rider', picked_up: 'On the way to you', delivered: 'Delivered'});
  }
  return e.status === 'closed' ? 'Handled by our team' : 'Sent';
};

const lines = (e: Enquiry): string[] => {
  switch (e.type) {
    case 'basket':
      return e.items.map((i) => `${i.name} × ${i.quantity} - ${rupees(i.price * i.quantity)}`);
    case 'stay': {
      const s = e.stay!;
      return [
        s.name,
        `${s.roomType} • ${s.rooms} room${s.rooms > 1 ? 's' : ''} • ${s.guests} guest${s.guests > 1 ? 's' : ''}${s.extraBeds ? ` (${s.extraBeds} extra bed)` : ''}`,
        ...(s.guestNames?.length ? [`Guests: ${s.guestNames.join(', ')}`] : []),
        `${s.checkIn} → ${s.checkOut} (${s.nights} night${s.nights > 1 ? 's' : ''})`,
      ];
    }
    case 'cab': {
      const c = e.cab!;
      return [`${c.pickup.label} → ${c.drop.label}`, `${c.vehicle} • ${c.approximate ? '~' : ''}${c.distanceKm} km`];
    }
    default:
      return [e.text ? `"${e.text}"` : 'Prescription photo', ...(e.text && e.hasImage ? ['+ prescription photo'] : [])];
  }
};

const FINAL: EnquiryStatus[] = ['delivered', 'completed', 'closed', 'rejected', 'cancelled'];
const canCancel = (e: Enquiry) => e.status === 'new' || (e.type === 'cab' && e.status === 'accepted');

const NO_KEYS: string[] = [];

// Requests sent from this device, with live status from Primebookin.
export const Bookings: React.FC = () => {
  const dispatch = useDispatch();
  const keys = useSelector((s: RootState) => s.pbSlice.requestKeys) ?? NO_KEYS;
  const [requests, setRequests] = useState<Enquiry[]>();
  const [error, setError] = useState('');
  const [alert, setAlert] = useState('');
  const [confirm, setConfirm] = useState<{e: Enquiry; action: 'cancel' | 'forget'} | null>(null);

  const keyFor = useCallback((id: string) => keys.find((k) => k.startsWith(`${id}:`))?.split(':')[1] || '', [keys]);

  const load = useCallback(() => {
    if (!keys.length) return setRequests([]);
    pbApi
      .lookup(keys)
      .then((r) => {
        setRequests(r);
        setError('');
      })
      .catch((err) => setError(errorMessage(err)));
  }, [keys]);

  // Refresh every 15 seconds while the screen is open.
  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const act = async () => {
    if (!confirm) return;
    const {e, action} = confirm;
    setConfirm(null);
    try {
      if (action === 'cancel') {
        await pbApi.cancel(e._id, keyFor(e._id));
      } else {
        await pbApi.forget(e._id, keyFor(e._id));
        dispatch(forgetRequest(e._id));
      }
      load();
    } catch (err) {
      setAlert(errorMessage(err));
    }
  };

  const renderCard = (e: Enquiry) => {
    const steps = STEPS[e.type];
    const done = FINAL.includes(e.status);
    const failed = e.status === 'cancelled' || e.status === 'rejected';
    const at = steps ? steps.indexOf(e.status) : -1;
    const person = e.rider || e.driver;

    return (
      <article
        key={e._id}
        className='pb-card'
      >
        <div className='pb-booking-head'>
          <span className='pb-tag'>{TYPE_LABEL[e.type]}</span>
          <span className={`pb-status${failed ? ' is-failed' : done ? ' is-done' : ''}`}>{statusText(e)}</span>
        </div>

        {steps && !failed && (
          <div
            className='pb-steps'
            aria-hidden={true}
          >
            {steps.map((s, i) => (
              <span
                key={s}
                className={i <= at ? 'is-done' : ''}
              />
            ))}
          </div>
        )}

        <ul className='pb-booking-lines'>
          {lines(e).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>

        {e.otp && !done && e.type !== 'stay' && (
          <p className='pb-otp'>
            <span>{e.type === 'cab' ? 'Share this OTP with the driver to start the ride' : 'Share this OTP with the rider at delivery'}</span>
            <strong>{e.otp}</strong>
          </p>
        )}

        {person && !done && (
          <div className='pb-contact'>
            <i className={`fa-solid ${e.driver ? 'fa-car' : 'fa-motorcycle'}`} />
            <span>
              {person.businessName}
              {e.driver?.vehicle && (
                <small>
                  {e.driver.vehicle.model} • {e.driver.vehicle.number}
                </small>
              )}
            </span>
            {person.phone && (
              <a
                href={`tel:+91${person.phone}`}
                aria-label={`Call ${person.businessName}`}
              >
                <i className='fa-solid fa-phone' />
              </a>
            )}
          </div>
        )}

        <div className='pb-listing-foot'>
          <span className='pb-booking-meta'>
            {e.code} • {new Date(e.createdAt).toLocaleString('en-IN', {dateStyle: 'medium', timeStyle: 'short'})}
          </span>
          {e.total > 0 ? (
            <span className='pb-price'>{rupees(e.total)}</span>
          ) : (
            <span className='pb-booking-meta'>{e.type === 'medicine' ? 'Price after pharmacy accepts' : 'Quote on WhatsApp'}</span>
          )}
        </div>

        <div className='pb-booking-actions'>
          {!e.anonymizedAt && (
            <button
              className='pb-btn-outline'
              onClick={() => openWhatsApp(buildMessage(e, keyFor(e._id)))}
            >
              <i className='fa-brands fa-whatsapp' /> WhatsApp
            </button>
          )}
          {canCancel(e) && (
            <button
              className='pb-btn-outline'
              onClick={() => setConfirm({e, action: 'cancel'})}
            >
              Cancel
            </button>
          )}
          {done && !e.anonymizedAt && (
            <button
              className='pb-link-btn'
              onClick={() => setConfirm({e, action: 'forget'})}
            >
              Delete my details
            </button>
          )}
          {e.anonymizedAt && <span className='pb-booking-meta'>Personal details deleted</span>}
        </div>
      </article>
    );
  };

  const renderContent = () => {
    if (error && !requests) return <p className='pb-empty'>{error}</p>;
    if (!requests) return <p className='pb-loading'>Loading your bookings…</p>;
    if (!requests.length) {
      return (
        <section className='pb-card'>
          <p className='pb-empty'>
            No bookings yet.
            <br />
            Reserve a room, order food or medicines, or book a cab from Explore.
          </p>
        </section>
      );
    }
    return requests.map(renderCard);
  };

  return (
    <PbLayout>
      <h2 className='pb-page-title'>My Bookings & Orders</h2>
      {renderContent()}

      {confirm && (
        <PbConfirm
          message={
            confirm.action === 'cancel'
              ? `Cancel ${TYPE_LABEL[confirm.e.type].toLowerCase()} ${confirm.e.code}?`
              : 'Delete your name, phone, address and other details from this request now? This cannot be undone.'
          }
          confirmLabel={confirm.action === 'cancel' ? 'YES, CANCEL' : 'DELETE'}
          onCancel={() => setConfirm(null)}
          onConfirm={act}
        />
      )}
      {alert && (
        <PbAlert
          message={alert}
          onClose={() => setAlert('')}
        />
      )}
    </PbLayout>
  );
};
