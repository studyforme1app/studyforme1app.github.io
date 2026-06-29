/* ---------- 추천 로직 ---------- */

import { normalizeLevel } from "./normalize.js";
import { SELF } from "./constants.js";

/* 책 한 권을 (학년, 자가수준, 옵션)에 대해 점수화한다.
   opts = { preferredDetail?:string, goal?:"basic"|"advanced"|"balanced", limit?:number } */
export function scoreBook(b, grade, selfLv, opts = {}) {
  // 1) 학년 적합도
  let gradeScore;
  if (grade >= b.grade_min && grade <= b.grade_max) {
    gradeScore = 1;
  } else {
    const d = Math.min(Math.abs(grade - b.grade_min), Math.abs(grade - b.grade_max));
    if (d >= 3) return null; // 너무 동떨어진 학년 제외
    gradeScore = Math.max(0, 1 - d * 0.35);
  }

  // 2) 난이도(tier) 적합도
  const lv = normalizeLevel(b.level);
  const bt = lv.tier;
  const diff = Math.abs(bt - selfLv);
  if (diff >= 3) return null; // 너무 동떨어진 난이도 제외
  const lvScore = Math.max(0, 1 - diff * 0.3);

  // 3) 가점: 세부과목 일치 / 학습 목적
  const detailBonus =
    opts.preferredDetail && b.subject_detail === opts.preferredDetail ? 0.08 : 0;
  let goalAdj = 0;
  if (opts.goal === "advanced" && bt > selfLv) goalAdj = 0.07;
  if (opts.goal === "basic" && bt <= selfLv) goalAdj = 0.07;

  const total = Math.round(
    Math.min(1, gradeScore * 0.55 + lvScore * 0.45 + detailBonus + goalAdj) * 100
  );
  return { ...b, _score: total, _diff: diff, _tier: bt, _strength: lv.strength };
}

export function recommend(books, grade, subject, selfLv, opts = {}) {
  return books
    .filter((b) => b.subject === subject)
    .filter((b) => !opts.detail || b.subject_detail === opts.detail)
    .map((b) => scoreBook(b, grade, selfLv, opts))
    .filter(Boolean)
    .sort((a, b) => b._score - a._score || a._strength - b._strength)
    .slice(0, opts.limit || 6);
}

export function whyText(b, selfLv, grade) {
  const parts = [];
  if (grade >= b.grade_min && grade <= b.grade_max) parts.push("현재 학년에 딱 맞아요");
  else parts.push("학년대가 비슷해요");

  if (b._diff === 0) parts.push(`<b>${SELF[selfLv].name}</b> 수준에 정확히 맞는 난이도`);
  else if (b._tier > selfLv) parts.push("한 단계 도전용으로 적합");
  else parts.push("기초를 다지기 좋은 난이도");

  if (b.subject_detail) parts.push(b.subject_detail);
  return parts.join(" · ");
}
