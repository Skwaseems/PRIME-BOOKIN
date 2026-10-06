import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {RootState} from '../store';
import type {ApiListing} from '../types/ApiTypes';
import {PbAlert, PbConfirm} from './components';
import {addToBasket} from './pbSlice';

type Store = {_id: string; businessName: string};

// "Add Item" with the one-store-per-basket rule: asks before replacing the basket.
export const useBasket = () => {
  const dispatch = useDispatch();
  const basket = useSelector((s: RootState) => s.pbSlice.basket) || [];
  const [alert, setAlert] = useState('');
  const [pending, setPending] = useState<{listing: ApiListing; store: Store} | null>(null);
  const [flashId, setFlashId] = useState('');

  const put = (listing: ApiListing, store: Store) => {
    dispatch(
      addToBasket({
        listingId: listing._id,
        name: listing.name,
        price: listing.price,
        image: listing.images[0],
        service: listing.service,
        partnerId: store._id,
        partnerName: store.businessName,
      }),
    );
    setFlashId(listing._id);
    setTimeout(() => setFlashId(''), 600);
    setAlert(`🛒 Added "${listing.name}" to your checkout basket!`);
  };

  const add = (listing: ApiListing, store: Store) => {
    const other = basket.find((l) => l.partnerId !== store._id);
    if (other) setPending({listing, store});
    else put(listing, store);
  };

  const dialogs = (
    <>
      {pending && (
        <PbConfirm
          message={`Your basket has items from ${basket[0]?.partnerName}. Start a new basket with ${pending.store.businessName}?`}
          confirmLabel='START NEW'
          onCancel={() => setPending(null)}
          onConfirm={() => {
            put(pending.listing, pending.store);
            setPending(null);
          }}
        />
      )}
      {alert && (
        <PbAlert
          message={alert}
          onClose={() => setAlert('')}
        />
      )}
    </>
  );

  return {add, flashId, dialogs, setAlert};
};
