import React, {useEffect, useRef, useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {Place, pbApi} from './api';

export const MAHABALESHWAR: [number, number] = [17.9237, 73.656];

export type PinKind = 'pickup' | 'drop' | 'store' | 'home' | 'rider' | 'driver' | 'offline';

const PIN_ICONS: Record<PinKind, string> = {
  pickup: 'fa-location-dot',
  drop: 'fa-flag-checkered',
  store: 'fa-store',
  home: 'fa-house',
  rider: 'fa-motorcycle',
  driver: 'fa-car',
  offline: 'fa-circle',
};

const pinIcon = (kind: PinKind) =>
  L.divIcon({
    className: `pb-pin pb-pin-${kind}`,
    html: `<i class="fa-solid ${PIN_ICONS[kind]}"></i>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
  });

export type MapPin = {id: string; kind: PinKind; place: Pick<Place, 'lat' | 'lng'>; draggable?: boolean; title?: string};

type PinMapProps = {
  pins: MapPin[];
  path?: [number, number][] | null;
  onTap?: (lat: number, lng: number) => void;
  onDrag?: (id: string, lat: number, lng: number) => void;
  hint?: React.ReactNode;
  height?: number;
};

// Leaflet map with pins, an optional route line, and tap-to-place.
export const PinMap: React.FC<PinMapProps> = ({pins, path, onTap, onDrag, hint, height = 230}) => {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const line = useRef<L.Polyline | null>(null);
  const handlers = useRef({onTap, onDrag});
  handlers.current = {onTap, onDrag};

  useEffect(() => {
    if (!el.current || map.current) return;
    // No zoom/fade animations: an animation finishing after the map is removed
    // (leaving the page mid-zoom) crashes Leaflet with "_leaflet_pos" errors.
    const m = L.map(el.current, {zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false}).setView(MAHABALESHWAR, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(m);
    m.on('click', (e: L.LeafletMouseEvent) => handlers.current.onTap?.(e.latlng.lat, e.latlng.lng));
    map.current = m;
    const current = markers.current;
    return () => {
      m.off();
      m.stop();
      m.remove();
      map.current = null;
      current.clear();
      line.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const wanted = new Set(pins.map((p) => p.id));
    markers.current.forEach((marker, id) => {
      if (!wanted.has(id)) {
        marker.remove();
        markers.current.delete(id);
      }
    });
    pins.forEach((pin) => {
      const existing = markers.current.get(pin.id);
      if (existing) {
        existing.setLatLng([pin.place.lat, pin.place.lng]);
        return;
      }
      const marker = L.marker([pin.place.lat, pin.place.lng], {icon: pinIcon(pin.kind), draggable: !!pin.draggable, title: pin.title}).addTo(m);
      if (pin.title) marker.bindTooltip(pin.title);
      marker.on('dragend', () => {
        const ll = marker.getLatLng();
        handlers.current.onDrag?.(pin.id, ll.lat, ll.lng);
      });
      markers.current.set(pin.id, marker);
    });

    line.current?.remove();
    line.current = null;
    if (path && path.length > 1) {
      line.current = L.polyline(path, {color: '#d32f2f', weight: 4, opacity: 0.85}).addTo(m);
      m.fitBounds(line.current.getBounds(), {padding: [30, 30]});
    } else if (pins.length > 1) {
      m.fitBounds(L.latLngBounds(pins.map((p) => [p.place.lat, p.place.lng] as [number, number])), {padding: [40, 40], maxZoom: 15});
    } else if (pins.length === 1) {
      m.setView([pins[0].place.lat, pins[0].place.lng], Math.max(m.getZoom(), 14));
    }
  }, [pins, path]);

  return (
    <div className='pb-map-wrap'>
      <div
        ref={el}
        className='pb-map'
        style={{height}}
        role='application'
        aria-label='Map. Tap to place a pin.'
      />
      {hint && <span className='pb-map-hint'>{hint}</span>}
    </div>
  );
};

// Coordinates with a readable name looked up afterwards.
export const placeAt = async (lat: number, lng: number): Promise<Place> => {
  const rounded = {lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6))};
  try {
    const named = await pbApi.reverse(rounded.lat, rounded.lng);
    return {...named, ...rounded};
  } catch {
    return {label: `${rounded.lat.toFixed(4)}, ${rounded.lng.toFixed(4)}`, ...rounded};
  }
};

export const currentPosition = (): Promise<{lat: number; lng: number}> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not available on this device.'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({lat: pos.coords.latitude, lng: pos.coords.longitude}),
      () => reject(new Error('Could not get your location. Allow location access, or search / tap the map instead.')),
      {enableHighAccuracy: true, timeout: 15000},
    );
  });

type PlaceFieldProps = {
  icon: string;
  place: Place | null;
  active?: boolean;
  placeholder: string;
  label: string;
  onPick: (p: Place) => void;
  onActivate?: () => void;
  onLocate?: () => void;
  locating?: boolean;
};

// Text field with place suggestions (searched on the server via OpenStreetMap).
export const PlaceField: React.FC<PlaceFieldProps> = ({
  icon,
  place,
  active,
  placeholder,
  label,
  onPick,
  onActivate,
  onLocate,
  locating,
}) => {
  const [text, setText] = useState(place?.label || '');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setText(place?.label || ''), [place]);

  useEffect(() => {
    const q = text.trim();
    if (!open || q.length < 3 || q === place?.label) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      pbApi
        .searchPlaces(q, ctrl.signal)
        .then(setResults)
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 700);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [text, open, place]);

  return (
    <div className='pb-place'>
      <label className={`pb-field${active ? ' is-active' : ''}`}>
        <i className={`fa-solid ${icon}`} />
        <input
          placeholder={placeholder}
          value={text}
          aria-label={label}
          onFocus={() => {
            setOpen(true);
            onActivate?.();
          }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onChange={(e) => setText(e.target.value)}
        />
        {onLocate && (
          <button
            type='button'
            className='pb-field-action'
            onClick={onLocate}
            aria-label='Use my current location'
            title='Use my current location'
          >
            <i className={`fa-solid ${locating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`} />
          </button>
        )}
        {onActivate && (
          <button
            type='button'
            className='pb-field-action'
            onClick={onActivate}
            aria-label={`Choose ${label.toLowerCase()} on the map`}
            title='Choose on map'
          >
            <i className='fa-solid fa-map-location-dot' />
          </button>
        )}
      </label>
      {open && (searching || results.length > 0) && (
        <ul
          className='pb-suggestions'
          role='listbox'
        >
          {searching && <li className='pb-suggestion-muted'>Searching…</li>}
          {results.map((r) => (
            <li
              key={`${r.lat},${r.lng},${r.address}`}
              role='option'
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(r);
                setOpen(false);
              }}
            >
              <strong>{r.label}</strong>
              <small>{r.address}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
