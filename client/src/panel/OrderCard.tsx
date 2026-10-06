import React, {useState} from 'react';

import {mapsLink, rupees, duration} from '../pb/whatsapp';
import type {PanelOrder} from './panelApi';

const TYPE_LABEL: Record<string, string> = {
  basket: 'Food Order',
  medicine: 'Medicine',
  stay: 'Room Booking',
  cab: 'Ride',
  'food-custom': 'Custom Request',
};

export const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked up',
  delivered: 'Delivered',
  confirmed: 'Confirmed',
  checked_in: 'Checked in',
  arrived: 'Driver arrived',
  started: 'On trip',
  completed: 'Completed',
  rejected: 'Declined',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

const ACTION_LABEL: Record<string, string> = {
  accepted: 'Accept',
  rejected: 'Decline',
  preparing: 'Start Preparing',
  ready: 'Mark Ready',
  confirmed: 'Confirm Booking',
  checked_in: 'Guest Checked In',
  completed: 'Complete',
  arrived: "I've Arrived",
  started: 'Start Ride',
  cancelled: 'Cancel',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  closed: 'Mark Handled',
};

const RIDER_NEXT: Record<string, {stage: string; label: string}> = {
  assigned: {stage: 'at_store', label: 'Reached Store'},
  at_store: {stage: 'picked_up', label: 'Order Picked Up'},
  picked_up: {stage: 'at_customer', label: 'Reached Customer'},
  at_customer: {stage: 'delivered', label: 'Delivered (enter OTP)'},
};

const ago = (iso: string) => {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  if (min < 1440) return `${Math.round(min / 60)} h ago`;
  return new Date(iso).toLocaleDateString('en-IN');
};

type Props = {
  order: PanelOrder;
  // Open job that can be claimed (not yet this partner's).
  claimable?: boolean;
  earningsHint?: string;
  busy?: boolean;
  onClaim?: (price?: number) => void;
  onStatus?: (status: string, otp?: string) => void;
  onRiderStep?: (stage: string, otp?: string) => void;
  onViewPrescription?: () => void;
  extraActions?: React.ReactNode;
};

export const OrderCard: React.FC<Props> = ({
  order: o,
  claimable,
  earningsHint,
  busy,
  onClaim,
  onStatus,
  onRiderStep,
  onViewPrescription,
  extraActions,
}) => {
  const [price, setPrice] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const needsOtp = (o.role === 'driver' && o.actions.includes('started')) || (o.role === 'rider' && o.riderStage === 'at_customer');
  const riderNext = o.role === 'rider' && o.riderStage ? RIDER_NEXT[o.riderStage] : undefined;
  const isNew = claimable || (o.role === 'vendor' && o.status === 'new');

  const navTo = o.type === 'cab' ? (['accepted', 'arrived'].includes(o.status) ? o.cab?.pickup : o.cab?.drop) : o.location;

  return (
    <article className={`pb-card pb-order${isNew ? ' is-new' : ''}`}>
      <div className='pb-booking-head'>
        <span className='pb-tag'>{TYPE_LABEL[o.type]}</span>
        <span className='pb-booking-meta'>
          {o.code} • {ago(o.createdAt)}
        </span>
      </div>
      {!claimable && <p className={`pb-order-status is-${o.status}`}>{STATUS_LABEL[o.status] || o.status}{o.riderStage && o.role !== 'rider' ? ` • rider ${o.riderStage.replace('_', ' ')}` : ''}</p>}

      {/* What */}
      {o.type === 'basket' && (
        <ul className='pb-booking-lines'>
          {o.items.map((i) => (
            <li key={i.listing}>
              <strong>{i.quantity} ×</strong> {i.name} <span className='pb-booking-meta'>{rupees(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      {o.type === 'medicine' && (
        <>
          {o.text && <p className='pb-order-text'>“{o.text}”</p>}
          {o.hasImage && onViewPrescription && (
            <button
              className='pb-btn-soft'
              style={{marginBottom: 8}}
              onClick={onViewPrescription}
            >
              <i className='fa-solid fa-file-prescription' /> View prescription photo
            </button>
          )}
        </>
      )}
      {o.type === 'stay' && o.stay && (
        <ul className='pb-booking-lines'>
          <li>
            <strong>{o.stay.name}</strong>
          </li>
          <li>
            {o.stay.roomType} • {o.stay.rooms} room{o.stay.rooms > 1 ? 's' : ''} • {o.stay.guests} guest{o.stay.guests > 1 ? 's' : ''}
            {o.stay.extraBeds ? ` • ${o.stay.extraBeds} extra bed` : ''}
          </li>
          <li>
            {o.stay.checkIn} → {o.stay.checkOut} ({o.stay.nights} night{o.stay.nights > 1 ? 's' : ''})
          </li>
          {!!o.stay.guestNames?.length && <li>Guests: {o.stay.guestNames.join(', ')}</li>}
        </ul>
      )}
      {o.type === 'cab' && o.cab && (
        <ul className='pb-booking-lines pb-route'>
          <li>
            <i className='fa-solid fa-location-dot' /> {o.cab.pickup.label}
          </li>
          <li>
            <i className='fa-solid fa-flag-checkered' /> {o.cab.drop.label}
          </li>
          <li className='pb-booking-meta'>
            {o.cab.vehicle} • {o.cab.approximate ? '~' : ''}
            {o.cab.distanceKm} km • about {duration(o.cab.durationMin)}
          </li>
        </ul>
      )}

      {/* Where the store is (riders) */}
      {o.role !== 'vendor' && o.partner && (o.type === 'basket' || o.type === 'medicine') && (
        <p className='pb-order-text'>
          <i className='fa-solid fa-store' /> Pick up from <strong>{o.partner.businessName}</strong>
          {o.partner.address ? `, ${o.partner.address}` : ''}
        </p>
      )}
      {(claimable && (o.type === 'basket' || o.type === 'medicine')) && o.location?.label && (
        <p className='pb-order-text'>
          <i className='fa-solid fa-house' /> Deliver to {o.location.label}
          {o.distanceKm != null ? ` • ${o.distanceKm} km` : ''}
        </p>
      )}

      {/* Who (only once it's theirs) */}
      {!claimable && o.contactPhone && (
        <div className='pb-contact'>
          <i className='fa-solid fa-user' />
          <span>
            {o.customerName || 'Customer'}
            {o.address && <small>{o.address}</small>}
          </span>
          <a
            href={`tel:+91${o.contactPhone}`}
            aria-label='Call customer'
          >
            <i className='fa-solid fa-phone' />
          </a>
        </div>
      )}
      {!claimable && o.rider && o.role === 'vendor' && (
        <p className='pb-order-text'>
          <i className='fa-solid fa-motorcycle' /> Rider: {o.rider.businessName}
          {o.rider.phone && (
            <>
              {' '}
              • <a href={`tel:+91${o.rider.phone}`}>{o.rider.phone}</a>
            </>
          )}
        </p>
      )}

      <div className='pb-listing-foot'>
        <span className='pb-booking-meta'>{earningsHint}</span>
        {o.total > 0 && <span className='pb-price'>{rupees(o.total)}</span>}
      </div>

      {/* Navigate */}
      {!claimable && navTo?.lat != null && ['rider', 'driver'].includes(o.role || '') && (
        <a
          className='pb-btn-outline pb-nav-link'
          href={`https://www.google.com/maps/dir/?api=1&destination=${navTo.lat},${navTo.lng}`}
          target='_blank'
          rel='noreferrer'
        >
          <i className='fa-solid fa-diamond-turn-right' /> Navigate
        </a>
      )}
      {!claimable && o.role === 'rider' && o.partner && o.riderStage && ['assigned', 'at_store'].includes(o.riderStage) && (
        <span className='pb-booking-meta'>Navigate to the store first, then to the customer.</span>
      )}

      {/* Actions */}
      {claimable && (
        <div className='pb-order-actions'>
          {o.type === 'medicine' && (
            <label className='pb-field pb-price-input'>
              <span className='pb-prefix'>₹</span>
              <input
                type='number'
                inputMode='numeric'
                min={1}
                placeholder='Total medicine price'
                aria-label='Total medicine price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
          )}
          <button
            className='pb-btn-solid'
            disabled={busy}
            onClick={() => {
              if (o.type === 'medicine' && !(Number(price) > 0)) return setError('Enter the total price of the medicines');
              setError('');
              onClaim?.(o.type === 'medicine' ? Number(price) : undefined);
            }}
          >
            {o.type === 'medicine' ? 'Accept & Send Price' : 'Accept'}
          </button>
        </div>
      )}

      {!claimable && (needsOtp || riderNext || o.actions.length > 0) && (
        <div className='pb-order-actions'>
          {needsOtp && (
            <label className='pb-field pb-price-input'>
              <i className='fa-solid fa-key' />
              <input
                inputMode='numeric'
                maxLength={4}
                placeholder="Customer's 4-digit OTP"
                aria-label='Customer OTP'
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </label>
          )}
          {riderNext && (
            <button
              className='pb-btn-solid'
              disabled={busy || (riderNext.stage === 'picked_up' && o.status !== 'ready')}
              onClick={() => onRiderStep?.(riderNext.stage, otp)}
            >
              {riderNext.stage === 'picked_up' && o.status !== 'ready' ? 'Waiting for store to mark ready…' : riderNext.label}
            </button>
          )}
          {o.role !== 'rider' &&
            o.actions.map((a) => (
              <button
                key={a}
                className={a === 'rejected' || a === 'cancelled' ? 'pb-btn-outline' : 'pb-btn-solid'}
                disabled={busy}
                onClick={() => {
                  if (a === 'started' && otp.length !== 4) return setError("Enter the customer's 4-digit OTP");
                  setError('');
                  onStatus?.(a, otp);
                }}
              >
                {ACTION_LABEL[a] || a}
              </button>
            ))}
        </div>
      )}
      {error && <p className='pb-error'>{error}</p>}
      {extraActions}
    </article>
  );
};

export {mapsLink};
