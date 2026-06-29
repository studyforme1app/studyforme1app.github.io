/* ---------- 결과 리포트 렌더 (레이더 + 추천 카드) ---------- */

import { SELF, gradeLabel, won, proxied } from "./constants.js";
import { whyText } from "./recommend.js";

/* 레이더. axes = [{label, value(1~5)}]. 이전 차트를 받아 파괴 후 재생성. */
export function renderRadar(canvas, axes, prevChart) {
  if (prevChart) prevChart.destroy();
  return new Chart(canvas, {
    type: "radar",
    data: {
      labels: axes.map((a) => a.label),
      datasets: [
        {
          data: axes.map((a) => a.value),
          fill: true,
          backgroundColor: "rgba(101,43,223,.15)",
          borderColor: "#652BDF",
          pointBackgroundColor: "#652BDF",
          borderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1, display: false },
          pointLabels: { font: { size: 11, weight: "700", family: "Pretendard" }, color: "#211A33" },
          grid: { color: "#EAE6F2" },
          angleLines: { color: "#EAE6F2" },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
}

/* 추천 섹션 렌더.
   sections = [{ title, selfLv, recos:[scoredBook], emptyMsg }] */
export function renderRecommendations(wrap, sections, grade) {
  wrap.innerHTML = "";
  sections.forEach((sec) => {
    const box = document.createElement("div");
    box.innerHTML = `<div class="secTitle">${sec.title} <span class="pill">${SELF[sec.selfLv].name} 수준</span></div>`;

    if (!sec.recos.length) {
      box.innerHTML += `<div class="noBook">${sec.emptyMsg}</div>`;
      wrap.appendChild(box);
      return;
    }

    const cards = document.createElement("div");
    cards.className = "cards";
    sec.recos.forEach((b) => {
      const t = b._tier;
      const card = document.createElement("div");
      card.className = "bookCard";
      card.innerHTML = `
        <div class="cover">
          <img src="${proxied(b.image_url)}" alt="" crossorigin="anonymous"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="ph" style="display:none">${b.title}</div>
        </div>
        <div class="body">
          <div class="ser">${b.series || b.publisher || ""}</div>
          <div class="ttl">${b.title}</div>
          <div class="badges">
            <span class="badge t${t}">${(b.level || "").trim()}</span>
            <span class="badge">${b.subject_detail || b.subject}</span>
          </div>
          <div class="why">${whyText(b, sec.selfLv, grade)}</div>
          <div class="price">${won(b.price)}</div>
          <div class="matchbar"><i style="width:${b._score}%"></i></div>
          <div class="matchTxt">적합도 ${b._score}%</div>
        </div>`;
      cards.appendChild(card);
    });
    box.appendChild(cards);
    wrap.appendChild(box);
  });
}

/* 진단에 필요한 빈 결과 메시지 빌더 */
export function emptyMsg(label, grade, selfLv) {
  return `${label} · ${gradeLabel(grade)}·${SELF[selfLv].name} 수준에 딱 맞는 문제집이 아직 없어요. 학년이나 수준을 조금 바꿔보세요.`;
}
