import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import { ArrowLeftRight, ArrowUpRight, Check, ChevronDown, Download, Expand, FileDown, Info, Plus, QrCode, ShieldCheck, Smartphone, Trash2, X } from 'lucide-react';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import { emptyCard, fullName, makeVCard, readPresets } from './vcard.mjs';
import './style.css';

type Card = typeof emptyCard;
type Preset = {id: string; label: string; card: Card};
const storageKey = 'exchange.presets.v1';
function load(): Preset[] { try { return readPresets(localStorage.getItem(storageKey)) as Preset[]; } catch { return []; } }
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function App() {
  const [presets, setPresets] = useState<Preset[]>(load);
  const [active, setActive] = useState(() => load()[0]?.id || '');
  const [card, setCard] = useState<Card>(() => load()[0]?.card || {...emptyCard});
  const [event, setEvent] = useState(() => load()[0]?.label || '');
  const [qr, setQr] = useState('');
  const [qrError, setQrError] = useState('');
  const [status, setStatus] = useState('');
  const [presenting, setPresenting] = useState(false);
  const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const payload = makeVCard(card);
  const name = fullName(card);
  const valid = Boolean(name && (card.phone.trim() || card.email.trim()));
  const dirty = active ? JSON.stringify(presets.find(p => p.id === active)?.card) !== JSON.stringify(card) || presets.find(p => p.id === active)?.label !== event : Boolean(event || Object.values(card).some(value => value.trim()));
  useEffect(() => {
    let current = true; setQr(''); setQrError('');
    if (valid) QRCode.toDataURL(payload, {width: 1200, margin: 4, errorCorrectionLevel: 'M', color: {dark: '#171a17', light: '#ffffff'}})
      .then(url => { if (current) setQr(url); }).catch(() => { if (current) setQrError('Too much information for a QR. Shorten your note or other fields.'); });
    return () => { current = false; };
  }, [payload, valid]);
  useEffect(() => { if (!status) return; const timer = setTimeout(() => setStatus(''), 5000); return () => clearTimeout(timer); }, [status]);
  function persist(next: Preset[]) { try { localStorage.setItem(storageKey, JSON.stringify(next)); setPresets(next); return true; } catch { setStatus('Your browser could not save this preset. Downloads still work.'); return false; } }
  function save() {
    if (!valid || !event.trim()) return;
    const id = active || crypto.randomUUID();
    const preset = {id, label: event.trim(), card: {...card}};
    if (persist(active ? presets.map(p => p.id === active ? preset : p) : [...presets, preset])) {setActive(id); setStatus('Event preset saved on this device.');}
  }
  function select(id: string) {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    const p = presets.find(p => p.id === id); setActive(id); setCard(p ? {...p.card} : {...emptyCard}); setEvent(p?.label || '');
  }
  function remove() { if (!active || !window.confirm(`Delete “${event}” from this device?`)) return; if (persist(presets.filter(p => p.id !== active))) { setActive(''); setStatus('Preset deleted. Your details are still in the editor.'); } }
  async function imageDownload() {
    if (!qr) return; setSaving(true);
    try { const blob = await (await fetch(qr)).blob(); download(blob, `${name || 'contact'}-qr.png`); setStatus('QR image downloaded.'); } catch { setStatus('Could not download the image. Please try again.'); } finally { setSaving(false); }
  }
  function present() { dialog.current?.showModal(); setPresenting(true); }
  const fields: {key: keyof Card; label: string; placeholder: string; type?: string; autoComplete?: string}[] = [
    {key:'firstName',label:'First name',placeholder:'e.g. Malhar',autoComplete:'given-name'},
    {key:'lastName',label:'Last name',placeholder:'e.g. Jani',autoComplete:'family-name'},
    {key:'phone',label:'Phone number',placeholder:'+91 98765 43210',type:'tel',autoComplete:'tel'},
    {key:'email',label:'Email address',placeholder:'you@example.com',type:'email',autoComplete:'email'},
    {key:'organization',label:'Company or organisation',placeholder:'Where you work or study',autoComplete:'organization'},
    {key:'title',label:'Role',placeholder:'What you do',autoComplete:'organization-title'},
    {key:'website',label:'Website or social link',placeholder:'https://your-website.com',type:'url',autoComplete:'url'},
  ];
  return <>
    <header className="header"><a className="brand" href="./" aria-label="Exchange home"><span className="brand-icon"><ArrowLeftRight size={21}/></span>exchange<span className="brand-dot">.</span></a><span className="header-note"><span className="online-dot"/>A little less “what’s your number?”</span><a className="github" href="https://github.com/Malhar-Jani/exchange-contact-cards" target="_blank" rel="noreferrer">View source <ArrowUpRight size={15}/></a></header>
    <main>
      <section className="intro"><div><h1>Good to meet you.<br/><span>Easy to stay in touch.</span></h1><p>Make a contact QR for your next event. They scan, tap save,<br className="desktop-break"/> and get back to the conversation.</p></div><div className="intro-aside"><ShieldCheck size={20}/><span>No account. No tracking.<br/>Just your contact details.</span></div></section>
      <div className="workspace">
        <section className="editor" aria-labelledby="details-heading">
          <div className="section-title"><h2 id="details-heading">Your contact details</h2><span className="small">Only share what you want to.</span></div>
          <div className="presets"><div className="select-wrap"><select aria-label="Saved event presets" value={active} onChange={e => select(e.target.value)}><option value="">New event preset</option>{presets.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select><ChevronDown size={16}/></div><button className="icon-button" aria-label="New event preset" onClick={() => select('')}><Plus size={20}/></button></div>
          <form onSubmit={e => {e.preventDefault(); save();}}>
            <label className="event-field">Event / preset name <span className="optional">private label</span><input value={event} onChange={e => setEvent(e.target.value)} maxLength={80} placeholder="e.g. eSummit 2027" required/><span className="field-help">For organising your presets. Not included in the QR.</span></label>
            <div className="form-divider"/>
            <div className="fields">{fields.map(f => <label key={f.key} className={f.key === 'website' ? 'wide' : ''}>{f.label}{f.key === 'firstName' && <span className="required-mark"> *</span>}<input type={f.type || 'text'} autoComplete={f.autoComplete} value={card[f.key]} onChange={e => setCard({...card,[f.key]:e.target.value})} placeholder={f.placeholder} maxLength={f.key === 'website' ? 240 : 100} required={f.key === 'firstName'}/></label>)}
            <label className="wide">Contact note <span className="optional">optional</span><textarea rows={2} maxLength={280} value={card.note} onChange={e => setCard({...card,note:e.target.value})} placeholder="e.g. We met at eSummit 2027."/><span className="field-help">Included in the contact they save. Keep it short for an easy scan.</span></label></div>
            <div className="save-row"><button className="button dark" type="submit" disabled={!valid || !event.trim()}><Check size={17}/>{active ? 'Save changes' : 'Save event preset'}</button>{active && <button className="icon-button" type="button" aria-label="Delete event preset" onClick={remove}><Trash2 size={18}/></button>}<span className="small">{dirty ? 'Unsaved changes' : active ? 'Saved on this device' : 'Add a name and phone or email'}</span></div>
            {active && <button className="copy-preset" type="button" onClick={() => {setActive(''); setEvent(''); setStatus('Details copied. Add a new event name and save.');}}>Use these details for another event <ArrowUpRight size={14}/></button>}
          </form>
        </section>
        <aside className="preview" aria-label="Live contact QR preview"><div className="preview-heading"><h2>Your next hello.</h2><span className="live-label"><span className="online-dot"/>Live preview</span></div>
          <div className="contact-card"><div className="card-top"><span className="card-monogram">{name ? `${card.firstName.trim()[0] || ''}${card.lastName.trim()[0] || ''}`.toUpperCase() : <ArrowLeftRight size={23}/>}</span><span className="card-type">CONTACT CARD</span></div><h3>{name || 'Your name goes here'}</h3><p className="card-role">{[card.title.trim(),card.organization.trim()].filter(Boolean).join(' · ') || 'A new connection starts here.'}</p>
          <div className="qr-area">{qr ? <img src={qr} alt={`Contact QR code for ${name}`} width={280} height={280}/> : <div className="qr-empty"><QrCode size={54} strokeWidth={1.2}/><p>{qrError || 'Add your name and a phone number or email to make your QR.'}</p></div>}</div>
          <div className="scan-caption"><Smartphone size={16}/><span>Scan. Open contact. Tap save.</span></div>
          {(card.phone || card.email) && <div className="card-contact">{card.phone && <span>{card.phone}</span>}{card.email && <span>{card.email}</span>}</div>}</div>
          <button className="button orange present-button" disabled={!qr} onClick={present}><Expand size={18}/>Show QR full screen<ArrowUpRight size={18}/></button>
          <div className="downloads"><button className="button outline" disabled={!qr || saving} onClick={imageDownload}><Download size={17}/>{saving ? 'Downloading…' : 'QR image'}</button><button className="button outline" disabled={!qr} onClick={() => download(new Blob([payload],{type:'text/vcard;charset=utf-8'}),`${name}.vcf`)}><FileDown size={17}/>Contact file</button></div>
          <p className="preview-tip"><Info size={16}/><span>The QR contains your details, not a link. It works offline. Saving steps vary by phone and scanner.</span></p>
        </aside>
      </div>
      <footer><span><ShieldCheck size={15}/>Your presets stay in this browser. Clearing browser data removes them.</span><span>Made for meeting people.</span></footer>
    </main>
    {qr && <button className="button orange mobile-show" onClick={present}><Expand size={18}/>Show my QR</button>}
    <div className="toast" role="status" aria-live="polite">{status}</div>
    <dialog ref={dialog} className="present-dialog" onClose={() => setPresenting(false)} onClick={e => {if(e.target === e.currentTarget) dialog.current?.close();}}><button className="icon-button close" aria-label="Close full screen QR" onClick={() => dialog.current?.close()}><X/></button>{presenting && <div className="presentation"><span className="brand"><ArrowLeftRight size={24}/>exchange.</span><h2>{name}</h2><p>{[card.title,card.organization].filter(Boolean).join(' · ')}</p><img src={qr} alt={`Contact QR code for ${name}`} width={500} height={500}/><h3>Let’s stay in touch.</h3><p>Scan with your camera, open the contact, then save.</p>{event && <span className="event-caption">{event}</span>}</div>}</dialog>
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);
