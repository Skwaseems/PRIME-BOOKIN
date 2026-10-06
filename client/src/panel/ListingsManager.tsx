import React, {useCallback, useEffect, useState} from 'react';

import type {ApiListing, ApiPartner} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {PbConfirm} from '../pb/components';
import {TextField} from '../pb/forms';
import {compressImage} from '../pb/useSendRequest';
import {rupees} from '../pb/whatsapp';
import {panelApi} from './panelApi';

const NOUN: Record<string, {one: string; many: string; stockOn: string; stockOff: string}> = {
  stay: {one: 'Room / Property', many: 'Rooms & Properties', stockOn: 'Available', stockOff: 'Sold out'},
  food: {one: 'Dish', many: 'Menu', stockOn: 'In stock', stockOff: 'Out of stock'},
  medicine: {one: 'Medicine', many: 'Medicines', stockOn: 'In stock', stockOff: 'Out of stock'},
  cab: {one: 'Tour Package', many: 'Tour Packages', stockOn: 'Available', stockOff: 'Unavailable'},
};

const CATEGORY_HINT: Record<string, string> = {
  stay: 'Hotels / Villas / Bungalow',
  food: 'Veg / Non-Veg / Desserts…',
  medicine: 'Fever & Pain / Wellness…',
  cab: 'Sightseeing / Outstation',
};

type Draft = {
  _id?: string;
  name: string;
  price: string;
  category: string;
  description: string;
  images: string[];
  extraBedPrice: string;
  amenities: string;
  requiresPrescription: boolean;
};

const toDraft = (l?: ApiListing): Draft => ({
  _id: l?._id,
  name: l?.name || '',
  price: l ? String(l.price) : '',
  category: l?.category || '',
  description: l?.description || '',
  images: l?.images || [],
  extraBedPrice: l?.details?.extraBedPrice != null ? String(l.details.extraBedPrice) : '',
  amenities: (l?.details?.amenities || []).join(', '),
  requiresPrescription: !!l?.details?.requiresPrescription,
});

export const ListingsManager: React.FC<{partner: ApiPartner; onError: (m: string) => void}> = ({partner, onError}) => {
  const service = partner.service || 'food';
  const noun = NOUN[service];
  const [listings, setListings] = useState<ApiListing[]>();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ApiListing | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    panelApi
      .myListings(partner._id)
      .then(setListings)
      .catch((err) => onError(errorMessage(err)));
  }, [partner._id, onError]);

  useEffect(load, [load]);

  const toggle = async (l: ApiListing) => {
    try {
      await panelApi.saveListing(partner._id, {isAvailable: !l.isAvailable}, l._id);
      load();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const save = async () => {
    if (!draft) return;
    const e: Record<string, string> = {};
    if (draft.name.trim().length < 2) e.name = 'Enter a name';
    if (!(Number(draft.price) >= 0) || draft.price === '') e.price = 'Enter the price';
    setErrors(e);
    if (Object.keys(e).length) return;

    const details: Record<string, any> = {};
    if (service === 'stay') {
      if (draft.extraBedPrice) details.extraBedPrice = Number(draft.extraBedPrice);
      details.amenities = draft.amenities.split(',').map((a) => a.trim()).filter(Boolean);
    }
    if (service === 'medicine') details.requiresPrescription = draft.requiresPrescription;

    setSaving(true);
    try {
      await panelApi.saveListing(
        partner._id,
        {
          name: draft.name.trim(),
          price: Number(draft.price),
          category: draft.category.trim() || undefined,
          description: draft.description.trim() || undefined,
          images: draft.images,
          details,
          ...(service === 'cab' && !draft._id ? {priceUnit: 'day' as const} : {}),
        },
        draft._id,
      );
      setDraft(null);
      load();
    } catch (err) {
      setErrors({form: errorMessage(err)});
    } finally {
      setSaving(false);
    }
  };

  if (draft) {
    return (
      <section className='pb-card'>
        <h2 className='pb-form-title'>
          <i className='fa-solid fa-pen-to-square' />
          {draft._id ? `Edit ${noun.one}` : `Add ${noun.one}`}
        </h2>
        <TextField
          icon='fa-tag'
          label='Name'
          value={draft.name}
          onChange={(v) => setDraft({...draft, name: v})}
          error={errors.name}
        />
        <TextField
          icon='fa-indian-rupee-sign'
          label={service === 'stay' ? 'Price per room per night (₹)' : service === 'cab' ? 'Package price (₹)' : 'Price (₹)'}
          type='number'
          inputMode='numeric'
          value={draft.price}
          onChange={(v) => setDraft({...draft, price: v})}
          error={errors.price}
        />
        <TextField
          icon='fa-layer-group'
          label={`Category (${CATEGORY_HINT[service]})`}
          value={draft.category}
          onChange={(v) => setDraft({...draft, category: v})}
        />
        <TextField
          icon='fa-align-left'
          label='Short description'
          maxLength={300}
          value={draft.description}
          onChange={(v) => setDraft({...draft, description: v})}
        />
        {service === 'stay' && (
          <>
            <TextField
              icon='fa-bed'
              label='Extra bed price per night (₹)'
              type='number'
              inputMode='numeric'
              value={draft.extraBedPrice}
              onChange={(v) => setDraft({...draft, extraBedPrice: v})}
            />
            <TextField
              icon='fa-spa'
              label='Amenities (comma separated)'
              value={draft.amenities}
              onChange={(v) => setDraft({...draft, amenities: v})}
            />
          </>
        )}
        {service === 'medicine' && (
          <label className='pb-consent'>
            <input
              type='checkbox'
              checked={draft.requiresPrescription}
              onChange={(e) => setDraft({...draft, requiresPrescription: e.target.checked})}
            />
            <span>Prescription required</span>
          </label>
        )}

        <span className='pb-label'>Photos ({draft.images.length}/6)</span>
        <div className='pb-thumbs'>
          {draft.images.map((src, i) => (
            <div key={src.slice(-40) + i}>
              <img
                src={src}
                alt={`Listing ${i + 1}`}
              />
              <button
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setDraft({...draft, images: draft.images.filter((_, j) => j !== i)})}
              >
                <i className='fa-solid fa-xmark' />
              </button>
            </div>
          ))}
          {draft.images.length < 6 && (
            <label className='pb-thumb-add'>
              <i className='fa-solid fa-camera' />
              Add
              <input
                type='file'
                accept='image/*'
                multiple={true}
                hidden={true}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []).slice(0, 6 - draft.images.length);
                  e.target.value = '';
                  try {
                    const added = await Promise.all(files.map((f) => compressImage(f, 1200, 0.75)));
                    setDraft((d) => (d ? {...d, images: [...d.images, ...added].slice(0, 6)} : d));
                  } catch (err) {
                    onError((err as Error).message);
                  }
                }}
              />
            </label>
          )}
        </div>

        {errors.form && <p className='pb-error'>{errors.form}</p>}
        <div className='pb-order-actions'>
          <button
            className='pb-btn-outline'
            onClick={() => setDraft(null)}
          >
            Cancel
          </button>
          <button
            className='pb-btn-solid'
            disabled={saving}
            onClick={save}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className='pb-section-row'>
        <h2 className='pb-page-title'>{noun.many}</h2>
        <button
          className='pb-btn-outline'
          onClick={() => setDraft(toDraft())}
        >
          <i className='fa-solid fa-plus' /> Add
        </button>
      </div>
      {!listings && <p className='pb-loading'>Loading…</p>}
      {listings?.length === 0 && <p className='pb-empty'>Nothing added yet. Tap “Add” to create your first {noun.one.toLowerCase()}.</p>}
      {listings?.map((l) => (
        <article
          key={l._id}
          className={`pb-card pb-listing${l.isAvailable ? '' : ' is-off'}`}
        >
          {l.images[0] ? (
            <img
              className='pb-listing-img'
              src={l.images[0]}
              alt={l.name}
            />
          ) : (
            <span className='pb-listing-img pb-noimg'>
              <i className='fa-regular fa-image' />
            </span>
          )}
          <div className='pb-listing-info'>
            <h3>{l.name}</h3>
            <p>
              {l.category ? `${l.category} • ` : ''}
              {rupees(l.price)}
            </p>
            <div className='pb-listing-foot'>
              <label className='pb-switch'>
                <input
                  type='checkbox'
                  checked={l.isAvailable}
                  onChange={() => toggle(l)}
                />
                <span />
                {l.isAvailable ? noun.stockOn : noun.stockOff}
              </label>
              <span>
                <button
                  className='pb-icon-btn'
                  aria-label={`Edit ${l.name}`}
                  onClick={() => setDraft(toDraft(l))}
                >
                  <i className='fa-solid fa-pen' />
                </button>
                <button
                  className='pb-icon-btn'
                  aria-label={`Delete ${l.name}`}
                  onClick={() => setDeleting(l)}
                >
                  <i className='fa-solid fa-trash' />
                </button>
              </span>
            </div>
          </div>
        </article>
      ))}
      {deleting && (
        <PbConfirm
          message={`Delete "${deleting.name}"? Customers will no longer see it.`}
          confirmLabel='DELETE'
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            const l = deleting;
            setDeleting(null);
            try {
              await panelApi.deleteListing(partner._id, l._id);
              load();
            } catch (err) {
              onError(errorMessage(err));
            }
          }}
        />
      )}
    </>
  );
};
