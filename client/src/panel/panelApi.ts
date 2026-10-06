import {api, API_URL} from '../api';
import type {ApiListing, ApiPartner, ApiUser, PartnerTypeKey} from '../types/ApiTypes';
import type {Enquiry, EnquiryStatus} from '../pb/api';

export type PanelOrder = Enquiry & {role: 'vendor' | 'rider' | 'driver' | null; actions: EnquiryStatus[]};
export type AdminRequest = Enquiry & {actions: EnquiryStatus[]};

export type Earnings = Record<'today' | 'week' | 'all', {amount: number; count: number; km: number}>;

export type Settings = {
  delivery: {baseKm: number; baseFare: number; perKm: number; foodMaxKm: number; medicineMaxKm: number; riderSharePct: number; dispatchRadiusKm: number};
  commission: {food: number; stay: number; cab: number; medicine: number};
  cab: {dispatchRadiusKm: number; vehicles: {key: string; label: string; seats: number; perKm: number; minFare: number}[]};
  privacy: {retentionDays: number};
};

export type AdminStats = {
  users: number;
  listings: number;
  partners: Record<string, Record<string, number>>;
  pendingApprovals: number;
  requestsByType: Record<string, number>;
  requestsToday: number;
  activeRequests: number;
  grossValue: number;
  platformEarnings: number;
  online: Record<string, number>;
};

export type Application = {
  type: PartnerTypeKey;
  businessName: string;
  description?: string;
  address?: string;
  city?: string;
  location?: {lat: number; lng: number};
  vehicle?: {type: string; number: string; model?: string};
  documents: {label: string; number?: string; file: string}[];
  acceptTerms: true;
};

const data = <T>(p: Promise<{data: T}>) => p.then((r) => r.data);

export const panelApi = {
  login: (phone: string, password: string) => data(api.post<{token: string; user: ApiUser}>('/auth/login', {phone, password})),
  requirements: () =>
    data(api.get<{documents: Record<PartnerTypeKey, string[]>; vehicles: {key: string; label: string}[]}>('/partners/requirements')),
  register: (body: Application & {name: string; ownerPhone: string; password: string; email?: string}) =>
    data(api.post<{token: string; user: ApiUser; partner: ApiPartner}>('/partners/register', body)),
  apply: (body: Application) => data(api.post<{partner: ApiPartner}>('/partners/apply', body)),
  mine: () => data(api.get<{partners: ApiPartner[]}>('/partners/mine')).then((d) => d.partners),
  updateProfile: (id: string, body: Partial<ApiPartner>) => data(api.patch<{partner: ApiPartner}>(`/partners/mine/${id}`, body)),

  // Partner panel
  partner: (pid: string) => data(api.get<{partner: ApiPartner}>(`/panel/${pid}`)).then((d) => d.partner),
  presence: (pid: string, body: {online?: boolean; isOpen?: boolean; lat?: number; lng?: number}) =>
    data(api.post<{partner: ApiPartner}>(`/panel/${pid}/presence`, body)).then((d) => d.partner),
  jobs: (pid: string) => data(api.get<{jobs: PanelOrder[]}>(`/panel/${pid}/jobs`)).then((d) => d.jobs),
  orders: (pid: string, scope: 'active' | 'history' = 'active') =>
    data(api.get<{orders: PanelOrder[]}>(`/panel/${pid}/orders`, {params: {scope}})).then((d) => d.orders),
  accept: (pid: string, id: string, subtotal?: number) =>
    data(api.post<{order: PanelOrder}>(`/panel/${pid}/jobs/${id}/accept`, {subtotal})).then((d) => d.order),
  setStatus: (pid: string, id: string, status: string, otp?: string) =>
    data(api.post<{order: PanelOrder}>(`/panel/${pid}/orders/${id}/status`, {status, otp})).then((d) => d.order),
  riderStep: (pid: string, id: string, stage: string, otp?: string) =>
    data(api.post<{order: PanelOrder}>(`/panel/${pid}/orders/${id}/rider`, {stage, otp})).then((d) => d.order),
  earnings: (pid: string) => data(api.get<Earnings>(`/panel/${pid}/earnings`)),
  prescription: (pid: string, id: string) =>
    api.get(`/panel/${pid}/orders/${id}/prescription`, {responseType: 'blob'}).then((r) => URL.createObjectURL(r.data as Blob)),

  // Listings (rooms, dishes, medicines, tours)
  myListings: (pid: string) =>
    data(api.get<{listings: ApiListing[]}>('/listings/mine/all', {params: {partner: pid}})).then((d) => d.listings),
  saveListing: (pid: string, body: Partial<ApiListing>, id?: string) =>
    data(
      id
        ? api.patch<{listing: ApiListing}>(`/listings/${id}`, body, {params: {partner: pid}})
        : api.post<{listing: ApiListing}>('/listings', body, {params: {partner: pid}}),
    ).then((d) => d.listing),
  deleteListing: (pid: string, id: string) => api.delete(`/listings/${id}`, {params: {partner: pid}}),

  // Admin
  stats: () => data(api.get<AdminStats>('/admin/stats')),
  partners: (params: {status?: string; type?: string}) =>
    data(api.get<{partners: ApiPartner[]}>('/admin/partners', {params})).then((d) => d.partners),
  setPartnerStatus: (id: string, status: string, statusNote?: string) =>
    data(api.patch<{partner: ApiPartner}>(`/admin/partners/${id}`, {status, statusNote})),
  documentUrl: (id: string, index: number) =>
    api.get(`/admin/partners/${id}/documents/${index}`, {responseType: 'blob'}).then((r) => URL.createObjectURL(r.data as Blob)),
  requests: (params: {type?: string; status?: string; q?: string}) =>
    data(api.get<{requests: AdminRequest[]}>('/admin/requests', {params})).then((d) => d.requests),
  adminStatus: (id: string, status: string, note?: string) => data(api.post(`/admin/requests/${id}/status`, {status, note})),
  assign: (id: string, partner: string) => data(api.post(`/admin/requests/${id}/assign`, {partner})),
  adminPrescription: (id: string) =>
    api.get(`/admin/requests/${id}/prescription`, {responseType: 'blob'}).then((r) => URL.createObjectURL(r.data as Blob)),
  live: () => data(api.get<{partners: ApiPartner[]}>('/admin/live')).then((d) => d.partners),
  settings: () => data(api.get<{settings: Settings}>('/admin/settings')).then((d) => d.settings),
  saveSettings: (s: Partial<Settings>) => data(api.put<{settings: Settings}>('/admin/settings', s)).then((d) => d.settings),
  runPrivacy: () => data(api.post<{requests: number; applications: number; retentionDays: number}>('/admin/privacy/run')),
};

// ----- Live alerts (Server-Sent Events over fetch, so the auth header can be sent) -----

export type LiveEvent = {event: string; data: any};

export function openStream(path: string, token: string, onEvent: (e: LiveEvent) => void, onState?: (connected: boolean) => void) {
  let stopped = false;
  let ctrl: AbortController | null = null;

  const run = async () => {
    while (!stopped) {
      ctrl = new AbortController();
      try {
        const res = await fetch(`${API_URL}${path}`, {headers: {Authorization: `Bearer ${token}`}, signal: ctrl.signal});
        if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);
        onState?.(true);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const {value, done} = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, {stream: true});
          let cut;
          while ((cut = buffer.indexOf('\n\n')) >= 0) {
            const chunk = buffer.slice(0, cut);
            buffer = buffer.slice(cut + 2);
            let event = 'message';
            let payload = '';
            for (const line of chunk.split('\n')) {
              if (line.startsWith('event:')) event = line.slice(6).trim();
              else if (line.startsWith('data:')) payload += line.slice(5).trim();
            }
            if (payload) {
              try {
                onEvent({event, data: JSON.parse(payload)});
              } catch {
                // ignore malformed events
              }
            }
          }
        }
      } catch {
        // network drop or abort; reconnect below
      }
      onState?.(false);
      if (!stopped) await new Promise((r) => setTimeout(r, 4000));
    }
  };
  run();
  return () => {
    stopped = true;
    ctrl?.abort();
  };
}

// ----- Ringing alert -----

let audio: AudioContext | null = null;

// Browsers only allow sound after a tap; call this from a button handler.
export const unlockSound = () => {
  try {
    audio ||= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch {
    audio = null;
  }
  return !!audio;
};

export const soundReady = () => !!audio && audio.state === 'running';

// One loud two-tone beep burst (about 1 second).
export const ring = () => {
  if (navigator.vibrate) navigator.vibrate([400, 150, 400]);
  if (!audio || audio.state !== 'running') return;
  const t = audio.currentTime;
  [0, 0.25, 0.5, 0.75].forEach((offset, i) => {
    const osc = audio!.createOscillator();
    const gain = audio!.createGain();
    osc.type = 'square';
    osc.frequency.value = i % 2 ? 660 : 880;
    gain.gain.setValueAtTime(0.0001, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.35, t + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.22);
    osc.connect(gain).connect(audio!.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.24);
  });
};
