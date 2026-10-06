import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import type {RootState} from '../store';
import type {ApiListing, ApiPartner, ServiceKey} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {pbApi} from './api';
import {saveContact, setService} from './pbSlice';
import {ListingCard, PbAlert, PbLayout, describe} from './components';
import {CabBooking} from './CabBooking';
import {compressImage, useSendRequest} from './useSendRequest';
import {useBasket} from './useBasket';
import {ConsentCheck, PhoneField, TextField, cleanPhone, validPhone} from './forms';
import {PinMap, PlaceField, currentPosition, placeAt} from './places';
import type {DeliveryTo, Place} from './api';
import {openWhatsApp, rupees} from './whatsapp';

const SERVICES: {key: ServiceKey; label: string; icon: string}[] = [
  {key: 'stay', label: 'Stays', icon: 'fa-hotel'},
  {key: 'food', label: 'Food', icon: 'fa-utensils'},
  {key: 'medicine', label: 'Medicines', icon: 'fa-pills'},
  {key: 'cab', label: 'Cabs', icon: 'fa-car'},
];

const STAY_CHIPS = ['Hotels', 'Villas', 'Bungalow'];
const BUDGET = {min: 2000, max: 25000, step: 500};

// Listings per service, kept for the session so switching tabs is instant.
const cache: Partial<Record<ServiceKey, ApiListing[]>> = {};

const useListings = (service: ServiceKey) => {
  const [listings, setListings] = useState<ApiListing[] | undefined>(cache[service]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setListings(cache[service]);
    setError('');
    pbApi
      .listings(service)
      .then((data) => {
        cache[service] = data;
        if (active) setListings(data);
      })
      .catch((err) => active && setError(errorMessage(err)));
    return () => {
      active = false;
    };
  }, [service]);

  return {listings, error};
};

let restaurantCache: ApiPartner[] | undefined;

const useRestaurants = (enabled: boolean) => {
  const [restaurants, setRestaurants] = useState<ApiPartner[] | undefined>(restaurantCache);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    pbApi
      .restaurants()
      .then((data) => {
        restaurantCache = data;
        if (active) setRestaurants(data);
      })
      .catch((err) => active && setError(errorMessage(err)));
    return () => {
      active = false;
    };
  }, [enabled]);

  return {restaurants, error};
};

export const Explore: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const service = useSelector((s: RootState) => s.pbSlice.service);
  const {listings, error} = useListings(service);
  const food = useRestaurants(service === 'food');

  const [search, setSearch] = useState('');
  const [stayType, setStayType] = useState('All');
  const [budget, setBudget] = useState(BUDGET.max);
  const [alert, setAlert] = useState('');
  const basket = useBasket();

  const {send, sending} = useSendRequest(setAlert);

  const chips = useMemo(() => {
    const extra = (cache.stay || [])
      .map((l) => l.category)
      .filter((c): c is string => !!c && !STAY_CHIPS.includes(c));
    return ['All', ...STAY_CHIPS, ...Array.from(new Set(extra))];
  }, [listings]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (listings || []).filter((l) => {
      if (q && !`${l.name} ${describe(l)} ${l.category || ''}`.toLowerCase().includes(q)) return false;
      if (service === 'stay') {
        if (stayType !== 'All' && l.category !== stayType) return false;
        if (l.price > budget) return false;
      }
      return true;
    });
  }, [listings, search, service, stayType, budget]);

  const storeOf = (l: ApiListing) =>
    typeof l.partner === 'object' ? l.partner : {_id: String(l.partner), businessName: 'Store'};

  // Cab tour packages are booked straight on WhatsApp.
  const bookTour = (l: ApiListing) =>
    openWhatsApp(
      `Hello PRIMEBOOKIN, I want to book a cab tour:\n\n❖ Package: ${l.name}\n❖ Price: ${rupees(l.price)}\n❖ Date: \n❖ Pickup point: \n\nPlease confirm availability!`,
    );

  const renderStayFilters = () => (
    <div className='pb-filters'>
      <div
        className='pb-chips'
        role='tablist'
        aria-label='Stay type'
      >
        {chips.map((c) => (
          <button
            key={c}
            role='tab'
            aria-selected={stayType === c}
            className={`pb-chip${stayType === c ? ' is-active' : ''}`}
            onClick={() => setStayType(c)}
          >
            {c === 'All' ? 'All Stays' : c}
          </button>
        ))}
      </div>
      <label className='pb-budget'>
        <span>
          Budget Max Cap: <strong>{rupees(budget)}</strong>
        </span>
        <input
          type='range'
          min={BUDGET.min}
          max={BUDGET.max}
          step={BUDGET.step}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-label='Maximum budget per night'
        />
      </label>
    </div>
  );

  const renderTiles = () => (
    <div className='pb-tiles'>
      {SERVICES.map((s) => (
        <button
          key={s.key}
          className={`pb-tile${service === s.key ? ' is-active' : ''}`}
          aria-pressed={service === s.key}
          onClick={() => {
            dispatch(setService(s.key));
            setSearch('');
          }}
        >
          <span className='pb-tile-icon'>
            <i className={`fa-solid ${s.icon}`} />
          </span>
          {s.label}
        </button>
      ))}
    </div>
  );

  const renderRestaurants = () => {
    if (food.error) return <p className='pb-empty'>{food.error}</p>;
    if (!food.restaurants) return <p className='pb-loading'>Loading restaurants…</p>;
    const q = search.trim().toLowerCase();
    // Search matches the restaurant or any dish on its menu.
    const dishMatches = new Set(
      (listings || [])
        .filter((l) => q && `${l.name} ${l.description || ''}`.toLowerCase().includes(q))
        .map((l) => (typeof l.partner === 'object' ? l.partner._id : l.partner)),
    );
    const shown = food.restaurants.filter(
      (r) => !q || `${r.businessName} ${r.description || ''}`.toLowerCase().includes(q) || dishMatches.has(r._id),
    );
    if (!shown.length) {
      return <p className='pb-empty'>{q ? `Nothing matches "${search}".` : 'No restaurants yet.'}</p>;
    }
    return shown.map((r) => (
      <article
        key={r._id}
        className='pb-card pb-listing pb-restaurant'
        onClick={() => navigate(`/restaurant/${r._id}`)}
      >
        <img
          className='pb-listing-img'
          src={r.image}
          alt={r.businessName}
          loading='lazy'
        />
        <div className='pb-listing-info'>
          <h3>
            <button className='pb-card-link'>{r.businessName}</button>
          </h3>
          <p>{r.description}</p>
          <div className='pb-listing-foot'>
            <span className='pb-detail-meta'>
              <i className='fa-solid fa-location-dot' /> {r.city || r.address}
            </span>
            <span className='pb-btn-outline'>View Menu</span>
          </div>
        </div>
      </article>
    ));
  };

  const renderList = () => {
    if (service === 'food') return renderRestaurants();
    if (error) return <p className='pb-empty'>{error}</p>;
    if (!listings) return <p className='pb-loading'>Loading options…</p>;
    if (!visible.length) {
      return (
        <p className='pb-empty'>
          {search ? `Nothing matches "${search}".` : 'No options available here yet.'}
        </p>
      );
    }
    return visible.map((l) => (
      <ListingCard
        key={l._id}
        listing={l}
        actionLabel={service === 'stay' ? 'Reserve Room' : service === 'cab' ? 'Book Tour' : 'Add Item'}
        flash={basket.flashId === l._id}
        onOpen={service === 'stay' ? () => navigate(`/stay/${l._id}`) : undefined}
        onAction={() => {
          if (service === 'stay') navigate(`/stay/${l._id}#book`);
          else if (service === 'cab') bookTour(l);
          else basket.add(l, storeOf(l));
        }}
      />
    ));
  };

  return (
    <PbLayout
      search={search}
      onSearch={setSearch}
    >
      {service === 'stay' && renderStayFilters()}
      {renderTiles()}

      {service === 'food' && (
        <TextRequest
          icon='fa-pepper-hot'
          title='Custom Request? Text directly below:'
          placeholder='Type custom dishes, specialized variations or specific instructions here...'
          buttonLabel='Send Custom Request'
          sending={sending}
          onSend={(text) => send({type: 'food-custom', text})}
        />
      )}
      {service === 'medicine' && (
        <MedicineRequest
          sending={sending}
          onSend={async (text, image, to) => {
            const sent = await send({type: 'medicine', text, image, ...to});
            if (sent) dispatch(saveContact({customerName: to.customerName, phone: to.phone, address: to.address}));
            return sent;
          }}
          onError={setAlert}
        />
      )}
      {service === 'cab' && (
        <CabBooking
          sending={sending}
          onSend={async (pickup, drop, vehicle, customer) => {
            const sent = await send({type: 'cab', pickup, drop, vehicle, ...customer});
            if (sent) dispatch(saveContact({customerName: customer.customerName, phone: customer.phone, address: ''}));
            return sent;
          }}
        />
      )}

      <h2 className='pb-section-title'>{service === 'food' ? 'Restaurants Near You' : 'Available Inventory Options'}</h2>
      {renderList()}

      {alert && (
        <PbAlert
          message={alert}
          onClose={() => setAlert('')}
        />
      )}
      {basket.dialogs}
    </PbLayout>
  );
};

type TextRequestProps = {
  icon: string;
  title: string;
  placeholder: string;
  buttonLabel: string;
  sending: boolean;
  onSend: (text: string) => Promise<unknown>;
};

const TextRequest: React.FC<TextRequestProps> = ({
  icon,
  title,
  placeholder,
  buttonLabel,
  sending,
  onSend,
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  return (
    <section className='pb-card'>
      <h2 className='pb-form-title'>
        <i className={`fa-solid ${icon}`} />
        {title}
      </h2>
      <textarea
        className='pb-textarea'
        placeholder={placeholder}
        value={text}
        aria-label={title}
        onChange={(e) => {
          setText(e.target.value);
          setError('');
        }}
      />
      {error && <p className='pb-error'>{error}</p>}
      <button
        className='pb-btn-outline'
        disabled={sending}
        onClick={async () => {
          if (text.trim().length < 2) return setError('Please type your request first.');
          if (await onSend(text.trim())) setText('');
        }}
      >
        {buttonLabel}
      </button>
    </section>
  );
};

const MedicineRequest: React.FC<{
  sending: boolean;
  onSend: (text: string, image: string | undefined, to: DeliveryTo) => Promise<unknown>;
  onError: (message: string) => void;
}> = ({sending, onSend, onError}) => {
  const saved = useSelector((st: RootState) => st.pbSlice.contact);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string>();
  const [customerName, setCustomerName] = useState(saved?.customerName || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [address, setAddress] = useState(saved?.address || '');
  const [pin, setPin] = useState<Place | null>(null);
  const [consent, setConsent] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInput = useRef<HTMLInputElement>(null);

  const setPinAt = async (lat: number, lng: number) => {
    setPin({label: 'Locating…', lat, lng});
    setPin(await placeAt(lat, lng));
  };

  const submit = async () => {
    const found: Record<string, string> = {};
    if (text.trim().length < 2 && !image) found.text = 'Type your medicines or add a prescription photo.';
    if (customerName.trim().length < 2) found.name = 'Enter your full name';
    if (!validPhone(phone)) found.phone = 'Enter a valid 10-digit mobile number';
    if (address.trim().length < 5) found.address = 'Enter the delivery address / landmark';
    if (!pin) found.pin = 'Pin your location on the map';
    if (!consent) found.consent = 'Please accept the Terms & Privacy Policy';
    setErrors(found);
    if (Object.keys(found).length || !pin) return;
    const to: DeliveryTo = {customerName: customerName.trim(), phone: cleanPhone(phone), address: address.trim(), location: pin, consent: true};
    if (await onSend(text.trim(), image, to)) {
      setText('');
      setImage(undefined);
      setConsent(false);
    }
  };

  return (
    <section className='pb-card'>
      <h2 className='pb-form-title'>
        <i className='fa-solid fa-file-prescription' />
        Direct Text Medicine / Upload Prescription Image
      </h2>
      <textarea
        className='pb-textarea'
        placeholder='List down your prescription compounds, brand names or operational delivery notes here...'
        value={text}
        aria-label='Medicines needed'
        onChange={(e) => {
          setText(e.target.value);
          setErrors((er) => ({...er, text: ''}));
        }}
      />
      {image && (
        <div className='pb-attachment'>
          <img
            src={image}
            alt='Prescription'
          />
          <span>Prescription photo attached</span>
          <button onClick={() => setImage(undefined)}>Remove</button>
        </div>
      )}
      {errors.text && <p className='pb-error'>{errors.text}</p>}
      <input
        ref={fileInput}
        type='file'
        accept='image/*'
        capture='environment'
        hidden={true}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          try {
            setImage(await compressImage(file));
            setErrors((er) => ({...er, text: ''}));
          } catch (err) {
            onError((err as Error).message);
          }
        }}
      />
      <button
        className='pb-btn-soft'
        style={{marginBottom: 14}}
        onClick={() => fileInput.current?.click()}
      >
        <i className='fa-solid fa-camera' />
        Snapshot Prescription
      </button>

      <span className='pb-label'>Delivery Details</span>
      <TextField
        icon='fa-user'
        label='Full Name'
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
      <TextField
        icon='fa-house'
        label='Delivery Address / Landmark'
        maxLength={300}
        value={address}
        onChange={setAddress}
        error={errors.address}
      />
      <PlaceField
        icon='fa-location-dot'
        label='Delivery location'
        placeholder='Search your area or tap the map'
        place={pin}
        onPick={setPin}
        onLocate={async () => {
          setLocating(true);
          try {
            const pos = await currentPosition();
            await setPinAt(pos.lat, pos.lng);
          } catch (err) {
            onError((err as Error).message);
          } finally {
            setLocating(false);
          }
        }}
        locating={locating}
      />
      <PinMap
        pins={pin ? [{id: 'home', kind: 'home', place: pin, draggable: true}] : []}
        height={170}
        onTap={setPinAt}
        onDrag={(_, lat, lng) => setPinAt(lat, lng)}
        hint={pin ? 'Drag the pin to adjust' : 'Tap the map to drop your pin'}
      />
      {errors.pin && <p className='pb-error'>{errors.pin}</p>}
      <p className='pb-note'>
        <i className='fa-solid fa-circle-info' /> A nearby pharmacy will reply with the price. Delivery is charged by
        distance.
      </p>
      <ConsentCheck
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
      <button
        className='pb-btn-solid'
        disabled={sending}
        onClick={submit}
      >
        {sending ? 'Please wait...' : 'Submit Setup'}
      </button>
    </section>
  );
};
