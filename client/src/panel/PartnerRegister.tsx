import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link, useNavigate} from 'react-router-dom';

import type {RootState} from '../store';
import type {PartnerTypeKey} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {setSession} from '../store/slices/userSlice';
import {PhoneField, TextField, cleanPhone, validPhone} from '../pb/forms';
import {PinMap, PlaceField, currentPosition, placeAt} from '../pb/places';
import {compressImage} from '../pb/useSendRequest';
import type {Place} from '../pb/api';
import {PanelLayout} from './PanelLayout';
import {PARTNER_TYPES} from './PartnerHome';
import {panelApi} from './panelApi';

type Doc = {number: string; file: string; name: string};

const readFile = (file: File): Promise<string> => {
  if (file.type.startsWith('image/')) return compressImage(file, 1600, 0.8);
  if (file.type !== 'application/pdf') return Promise.reject(new Error('Upload a photo or a PDF'));
  if (file.size > 2_000_000) return Promise.reject(new Error('PDF must be under 2 MB. Upload a photo instead.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
};

const HAS_LOCATION: PartnerTypeKey[] = ['hotel', 'restaurant', 'pharmacy'];

export const PartnerRegister: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.userSlice.user);

  const [step, setStep] = useState(1);
  const [type, setType] = useState<PartnerTypeKey | null>(null);
  const [required, setRequired] = useState<Record<string, string[]>>({});
  const [vehicles, setVehicles] = useState<{key: string; label: string}[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mahabaleshwar');
  const [pin, setPin] = useState<Place | null>(null);
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [docs, setDocs] = useState<Record<string, Doc>>({});
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    panelApi
      .requirements()
      .then((r) => {
        setRequired(r.documents);
        setVehicles(r.vehicles);
        setVehicleType(r.vehicles.find((v) => v.key === 'sedan')?.key || r.vehicles[0]?.key || '');
      })
      .catch((err) => setErrors({form: errorMessage(err)}));
  }, []);

  const isPerson = type === 'cab' || type === 'delivery';
  const docLabels = type ? required[type] || [] : [];

  const checkDetails = () => {
    const e: Record<string, string> = {};
    if (!user) {
      if (name.trim().length < 2) e.name = 'Enter your full name';
      if (!validPhone(phone)) e.phone = 'Enter a valid 10-digit mobile number';
      if (password.length < 6) e.password = 'At least 6 characters';
    }
    if (businessName.trim().length < 2) e.businessName = isPerson ? 'Enter the name customers will see' : 'Enter the business name';
    if (type && HAS_LOCATION.includes(type)) {
      if (address.trim().length < 5) e.address = 'Enter the full address';
      if (!pin) e.pin = 'Pin the exact location on the map (used for delivery distance)';
    }
    if (type === 'cab' && vehicleNumber.trim().length < 6) e.vehicleNumber = 'Enter the vehicle registration number';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const checkDocs = () => {
    const e: Record<string, string> = {};
    docLabels.forEach((label) => {
      if (!docs[label]?.file) e[label] = 'Upload a photo or PDF';
    });
    if (!accept) e.accept = 'Please accept the Partner Terms and Privacy Policy';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!type || !checkDocs()) return;
    setSubmitting(true);
    const application = {
      type,
      businessName: businessName.trim(),
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      location: pin ? {lat: pin.lat, lng: pin.lng} : undefined,
      vehicle: type === 'cab' ? {type: vehicleType, number: vehicleNumber.trim().toUpperCase(), model: vehicleModel.trim() || undefined} : undefined,
      documents: docLabels.map((label) => ({label, number: docs[label].number.trim() || undefined, file: docs[label].file})),
      acceptTerms: true as const,
    };
    try {
      if (user) {
        await panelApi.apply(application);
      } else {
        const session = await panelApi.register({...application, name: name.trim(), ownerPhone: cleanPhone(phone), password, email: email.trim() || undefined});
        dispatch(setSession({token: session.token, user: session.user}));
      }
      setDone(true);
    } catch (err) {
      setErrors({form: errorMessage(err)});
    } finally {
      setSubmitting(false);
    }
  };

  const setPinAt = async (lat: number, lng: number) => setPin(await placeAt(lat, lng));

  if (done) {
    return (
      <PanelLayout title='Registration sent'>
        <section className='pb-card'>
          <p
            className='pb-empty'
            style={{fontSize: 13}}
          >
            <i
              className='fa-solid fa-circle-check'
              style={{color: '#16a34a', fontSize: 36, display: 'block', marginBottom: 10}}
            />
            Thank you! Your application is with the Primebookin team.
            <br />
            We will verify your documents and approve your account. You can check the status any time on the partner
            page.
          </p>
          <button
            className='pb-btn-solid'
            onClick={() => navigate('/partner')}
          >
            Go to partner page
          </button>
        </section>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title='Partner Registration'
      subtitle={`Step ${step} of 3`}
      onBack={() => (step > 1 ? setStep(step - 1) : navigate('/partner'))}
    >
      {step === 1 && (
        <>
          <h2 className='pb-page-title'>What would you like to register?</h2>
          {(Object.keys(PARTNER_TYPES) as PartnerTypeKey[]).map((t) => (
            <button
              key={t}
              className={`pb-card pb-account${type === t ? ' is-selected' : ''}`}
              onClick={() => {
                setType(t);
                setStep(2);
              }}
            >
              <span className='pb-tile-icon'>
                <i className={`fa-solid ${PARTNER_TYPES[t].icon}`} />
              </span>
              <span>
                <strong>{PARTNER_TYPES[t].label}</strong>
                <small>Documents: {(required[t] || []).join(', ')}</small>
              </span>
              <i className='fa-solid fa-chevron-right' />
            </button>
          ))}
        </>
      )}

      {step === 2 && type && (
        <section className='pb-card'>
          <h2 className='pb-form-title'>
            <i className={`fa-solid ${PARTNER_TYPES[type].icon}`} />
            {PARTNER_TYPES[type].label}
          </h2>

          {!user && (
            <>
              <span className='pb-label'>Your Account</span>
              <TextField
                icon='fa-user'
                label='Full Name (as on ID)'
                autoComplete='name'
                value={name}
                onChange={setName}
                error={errors.name}
              />
              <PhoneField
                label='Mobile Number (used to sign in)'
                value={phone}
                onChange={setPhone}
                error={errors.phone}
              />
              <TextField
                icon='fa-key'
                label='Create Password'
                type='password'
                autoComplete='new-password'
                value={password}
                onChange={setPassword}
                error={errors.password}
              />
              <TextField
                icon='fa-envelope'
                label='Email (optional)'
                type='email'
                autoComplete='email'
                value={email}
                onChange={setEmail}
              />
            </>
          )}

          <span className='pb-label'>{isPerson ? 'Profile' : 'Business Details'}</span>
          <TextField
            icon={isPerson ? 'fa-id-badge' : 'fa-store'}
            label={isPerson ? 'Name shown to customers' : 'Business Name'}
            value={businessName}
            onChange={setBusinessName}
            error={errors.businessName}
          />
          {!isPerson && (
            <TextField
              icon='fa-align-left'
              label={type === 'restaurant' ? 'Cuisine (e.g. North Indian • Biryani)' : 'Short description'}
              value={description}
              onChange={setDescription}
            />
          )}
          <TextField
            icon='fa-city'
            label='Town / City'
            value={city}
            onChange={setCity}
          />

          {HAS_LOCATION.includes(type) && (
            <>
              <TextField
                icon='fa-house'
                label='Full Address'
                maxLength={300}
                value={address}
                onChange={setAddress}
                error={errors.address}
              />
              <span className='pb-label'>Exact location on map</span>
              <PlaceField
                icon='fa-location-dot'
                label='Business location'
                placeholder='Search your area or tap the map'
                place={pin}
                onPick={setPin}
                onLocate={async () => {
                  try {
                    const p = await currentPosition();
                    await setPinAt(p.lat, p.lng);
                  } catch (err) {
                    setErrors({...errors, pin: (err as Error).message});
                  }
                }}
              />
              <PinMap
                pins={pin ? [{id: 'store', kind: 'store', place: pin, draggable: true}] : []}
                height={180}
                onTap={setPinAt}
                onDrag={(_, lat, lng) => setPinAt(lat, lng)}
                hint={pin ? 'Drag to adjust' : 'Tap the map at your entrance'}
              />
              {errors.pin && <p className='pb-error'>{errors.pin}</p>}
            </>
          )}

          {type === 'cab' && (
            <>
              <span className='pb-label'>Vehicle</span>
              <label className='pb-field'>
                <i className='fa-solid fa-car' />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  aria-label='Vehicle type'
                >
                  {vehicles.map((v) => (
                    <option
                      key={v.key}
                      value={v.key}
                    >
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <TextField
                icon='fa-hashtag'
                label='Registration Number (e.g. MH 11 AB 1234)'
                value={vehicleNumber}
                onChange={setVehicleNumber}
                error={errors.vehicleNumber}
              />
              <TextField
                icon='fa-car-side'
                label='Model (e.g. Swift Dzire)'
                value={vehicleModel}
                onChange={setVehicleModel}
              />
            </>
          )}

          <button
            className='pb-btn-solid'
            onClick={() => checkDetails() && setStep(3)}
          >
            Next: Documents
          </button>
        </section>
      )}

      {step === 3 && type && (
        <section className='pb-card'>
          <h2 className='pb-form-title'>
            <i className='fa-solid fa-file-shield' />
            Verification Documents
          </h2>
          <p className='pb-detail-text'>
            Upload a clear photo or PDF of each. Only the Primebookin admin team can see them.
          </p>
          {docLabels.map((label) => {
            const d = docs[label] || {number: '', file: '', name: ''};
            return (
              <div
                key={label}
                className='pb-doc'
              >
                <strong>{label}</strong>
                <TextField
                  icon='fa-hashtag'
                  label={`${label} number (if any)`}
                  value={d.number}
                  onChange={(v) => setDocs({...docs, [label]: {...d, number: v}})}
                />
                <label className={`pb-upload${d.file ? ' is-done' : ''}`}>
                  <i className={`fa-solid ${d.file ? 'fa-circle-check' : 'fa-upload'}`} />
                  {d.file ? d.name || 'Uploaded' : 'Upload photo / PDF'}
                  <input
                    type='file'
                    accept='image/*,application/pdf'
                    hidden={true}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      try {
                        const dataUrl = await readFile(file);
                        setDocs((all) => ({...all, [label]: {...(all[label] || {number: ''}), file: dataUrl, name: file.name}}));
                        setErrors((er) => ({...er, [label]: ''}));
                      } catch (err) {
                        setErrors((er) => ({...er, [label]: (err as Error).message}));
                      }
                    }}
                  />
                </label>
                {errors[label] && <p className='pb-error'>{errors[label]}</p>}
              </div>
            );
          })}

          <label className='pb-consent'>
            <input
              type='checkbox'
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
            />
            <span>
              I confirm these documents are genuine and I agree to the{' '}
              <Link
                to='/partner-terms'
                target='_blank'
              >
                Partner Terms
              </Link>{' '}
              and{' '}
              <Link
                to='/privacy'
                target='_blank'
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.accept && <p className='pb-error'>{errors.accept}</p>}
          {errors.form && <p className='pb-error'>{errors.form}</p>}

          <button
            className='pb-btn-solid'
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? 'Uploading…' : 'Submit for Approval'}
          </button>
        </section>
      )}
    </PanelLayout>
  );
};
