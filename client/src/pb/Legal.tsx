import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import {pbApi} from './api';
import {PbLayout} from './components';
import {SUPPORT_PHONE} from './whatsapp';

const UPDATED = '4 October 2026';
const PHONE = `+${SUPPORT_PHONE.slice(0, 2)} ${SUPPORT_PHONE.slice(2, 7)} ${SUPPORT_PHONE.slice(7)}`;

const useRetentionDays = () => {
  const [days, setDays] = useState(90);
  useEffect(() => {
    pbApi
      .options()
      .then((o) => setDays(o.retentionDays))
      .catch(() => {});
  }, []);
  return days;
};

export const Terms: React.FC = () => (
  <PbLayout title='Terms & Conditions'>
    <article className='pb-card pb-legal'>
      <p className='pb-booking-meta'>Last updated {UPDATED}</p>
      <p>
        These terms apply when you use Primebookin to book stays, order food or medicines, or book cabs in
        Mahabaleshwar, Panchgani, Bhilar, Medha and nearby areas. By sending a request you agree to them.
      </p>

      <h2>1. What Primebookin does</h2>
      <p>
        Primebookin connects you with independent hotels, restaurants, medical stores, cab drivers and delivery
        partners ("partners"). The partner provides the room, food, medicine or ride and is responsible for its
        quality. We help with the booking, delivery and support.
      </p>

      <h2>2. Requests, prices and payment</h2>
      <ul>
        <li>Prices shown are calculated from the partner's rates. Delivery charges depend on distance; cab fares on distance and vehicle type.</li>
        <li>A request is confirmed only when the partner accepts it. Medicine prices are confirmed by the pharmacy.</li>
        <li>Payment is currently cash / UPI on delivery or at the property, unless agreed otherwise on WhatsApp.</li>
      </ul>

      <h2>3. Medicines</h2>
      <ul>
        <li>Prescription medicines are supplied only against a valid prescription from a registered doctor.</li>
        <li>The pharmacist may refuse or change an order as required by law.</li>
      </ul>

      <h2>4. Cancellations</h2>
      <ul>
        <li>You can cancel free of charge before a partner accepts. After that, contact us on WhatsApp.</li>
        <li>Hotels may have their own cancellation policy, which they will tell you when confirming.</li>
      </ul>

      <h2>5. Your responsibilities</h2>
      <ul>
        <li>Give correct names, phone number and address, and share the OTP only with the rider or driver serving you.</li>
        <li>Treat partners respectfully. Misuse may lead to blocked access.</li>
      </ul>

      <h2>6. Liability</h2>
      <p>
        We are not liable for delays caused by weather, road conditions or events beyond our control. Our liability
        for any request is limited to the amount paid for it.
      </p>

      <h2>7. Contact & complaints</h2>
      <p>
        Call or WhatsApp {PHONE}. These terms are governed by the laws of India; courts at Satara, Maharashtra have
        jurisdiction. See also our <Link to='/privacy'>Privacy Policy</Link>.
      </p>
    </article>
  </PbLayout>
);

export const Privacy: React.FC = () => {
  const days = useRetentionDays();
  return (
    <PbLayout title='Privacy Policy'>
      <article className='pb-card pb-legal'>
        <p className='pb-booking-meta'>Last updated {UPDATED}</p>
        <p>
          Primebookin respects your privacy and processes personal data in line with the Digital Personal Data
          Protection Act, 2023 and the Information Technology Act, 2000.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>Name, mobile number, delivery address and map location you enter.</li>
          <li>Guest names for hotel bookings; pickup and drop points for cab rides.</li>
          <li>Medicine lists and prescription photos you choose to upload.</li>
          <li>For partners: identity and business documents, vehicle details, and live location while online.</li>
        </ul>
        <p>We do not need an account to serve you, and we do not sell your data.</p>

        <h2>Why we use it</h2>
        <p>
          Only to complete your request: to share it with the partner serving you, calculate distance and charges,
          deliver, contact you about the request, and resolve complaints.
        </p>

        <h2>Who sees it</h2>
        <ul>
          <li>The hotel, restaurant, pharmacy, driver or rider handling your request. Riders and drivers see your phone and address only after they accept.</li>
          <li>Our support team, through WhatsApp and the admin panel.</li>
          <li>Map services (OpenStreetMap) receive search text and map points, without your name or phone.</li>
        </ul>

        <h2>How long we keep it</h2>
        <p>
          Personal details (names, phone numbers, addresses, locations, medicine notes and prescription photos) are{' '}
          <strong>deleted automatically {days} days</strong> after your request is completed or cancelled. We keep
          only order amounts and dates, without personal details, for accounts and tax. Documents of rejected partner
          applications are deleted after the same period.
        </p>

        <h2>Your rights</h2>
        <ul>
          <li>
            <strong>Delete now:</strong> on the Bookings screen, use "Delete my details" on any finished request.
          </li>
          <li>Ask to access or correct your data, or withdraw consent, by WhatsApp or phone.</li>
          <li>If you are not satisfied, you may complain to the Data Protection Board of India.</li>
        </ul>

        <h2>Security</h2>
        <p>
          Data is sent over encrypted connections and stored in a secured database. Requests saved on your phone can
          only be viewed with a secret key stored on that phone.
        </p>

        <h2>Grievance Officer</h2>
        <p>
          Primebookin Support, Mahabaleshwar, Maharashtra. Phone / WhatsApp: {PHONE}. We reply within 7 days.
        </p>
      </article>
    </PbLayout>
  );
};

export const PartnerTerms: React.FC = () => (
  <PbLayout title='Partner Terms'>
    <article className='pb-card pb-legal'>
      <p className='pb-booking-meta'>Last updated {UPDATED}</p>
      <p>
        These terms apply to hotels, restaurants, medical stores, cab drivers and delivery partners who join
        Primebookin.
      </p>

      <h2>1. Approval</h2>
      <ul>
        <li>Your account starts only after an admin verifies your documents (e.g. FSSAI, drug licence, GST, driving licence, RC, insurance, Aadhaar, PAN).</li>
        <li>Documents must be genuine and valid. We may suspend accounts with expired or false documents.</li>
      </ul>

      <h2>2. Service standards</h2>
      <ul>
        <li>Keep prices, menus, rooms and stock up to date, and accept or decline requests promptly.</li>
        <li>Restaurants must follow FSSAI food-safety rules; pharmacies must dispense prescription medicines only against a valid prescription.</li>
        <li>Drivers and riders must hold valid licences, follow traffic laws and verify the customer OTP.</li>
      </ul>

      <h2>3. Commission and payouts</h2>
      <ul>
        <li>Primebookin keeps a commission per completed request (currently set by the admin per service).</li>
        <li>Riders receive their share of the delivery charge; drivers receive the fare minus commission.</li>
        <li>Payouts are settled to your registered bank account on the schedule agreed with Primebookin.</li>
      </ul>

      <h2>4. Customer data</h2>
      <ul>
        <li>Use customer names, phone numbers and addresses only to complete that request. Do not store, share or use them for marketing.</li>
        <li>While you are online, your live location is shared with Primebookin to send you nearby jobs.</li>
      </ul>

      <h2>5. Ending the partnership</h2>
      <p>
        Either side may end the partnership with notice. Accounts can be suspended immediately for fraud, safety
        issues or repeated complaints.
      </p>

      <p>
        Questions: {PHONE}. See also the <Link to='/privacy'>Privacy Policy</Link>.
      </p>
    </article>
  </PbLayout>
);
