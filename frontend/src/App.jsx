import React, { useEffect, useState } from 'react';
import FreightAILogo from './FreightAILogo.jsx';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export function formatNumber(value, options) {
  return new Intl.NumberFormat('en-IN', options).format(value);
}

export class AuthenticationError extends Error {}

async function parseResponse(response, fallbackMessage) {
  let payload;
  try { payload = await response.json(); } catch { throw new Error(fallbackMessage); }
  if (response.status === 401) throw new AuthenticationError('Your session has expired. Please log in again.');
  if (!response.ok) throw new Error(payload?.error || payload?.message || fallbackMessage);
  return payload;
}

export async function getCatalogue(path) {
  return parseResponse(await fetch(`${apiBaseUrl}${path}`, { credentials: 'include' }), 'The FreightAI catalogue could not be loaded. Please try again.');
}

async function requestJson(path, body) {
  return parseResponse(await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body)
  }), 'FreightAI could not complete the analysis. Please try again.');
}

async function lookup(path, fallbackMessage, property) {
  const payload = await parseResponse(await fetch(`${apiBaseUrl}${path}`, { credentials: 'include' }), fallbackMessage);
  if (!payload?.[property]) throw new Error(fallbackMessage);
  return payload[property];
}

export function lookupTradeLane(originPort, destinationPort) {
  return lookup(`/api/trade-lanes/lookup?${new URLSearchParams({ originPort, destinationPort })}`, 'Trade lane intelligence is unavailable for this route.', 'tradeLane');
}

export function lookupFreightMarket(originPort, destinationPort, vesselType) {
  return lookup(`/api/freight-market/lookup?${new URLSearchParams({ originPort, destinationPort, vesselType })}`, 'Freight market intelligence is unavailable for this route.', 'market');
}

export function lookupFreightForecast() {
  return lookup('/api/freight-forecast/current', 'Freight forecasting data is currently unavailable.', 'forecast');
}

function IntelligencePreview({ tradeLane, state, message }) {
  return <section className="trade-lane-panel" aria-live="polite" aria-labelledby="trade-lane-title">
    <p className="section-kicker">Trade lane intelligence</p>
    <h3 id="trade-lane-title">{tradeLane?.laneName ?? 'Origin → destination'}</h3>
    {state === 'loading' && <p role="status">Resolving the selected trade lane…</p>}
    {state === 'error' && <p className="trade-lane-message error-text" role="alert">{message}</p>}
    {state === 'ready' && tradeLane && <div className="trade-lane-details">
      <p className="lane-route">{tradeLane.origin.name} <span aria-hidden="true">→</span> {tradeLane.destination.name}</p>
      {tradeLane.isDetailedLaneDataAvailable === false ? <p className="route-profile-label">Route profile · Estimated demo data</p> : <p>Detailed seeded/demo lane data is available for this route.</p>}
      <small>{tradeLane.dataDisclaimer}</small>
    </div>}
  </section>;
}

export function Dashboard({ user, onLogout, initialForm, onDraftChange, onAnalysisReady }) {
  const [form, setForm] = useState(initialForm ?? { cargoQuantity: '80000', originPort: '', destinationPort: '', vesselType: '' });
  const [ports, setPorts] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [catalogueError, setCatalogueError] = useState('');
  const [isCatalogueLoading, setIsCatalogueLoading] = useState(true);
  const [tradeLane, setTradeLane] = useState(null);
  const [tradeLaneState, setTradeLaneState] = useState('idle');
  const [tradeLaneMessage, setTradeLaneMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let current = true;
    Promise.all([getCatalogue('/api/ports'), getCatalogue('/api/vessels')])
      .then(([portPayload, vesselPayload]) => {
        if (!Array.isArray(portPayload?.ports) || !Array.isArray(vesselPayload?.vessels)) throw new Error('The FreightAI catalogue returned an unexpected result. Please try again.');
        if (!current) return;
        setPorts(portPayload.ports); setVessels(vesselPayload.vessels);
        setForm((value) => ({ ...value,
          originPort: value.originPort || (portPayload.ports.some((port) => port.name === 'Paradip') ? 'Paradip' : portPayload.ports[0]?.name ?? ''),
          destinationPort: value.destinationPort || (portPayload.ports.some((port) => port.name === 'Haldia') ? 'Haldia' : portPayload.ports[0]?.name ?? ''),
          vesselType: value.vesselType || (vesselPayload.vessels.some((vessel) => vessel.vesselType === 'Handysize') ? 'Handysize' : vesselPayload.vessels[0]?.vesselType ?? '')
        }));
      })
      .catch((requestError) => { if (current) { setCatalogueError(requestError.message); if (requestError instanceof AuthenticationError) onLogout(); } })
      .finally(() => { if (current) setIsCatalogueLoading(false); });
    return () => { current = false; };
  }, [onLogout]);

  useEffect(() => { onDraftChange?.(form); }, [form, onDraftChange]);

  useEffect(() => {
    if (isCatalogueLoading || !form.originPort || !form.destinationPort) return undefined;
    let current = true;
    setTradeLaneState('loading'); setTradeLane(null); setTradeLaneMessage('');
    lookupTradeLane(form.originPort, form.destinationPort)
      .then((lane) => { if (current) { setTradeLane(lane); setTradeLaneState('ready'); } })
      .catch((requestError) => { if (current) { setTradeLaneState('error'); setTradeLaneMessage(requestError.message); if (requestError instanceof AuthenticationError) onLogout(); } });
    return () => { current = false; };
  }, [form.originPort, form.destinationPort, isCatalogueLoading, onLogout]);

  function updateForm(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function analyzeVoyage(event) {
    event.preventDefault();
    const cargoQuantity = Number(form.cargoQuantity);
    if (!Number.isFinite(cargoQuantity) || cargoQuantity <= 0) return setError('Enter a cargo quantity greater than zero.');
    if (!form.originPort || !form.destinationPort || !form.vesselType) return setError('Select an origin, destination, and vessel for the port assessment.');
    setError(''); setIsLoading(true);
    try {
      const [recommendation, compatibility] = await Promise.all([
        requestJson('/api/vessels/recommend', { cargoQuantity }),
        requestJson('/api/ports/compatibility', { originPort: form.originPort, destinationPort: form.destinationPort, vesselType: form.vesselType })
      ]);
      if (!Array.isArray(recommendation?.recommendations) || typeof compatibility?.compatible !== 'boolean') throw new Error('The FreightAI API returned an unexpected result. Please try again.');
      const [tradeLaneResult, marketResult, forecastResult] = await Promise.allSettled([
        lookupTradeLane(form.originPort, form.destinationPort), lookupFreightMarket(form.originPort, form.destinationPort, form.vesselType), lookupFreightForecast()
      ]);
      const authFailure = [tradeLaneResult, marketResult, forecastResult].find((result) => result.status === 'rejected' && result.reason instanceof AuthenticationError);
      if (authFailure) throw authFailure.reason;
      onAnalysisReady?.({ form: { ...form, cargoQuantity }, recommendation, compatibility, intelligence: { tradeLane: tradeLaneResult, market: marketResult, forecast: forecastResult } });
    } catch (requestError) {
      if (requestError instanceof AuthenticationError) { onLogout(); return; }
      setError(requestError.message || 'Unable to reach the FreightAI API. Confirm that the backend is running.');
    } finally { setIsLoading(false); }
  }

  const portsByCountry = ports.reduce((groups, port) => { (groups[port.country] ??= []).push(port); return groups; }, {});
  const catalogueUnavailable = isCatalogueLoading || catalogueError || !ports.length || !vessels.length;
  return <main className="app-shell">
    <header className="site-header"><FreightAILogo className="dashboard-logo" /><div className="user-menu"><span>{user.name}<small>{user.email}</small></span><button type="button" onClick={onLogout}>Log out</button></div></header>
    <section className="hero"><p className="eyebrow">Decision-support prototype</p><h1>Plan with port and vessel constraints in view.</h1><p>Analyse bulk-cargo capacity recommendations and destination-port fit from the current FreightAI demo catalogue.</p></section>
    <section className="planning-workspace" aria-label="Voyage planning workspace"><form className="input-panel voyage-input-panel" onSubmit={analyzeVoyage}>
      <div className="panel-heading"><p className="section-kicker">01 — Voyage inputs</p><h2>Build a charter scenario</h2><span className="demo-label">Demo catalogue selections</span></div>
      <label className="field field-full" htmlFor="cargoQuantity"><span>Cargo requirement <em>(tonnes)</em></span><input id="cargoQuantity" name="cargoQuantity" type="number" min="1" step="1" value={form.cargoQuantity} onChange={updateForm} required /></label>
      <div className="field-grid">{[['originPort', 'Origin port'], ['destinationPort', 'Destination port']].map(([name, label]) => <label className="field" htmlFor={name} key={name}><span>{label}</span><select id={name} name={name} value={form[name]} onChange={updateForm} disabled={catalogueUnavailable} required><option value="">{isCatalogueLoading ? 'Loading ports…' : `Select ${label.toLowerCase()}`}</option>{Object.entries(portsByCountry).map(([country, countryPorts]) => <optgroup key={country} label={country}>{countryPorts.map((port) => <option key={port.id} value={port.name}>{port.name}</option>)}</optgroup>)}</select></label>)}</div>
      <label className="field field-full" htmlFor="vesselType"><span>Vessel for port assessment</span><select id="vesselType" name="vesselType" value={form.vesselType} onChange={updateForm} disabled={catalogueUnavailable} required><option value="">{isCatalogueLoading ? 'Loading vessels…' : 'Select a vessel'}</option>{vessels.map((vessel) => <option key={vessel.id} value={vessel.vesselType}>{vessel.vesselType}</option>)}</select><small>This selection is evaluated against destination limits; recommendations are calculated separately from cargo quantity.</small></label>
      <IntelligencePreview tradeLane={tradeLane} state={tradeLaneState} message={tradeLaneMessage} />
      {catalogueError && <div className="message error-message" role="alert"><strong>Catalogue unavailable.</strong><span>{catalogueError}</span></div>}
      {!isCatalogueLoading && !catalogueError && (!ports.length || !vessels.length) && <div className="message error-message" role="alert">The demo catalogue is empty. Run the backend seed command, then refresh.</div>}
      {error && <div className="message error-message" role="alert"><strong>Analysis unavailable.</strong><span>{error}</span></div>}
      {isLoading && <div className="loading-state" role="status"><span className="spinner" aria-hidden="true" />Analyzing vessel suitability, port compatibility, and intelligence signals…</div>}
      <button className="analyze-button" type="submit" disabled={isLoading || catalogueUnavailable}>{isLoading ? 'Analyzing voyage…' : 'Analyze Voyage'}</button>
    </form></section>
    <footer>FreightAI prototype · Decisions use illustrative demo data and are not operational chartering advice.</footer>
  </main>;
}
