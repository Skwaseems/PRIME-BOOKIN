import React from 'react';
import {useNavigate} from 'react-router-dom';

import {PbLayout} from './components';
import {SUPPORT_PHONE, openWhatsApp} from './whatsapp';

const display = `+${SUPPORT_PHONE.slice(0, 2)} ${SUPPORT_PHONE.slice(2, 7)} ${SUPPORT_PHONE.slice(7)}`;

type Item = {icon: string; title: string; sub: string; href?: string; onClick?: () => void};

export const Support: React.FC = () => {
  const navigate = useNavigate();

  const items: Item[] = [
    {
      icon: 'fa-solid fa-phone-volume',
      title: 'Call Primebookin',
      sub: display,
      href: `tel:+${SUPPORT_PHONE}`,
    },
    {
      icon: 'fa-brands fa-whatsapp',
      title: 'Chat on WhatsApp',
      sub: 'Bookings, orders and quotes',
      onClick: () => openWhatsApp('Hello PRIMEBOOKIN, I need help with '),
    },
    {
      icon: 'fa-solid fa-store',
      title: 'Partner with Primebookin',
      sub: 'Register your hotel, restaurant, medical store, cab or as a rider',
      onClick: () => navigate('/partner/register'),
    },
    {
      icon: 'fa-solid fa-user-shield',
      title: 'Partner / Admin Login',
      sub: 'Hotels, restaurants, medicals, drivers, riders',
      onClick: () => navigate('/partner'),
    },
    {
      icon: 'fa-solid fa-file-contract',
      title: 'Terms & Conditions',
      sub: 'Bookings, cancellations, medicines',
      onClick: () => navigate('/terms'),
    },
    {
      icon: 'fa-solid fa-user-lock',
      title: 'Privacy Policy',
      sub: 'Your details are deleted automatically after your request',
      onClick: () => navigate('/privacy'),
    },
  ];

  return (
    <PbLayout>
      <h2 className='pb-page-title'>Support Center</h2>
      {items.map((item) => {
        const content = (
          <>
            <i className={item.icon} />
            <span>
              {item.title}
              <small>{item.sub}</small>
            </span>
            <i className='fa-solid fa-chevron-right' />
          </>
        );
        return (
          <section
            key={item.title}
            className='pb-card'
          >
            {item.href ? (
              <a
                className='pb-support-link'
                href={item.href}
              >
                {content}
              </a>
            ) : (
              <button
                className='pb-support-link'
                onClick={item.onClick}
              >
                {content}
              </button>
            )}
          </section>
        );
      })}
    </PbLayout>
  );
};
