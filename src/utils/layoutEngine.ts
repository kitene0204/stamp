import { LayoutResult, LayoutSettings, PlacedStamp, StampItem } from '../types';

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const MM_TO_PX = 96 / 25.4; // 3.779527559px per mm at 96 DPI

export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  pageMarginMm: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
  itemSpacingMm: 3,
  alignment: 'pack',
  showRuler: true,
  showCalibrationCheckBar: true,
  showCutLines: true,
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
  const spacing = Math.max(0.5, settings.itemSpacingMm);

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
  let currentOccupiedArea = 0;

  for (let i = 0; i < instancesToPlace.length; i++) {
    const { stamp, copyIndex } = instancesToPlace[i];
    
    // Total bounding width and height including cut guide margin if active
    const extraMargin = stamp.showCutGuide ? stamp.cutGuideMarginMm * 2 : 0;
    const itemTotalWidth = stamp.widthMm + extraMargin;
    const itemTotalHeight = stamp.heightMm + extraMargin;

    // Check if item exceeds printable page bounds entirely
    const canFitWidth = itemTotalWidth <= printableWidth;
    const canFitHeight = itemTotalHeight <= printableHeight;

    if (!canFitWidth || !canFitHeight) {
      // Force clamp to printable area for layout
      console.warn(`Stamp ${stamp.name} (${itemTotalWidth}x${itemTotalHeight}mm) exceeds printable area`);
    }

    // Check if we need to wrap to the next row
    if (cursorX + itemTotalWidth > marginLeft + printableWidth && cursorX > marginLeft) {
      cursorX = marginLeft;
      cursorY += currentRowHeight + spacing;
      currentRowHeight = 0;
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
    cursorX += itemTotalWidth + spacing;
    if (itemTotalHeight > currentRowHeight) {
      currentRowHeight = itemTotalHeight;
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
