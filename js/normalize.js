/* ---------- 난이도(level) 정규화 ----------
   데이터의 level 컬럼은 인코딩이 혼재한다.
     "기본 3", "중위 2", "최상위 1"  → 등급 단어 + 강도 숫자
     "1", "3" (숫자만), 빈 값          → 등급 단어 없음(미해석)
   이를 {tier:0..4, strength:1..5, raw, resolved} 로 표준화한다.        */

import { TIERS } from "./constants.js";

// 등급 단어가 서로 포함관계("상위" ⊂ "최상위")이므로 긴 단어부터 매칭한다.
const TIERS_BY_LEN = TIERS
  .map((t, i) => ({ t, i }))
  .sort((a, b) => b.t.length - a.t.length);

export function normalizeLevel(level) {
  const raw = (level == null ? "" : "" + level).trim();

  let tier = -1;
  for (const { t, i } of TIERS_BY_LEN) {
    if (raw.includes(t)) { tier = i; break; }
  }

  const numMatch = raw.match(/\d+/);
  const num = numMatch ? +numMatch[0] : null;
  const strength = num != null && num >= 1 && num <= 5 ? num : 3; // 강도 기본값 3

  if (tier >= 0) {
    return { tier, strength, raw, resolved: true };
  }
  // 등급 단어가 없으면 안전하게 '기본'(1)으로 폴백하되 미해석으로 표시한다.
  return { tier: 1, strength, raw, resolved: false };
}

// 기존 tierOf() 대체 (호환용)
export function tierOf(level) {
  return normalizeLevel(level).tier;
}
