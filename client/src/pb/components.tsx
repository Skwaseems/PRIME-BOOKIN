import React from 'react';
import {useSelector} from 'react-redux';
import {useLocation, useNavigate} from 'react-router-dom';

import type {RootState} from '../store';
import type {ApiListing} from '../types/ApiTypes';
import {SUPPORT_PHONE, rupees} from './whatsapp';

export const PB_ROUTES = {
  explore: '/',
  bookings: '/bookings',
  cart: '/cart',
  support: '/support',
};

type LayoutProps = {
  search?: string;
  onSearch?: (value: string) => void;
  // Detail pages show a back arrow and this title instead of the search bar.
  title?: string;
  children: React.ReactNode;
};

export const PbLayout: React.FC<LayoutProps> = ({search, onSearch, title, children}) => {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const basketCount = useSelector((s: RootState) => (s.pbSlice.basket || []).reduce((n, l) => n + (l.quantity || 1), 0));

  const nav = [
    {path: PB_ROUTES.explore, label: 'Explore', icon: 'fa-compass'},
    {path: PB_ROUTES.bookings, label: 'Bookings', icon: 'fa-calendar-check'},
    {path: PB_ROUTES.cart, label: 'Cart', icon: 'fa-basket-shopping'},
    {path: PB_ROUTES.support, label: 'Support', icon: 'fa-headset'},
  ];

  return (
    <div className='pb'>
      <header className='pb-header'>
        <div className={`pb-header-row${title ? ' is-detail' : ''}`}>
          {title ? (
            <div className='pb-header-title'>
              <button
                onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(PB_ROUTES.explore))}
                aria-label='Back'
              >
                <i className='fa-solid fa-arrow-left' />
              </button>
              <h1>{title}</h1>
            </div>
          ) : (
            <h1 className='pb-logo'>PRIMEBOOKIN</h1>
          )}
          <a
            className='pb-call'
            href={`tel:+${SUPPORT_PHONE}`}
          >
            <i className='fa-solid fa-phone-volume' /> CALL
          </a>
        </div>
        {!title && (
        <label className='pb-search'>
          <i className='fa-solid fa-magnifying-glass' />
          <input
            type='search'
            placeholder='Search rooms, cafes, routes...'
            value={search ?? ''}
            onChange={(e) => onSearch?.(e.target.value)}
            // On screens without a list to filter, searching takes you to Explore.
            onFocus={() => {
              if (!onSearch) navigate(PB_ROUTES.explore);
            }}
            readOnly={!onSearch}
          />
        </label>
        )}
      </header>

      <main className='pb-body'>{children}</main>

      <nav className='pb-nav'>
        {nav.map((item) => (
          <button
            key={item.path}
            className={`pb-nav-item${pathname === item.path ? ' is-active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={pathname === item.path ? 'page' : undefined}
          >
            <i className={`fa-solid ${item.icon}`} />
            {item.label}
            {item.path === PB_ROUTES.cart && basketCount > 0 && (
              <span className='pb-badge'>{basketCount}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export const PbConfirm: React.FC<{
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({message, confirmLabel, onConfirm, onCancel}) => (
  <div
    className='pb-overlay'
    role='alertdialog'
    aria-modal='true'
    onClick={onCancel}
  >
    <div
      className='pb-alert'
      onClick={(e) => e.stopPropagation()}
    >
      {message}
      <div className='pb-alert-actions'>
        <button onClick={onCancel}>CANCEL</button>
        <button
          onClick={onConfirm}
          autoFocus={true}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export const PbAlert: React.FC<{message: string; onClose: () => void}> = ({
  message,
  onClose,
}) => (
  <div
    className='pb-overlay'
    role='alertdialog'
    aria-modal='true'
    onClick={onClose}
  >
    <div
      className='pb-alert'
      onClick={(e) => e.stopPropagation()}
    >
      {message}
      <div className='pb-alert-actions'>
        <button
          onClick={onClose}
          autoFocus={true}
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

export const describe = (listing: ApiListing): string => {
  const partner = typeof listing.partner === 'object' ? listing.partner : null;
  if (listing.service === 'food' && partner) {
    return `${partner.businessName} Menu • ${listing.description || ''}`;
  }
  return listing.description || '';
};

type ListingCardProps = {
  listing: ApiListing;
  actionLabel: string;
  onAction: () => void;
  // Makes the photo and name open a detail page.
  onOpen?: () => void;
  flash?: boolean;
};

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  actionLabel,
  onAction,
  onOpen,
  flash,
}) => (
  <article className='pb-card pb-listing'>
    <img
      className='pb-listing-img'
      src={listing.images[0]}
      alt={listing.name}
      loading='lazy'
      onClick={onOpen}
      style={onOpen ? {cursor: 'pointer'} : undefined}
    />
    <div className='pb-listing-info'>
      <h3>
        {onOpen ? (
          <button
            className='pb-card-link'
            onClick={onOpen}
          >
            {listing.name}
            {listing.images.length > 1 && (
              <small className='pb-photo-count'>
                <i className='fa-regular fa-images' /> {listing.images.length} photos
              </small>
            )}
          </button>
        ) : (
          listing.name
        )}
      </h3>
      <p>{describe(listing)}</p>
      <div className='pb-listing-foot'>
        <span className='pb-price'>{rupees(listing.price)}</span>
        <button
          className={`pb-btn-outline${flash ? ' is-flash' : ''}`}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  </article>
);
