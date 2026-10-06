import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import type {RootState} from '../store';
import {errorMessage} from '../api';
import {Customer, Place, RouteQuote, pbApi} from './api';
import {ConsentCheck, PhoneField, TextField, cleanPhone, validPhone} from './forms';
import {PinMap, PlaceField, currentPosition, placeAt} from './places';
import {duration, rupees} from './whatsapp';

type Which = 'pickup' | 'drop';

const VEHICLE_ICON: Record<string, string> = {bike: 'fa-motorcycle', suv: 'fa-van-shuttle'};

type Props = {
  sending: boolean;
  onSend: (pickup: Place, drop: Place, vehicle: string, customer: Customer) => Promise<unknown>;
};

export const CabBooking: React.FC<Props> = ({sending, onSend}) => {
  const saved = useSelector((s: RootState) => s.pbSlice.contact);
  const [pickup, setPickup] = useState<Place | null>(null);
  const [drop, setDrop] = useState<Place | null>(null);
  const [mode, setMode] = useState<Which>('pickup');
  const [quote, setQuote] = useState<RouteQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [vehicle, setVehicle] = useState('sedan');
  const [customerName, setCustomerName] = useState(saved?.customerName || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const setPoint = (which: Which, p: Place) => {
    (which === 'pickup' ? setPickup : setDrop)(p);
    setError('');
    // After choosing pickup, the next map tap sets the drop.
    if (which === 'pickup') setMode('drop');
  };

  const pointFromMap = async (which: Which, lat: number, lng: number) => {
    setPoint(which, {label: 'Locating…', lat, lng});
    (which === 'pickup' ? setPickup : setDrop)(await placeAt(lat, lng));
  };

  // Distance and fares once both points are set.
  useEffect(() => {
    setQuote(null);
    if (!pickup || !drop) return;
    let active = true;
    setQuoting(true);
    pbApi
      .route(pickup, drop)
      .then((q) => active && setQuote(q))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setQuoting(false));
    return () => {
      active = false;
    };
  }, [pickup, drop]);

  const locate = async () => {
    setLocating(true);
    try {
      const pos = await currentPosition();
      await pointFromMap('pickup', pos.lat, pos.lng);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLocating(false);
    }
  };

  const selected = quote?.fares.find((f) => f.key === vehicle);

  const submit = async () => {
    if (!pickup || !drop || !selected) return;
    const found: Record<string, string> = {};
    if (customerName.trim().length < 2) found.name = 'Enter your name';
    if (!validPhone(phone)) found.phone = 'Enter a valid 10-digit mobile number';
    if (!consent) found.consent = 'Please accept the Terms & Privacy Policy';
    setErrors(found);
    if (Object.keys(found).length) return;
    const sent = await onSend(pickup, drop, selected.key, {customerName: customerName.trim(), phone: cleanPhone(phone), consent: true});
    if (sent) {
      setPickup(null);
      setDrop(null);
      setMode('pickup');
      setConsent(false);
    }
  };

  const pins = [
    ...(pickup ? [{id: 'pickup', kind: 'pickup' as const, place: pickup, draggable: true}] : []),
    ...(drop ? [{id: 'drop', kind: 'drop' as const, place: drop, draggable: true}] : []),
  ];

  return (
    <section className='pb-card'>
      <h2 className='pb-form-title'>
        <i className='fa-solid fa-car-side' />
        Point-To-Point Cab Terminal
      </h2>

      <PlaceField
        icon='fa-location-dot'
        label='Pick-up location'
        place={pickup}
        active={mode === 'pickup'}
        placeholder='Input specific pick-up location...'
        onPick={(p) => setPoint('pickup', p)}
        onActivate={() => setMode('pickup')}
        onLocate={locate}
        locating={locating}
      />
      <PlaceField
        icon='fa-crosshairs'
        label='Drop location'
        place={drop}
        active={mode === 'drop'}
        placeholder='Input target drop destination point...'
        onPick={(p) => setPoint('drop', p)}
        onActivate={() => setMode('drop')}
      />

      <PinMap
        pins={pins}
        path={quote?.path}
        onTap={(lat, lng) => pointFromMap(mode, lat, lng)}
        onDrag={(id, lat, lng) => pointFromMap(id as Which, lat, lng)}
        hint={
          <>
            Tap map to set <strong>{mode === 'pickup' ? 'pick-up' : 'drop'}</strong>
          </>
        }
      />

      {error && <p className='pb-error'>{error}</p>}
      {quoting && <p className='pb-loading'>Calculating route…</p>}

      {quote && (
        <>
          <p className='pb-route-summary'>
            <i className='fa-solid fa-route' /> {quote.approximate ? '~' : ''}
            {quote.distanceKm} km • about {duration(quote.durationMin)}
            {quote.approximate && <small> (approximate)</small>}
          </p>
          <div
            className='pb-vehicles'
            role='radiogroup'
            aria-label='Vehicle'
          >
            {quote.fares.map((f) => (
              <button
                key={f.key}
                role='radio'
                aria-checked={vehicle === f.key}
                className={`pb-vehicle${vehicle === f.key ? ' is-active' : ''}`}
                onClick={() => setVehicle(f.key)}
              >
                <i className={`fa-solid ${VEHICLE_ICON[f.key] || 'fa-car'}`} />
                <strong>{f.label}</strong>
                <small>
                  {f.seats} seat{f.seats > 1 ? 's' : ''} • ₹{f.perKm}/km
                </small>
                <span>{rupees(f.fare)}</span>
              </button>
            ))}
          </div>

          <TextField
            icon='fa-user'
            label='Your Name'
            autoComplete='name'
            value={customerName}
            onChange={setCustomerName}
            error={errors.name}
          />
          <PhoneField
            value={phone}
            onChange={setPhone}
            error={errors.phone}
          />
          <ConsentCheck
            checked={consent}
            onChange={setConsent}
            error={errors.consent}
          />
        </>
      )}

      <button
        className='pb-btn-solid'
        disabled={sending || !pickup || !drop || !selected}
        onClick={submit}
      >
        {sending
          ? 'Please wait...'
          : selected
            ? `Lock Drivers & Route Vehicle • ${rupees(selected.fare)}`
            : 'Lock Drivers & Route Vehicle'}
      </button>
    </section>
  );
};
