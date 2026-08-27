import { LayoutResult, LayoutSettings, PlacedStamp, StampItem } from '../types';

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const MM_TO_PX = 96 / 25.4; // 3.779527559px per mm at 96 DPI

export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  pageMarginMm: {
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
  },
  itemSpacingMm: 30, // 3cm (30mm) 좌우/상하 여유 간격
  spacingMode: 'custom', // 30mm (3cm) 고정 간격 모드
  padSpacingRatio: 1.5,
  horizontalSpacingMm: 30, // 3cm (30mm)
  verticalSpacingMm: 30, // 3cm (30mm)
  alignment: 'pack',
  showRuler: true,
  showCalibrationCheckBar: true,
  showCutLines: false, // 기본값: 테두리선(재단선) 미표시
  showPageInfo: true,
  paperOrientation: 'portrait',
};

export function calculateA4Layout(
  stamps: StampItem[],
  settings: LayoutSettings = DEFAULT_LAYOUT_SETTINGS
): LayoutResult {
  const isPortrait = settings.paperOrientation === 'portrait';
  const pageWidth = isPortrait ? A4_WIDTH_MM : A4_HEIGHT_MM;
  const pageHeight = isPortrait ? A4_HEIGHT_MM : A4_WIDTH_MM;

  const { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight } =
    settings.pageMarginMm;

  const printableWidth = Math.max(10, pageWidth - marginLeft - marginRight);
  const printableHeight = Math.max(10, pageHeight - marginTop - marginBottom);

  // Flatten all copies of each stamp item
  const instancesToPlace: { stamp: StampItem; copyIndex: number }[] = [];
  for (const stamp of stamps) {
    const count = Math.max(1, stamp.copies || 1);
    for (let c = 0; c < count; c++) {
      instancesToPlace.push({ stamp, copyIndex: c });
    }
  }

  if (instancesToPlace.length === 0) {
    return {
      pages: [
        {
          pageIndex: 0,
          stamps: [],
          utilizationPercent: 0,
        },
      ],
      totalStampsCount: 0,
      totalPages: 1,
      overflowStampsCount: 0,
    };
  }

  const pages: {
    pageIndex: number;
    stamps: PlacedStamp[];
    utilizationPercent: number;
  }[] = [];

  let currentPageIndex = 0;
  let currentStamps: PlacedStamp[] = [];
  let cursorX = marginLeft;
  let cursorY = marginTop;
  let currentRowHeight = 0;
  let currentRowMaxVGap = 0;
  let currentOccupiedArea = 0;

  for (let i = 0; i < instancesToPlace.length; i++) {
    const { stamp, copyIndex } = instancesToPlace[i];
    
    // Total bounding width and height including cut guide margin if active
    const extraMargin = stamp.showCutGuide ? stamp.cutGuideMarginMm * 2 : 0;
    const itemTotalWidth = stamp.widthMm + extraMargin;
    const itemTotalHeight = stamp.heightMm + extraMargin;

    // Calculate dynamic spacing: either pad-size (stamp width/height) or fixed custom mm (default 30mm / 3cm)
    const hGap =
      settings.spacingMode === 'pad-size'
        ? Math.max(20, stamp.widthMm * (settings.padSpacingRatio ?? 1.5))
        : Math.max(1, settings.horizontalSpacingMm ?? settings.itemSpacingMm ?? 30);

    const vGap =
      settings.spacingMode === 'pad-size'
        ? Math.max(20, stamp.heightMm * (settings.padSpacingRatio ?? 1.5))
        : Math.max(1, settings.verticalSpacingMm ?? settings.itemSpacingMm ?? 30);

    // Check if item exceeds printable page bounds entirely
    const canFitWidth = itemTotalWidth <= printableWidth;
    const canFitHeight = itemTotalHeight <= printableHeight;

    if (!canFitWidth || !canFitHeight) {
      console.warn(`Stamp ${stamp.name} (${itemTotalWidth}x${itemTotalHeight}mm) exceeds printable area`);
    }

    // Check if we need to wrap to the next row
    if (cursorX + itemTotalWidth > marginLeft + printableWidth && cursorX > marginLeft) {
      cursorX = marginLeft;
      cursorY += currentRowHeight + currentRowMaxVGap;
      currentRowHeight = 0;
      currentRowMaxVGap = 0;
    }

    // Check if we need to wrap to the next page
    if (cursorY + itemTotalHeight > marginTop + printableHeight && currentStamps.length > 0) {
      // Finalize current page
      const printableArea = printableWidth * printableHeight;
      const utilPercent = Math.min(100, Math.round((currentOccupiedArea / printableArea) * 100));
      
      pages.push({
        pageIndex: currentPageIndex,
        stamps: currentStamps,
        utilizationPercent: utilPercent,
      });

      // Start new page
      currentPageIndex++;
      currentStamps = [];
      cursorX = marginLeft;
      cursorY = marginTop;
      currentRowHeight = 0;
      currentRowMaxVGap = 0;
      currentOccupiedArea = 0;
    }

    // Place stamp
    const placed: PlacedStamp = {
      instanceId: `${stamp.id}-${copyIndex}-${Date.now()}-${i}`,
      stampId: stamp.id,
      stamp,
      xMm: cursorX,
      yMm: cursorY,
      widthMm: stamp.widthMm,
      heightMm: stamp.heightMm,
      pageIndex: currentPageIndex,
      indexInPage: currentStamps.length,
    };

    currentStamps.push(placed);
    currentOccupiedArea += stamp.widthMm * stamp.heightMm;

    // Update cursor & row height
    cursorX += itemTotalWidth + hGap;
    if (itemTotalHeight > currentRowHeight) {
      currentRowHeight = itemTotalHeight;
    }
    if (vGap > currentRowMaxVGap) {
      currentRowMaxVGap = vGap;
    }
  }

  // Push final page
  if (currentStamps.length > 0 || pages.length === 0) {
    const printableArea = printableWidth * printableHeight;
    const utilPercent = Math.min(100, Math.round((currentOccupiedArea / printableArea) * 100));
    pages.push({
      pageIndex: currentPageIndex,
      stamps: currentStamps,
      utilizationPercent: utilPercent,
    });
  }

  return {
    pages,
    totalStampsCount: instancesToPlace.length,
    totalPages: pages.length,
    overflowStampsCount: 0,
  };
}
