/* ---------- 데이터 로드 / 매핑 / 검증 ---------- */

import { normalizeLevel } from "./normalize.js";

/* 샘플 데이터 (data/ 에 데이터 파일이 없을 때만 사용하는 폴백) */
export const SAMPLE = [
  ["용선생 15분 한국사 독해 1 (우리 역사의 시작~삼국 시대)", "용선생 15분 독해", "BRICKS 사회평론", "국어", "독해/문해력", 3, 6, "기본 5", 11000, "9791162732779"],
  ["용선생 추론독해 초등 국어 1단계 (1, 2학년 권장)", "용선생 추론독해", "BRICKS 사회평론", "국어", "독해/문해력", 1, 2, "기본 5", 11000, "9791197407000"],
  ["용선생 추론독해 초등 국어 2단계 (2, 3학년 권장)", "용선생 추론독해", "BRICKS 사회평론", "국어", "독해/문해력", 2, 3, "기본 5", 11000, "9791197407017"],
  ["용선생 추론독해 초등 국어 3단계 (3, 4학년 권장)", "용선생 추론독해", "BRICKS 사회평론", "국어", "독해/문해력", 3, 4, "기본 5", 12000, "9791197407024"],
  ["용선생 추론독해 초등 국어 4단계 (4, 5학년 권장)", "용선생 추론독해", "BRICKS 사회평론", "국어", "독해/문해력", 4, 5, "기본 5", 12000, "9791197407031"],
  ["용선생 추론독해 초등 국어 5단계 (5, 6학년 권장)", "용선생 추론독해", "BRICKS 사회평론", "국어", "독해/문해력", 5, 6, "기본 5", 12000, "9791197407048"],
  ["용선생 추론독해 초등 국어 6단계 (6학년, 예비 중등 권장)", "용선생 추론독해", "BRICKS 사회평론", "국어", "독해/문해력", 6, 6, "기본 5", 12000, "9791197407055"],
  ["ERI 독해가 문해력이다 3단계 기본 (초등 3~4학년 권장)", "EBS 초등 ERI 독해가 문해력이다", "EBS", "국어", "독해/문해력", 3, 4, "기본 4", 12000, "9788954759687"],
  ["EBS랑 홈스쿨 초등 영어 초등 영독해 Level 1 (2025)", "EBS랑 홈스쿨 초등 영어", "EBS", "영어", "독해", 3, 3, "기본 2", 7200, "9788954755863"],
  ["EBS랑 홈스쿨 초등 영어 초등 영독해 Level 2 (2025)", "EBS랑 홈스쿨 초등 영어", "EBS", "영어", "독해", 4, 4, "기본 2", 7200, "9788954755870"],
  ["EBS랑 홈스쿨 초등 영어 초등 영독해 Level 3 (2025)", "EBS랑 홈스쿨 초등 영어", "EBS", "영어", "독해", 5, 5, "기본 2", 7200, "9788954755887"],
  ["MY VOCA COACH 중학 입문 (2025)", "MY VOCA COACH 중학", "EBS", "영어", "어휘", 7, 7, "중위 3", 11000, "9788954761598"],
  ["MY VOCA COACH 중학 기본 (2025)", "MY VOCA COACH 중학", "EBS", "영어", "어휘", 8, 8, "중위 2", 11000, "9788954761604"],
  ["MY VOCA COACH 중학 실력 (2025)", "MY VOCA COACH 중학", "EBS", "영어", "어휘", 9, 9, "상위 2", 11000, "9788954761611"],
  ["MY GRAMMAR COACH 기초편", "MY GRAMMAR COACH", "EBS", "영어", "문법", 7, 7, "중위 3", 9000, "9788954761628"],
  ["MY GRAMMAR COACH 표준편", "MY GRAMMAR COACH", "EBS", "영어", "문법", 8, 8, "중위 4", 13000, "9788954761635"],
  ["EBS 중학 영어듣기 능력평가 완벽대비 중1", "EBS 중학 영어듣기 능력평가 완벽대비", "EBS", "영어", "듣기", 7, 7, "중위 3", 10500, "9788954770767"],
  ["EBS 중학 영어듣기 능력평가 완벽대비 중2", "EBS 중학 영어듣기 능력평가 완벽대비", "EBS", "영어", "듣기", 8, 8, "중위 3", 10500, "9788954770750"],
  ["EBS 중학 영어듣기 능력평가 완벽대비 중3", "EBS 중학 영어듣기 능력평가 완벽대비", "EBS", "영어", "듣기", 9, 9, "중위 3", 10500, "9788954770774"],
].map((r) => ({
  title: r[0], series: r[1], publisher: r[2], subject: r[3], subject_detail: r[4],
  grade_min: r[5], grade_max: r[6], semester: "", level: r[7], price: r[8],
  image_url: "http://biblio.booxen.com/IMG_ISBN13/" + r[9] + "_L.jpg", isbn: r[9],
}));

/* 자동 로드/직접 업로드 공용 매핑 — 컬럼명 한/영 모두 수용 */
export function mapRows(rows) {
  return rows
    .map((r) => ({
      title: r.title || r.제목 || "",
      series: r.series || r.시리즈 || "",
      publisher: r.publisher || r.출판사 || "",
      subject: r.subject || r.과목 || "",
      subject_detail: r.subject_detail || r.세부과목 || "",
      grade_min: +(r.grade_min || r.grade || 1),
      grade_max: +(r.grade_max || r.grade || r.grade_min || 12),
      semester: ("" + (r.semester || r.학기 || "")).trim(),
      level: r.level || r.난이도 || "기본",
      price: +("" + (r.price || 0)).replace(/[^0-9]/g, ""),
      image_url: r.image_url || r.이미지 || "",
      isbn: r.isbn || "",
    }))
    .filter((b) => b.title && b.subject);
}

/* 데이터 품질 검증 — 미해석 난이도, 학년 역전 등을 집계해 가시화한다. */
export function validateData(books) {
  let unresolved = 0, gradeIssues = 0;
  for (const b of books) {
    if (!normalizeLevel(b.level).resolved) unresolved++;
    if (b.grade_min > b.grade_max) gradeIssues++;
  }
  return { count: books.length, unresolved, gradeIssues, warnings: unresolved + gradeIssues };
}

/* 레포에 올린 데이터 파일 자동 로드 (data/ 폴더 우선) */
const DATA_FILES = [
  "data/workbooks.csv", "data/books.csv", "data/data.csv",
  "data/workbooks.xlsx", "data/books.xlsx", "data/data.xlsx",
  // 하위호환: 루트에 둔 경우도 시도
  "workbooks.csv", "books.csv", "data.csv",
];

export async function autoLoad() {
  for (const name of DATA_FILES) {
    try {
      const res = await fetch(name + "?v=" + Date.now()); // 캐시 우회
      if (!res.ok) continue;
      let rows = [];
      if (name.toLowerCase().endsWith(".csv")) {
        rows = Papa.parse(await res.text(), { header: true, skipEmptyLines: true }).data;
      } else {
        const wb = XLSX.read(await res.arrayBuffer(), { type: "array" });
        rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      }
      const mapped = mapRows(rows);
      if (mapped.length) return { mapped, label: name.replace(/^data\//, "") };
    } catch (e) {
      /* 없으면 다음 후보 시도 */
    }
  }
  return null; // 아무 파일도 없으면 호출부에서 샘플 유지
}

/* 파일 직접 업로드 → 매핑된 행 배열 반환 */
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let rows = [];
        if (ext === "csv") {
          rows = Papa.parse(ev.target.result, { header: true, skipEmptyLines: true }).data;
        } else {
          const wb = XLSX.read(ev.target.result, { type: "binary" });
          rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        }
        resolve(mapRows(rows));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("파일을 읽지 못했어요."));
    if (ext === "csv") reader.readAsText(file, "UTF-8");
    else reader.readAsBinaryString(file);
  });
}
