import React, {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';

import type {ApiListing, ApiPartner} from '../types/ApiTypes';
import {errorMessage} from '../api';
import {pbApi} from './api';
import {ListingCard, PbLayout} from './components';
import {useBasket} from './useBasket';

export const RestaurantMenu: React.FC = () => {
  const {id} = useParams();
  const basket = useBasket();
  const [data, setData] = useState<{partner: ApiPartner; listings: ApiListing[]}>();
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (!id) return;
    pbApi
      .partner(id)
      .then(setData)
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set((data?.listings || []).map((l) => l.category).filter((c): c is string => !!c)))],
    [data],
  );

  if (error || !data) {
    return (
      <PbLayout title='Menu'>
        <p className={error ? 'pb-empty' : 'pb-loading'}>{error || 'Loading menu…'}</p>
      </PbLayout>
    );
  }

  const {partner, listings} = data;
  const visible = listings.filter((l) => category === 'All' || l.category === category);

  return (
    <PbLayout title={partner.businessName}>
      {partner.image && (
        <img
          className='pb-hero'
          src={partner.image}
          alt={partner.businessName}
        />
      )}
      <section className='pb-card'>
        <h2 className='pb-detail-title'>{partner.businessName}</h2>
        {partner.description && <p className='pb-detail-text'>{partner.description}</p>}
        {partner.address && (
          <p className='pb-detail-meta'>
            <i className='fa-solid fa-location-dot' /> {partner.address}
          </p>
        )}
        {!partner.isOpen && <p className='pb-error'>Closed right now. You can still add items and ask on WhatsApp.</p>}
      </section>

      {categories.length > 2 && (
        <div
          className='pb-chips'
          style={{marginBottom: 12}}
        >
          {categories.map((c) => (
            <button
              key={c}
              className={`pb-chip${category === c ? ' is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <h2 className='pb-section-title'>Menu</h2>
      {visible.length === 0 && <p className='pb-empty'>No dishes on the menu yet.</p>}
      {visible.map((l) => (
        <ListingCard
          key={l._id}
          listing={{...l, partner}}
          actionLabel='Add Item'
          flash={basket.flashId === l._id}
          onAction={() => basket.add(l, partner)}
        />
      ))}

      {basket.dialogs}
    </PbLayout>
  );
};
