/* ---------- 공용 상수 / 헬퍼 ---------- */

// 난이도 등급(책) — 자가진단(SELF)과 동일한 0~4 축을 공유한다.
export const TIERS = ["기초", "기본", "중위", "상위", "최상위"]; // 0~4

// 자가진단 5단계 — TIERS와 의미·인덱스를 1:1로 맞춘다.
export const SELF = [
  { k: 0, name: "기초",   desc: "아직 어려워요" },
  { k: 1, name: "기본",   desc: "기본은 알아요" },
  { k: 2, name: "중위",   desc: "곧잘 해요" },
  { k: 3, name: "상위",   desc: "잘해요" },
  { k: 4, name: "최상위", desc: "아주 잘해요" },
];

// 학습 목적(추천 정렬 보조 입력)
export const GOALS = [
  { k: "balanced", name: "기본 추천", desc: "현재 수준에 맞춰" },
  { k: "basic",    name: "기초 보충", desc: "부족한 부분부터" },
  { k: "advanced", name: "심화 도전", desc: "한 단계 위로" },
];

export function gradeLabel(g) {
  g = +g;
  if (g <= 6) return "초등 " + g + "학년";
  if (g <= 9) return "중학 " + (g - 6) + "학년";
  return "고등 " + (g - 9) + "학년";
}

export const won = (n) => (+n || 0).toLocaleString("ko-KR") + "원";

// http 표지를 https로 안전하게 불러오기 위한 이미지 프록시 (mixed-content/CORS 회피)
export function proxied(url) {
  if (!url) return "";
  if (/^https:\/\//i.test(url)) return url; // 이미 https면 그대로
  const stripped = url.replace(/^https?:\/\//i, "");
  return "https://images.weserv.nl/?url=" + encodeURIComponent(stripped);
}
