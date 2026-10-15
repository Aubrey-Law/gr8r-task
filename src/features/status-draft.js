/* Status drafts are written from the matter record. The attorney reviews them. Nothing is sent. */
import { esc, fmtDate } from '../core/utils.js';
import { ic } from '../core/icons.js';
import { matterTypeName, stageName } from '../core/constants.js';
import { D, S, isOver, tasksOf } from '../core/store.js';

const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999');
export const DRAFT_USES = [
  ['status', 'Status update'],
  ['request', 'Document request'],
  ['signing', 'Signing reminder'],
  ['probate', 'Probate status'],
];
const professional = () => S.prefs.voice === 'professional';

function matterCtx(p) {
  const open = tasksOf(p.id)
    .filter(t => t.status !== 'done')
    .sort(byDue);
  const overdue = open.filter(isOver);
  const waiting = open.filter(t => t.status === 'waiting');
  const fromClient = open.filter(t => t.labels?.includes('client') || t.status === 'waiting');
  const next = open.find(t => t.due) || open[0];
  const docs = D().files.filter(f => f.project === p.id);
  const parties = (p.parties || []).map(x => `${x.name} (${x.role})`).join('; ') || 'None listed';
  const type = matterTypeName(p.matterType);
  const stage = stageName(p.matterType, p.stage);
  const docLine = docs.length ? docs.map(f => f.name).join(', ') : 'None on file yet';
  const names = (p.parties || []).filter(x => x.role !== 'Decedent').map(x => x.name);
  const hello = names.length ? names.join(' and ') : 'Hello';
  const needed = fromClient.filter(t => t.labels?.includes('client') || /list|notice|sign|questionnaire|asset/i.test(t.title));
  const signing = (p.milestones || []).find(m => /sign/i.test(m.name)) || open.find(t => /sign/i.test(t.title));
  const signingWhen = signing?.date || signing?.due;
  return { open, overdue, waiting, next, docs, parties, type, stage, docLine, names, hello, needed, signing, signingWhen };
}

function clientStatus(p, c) {
  const needBlock = c.needed.length
    ? c.needed.map(t => `- ${t.title}${t.due ? ` (${fmtDate(t.due)})` : ''}`).join('\n')
    : '- Nothing is needed from you right now.';
  const nextStep = c.next ? `${c.next.title}.` : 'We will confirm the next step shortly.';
  const nextDate = c.next?.due ? ` The date on our checklist is ${fmtDate(c.next.due)}.` : '';
  if (professional()) {
    return [
      `Status update: ${p.name}`,
      '',
      `Dear ${c.hello},`,
      '',
      `This letter reports the status of your ${c.type.toLowerCase()} matter. It describes the current stage of the work. It is not a prediction of any outcome.`,
      '',
      `Current stage: ${c.stage}.`,
      '',
      `Next step: ${nextStep}${nextDate}`,
      '',
      'Documents requested from you:',
      needBlock,
      '',
      `Documents already on file: ${c.docLine}.`,
      '',
      'I will write again after the next step. Please contact me if this report does not match your understanding.',
    ].join('\n');
  }
  return [
    `Status update: ${p.name}`,
    '',
    `${c.hello} — this is a status update for your ${c.type.toLowerCase()} matter. It describes where the work stands. It is not a prediction of any outcome.`,
    '',
    `Current stage: ${c.stage}.`,
    '',
    `Next step: ${nextStep}${nextDate}`,
    '',
    'What we need from you:',
    needBlock,
    '',
    `Documents we already have on file: ${c.docLine}.`,
    '',
    'I will write again after the next step. Please reply if the information above does not match what you expect.',
  ].join('\n');
}

function clientRequest(p, c) {
  const items = c.needed.length ? c.needed : c.open.slice(0, 4);
  const list = items.length ? items.map(t => `- ${t.title}${t.due ? ` (${fmtDate(t.due)})` : ''}`).join('\n') : '- No open checklist item is waiting on you.';
  if (professional()) {
    return [
      `Document request: ${p.name}`,
      '',
      `Dear ${c.hello},`,
      '',
      `Please send the following so we can continue your ${c.type.toLowerCase()} matter. This request is not a prediction of any outcome.`,
      '',
      list,
      '',
      `We already have: ${c.docLine}.`,
      '',
      'Please reply with the items you can send, or tell me if a date above is not workable.',
    ].join('\n');
  }
  return [
    `Document request: ${p.name}`,
    '',
    `${c.hello} — please send the items below so the ${p.name} matter can keep moving.`,
    '',
    list,
    '',
    `Already on file: ${c.docLine}.`,
    '',
    'Reply when you can. If a date does not work, tell me and I will adjust the checklist.',
  ].join('\n');
}

function clientSigning(p, c) {
  const when = c.signingWhen ? fmtDate(c.signingWhen) : 'a date still to be set';
  const what = c.signing?.name || c.signing?.title || 'Signing appointment';
  if (professional()) {
    return [
      `Signing reminder: ${p.name}`,
      '',
      `Dear ${c.hello},`,
      '',
      `This is a reminder of the ${what.toLowerCase()} for your ${c.type.toLowerCase()} matter, currently scheduled for ${when}.`,
      '',
      'Please bring a photo identification. Let me know if you need to move the appointment.',
      '',
      'This reminder does not describe the contents of the documents or predict any outcome.',
    ].join('\n');
  }
  return [
    `Signing reminder: ${p.name}`,
    '',
    `${c.hello} — a reminder that ${what} is on the calendar for ${when}.`,
    '',
    'Bring a photo ID. Reply if you need a different time.',
    '',
    'This note is only a scheduling reminder.',
  ].join('\n');
}

function clientProbate(p, c) {
  if (p.matterType !== 'probate') {
    const lead = professional() ? `Dear ${c.hello},` : `${c.hello} —`;
    return [
      `Probate status: ${p.name}`,
      '',
      lead,
      '',
      `This matter is ${c.type.toLowerCase()}, now in ${c.stage}. A probate status, with a court and a case number, does not apply to this file.`,
      '',
      'Use Status update when you want the client letter for this matter.',
    ].join('\n');
  }
  const court = p.court || 'the court on this file';
  const caseNo = p.caseNumber || 'not yet assigned';
  const next = c.next ? `${c.next.title}${c.next.due ? ` (${fmtDate(c.next.due)})` : ''}` : 'None dated';
  if (professional()) {
    return [
      `Probate status: ${p.name}`,
      '',
      `Dear ${c.hello},`,
      '',
      `This letter reports the status of the estate administration in ${court}, case ${caseNo}. It is not a prediction of any court outcome.`,
      '',
      `Current stage: ${c.stage}.`,
      '',
      `Next dated step: ${next}.`,
      '',
      `Documents on file: ${c.docLine}.`,
      '',
      'Please contact me if you expected a different next step.',
    ].join('\n');
  }
  return [
    `Probate status: ${p.name}`,
    '',
    `${c.hello} — here is where the estate administration stands. This is not a prediction of what the court will do.`,
    '',
    `Court: ${court}.`,
    `Case: ${caseNo}.`,
    `Stage: ${c.stage}.`,
    '',
    `Next dated step: ${next}.`,
    '',
    `On file: ${c.docLine}.`,
    '',
    'Reply if this does not match what you expected.',
  ].join('\n');
}

export function buildDrafts(p, use = 'status') {
  const c = matterCtx(p);
  const { open, overdue, waiting, next, parties, type, stage, docLine } = c;
  const openLines = open.length ? open.map(t => `- ${t.title}${t.due ? ` (due ${fmtDate(t.due)})` : ''}`).join('\n') : '- None';
  const court = p.matterType === 'probate' || p.court || p.caseNumber ? `Court: ${p.court || 'Not set'}\nCase number: ${p.caseNumber || 'Not set'}` : '';
  const nextLine = next ? `${next.title}${next.due ? ` on ${fmtDate(next.due)}` : ''}` : 'No dated next step';
  const blockerLines = [...overdue.map(t => `- ${t.title} is overdue`), ...waiting.filter(t => !overdue.includes(t)).map(t => `- ${t.title} is waiting`)];
  const useName = DRAFT_USES.find(u => u[0] === use)?.[1] || 'Status update';
  const clientByUse = { status: clientStatus, request: clientRequest, signing: clientSigning, probate: clientProbate };
  const internal = [
    `Internal ${useName.toLowerCase()} — ${p.name}`,
    `Type: ${type}`,
    `Stage: ${stage}`,
    `Parties: ${parties}`,
    `Jurisdiction: ${p.jurisdiction || 'Not set'}`,
    court.trim(),
    '',
    'Blockers:',
    blockerLines.length ? blockerLines.join('\n') : '- None noted',
    '',
    `Next deadline: ${nextLine}`,
    '',
    'Open checklist:',
    openLines,
    '',
    'Documents on file:',
    docLine,
    '',
    `Do next: ${overdue[0] ? `Follow up on ${overdue[0].title}.` : next ? `Continue ${next.title}.` : 'Review the matter and close finished work.'}`,
  ]
    .filter(line => line !== undefined)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  const client = (clientByUse[use] || clientStatus)(p, c);
  return { internal, client, use };
}

export function statusDraftHtml(p) {
  const d = p.drafts;
  const reviewed = !!d?.reviewedAt;
  const ready = !!(d && d.internal && d.client);
  const box = (which, label, note) => `<div class="field" style="margin:0">
      <label class="label" for="draft-${which}">${label}</label>
      <textarea class="textarea" id="draft-${which}" data-in="matterDraft" data-id="${p.id}" data-which="${which}" rows="12" ${ready ? '' : 'disabled'} placeholder="Choose a draft and write it from the matter record.">${esc(d?.[which] || '')}</textarea>
      <span class="hint">${note}</span>
    </div>`;
  return `<section class="panel" aria-labelledby="status-drafts">
    <div class="panel-h"><h2 id="status-drafts">Drafts</h2><div class="acts"><select class="select" id="draft-use-${p.id}" style="height:26px;width:auto;font-size:12px" aria-label="Draft type">${DRAFT_USES.map(([id, name]) => `<option value="${id}" ${(d?.use || 'status') === id ? 'selected' : ''}>${name}</option>`).join('')}</select><button class="btn btn-primary btn-sm" data-a="draftStatus" data-id="${p.id}">${ic('sparkles', 13)}Write draft</button></div></div>
    <div class="panel-b" style="display:flex;flex-direction:column;gap:14px">
      <p class="muted" style="margin:0;font-size:13px">The draft is written from this matter. Wording follows the firm preference in Settings. Review it, then copy. This app does not send it.</p>
      ${box('internal', 'Internal memo', 'For you. This can name blockers and what to do next.')}
      ${box('client', 'Client update', 'Plain status only. It does not predict an outcome or give new legal advice.')}
      <div class="row" style="flex-wrap:wrap;gap:8px">
        <button class="btn btn-secondary btn-sm" data-a="markDraftReviewed" data-id="${p.id}" ${ready && !reviewed ? '' : 'disabled'}>${ic('circle-check', 13)}Mark reviewed</button>
        <button class="btn btn-secondary btn-sm" data-a="copyDraft" data-id="${p.id}" data-which="internal" ${reviewed ? '' : 'disabled'}>Copy internal</button>
        <button class="btn btn-secondary btn-sm" data-a="copyDraft" data-id="${p.id}" data-which="client" ${reviewed ? '' : 'disabled'}>Copy client update</button>
        ${reviewed ? `<span class="faint" style="font-size:12px">Reviewed. Copy is available. Editing a draft clears the review.</span>` : `<span class="faint" style="font-size:12px">Mark reviewed before copying.</span>`}
      </div>
    </div>
  </section>`;
}
