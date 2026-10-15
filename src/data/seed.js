/* ---------- seed data: fictional practice matters only ---------- */
import { dOff, minsAgo, uid } from '../core/utils.js';

export function seed() {
  const members = [
    {
      id: 'm1',
      name: 'Avery Lang',
      email: 'avery@harborpine.example',
      role: 'Owner',
      team: '',
      title: 'Attorney',
      c: '#3B82C4',
      status: 'active',
      last: 0,
      tz: 'Sample City',
    },
  ];
  const projects = [
    {
      id: 'p1',
      key: 'MSH',
      name: 'Marsh revocable trust',
      icon: 'scale',
      color: 'teal',
      status: 'client',
      matterType: 'estate',
      stage: 'drafting',
      jurisdiction: 'Sample State',
      court: '',
      caseNumber: '',
      team: '',
      lead: 'm1',
      due: dOff(21),
      start: dOff(-18),
      fav: true,
      members: ['m1'],
      parties: [
        { id: 'y1', name: 'Helen Marsh', role: 'Client' },
        { id: 'y2', name: 'Robert Marsh', role: 'Spouse' },
      ],
      desc: 'Fictional revocable trust package for a married couple. Sample data for practicing the workflow.',
      milestones: [{ name: 'Signing appointment', date: dOff(14) }],
      drafts: null,
      reminder: 'Follow up on the Marsh asset list.',
      notes: [{ id: 'mn1', text: 'Helen prefers email. Keep Robert’s separate property out of the client update.', at: minsAgo(800) }],
      last: 40,
    },
    {
      id: 'p2',
      key: 'NGY',
      name: 'Nguyen estate administration',
      icon: 'landmark',
      color: 'indigo',
      status: 'court',
      matterType: 'probate',
      stage: 'inventory',
      jurisdiction: 'Sample State',
      court: 'Sample County Probate Court',
      caseNumber: '2026-PR-0142',
      team: '',
      lead: 'm1',
      due: dOff(45),
      start: dOff(-40),
      fav: false,
      members: ['m1'],
      parties: [
        { id: 'y3', name: 'Claire Nguyen', role: 'Personal representative' },
        { id: 'y4', name: 'Eleanor Nguyen', role: 'Decedent' },
      ],
      desc: 'Fictional probate administration. Sample court, case number, and parties only.',
      milestones: [
        { name: 'Inventory due', date: dOff(12) },
        { name: 'Creditor period ends', date: dOff(30) },
      ],
      drafts: null,
      reminder: 'Check whether letters have issued.',
      notes: [{ id: 'mn2', text: 'Creditor notice has not gone out. Keep any hearing result out of client drafts.', at: minsAgo(1400) }],
      last: 90,
    },
  ];
  let n = 0;
  const T = [];
  const t = (p, title, status, prio, due, labels = [], x = {}) => {
    const proj = projects.find(q => q.id === p);
    const count = T.filter(q => q.project === p).length + 1;
    T.push(
      Object.assign(
        {
          id: 't' + ++n,
          key: proj.key + '-' + (100 + count),
          project: p,
          title,
          status,
          assignee: 'm1',
          priority: prio,
          due: due == null ? null : dOff(due),
          start: due == null ? null : dOff(due - (x.len || 3)),
          labels,
          subtasks: [],
          attachments: [],
          deps: [],
          desc: '',
          estimate: null,
          created: minsAgo(60 * 24 * (x.age || 10)),
          updated: minsAgo(60 * (x.upd || 20)),
          order: n,
          fav: false,
          recur: null,
        },
        x,
      ),
    );
  };
  t('p1', 'Conflict check', 'done', 'high', -16, [], { age: 18 });
  t('p1', 'Engagement letter', 'done', 'high', -12, ['client'], { age: 16 });
  t('p1', 'Asset list', 'waiting', 'high', -2, ['client'], { age: 14, upd: 6 });
  t('p1', 'Draft trust and wills', 'progress', 'high', 7, [], {
    age: 8,
    upd: 4,
    desc: '<p>Working draft of the revocable trust and pour-over wills. Internal notes only.</p>',
    subtasks: [
      { id: 's1', title: 'Trust agreement', done: true },
      { id: 's2', title: 'Pour-over wills', done: false },
      { id: 's3', title: 'Powers of attorney', done: false },
    ],
  });
  t('p1', 'Signing appointment', 'todo', 'medium', 14, ['client'], { age: 4 });
  t('p1', 'Deed and beneficiary follow-up', 'todo', 'medium', 21, ['deed', 'beneficiary', 'funding'], { age: 2 });

  t('p2', 'Open the estate file', 'done', 'high', -36, [], { age: 40 });
  t('p2', 'Petition for probate', 'done', 'high', -28, ['court'], { age: 34 });
  t('p2', 'Letters', 'waiting', 'high', 4, ['court'], { age: 20, upd: 8 });
  t('p2', 'Notice to heirs and creditors', 'progress', 'high', 6, ['client'], { age: 12, upd: 5 });
  t('p2', 'Inventory', 'todo', 'urgent', 12, ['court'], { age: 10 });
  t('p2', 'Creditor period', 'todo', 'medium', 30, ['court'], { age: 10 });
  t('p2', 'Accounting', 'todo', 'medium', 45, ['tax'], { age: 6 });

  T.filter(x => x.status === 'done').forEach((x, i) => (x.completedAt = minsAgo(60 * 24 * (4 + i))));
  const comments = [
    {
      id: 'c1',
      task: 't3',
      by: 'm1',
      at: minsAgo(360),
      text: 'Internal: still waiting on the asset list before the trust draft can be finished.',
      re: {},
    },
    {
      id: 'c2',
      task: 't9',
      by: 'm1',
      at: minsAgo(500),
      text: 'Internal: letters are with the court. Do not tell the client a hearing outcome.',
      re: {},
    },
  ];
  const A = (verb, task, project, m, extra = '') => ({ id: uid('a'), by: 'm1', verb, task, project, at: minsAgo(m), extra });
  const activity = [
    A('completed', 't1', 'p1', 60 * 24 * 16),
    A('completed', 't2', 'p1', 60 * 24 * 12),
    A('is waiting on', 't3', 'p1', 360, 'from the client'),
    A('started', 't4', 'p1', 240),
    A('completed', 't8', 'p2', 60 * 24 * 28),
    A('is waiting on', 't9', 'p2', 500, 'from the court'),
    A('created matter', null, 'p1', 60 * 24 * 18),
    A('created matter', null, 'p2', 60 * 24 * 40),
  ];
  const files = [
    {
      id: 'f1',
      project: 'p1',
      name: 'engagement-letter.pdf',
      type: 'pdf',
      size: '180 KB',
      by: 'm1',
      at: minsAgo(60 * 24 * 12),
      task: 't2',
      source: 'office',
      signed: true,
    },
    {
      id: 'f2',
      project: 'p1',
      name: 'asset-questionnaire.pdf',
      type: 'pdf',
      size: '96 KB',
      by: 'm1',
      at: minsAgo(60 * 24 * 10),
      task: 't3',
      source: 'office',
      signed: false,
    },
    { id: 'f3', project: 'p1', name: 'draft-trust.docx', type: 'doc', size: '240 KB', by: 'm1', at: minsAgo(240), task: 't4', source: 'office', signed: false },
    {
      id: 'f4',
      project: 'p2',
      name: 'petition.pdf',
      type: 'pdf',
      size: '420 KB',
      by: 'm1',
      at: minsAgo(60 * 24 * 28),
      task: 't8',
      source: 'court',
      signed: false,
    },
    {
      id: 'f5',
      project: 'p2',
      name: 'proposed-letters.pdf',
      type: 'pdf',
      size: '150 KB',
      by: 'm1',
      at: minsAgo(60 * 24 * 8),
      task: 't9',
      source: 'office',
      signed: false,
    },
  ];
  const events = [
    { id: 'e1', title: 'Signing appointment', date: dOff(14), time: '10:00', project: 'p1' },
    { id: 'e2', title: 'Status conference', date: dOff(8), time: '09:00', project: 'p2' },
  ];
  return {
    ws: { name: 'Harbor & Pine Law', url: 'harborpine', c: '#1D1C1A', brand: true },
    workspaces: [{ id: 'w1', name: 'Harbor & Pine Law', c: '#1D1C1A', plan: 'Solo', brand: true }],
    me: 'm1',
    members,
    teams: [],
    projects,
    tasks: T,
    comments,
    activity,
    notifs: [],
    files,
    events,
    projOrder: projects.map(p => p.id),
    savedViews: [],
    recentSearches: [],
    sessions: [],
    invoices: [],
    tfa: false,
    notifPrefs: {
      email_mention: true,
      email_assign: true,
      email_digest: false,
      email_comment: false,
      push_mention: false,
      push_assign: true,
      push_comment: false,
      push_due: true,
      mention_all: true,
      assign_self: true,
    },
  };
}
