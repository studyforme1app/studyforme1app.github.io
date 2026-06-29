/* ---------- 자가진단 UI + 분석 텍스트 ---------- */

import { SELF, GOALS, gradeLabel } from "./constants.js";

export function subjectsInData(data) {
  return [...new Set(data.map((b) => b.subject).filter(Boolean))];
}

/* 한 과목의 세부영역 목록(빈도순, 최대 limit개) */
export function detailsForSubject(data, subject, limit = 8) {
  const freq = {};
  data.forEach((b) => {
    if (b.subject === subject && b.subject_detail) {
      freq[b.subject_detail] = (freq[b.subject_detail] || 0) + 1;
    }
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([d]) => d);
}

/* 과목 칩 */
export function renderSubjectChips(box, data, state, onChange) {
  box.innerHTML = "";
  subjectsInData(data).forEach((s) => {
    const c = document.createElement("div");
    c.className = "chip" + (state.selectedSubjects.has(s) ? " on" : "");
    c.textContent = s;
    c.setAttribute("role", "button");
    c.setAttribute("tabindex", "0");
    c.setAttribute("aria-pressed", state.selectedSubjects.has(s) ? "true" : "false");
    const toggle = () => {
      if (state.selectedSubjects.has(s)) {
        state.selectedSubjects.delete(s);
        delete state.selfLevels[s];
        delete state.detailLevels[s];
      } else {
        state.selectedSubjects.add(s);
        state.selfLevels[s] = 1;
      }
      onChange();
    };
    c.onclick = toggle;
    c.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    };
    box.appendChild(c);
  });
}

/* 학습 목적 세그먼트 */
export function renderGoal(box, state, onChange) {
  box.innerHTML = "";
  GOALS.forEach((g) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "segBtn" + (state.goal === g.k ? " on" : "");
    b.setAttribute("aria-pressed", state.goal === g.k ? "true" : "false");
    b.innerHTML = `${g.name}<small>${g.desc}</small>`;
    b.onclick = () => { state.goal = g.k; onChange(); };
    box.appendChild(b);
  });
}

// 레벨 버튼 한 줄을 만든다. cur=현재값, onPick(level)
function levelRow(cur, onPick) {
  const lv = document.createElement("div");
  lv.className = "levels";
  SELF.forEach((o) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lvBtn" + (cur === o.k ? " on" : "");
    b.dataset.lv = o.k;
    b.setAttribute("aria-pressed", cur === o.k ? "true" : "false");
    b.innerHTML = `${o.name}<small>${o.desc}</small>`;
    b.onclick = () => onPick(o.k);
    lv.appendChild(b);
  });
  return lv;
}

/* 과목별 현재 수준 + (선택) 세부영역 진단 */
export function renderSA(panel, list, state, data, onChange) {
  if (state.selectedSubjects.size === 0) {
    panel.style.display = "none";
    return;
  }
  panel.style.display = "block";
  list.innerHTML = "";

  [...state.selectedSubjects].forEach((s) => {
    const row = document.createElement("div");
    row.className = "saRow";
    row.innerHTML = `<div class="sName">${s}</div>`;
    row.appendChild(levelRow(state.selfLevels[s], (k) => { state.selfLevels[s] = k; onChange(); }));

    if (state.detailMode) {
      const details = detailsForSubject(data, s);
      if (details.length) {
        const focus = (state.detailLevels[s] = state.detailLevels[s] || {});
        const chips = document.createElement("div");
        chips.className = "chips";
        chips.style.marginTop = "10px";
        details.forEach((d) => {
          const c = document.createElement("div");
          const on = d in focus;
          c.className = "chip" + (on ? " on" : "");
          c.style.fontSize = "12px";
          c.textContent = d;
          c.onclick = () => {
            if (d in focus) delete focus[d];
            else focus[d] = state.selfLevels[s]; // 과목 수준을 기본값으로
            onChange();
          };
          chips.appendChild(c);
        });
        row.appendChild(chips);

        Object.keys(focus).forEach((d) => {
          const sub = document.createElement("div");
          sub.style.margin = "8px 0 2px";
          sub.style.fontSize = "12px";
          sub.style.fontWeight = "700";
          sub.style.color = "var(--muted)";
          sub.textContent = "└ " + d;
          row.appendChild(sub);
          row.appendChild(levelRow(focus[d], (k) => { focus[d] = k; onChange(); }));
        });
      }
    }
    list.appendChild(row);
  });
}

/* 진단 대상 평탄화: 세부영역을 골랐으면 그 단위, 아니면 과목 단위.
   반환: [{ subject, detail|null, label, selfLv }] */
export function buildItems(state) {
  const items = [];
  [...state.selectedSubjects].forEach((s) => {
    const focus = state.detailLevels[s];
    if (state.detailMode && focus && Object.keys(focus).length) {
      Object.entries(focus).forEach(([d, lv]) => {
        items.push({ subject: s, detail: d, label: `${s} · ${d}`, selfLv: lv });
      });
    } else {
      items.push({ subject: s, detail: null, label: s, selfLv: state.selfLevels[s] });
    }
  });
  return items;
}

/* 진단 분석 문구 — items 기반 */
export function buildAnalysis(items, grade) {
  const out = [];
  const sorted = [...items].sort((a, b) => b.selfLv - a.selfLv);
  const top = sorted[0];
  const low = sorted[sorted.length - 1];

  out.push(`현재 <b>${gradeLabel(grade)}</b> 기준으로 <b>${items.length}개 영역</b>을 진단했어요.`);

  if (items.length > 1 && top.selfLv !== low.selfLv) {
    out.push(`<b>${top.label}</b>은(는) 상대적으로 강점, <b>${low.label}</b>은(는) 보완이 필요해 보여요.`);
  }
  const needBase = items.filter((i) => i.selfLv <= 1);
  if (needBase.length) {
    out.push(`${needBase.map((i) => `<b>${i.label}</b>`).join(", ")}은(는) <b>기초·기본 난이도</b>부터 차근차근 권해요.`);
  }
  const adv = items.filter((i) => i.selfLv >= 3);
  if (adv.length) {
    out.push(`${adv.map((i) => `<b>${i.label}</b>`).join(", ")}은(는) <b>상위·최상위 난이도</b>로 한 단계 도전해볼 만해요.`);
  }
  return out;
}
