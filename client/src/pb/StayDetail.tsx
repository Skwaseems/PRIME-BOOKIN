import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';

import type {ApiListing} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {pbApi} from './api';
import {PbAlert, PbLayout} from './components';
import {useSendRequest} from './useSendRequest';
import {ConsentCheck} from './forms';
import {rupees} from './whatsapp';

const ROOM_TYPES: Record<string, number> = {
  'Standard Room': 1,
  'Deluxe Room': 1.25,
  'Super Deluxe Suite': 1.6,
};
const ROOM_LABELS: Record<string, string> = {
  'Standard Room': 'Standard Room (Base Rate)',
  'Deluxe Room': 'Deluxe Room (+25%)',
  'Super Deluxe Suite': 'Super Deluxe Suite (+60%)',
};
// Each room sleeps 2, plus 1 on an extra bed ("2+1").
const PER_ROOM = 2;
const EXTRA_PER_ROOM = 1;
const DEFAULT_EXTRA_BED_PRICE = 800;
const MAX_ROOMS = 10;

const isoDay = (offset: number, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Gallery: React.FC<{images: string[]; name: string}> = ({images, name}) => {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const go = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({left: i * el.clientWidth, behavior: 'smooth'});
  };

  return (
    <div className='pb-gallery'>
      <div
        className='pb-gallery-track'
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${name}, view ${i + 1}`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      {images.length > 1 && (
        <>
          <span className='pb-gallery-count'>
            <i className='fa-regular fa-images' /> {index + 1}/{images.length}
          </span>
          <div className='pb-gallery-dots'>
            {images.map((_, i) => (
              <button
                key={i}
                className={i === index ? 'is-active' : ''}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Stepper: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
}> = ({value, min, max, onChange, label}) => (
  <div className='pb-stepper'>
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label={`Fewer ${label}`}
    >
      <i className='fa-solid fa-minus' />
    </button>
    <span aria-live='polite'>{value}</span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`More ${label}`}
    >
      <i className='fa-solid fa-plus' />
    </button>
  </div>
);

export const StayDetail: React.FC = () => {
  const {id} = useParams();
  const [listing, setListing] = useState<ApiListing>();
  const [loadError, setLoadError] = useState('');

  const [roomType, setRoomType] = useState('Standard Room');
  const [checkIn, setCheckIn] = useState(isoDay(0));
  const [checkOut, setCheckOut] = useState(isoDay(1));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [names, setNames] = useState<string[]>(['']);
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState('');
  const formRef = useRef<HTMLElement>(null);

  const {send, sending} = useSendRequest(setAlert);

  useEffect(() => {
    if (!id) return;
    pbApi
      .listing(id)
      .then(setListing)
      .catch((err) => setLoadError(errorMessage(err)));
  }, [id]);

  // Opened from "Reserve Room": jump straight to the form.
  useEffect(() => {
    if (listing && window.location.hash === '#book') {
      formRef.current?.scrollIntoView({behavior: 'smooth'});
    }
  }, [listing]);

  const nights = useMemo(() => {
    const n = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
    return Number.isFinite(n) ? n : 0;
  }, [checkIn, checkOut]);

  const capacity = rooms * (PER_ROOM + EXTRA_PER_ROOM);
  const extraBeds = Math.max(0, guests - rooms * PER_ROOM);
  const extraBedPrice = Number(listing?.details?.extraBedPrice ?? DEFAULT_EXTRA_BED_PRICE);
  const roomRate = Math.round((listing?.price || 0) * ROOM_TYPES[roomType]);
  const roomsTotal = roomRate * rooms * Math.max(nights, 0);
  const bedsTotal = extraBedPrice * extraBeds * Math.max(nights, 0);

  const changeGuests = (n: number) => {
    setGuests(n);
    // Add rooms automatically when guests no longer fit (2+1 per room).
    const needed = Math.ceil(n / (PER_ROOM + EXTRA_PER_ROOM));
    if (needed > rooms) setRooms(needed);
  };

  const changeRooms = (n: number) => {
    setRooms(n);
    if (guests > n * (PER_ROOM + EXTRA_PER_ROOM)) setGuests(n * (PER_ROOM + EXTRA_PER_ROOM));
    if (guests < n) setGuests(n);
  };

  // One name field per guest; the first (main guest) is required.
  const nameFields = Array.from({length: guests}, (_, i) => names[i] || '');

  const submit = async () => {
    if (!listing) return;
    const found: Record<string, string> = {};
    const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^(\+?91)(?=\d{10}$)/, '');
    if (!nameFields[0].trim()) found.name0 = 'Enter the main guest name';
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) found.phone = 'Enter a valid 10-digit mobile number';
    if (nights < 1) found.dates = 'Check-out must be after check-in';
    if (!consent) found.consent = 'Please accept the Terms & Privacy Policy';
    setErrors(found);
    if (Object.keys(found).length) return;

    await send({
      type: 'stay',
      listing: listing._id,
      roomType,
      rooms,
      guests,
      guestNames: nameFields.map((n) => n.trim()).filter(Boolean),
      phone: cleanPhone,
      checkIn,
      checkOut,
      consent: true,
    });
  };

  if (loadError || !listing) {
    return (
      <PbLayout title='Stay details'>
        <p className={loadError ? 'pb-empty' : 'pb-loading'}>{loadError || 'Loading…'}</p>
      </PbLayout>
    );
  }

  const amenities: string[] = listing.details?.amenities || [];

  return (
    <PbLayout title={listing.name}>
      <Gallery
        images={listing.images}
        name={listing.name}
      />

      <section className='pb-card'>
        <div className='pb-booking-head'>
          {listing.category && <span className='pb-tag'>{listing.category}</span>}
          <span className='pb-price'>
            {rupees(listing.price)} <small>/ room / night</small>
          </span>
        </div>
        <h2 className='pb-detail-title'>{listing.name}</h2>
        <p className='pb-detail-text'>{listing.description}</p>
        {amenities.length > 0 && (
          <div className='pb-amenities'>
            {amenities.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
        )}
      </section>

      <section
        className='pb-card'
        ref={formRef}
        id='book'
      >
        <h2 className='pb-form-title'>
          <i className='fa-solid fa-bed' />
          Reservation Details
        </h2>

        <span className='pb-label'>Room Type</span>
        <label className='pb-field'>
          <i className='fa-solid fa-door-open' />
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            aria-label='Room type'
          >
            {Object.keys(ROOM_TYPES).map((r) => (
              <option
                key={r}
                value={r}
              >
                {ROOM_LABELS[r]}
              </option>
            ))}
          </select>
        </label>

        <div className='pb-two-col'>
          <div>
            <span className='pb-label'>Check-in Date</span>
            <label className='pb-field'>
              <input
                type='date'
                value={checkIn}
                min={isoDay(0)}
                aria-label='Check-in date'
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (e.target.value >= checkOut) setCheckOut(isoDay(1, new Date(e.target.value)));
                }}
              />
            </label>
          </div>
          <div>
            <span className='pb-label'>Check-out Date</span>
            <label className='pb-field'>
              <input
                type='date'
                value={checkOut}
                min={checkIn}
                aria-label='Check-out date'
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>
          </div>
        </div>
        {errors.dates && <p className='pb-error'>{errors.dates}</p>}

        <div className='pb-count-row'>
          <div>
            <strong>Rooms</strong>
            <small>{PER_ROOM}+{EXTRA_PER_ROOM} guests per room</small>
          </div>
          <Stepper
            value={rooms}
            min={1}
            max={MAX_ROOMS}
            onChange={changeRooms}
            label='rooms'
          />
        </div>
        <div className='pb-count-row'>
          <div>
            <strong>No. of Guests</strong>
            <small>Up to {capacity} for {rooms} room{rooms > 1 ? 's' : ''}</small>
          </div>
          <Stepper
            value={guests}
            min={1}
            max={MAX_ROOMS * (PER_ROOM + EXTRA_PER_ROOM)}
            onChange={changeGuests}
            label='guests'
          />
        </div>
        {extraBeds > 0 && (
          <p className='pb-note'>
            <i className='fa-solid fa-circle-info' /> {extraBeds} extra bed{extraBeds > 1 ? 's' : ''} (2+1 in a room) at{' '}
            {rupees(extraBedPrice)}/night each.
          </p>
        )}

        <span className='pb-label'>Guest Names</span>
        {nameFields.map((value, i) => (
          <div key={i}>
            <label className='pb-field'>
              <i className='fa-solid fa-user' />
              <input
                value={value}
                placeholder={i === 0 ? 'Main guest full name' : `Guest ${i + 1} name (optional)`}
                aria-label={i === 0 ? 'Main guest name' : `Guest ${i + 1} name`}
                autoComplete={i === 0 ? 'name' : 'off'}
                maxLength={80}
                onChange={(e) => {
                  const next = [...nameFields];
                  next[i] = e.target.value;
                  setNames(next);
                  if (i === 0 && errors.name0) setErrors({...errors, name0: ''});
                }}
              />
            </label>
            {i === 0 && errors.name0 && <p className='pb-error'>{errors.name0}</p>}
          </div>
        ))}

        <span className='pb-label'>Mobile Number</span>
        <label className='pb-field'>
          <i className='fa-solid fa-mobile-screen' />
          <span className='pb-prefix'>+91</span>
          <input
            type='tel'
            inputMode='numeric'
            autoComplete='tel-national'
            placeholder='10-digit mobile number'
            aria-label='Mobile number'
            maxLength={14}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({...errors, phone: ''});
            }}
          />
        </label>
        {errors.phone && <p className='pb-error'>{errors.phone}</p>}

        <div className='pb-breakdown'>
          <div>
            <span>
              {rupees(roomRate)} × {rooms} room{rooms > 1 ? 's' : ''} × {Math.max(nights, 0)} night
              {nights === 1 ? '' : 's'}
            </span>
            <span>{rupees(roomsTotal)}</span>
          </div>
          {extraBeds > 0 && (
            <div>
              <span>
                Extra bed {rupees(extraBedPrice)} × {extraBeds} × {Math.max(nights, 0)} night{nights === 1 ? '' : 's'}
              </span>
              <span>{rupees(bedsTotal)}</span>
            </div>
          )}
        </div>
        <div className='pb-estimate'>
          <span>Calculated Total Stay:</span>
          <strong>{nights >= 1 ? rupees(roomsTotal + bedsTotal) : '—'}</strong>
        </div>

        <ConsentCheck
          checked={consent}
          onChange={(v) => {
            setConsent(v);
            if (errors.consent) setErrors({...errors, consent: ''});
          }}
          error={errors.consent}
        />

        <button
          className='pb-btn-solid'
          disabled={sending}
          onClick={submit}
        >
          {sending ? 'Please wait...' : 'Confirm & Reserve via WhatsApp'}
        </button>
      </section>

      {alert && (
        <PbAlert
          message={alert}
          onClose={() => setAlert('')}
        />
      )}
    </PbLayout>
  );
};
