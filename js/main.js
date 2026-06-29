/* ---------- 진입점: 상태 관리 + 이벤트 바인딩 ---------- */

import { gradeLabel } from "./constants.js";
import { SAMPLE, validateData, autoLoad, parseFile } from "./data.js";
import {
  renderSubjectChips, renderSA, renderGoal, buildItems, buildAnalysis,
} from "./diagnose.js";
import { renderRadar, renderRecommendations, emptyMsg } from "./report.js";
import { recommend } from "./recommend.js";
import { bindImageButton, bindPdfButton } from "./exporter.js";

/* ---------- 상태 ---------- */
const state = {
  DATA: SAMPLE.slice(),
  selectedSubjects: new Set(),
  selfLevels: {},     // subject -> 0..4
  detailMode: false,
  detailLevels: {},   // subject -> { detail -> 0..4 }
  goal: "balanced",
};
let radarChart = null;

/* ---------- DOM 참조 ---------- */
const el = {};
[
  "gradeSel", "subjectChips", "goalSeg", "saPanel", "saList", "detailToggle",
  "runBtn", "dataStat", "fileInput", "emptyState", "report", "rGrade", "rDate",
  "radar", "analysisList", "recoSections", "imgBtn", "pdfBtn", "stepper",
].forEach((id) => (el[id] = document.getElementById(id)));

/* ---------- 초기화 ---------- */
for (let g = 1; g <= 12; g++) {
  const o = document.createElement("option");
  o.value = g;
  o.textContent = gradeLabel(g);
  if (g === 3) o.selected = true;
  el.gradeSel.appendChild(o);
}

function updateStepper(diagnosed) {
  const done = {
    1: state.DATA.length > 0,
    2: state.selectedSubjects.size > 0,
    3: state.selectedSubjects.size > 0, // 수준은 기본값이 있어 과목 선택과 동일 시점
    4: !!diagnosed,
  };
  el.stepper.querySelectorAll(".st").forEach((st) => {
    const n = +st.dataset.step;
    st.classList.toggle("done", !!done[n]);
  });
}

function updateRunState() {
  el.runBtn.disabled = state.selectedSubjects.size === 0;
}

// 입력 영역 전체를 다시 그린다.
function refresh() {
  renderSubjectChips(el.subjectChips, state.DATA, state, refresh);
  renderGoal(el.goalSeg, state, refresh);
  renderSA(el.saPanel, el.saList, state, state.DATA, refresh);
  updateRunState();
  updateStepper(false);
}

function setData(mapped, label) {
  state.DATA = mapped;
  state.selectedSubjects.clear();
  state.selfLevels = {};
  state.detailLevels = {};
  const v = validateData(mapped);
  el.dataStat.textContent =
    `${label} ${v.count}권 사용 중` + (v.warnings ? ` · 검토 필요 ${v.warnings}건` : "");
  if (v.warnings) {
    console.warn(
      `[StudyForMe] 데이터 검토 필요: 난이도 미해석 ${v.unresolved}건, 학년 역전 ${v.gradeIssues}건`
    );
  }
  refresh();
}

/* ---------- 입력 이벤트 ---------- */
el.detailToggle.addEventListener("change", (e) => {
  state.detailMode = e.target.checked;
  refresh();
});

el.fileInput.addEventListener("change", async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const mapped = await parseFile(f);
    if (!mapped.length) {
      alert("인식된 행이 없어요. 컬럼명을 확인해주세요.");
      return;
    }
    setData(mapped, "업로드 데이터");
  } catch (err) {
    alert("파일을 읽지 못했어요: " + err.message);
  }
});

/* ---------- 진단 실행 ---------- */
el.runBtn.addEventListener("click", () => {
  const grade = +el.gradeSel.value;
  const items = buildItems(state);
  const opts = { goal: state.goal };

  el.emptyState.style.display = "none";
  el.report.style.display = "block";
  el.rGrade.textContent = gradeLabel(grade);
  el.rDate.textContent =
    new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) +
    " 기준";

  // 레이더
  const axes = items.map((i) => ({ label: i.label, value: i.selfLv + 1 }));
  radarChart = renderRadar(el.radar, axes, radarChart);

  // 분석
  el.analysisList.innerHTML = "";
  buildAnalysis(items, grade).forEach((h) => {
    const li = document.createElement("li");
    li.innerHTML = h;
    el.analysisList.appendChild(li);
  });

  // 추천 섹션
  const sections = items.map((i) => {
    const o = i.detail ? { ...opts, detail: i.detail, preferredDetail: i.detail } : opts;
    return {
      title: `${i.label} 추천 문제집`,
      selfLv: i.selfLv,
      recos: recommend(state.DATA, grade, i.subject, i.selfLv, o),
      emptyMsg: emptyMsg(i.label, grade, i.selfLv),
    };
  });
  renderRecommendations(el.recoSections, sections, grade);

  updateStepper(true);
  el.report.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ---------- 저장 버튼 ---------- */
bindImageButton(el.imgBtn, el.report);
bindPdfButton(el.pdfBtn, el.report);

/* ---------- 첫 렌더 ---------- */
refresh();
el.dataStat.textContent = "데이터 불러오는 중…";
autoLoad()
  .then((res) => {
    if (res) setData(res.mapped, res.label);
    else el.dataStat.textContent = `샘플 데이터 ${state.DATA.length}권 사용 중`;
  })
  .catch(() => {
    el.dataStat.textContent = `샘플 데이터 ${state.DATA.length}권 사용 중`;
  });
