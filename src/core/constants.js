/* ---------- vocab ---------- */
export const STATUSES = [
  { id: 'todo', name: 'To do' },
  { id: 'progress', name: 'In progress' },
  { id: 'waiting', name: 'Waiting' },
  { id: 'done', name: 'Done' },
];
export const ST = Object.fromEntries(STATUSES.map(s => [s.id, s]));
export const PRIOS = [
  { id: 'urgent', name: 'Urgent', w: 4 },
  { id: 'high', name: 'High', w: 3 },
  { id: 'medium', name: 'Medium', w: 2 },
  { id: 'low', name: 'Low', w: 1 },
  { id: 'none', name: 'No priority', w: 0 },
];
export const PR = Object.fromEntries(PRIOS.map(p => [p.id, p]));
export const LABELS = [
  { id: 'court', name: 'Court', c: 'var(--violet)' },
  { id: 'client', name: 'Client', c: 'var(--blue)' },
  { id: 'funding', name: 'Funding', c: 'var(--teal)' },
  { id: 'tax', name: 'Tax', c: 'var(--amber)' },
  { id: 'deed', name: 'Deed', c: 'var(--rose)' },
  { id: 'beneficiary', name: 'Beneficiary', c: 'var(--green)' },
];
export const LB = Object.fromEntries(LABELS.map(l => [l.id, l]));
export const PSTAT = {
  active: { name: 'Active', c: 'var(--blue)' },
  client: { name: 'Waiting on client', c: 'var(--amber)' },
  court: { name: 'Waiting on court', c: 'var(--red)' },
  hold: { name: 'On hold', c: 'var(--gray)' },
  complete: { name: 'Closed', c: 'var(--green)' },
};
export const MATTER_TYPES = [
  { id: 'estate', name: 'Estate planning', icon: 'scale' },
  { id: 'probate', name: 'Probate', icon: 'landmark' },
  { id: 'other', name: 'Other', icon: 'folder' },
];
export const STAGES = {
  estate: [
    ['inquiry', 'Inquiry'],
    ['engagement', 'Engagement'],
    ['questionnaire', 'Questionnaire'],
    ['drafting', 'Drafting'],
    ['signing', 'Signing'],
    ['funding', 'Funding'],
    ['closed', 'Closed'],
  ],
  probate: [
    ['intake', 'Intake'],
    ['petition', 'Petition'],
    ['notice', 'Notice'],
    ['inventory', 'Inventory'],
    ['accounting', 'Accounting'],
    ['distribution', 'Distribution'],
    ['closed', 'Closed'],
  ],
  other: [
    ['intake', 'Intake'],
    ['active', 'Active work'],
    ['closed', 'Closed'],
  ],
};
export const stagesFor = type => STAGES[type] || STAGES.other;
export const stageName = (type, id) => stagesFor(type).find(s => s[0] === id)?.[1] || '—';
export const matterTypeName = id => MATTER_TYPES.find(t => t.id === id)?.name || 'Matter';
export const PCOLORS = {
  indigo: '#5A67D8',
  blue: '#3B82C4',
  violet: '#8662C9',
  teal: '#23918A',
  rose: '#C54B78',
  amber: '#C48A1E',
  green: '#3D8E5F',
  slate: '#6B7280',
};
export const PICONS = [
  'globe',
  'smartphone',
  'megaphone',
  'rocket',
  'component',
  'building-2',
  'layout-grid',
  'palette',
  'code',
  'briefcase',
  'target',
  'layers',
  'zap',
  'heart',
  'folder',
  'sparkles',
  'scale',
  'landmark',
];
export const ROLES = ['Owner', 'Admin', 'Member', 'Guest'];
export const TEAMS_SEED = [];
