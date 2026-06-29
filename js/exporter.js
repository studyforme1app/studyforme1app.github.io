/* ---------- 리포트 저장 (이미지 / PDF) ---------- */

/* #report 영역을 캡처한다.
   useCORS 만 사용한다. allowTaint 를 함께 켜면 외부 이미지로 canvas가
   오염되어 toDataURL()이 보안 오류로 실패하므로 절대 병행하지 않는다. */
async function snapshot(el) {
  return await html2canvas(el, {
    scale: 2,
    backgroundColor: "#FAF8FF",
    useCORS: true,
  });
}

function withBusy(button, label, fn) {
  return async () => {
    const orig = button.textContent;
    button.textContent = label;
    button.disabled = true;
    try {
      await fn();
    } catch (e) {
      alert("저장 중 문제가 생겼어요. 표지 이미지가 외부 서버라 일부 환경에서 제한될 수 있어요.");
    } finally {
      button.textContent = orig;
      button.disabled = false;
    }
  };
}

export function bindImageButton(button, reportEl) {
  button.addEventListener(
    "click",
    withBusy(button, "저장 중…", async () => {
      const c = await snapshot(reportEl);
      const a = document.createElement("a");
      a.download = "문제집진단리포트.png";
      a.href = c.toDataURL("image/png");
      a.click();
    })
  );
}

export function bindPdfButton(button, reportEl) {
  button.addEventListener(
    "click",
    withBusy(button, "저장 중…", async () => {
      const c = await snapshot(reportEl);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = 210, ph = 297, iw = pw, ih = (c.height * pw) / c.width;
      let left = ih, pos = 0;
      pdf.addImage(c, "PNG", 0, 0, iw, ih);
      left -= ph;
      while (left > 0) {
        pos -= ph;
        pdf.addPage();
        pdf.addImage(c, "PNG", 0, pos, iw, ih);
        left -= ph;
      }
      pdf.save("문제집진단리포트.pdf");
    })
  );
}
