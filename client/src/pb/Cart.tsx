import React, {useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import type {RootState} from '../store';
import type {ApiPartner} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {BasketQuote, Place, pbApi} from './api';
import {PbAlert, PbLayout, PB_ROUTES} from './components';
import {ConsentCheck, PhoneField, TextField, cleanPhone, validPhone} from './forms';
import {PinMap, PlaceField, currentPosition, placeAt} from './places';
import {BasketLine, changeQuantity, clearBasket, saveContact} from './pbSlice';
import {useSendRequest} from './useSendRequest';
import {rupees} from './whatsapp';

const EMPTY_BASKET: BasketLine[] = [];

export const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const basket = useSelector((s: RootState) => s.pbSlice.basket) ?? EMPTY_BASKET;
  const saved = useSelector((s: RootState) => s.pbSlice.contact);

  const [customerName, setCustomerName] = useState(saved?.customerName || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [address, setAddress] = useState(saved?.address || '');
  const [pin, setPin] = useState<Place | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [store, setStore] = useState<ApiPartner | null>(null);
  const [quote, setQuote] = useState<BasketQuote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [alert, setAlert] = useState('');
  const {send, sending} = useSendRequest(setAlert);

  const storeId = basket[0]?.partnerId;
  const items = useMemo(() => basket.map((l) => ({listing: l.listingId, quantity: l.quantity})), [basket]);
  const subtotal = basket.reduce((sum, l) => sum + l.price * l.quantity, 0);

  useEffect(() => {
    if (!storeId) return setStore(null);
    pbApi
      .partner(storeId)
      .then((d) => setStore(d.partner))
      .catch(() => setStore(null));
  }, [storeId]);

  // Delivery charge for the pinned address, priced on the server.
  useEffect(() => {
    if (!items.length) return;
    let active = true;
    setQuoteError('');
    setQuoting(true);
    pbApi
      .quote(items, pin || undefined)
      .then((q) => active && setQuote(q))
      .catch((err) => {
        if (!active) return;
        setQuote(null);
        setQuoteError(errorMessage(err));
      })
      .finally(() => active && setQuoting(false));
    return () => {
      active = false;
    };
  }, [items, pin]);

  const clear = (key: string) => setErrors((e) => (e[key] ? {...e, [key]: ''} : e));

  const setPinAt = async (lat: number, lng: number) => {
    setPin({label: 'Locating…', lat, lng});
    setPin(await placeAt(lat, lng));
    setErrors((e) => ({...e, pin: ''}));
  };

  const locate = async () => {
    setLocating(true);
    try {
      const pos = await currentPosition();
      await setPinAt(pos.lat, pos.lng);
    } catch (err) {
      setAlert((err as Error).message);
    } finally {
      setLocating(false);
    }
  };

  const dispatchOrder = async () => {
    const found: Record<string, string> = {};
    if (customerName.trim().length < 2) found.name = 'Enter your full name';
    if (!validPhone(phone)) found.phone = 'Enter a valid 10-digit mobile number';
    if (address.trim().length < 5) found.address = 'Enter the delivery address / landmark';
    if (!pin) found.pin = 'Pin your location on the map so we can calculate the delivery distance';
    if (!consent) found.consent = 'Please accept the Terms & Privacy Policy';
    setErrors(found);
    if (Object.keys(found).length || !pin) return;

    const sent = await send({
      type: 'basket',
      items,
      customerName: customerName.trim(),
      phone: cleanPhone(phone),
      address: address.trim(),
      location: pin,
      consent: true,
    });
    if (sent) {
      dispatch(saveContact({customerName: customerName.trim(), phone: cleanPhone(phone), address: address.trim()}));
      dispatch(clearBasket());
    }
  };

  if (!basket.length) {
    return (
      <PbLayout>
        <h2 className='pb-page-title'>Food Delivery Basket</h2>
        <section className='pb-card'>
          <p className='pb-empty'>
            Your basket is empty.
            <br />
            Add items from Food or Medicines.
          </p>
          <button
            className='pb-btn-outline'
            style={{display: 'block', margin: '0 auto'}}
            onClick={() => navigate(PB_ROUTES.explore)}
          >
            Browse restaurants
          </button>
        </section>
      </PbLayout>
    );
  }

  const pins = [
    ...(store?.location?.lat != null ? [{id: 'store', kind: 'store' as const, place: store.location}] : []),
    ...(pin ? [{id: 'home', kind: 'home' as const, place: pin, draggable: true}] : []),
  ];
  const deliveryFee = quote?.deliveryFee;

  return (
    <PbLayout>
      <h2 className='pb-page-title'>Food Delivery Basket</h2>
      <p className='pb-page-sub'>
        <i className='fa-solid fa-store' /> {basket[0].partnerName}
      </p>

      {basket.map((line) => (
        <article
          key={line.listingId}
          className='pb-card pb-basket-line'
        >
          <div>
            <h3>{line.name}</h3>
            <span>
              {rupees(line.price)} x {line.quantity}
            </span>
          </div>
          <div className='pb-qty'>
            <button
              onClick={() => dispatch(changeQuantity({listingId: line.listingId, delta: -1}))}
              aria-label={`One less ${line.name}`}
            >
              -
            </button>
            <span aria-live='polite'>{line.quantity}</span>
            <button
              onClick={() => dispatch(changeQuantity({listingId: line.listingId, delta: 1}))}
              aria-label={`One more ${line.name}`}
            >
              +
            </button>
          </div>
        </article>
      ))}

      <section className='pb-card pb-checkout'>
        <h3>Delivery Address Details</h3>
        <TextField
          icon='fa-user'
          label='Full Name'
          autoComplete='name'
          value={customerName}
          onChange={(v) => {
            setCustomerName(v);
            clear('name');
          }}
          error={errors.name}
        />
        <PhoneField
          value={phone}
          onChange={(v) => {
            setPhone(v);
            clear('phone');
          }}
          error={errors.phone}
        />
        <TextField
          icon='fa-house'
          label='Delivery Address / Landmark'
          autoComplete='street-address'
          maxLength={300}
          value={address}
          onChange={(v) => {
            setAddress(v);
            clear('address');
          }}
          error={errors.address}
        />

        <span className='pb-label'>Pin your location for delivery</span>
        <PlaceField
          icon='fa-location-dot'
          label='Delivery location'
          placeholder='Search your area or tap the map'
          place={pin}
          onPick={(p) => {
            setPin(p);
            setErrors((e) => ({...e, pin: ''}));
          }}
          onLocate={locate}
          locating={locating}
        />
        <PinMap
          pins={pins}
          height={190}
          onTap={setPinAt}
          onDrag={(_, lat, lng) => setPinAt(lat, lng)}
          hint={pin ? 'Drag the pin to adjust' : 'Tap the map to drop your pin'}
        />
        {errors.pin && <p className='pb-error'>{errors.pin}</p>}

        <div className='pb-distance'>
          <span>Distance from restaurant</span>
          <strong>{quoting && pin ? 'Calculating…' : quote?.distanceKm != null ? `${quote.approximate ? '~' : ''}${quote.distanceKm} km` : '—'}</strong>
        </div>
        {quoteError && <p className='pb-error'>{quoteError}</p>}

        <div className='pb-totals'>
          <div>
            <span>Subtotal:</span>
            <strong>{rupees(quote?.subtotal ?? subtotal)}</strong>
          </div>
          <div>
            <span>Delivery Charge:</span>
            <strong>{quoting && pin ? '…' : deliveryFee != null ? rupees(deliveryFee) : 'Pin location'}</strong>
          </div>
          <div className='pb-totals-grand'>
            <span>Total Payable:</span>
            <strong>{deliveryFee != null ? rupees((quote?.subtotal ?? subtotal) + deliveryFee) : rupees(subtotal)}</strong>
          </div>
        </div>

        <ConsentCheck
          checked={consent}
          onChange={(v) => {
            setConsent(v);
            setErrors((e) => ({...e, consent: ''}));
          }}
          error={errors.consent}
        />

        <button
          className='pb-btn-solid pb-btn-whatsapp'
          disabled={sending || quoting || !!quoteError}
          onClick={dispatchOrder}
        >
          <i
            className='fa-brands fa-whatsapp'
            style={{marginRight: 8}}
          />
          {sending ? 'Please wait...' : 'Dispatch Order via WhatsApp'}
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
