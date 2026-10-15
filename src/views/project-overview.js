/* ---------- OVERVIEW ---------- */
import { TODAY, ago, dayBucket, diffD, esc, fmtDate, parse } from '../core/utils.js';
import { ic } from '../core/icons.js';
import { matterTypeName, stageName, STATUSES } from '../core/constants.js';
import { D, S, isOver, mem, pColor, progressOf, task, tasksOf } from '../core/store.js';
import { av, empty, pStatus, practiceNote, stIcon } from '../ui/helpers.js';
import { sortTasks } from '../shell/view-engine.js';
import { actHtml, miniRow } from '../components/task-list.js';
import { statusDraftHtml } from '../features/status-draft.js';

export function projOverview(p) {
  const ts = tasksOf(p.id);
  const pr = progressOf(p.id);
  const cnt = STATUSES.map(s => ({ s, n: ts.filter(t => t.status === s.id).length }));
  const over = ts.filter(isOver);
  const soon = sortTasks(
    ts.filter(t => t.status !== 'done' && t.due),
    { f: 'due', dir: 1 },
  ).slice(0, 6);
  const acts = D()
    .activity.filter(a => a.project === p.id)
    .slice(0, 6);
  const daysLeft = diffD(parse(p.due), TODAY);
  return `<div class="page" style="max-width:1160px;padding-top:22px">
    ${practiceNote()}
    <div class="grid2" style="margin-top:16px">
      <div class="stack">
        <section class="panel"><div class="panel-h"><h2>About</h2><div class="acts"><button class="btn btn-sm btn-ghost" data-a="editProject" data-id="${p.id}">${ic('pencil', 13)}Edit</button></div></div><div class="panel-b" style="font-size:14px;line-height:1.6;color:var(--text)">${esc(p.desc)}</div></section>
        <section class="panel"><div class="panel-h"><h2>Notes</h2></div><div class="panel-b" style="display:flex;flex-direction:column;gap:10px">
          <form class="row" data-submit="addMatterNote" data-id="${p.id}" style="gap:8px"><input class="input grow" id="note-in-${p.id}" data-in="matterNote" data-id="${p.id}" value="${esc(S.ui.noteDraft?.[p.id] || '')}" placeholder="Internal note. It stays on this matter." aria-label="New note"><button class="btn btn-secondary btn-sm" data-a="addMatterNote" data-id="${p.id}">Add</button></form>
          ${(p.notes || []).map(n => `<div class="row" style="align-items:flex-start;gap:8px"><div class="grow"><div style="font-size:13.5px;line-height:1.45">${esc(n.text)}</div><div class="faint" style="font-size:11.5px;margin-top:2px">${ago(n.at)}</div></div><button class="ibtn ibtn-xs" data-a="delMatterNote" data-id="${p.id}" data-nid="${n.id}" aria-label="Remove note">${ic('x', 12)}</button></div>`).join('') || '<span class="faint">No notes yet.</span>'}
        </div></section>
        ${statusDraftHtml(p)}
        <section class="panel"><div class="panel-h"><h2>Progress</h2><div class="acts"><span class="faint" style="font-size:12px">${ts.filter(t => t.status === 'done').length} of ${ts.length} checklist items done</span></div></div>
          <div class="panel-b">
            <div class="row" style="align-items:baseline;gap:10px;margin-bottom:10px"><span style="font-size:30px;font-weight:600;letter-spacing:-.03em" class="num">${pr}%</span><span class="muted">${daysLeft >= 0 ? `${daysLeft} days until ${fmtDate(p.due)}` : `Ended ${fmtDate(p.due)}`}</span>${over.length ? `<span class="badge red">${ic('clock-alert', 11)}${over.length} overdue</span>` : ''}</div>
            <div class="stackbar" style="height:8px;margin-bottom:12px">${cnt.map(c => `<i style="width:${(c.n / Math.max(ts.length, 1)) * 100}%;background:var(--st-${c.s.id})" title="${c.s.name}: ${c.n}"></i>`).join('')}</div>
            <div class="row" style="flex-wrap:wrap;gap:14px;font-size:12.5px">${cnt.map(c => `<button class="row" style="gap:5px" data-a="goFilteredList" data-id="${p.id}" data-st="${c.s.id}">${stIcon(c.s.id, 12)}<span class="muted">${c.s.name}</span><b class="num" style="font-weight:600">${c.n}</b></button>`).join('')}</div>
          </div></section>
        <section class="panel"><div class="panel-h"><h2>Coming up</h2><div class="acts"><button class="btn btn-sm btn-ghost" data-a="go" data-r="project" data-id="${p.id}" data-tab="list">View checklist</button></div></div>${soon.map(t => miniRow(t, { noProj: true })).join('') || empty('circle-check', 'Nothing scheduled', 'Checklist items with due dates will show up here.', '', 'sm')}</section>
      </div>
      <div class="stack">
        <section class="panel"><div class="panel-h"><h2>Details</h2></div><div class="panel-b"><dl class="kv">
          <dt>${ic('circle-dot', 14)}Status</dt><dd><button class="pillbtn" data-a="pop" data-pop="pstatus" data-id="${p.id}">${pStatus(p.status)}</button></dd>
          <dt>${ic('scale', 14)}Type</dt><dd><span class="pillbtn">${esc(matterTypeName(p.matterType))}</span></dd>
          <dt>${ic('milestone', 14)}Stage</dt><dd><span class="pillbtn">${esc(stageName(p.matterType, p.stage))}</span></dd>
          <dt>${ic('user', 14)}Attorney</dt><dd><span class="pillbtn">${av(p.lead, 'sm', false)}${esc(mem(p.lead)?.name || '')}</span></dd>
          <dt>${ic('users', 14)}Parties</dt><dd><span class="pillbtn">${esc((p.parties || []).map(x => `${x.name} · ${x.role}`).join(', ') || 'None')}</span></dd>
          <dt>${ic('landmark', 14)}Jurisdiction</dt><dd><span class="pillbtn">${esc(p.jurisdiction || 'Not set')}</span></dd>
          ${p.matterType === 'probate' || p.court || p.caseNumber ? `<dt>${ic('gavel', 14)}Court</dt><dd><span class="pillbtn">${esc(p.court || 'Not set')}${p.caseNumber ? ` · ${esc(p.caseNumber)}` : ''}</span></dd>` : ''}
          <dt>${ic('calendar', 14)}Opened</dt><dd><span class="pillbtn num">${fmtDate(p.start, true)}</span></dd>
          <dt>${ic('flag', 14)}Target</dt><dd><span class="pillbtn num">${fmtDate(p.due, true)}</span></dd>
          <dt>${ic('pin', 14)}Reminder</dt><dd><input class="input" data-in="matterReminder" data-id="${p.id}" value="${esc(p.reminder || '')}" placeholder="Shown on Home" aria-label="Pinned reminder"></dd>
        </dl></div></section>
        <section class="panel"><div class="panel-h"><h2>Milestones</h2></div><div class="panel-b">${
          (p.milestones || [])
            .map(m => {
              const n = diffD(parse(m.date), TODAY);
              return `<div class="row" style="height:32px;font-size:13px"><span style="width:9px;height:9px;transform:rotate(45deg);border-radius:2px;flex-shrink:0;margin:0 3px;background:${n < 0 ? 'var(--green)' : pColor(p)}"></span><span class="grow trunc ${n < 0 ? 'faint' : ''}">${esc(m.name)}</span><span class="num muted">${fmtDate(m.date)}</span></div>`;
            })
            .join('') || '<span class="faint">No milestones yet</span>'
        }</div></section>
        <section class="panel"><div class="panel-h"><h2>Recent activity</h2><div class="acts"><button class="btn btn-sm btn-ghost" data-a="go" data-r="project" data-id="${p.id}" data-tab="activity">View all</button></div></div><div class="panel-b feed">${acts.map(a => actHtml(a)).join('') || '<span class="faint">No activity yet</span>'}</div></section>
      </div>
    </div>
  </div>`;
}
export function projActivity(p) {
  const as = D().activity.filter(a => a.project === p.id);
  const cs = D()
    .comments.filter(c => task(c.task)?.project === p.id)
    .map(c => ({ id: c.id, by: c.by, verb: 'commented on', task: c.task, project: p.id, at: c.at, extra: '' }));
  const all = [...as, ...cs].sort((a, b) => b.at - a.at);
  const b = {};
  all.forEach(a => (b[dayBucket(a.at)] ||= []).push(a));
  return `<div class="page" style="max-width:780px;padding-top:18px">${
    all.length
      ? Object.entries(b)
          .map(([k, list]) => `<div class="day-h">${k}</div><div class="feed lined">${list.map(a => actHtml(a)).join('')}</div>`)
          .join('')
      : empty('activity', 'No activity yet', 'Changes to this matter will appear here.')
  }</div>`;
}
