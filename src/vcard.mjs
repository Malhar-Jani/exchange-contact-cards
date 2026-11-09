export const emptyCard = { firstName: '', lastName: '', phone: '', email: '', organization: '', title: '', website: '', note: '' };
export function escapeText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
// Fold at 75 UTF-8 octets, without splitting a Unicode character.
export function foldLine(line) {
  const lines = []; let part = ''; let size = 0;
  for (const char of line) {
    const bytes = new TextEncoder().encode(char).length;
    if (size + bytes > 75) { lines.push(part); part = ' '; size = 1; }
    part += char; size += bytes;
  }
  return [...lines, part].join('\r\n');
}
export function fullName(card) { return [card.firstName.trim(), card.lastName.trim()].filter(Boolean).join(' '); }
export function makeVCard(card) {
  const c = Object.fromEntries(Object.keys(emptyCard).map(key => [key, String(card[key] || '').trim()]));
  const rows = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeText(c.lastName)};${escapeText(c.firstName)};;;`, `FN:${escapeText(fullName(c))}`];
  if (c.phone) rows.push(`TEL;TYPE=CELL:${escapeText(c.phone)}`);
  if (c.email) rows.push(`EMAIL;TYPE=INTERNET:${escapeText(c.email)}`);
  if (c.organization) rows.push(`ORG:${escapeText(c.organization)}`);
  if (c.title) rows.push(`TITLE:${escapeText(c.title)}`);
  if (c.website) rows.push(`URL:${escapeText(c.website)}`);
  if (c.note) rows.push(`NOTE:${escapeText(c.note)}`);
  rows.push('END:VCARD');
  return rows.map(foldLine).join('\r\n') + '\r\n';
}
export function readPresets(raw) {
  try {
    const data = JSON.parse(raw || '[]');
    if (!Array.isArray(data)) return [];
    return data.filter(p => p && typeof p.id === 'string' && typeof p.label === 'string' && p.card && typeof p.card === 'object')
      .map(p => ({id: p.id, label: p.label.slice(0, 80), card: Object.fromEntries(Object.keys(emptyCard).map(key => [key, typeof p.card[key] === 'string' ? p.card[key].slice(0, 500) : '']))}));
  } catch { return []; }
}
