export async function downloadReport(elementId, filename = "planora-report.pdf") {
  const element = document.getElementById(elementId);
  if (!element) { window.print(); return; }

  // Reveal hidden AI tab panels for full capture
  const hiddenPanels = [...element.querySelectorAll(".ai-tab-panel")];
  const prevPanelDisplay = hiddenPanels.map((p) => p.style.display);
  hiddenPanels.forEach((p) => { p.style.display = "block"; });

  // Reveal rec bodies
  const recBodies = [...element.querySelectorAll(".ai-rec-body")];
  const prevRecDisplay = recBodies.map((r) => r.style.display);
  recBodies.forEach((r) => { r.style.display = "block"; });

  // Unwrap cashflow horizontal scroll
  const track = element.querySelector(".cashflow-cards-track");
  const prevTrack = track ? { overflow: track.style.overflowX, wrap: track.style.flexWrap } : null;
  if (track) { track.style.overflowX = "visible"; track.style.flexWrap = "wrap"; }

  // Hide interactive chrome
  const toHide = [
    ...element.querySelectorAll(".ai-chat-panel, .ai-tab-nav, .zoom-controls, .chart-toolbar button, .dashboard-actions, .ai-header-actions"),
  ];
  const prevHideDisplay = toHide.map((el) => el.style.display);
  toHide.forEach((el) => { el.style.display = "none"; });

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#f7f9fc",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = pw / canvas.width;
    const sh = canvas.height * ratio;

    let pageY = 0;
    let remaining = sh;
    pdf.addImage(imgData, "JPEG", 0, pageY, pw, sh);
    remaining -= ph;
    while (remaining > 0) {
      pageY -= ph;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, pageY, pw, sh);
      remaining -= ph;
    }

    pdf.save(filename);
  } catch (err) {
    console.error("PDF generation failed, falling back to print:", err);
    window.print();
  } finally {
    hiddenPanels.forEach((p, i) => { p.style.display = prevPanelDisplay[i]; });
    recBodies.forEach((r, i) => { r.style.display = prevRecDisplay[i]; });
    if (track && prevTrack) { track.style.overflowX = prevTrack.overflow; track.style.flexWrap = prevTrack.wrap; }
    toHide.forEach((el, i) => { el.style.display = prevHideDisplay[i]; });
  }
}
