/* Status drafts are written from the matter record. The attorney reviews them. Nothing is sent. */
import { esc, fmtDate } from '../core/utils.js';
import { ic } from '../core/icons.js';
import { matterTypeName, stageName } from '../core/constants.js';
import { D, isOver, tasksOf } from '../core/store.js';

const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999');

export function buildDrafts(p) {
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
  const openLines = open.length ? open.map(t => `- ${t.title}${t.due ? ` (due ${fmtDate(t.due)})` : ''}`).join('\n') : '- None';
  const court = p.matterType === 'probate' || p.court || p.caseNumber ? `Court: ${p.court || 'Not set'}\nCase number: ${p.caseNumber || 'Not set'}\n` : '';
  const nextLine = next ? `${next.title}${next.due ? ` on ${fmtDate(next.due)}` : ''}` : 'No dated next step';
  const blockerLines = [...overdue.map(t => `- ${t.title} is overdue`), ...waiting.filter(t => !overdue.includes(t)).map(t => `- ${t.title} is waiting`)];
  const internal = [
    `Internal status — ${p.name}`,
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

  const needed = fromClient.filter(t => t.labels?.includes('client') || /list|notice|sign|questionnaire|asset/i.test(t.title));
  const needBlock = needed.length
    ? needed.map(t => `- ${t.title}${t.due ? ` (we have this down for ${fmtDate(t.due)})` : ''}`).join('\n')
    : '- Nothing is needed from you right now.';
  const names = (p.parties || []).filter(x => x.role !== 'Decedent').map(x => x.name);
  const hello = names.length ? names.join(' and ') : 'Hello';
  const client = [
    `Status update: ${p.name}`,
    '',
    `${hello} — this is a status update for your ${type.toLowerCase()} matter. It describes where the work stands. It is not a prediction of any outcome.`,
    '',
    `Current stage: ${stage}.`,
    '',
    `Next step: ${next ? `${next.title}.` : 'We will confirm the next step shortly.'}${next?.due ? ` The date on our checklist is ${fmtDate(next.due)}.` : ''}`,
    '',
    'What we need from you:',
    needBlock,
    '',
    `Documents we already have on file: ${docLine}.`,
    '',
    'I will write again after the next step. Please reply if the information above does not match what you expect.',
  ].join('\n');
  return { internal, client };
}

export function statusDraftHtml(p) {
  const d = p.drafts;
  const reviewed = !!d?.reviewedAt;
  const ready = !!(d && d.internal && d.client);
  const box = (which, label, note) => `<div class="field" style="margin:0">
      <label class="label" for="draft-${which}">${label}</label>
      <textarea class="textarea" id="draft-${which}" data-in="draft" data-id="${p.id}" data-which="${which}" rows="12" ${ready ? '' : 'disabled'} placeholder="Draft status to fill this from the matter record.">${esc(d?.[which] || '')}</textarea>
      <span class="hint">${note}</span>
    </div>`;
  return `<section class="panel" aria-labelledby="status-drafts">
    <div class="panel-h"><h2 id="status-drafts">Status drafts</h2><div class="acts"><button class="btn btn-primary btn-sm" data-a="draftStatus" data-id="${p.id}">${ic('sparkles', 13)}Draft status</button></div></div>
    <div class="panel-b" style="display:flex;flex-direction:column;gap:14px">
      <p class="muted" style="margin:0;font-size:13px">Two drafts are written from this matter. Review them, then copy the one you want. This app does not send either draft.</p>
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
