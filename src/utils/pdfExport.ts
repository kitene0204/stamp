import { jsPDF } from 'jspdf';
import { LayoutResult, LayoutSettings } from '../types';
import { A4_HEIGHT_MM, A4_WIDTH_MM } from './layoutEngine';

export async function exportLayoutToPdf(
  layoutResult: LayoutResult,
  settings: LayoutSettings,
  fileName: string = 'Pop-Stamp-Print.pdf'
): Promise<void> {
  const isPortrait = settings.paperOrientation === 'portrait';
  const orientation = isPortrait ? 'p' : 'l';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = isPortrait ? A4_WIDTH_MM : A4_HEIGHT_MM;
  const pageHeight = isPortrait ? A4_HEIGHT_MM : A4_WIDTH_MM;

  for (let pIdx = 0; pIdx < layoutResult.pages.length; pIdx++) {
    if (pIdx > 0) {
      doc.addPage('a4', orientation);
    }

    const page = layoutResult.pages[pIdx];

    // Optional Calibration ruler in header
    if (settings.showCalibrationCheckBar) {
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.2);
      
      const rulerX = pageWidth - 65;
      const rulerY = 5;
      doc.line(rulerX, rulerY, rulerX + 50, rulerY);
      
      // Ruler ticks
      for (let mm = 0; mm <= 50; mm += 5) {
        const tickH = mm % 10 === 0 ? 2.5 : 1.5;
        doc.line(rulerX + mm, rulerY, rulerX + mm, rulerY + tickH);
      }
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text('50mm 실측 확인 자 (100% 인쇄 검증)', rulerX, rulerY + 5.5);
    }

    // Page number and info
    if (settings.showPageInfo) {
      doc.setFontSize(6);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `Pop-Stamp Print Master | Page ${pIdx + 1} of ${layoutResult.totalPages} | Stamps: ${page.stamps.length}`,
        10,
        5.5
      );
    }

    // Render stamps
    for (const item of page.stamps) {
      const { stamp, xMm, yMm, widthMm, heightMm } = item;
      const imgSrc = stamp.processedImageUrl || stamp.imageUrl;

      // Draw image
      try {
        doc.addImage(imgSrc, 'PNG', xMm, yMm, widthMm, heightMm);
      } catch (err) {
        console.warn('PDF image add warning:', err);
      }

      // Draw cut guides if enabled
      if (stamp.showCutGuide && settings.showCutLines) {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.15);

        const margin = stamp.cutGuideMarginMm;
        const boxX = xMm - margin;
        const boxY = yMm - margin;
        const boxW = widthMm + margin * 2;
        const boxH = heightMm + margin * 2;

        if (stamp.shape === 'circle') {
          const radius = Math.min(boxW, boxH) / 2;
          const cx = boxX + boxW / 2;
          const cy = boxY + boxH / 2;
          doc.circle(cx, cy, radius, 'S');
        } else if (stamp.shape === 'rounded') {
          doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'S');
        } else {
          doc.rect(boxX, boxY, boxW, boxH, 'S');
        }
      }
    }
  }

  doc.save(fileName);
}
