export type StampShape = 'circle' | 'rectangle' | 'rounded' | 'oval';

export interface ImageFilterSettings {
  binarize: boolean;
  threshold: number; // 0 to 255 (default ~128)
  invert: boolean;
  removeBg: boolean;
  removeBgTolerance: number; // 0 to 100
  contrast: number; // 0 to 200 (100 = default)
  brightness: number; // -100 to 100 (0 = default)
}

export interface StampItem {
  id: string;
  name: string;
  imageUrl: string; // Base64 or object URL
  processedImageUrl?: string; // Filtered Base64 for print/display
  originalWidth: number; // in pixels
  originalHeight: number; // in pixels
  aspectRatio: number; // width / height
  
  // Dimensions in Millimeters (mm)
  widthMm: number; // Range 1.5 ~ 50mm
  heightMm: number; // Range 1.5 ~ 50mm
  lockAspectRatio: boolean;
  
  shape: StampShape;
  copies: number; // How many instances to print (1 ~ 500)
  
  // Cut guide line
  showCutGuide: boolean;
  cutGuideColor: string; // e.g. '#94a3b8' or '#ef4444'
  cutGuideStyle: 'solid' | 'dashed' | 'dotted';
  cutGuideMarginMm: number; // margin outside stamp in mm (e.g. 0.5mm ~ 2mm)
  
  filters: ImageFilterSettings;
  
  sourceType: 'upload' | 'preset' | 'text-generator';
  createdAt: number;
}

export interface PageMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface LayoutSettings {
  pageMarginMm: PageMargin; // default 10mm all around
  itemSpacingMm: number; // gap between stamps (e.g. 2mm ~ 30mm)
  spacingMode: 'pad-size' | 'custom'; // 'pad-size': separate by stamp pad width/size (user request), 'custom': fixed mm
  padSpacingRatio: number; // multiplier for pad-size mode (e.g. 1.0 = 100% of pad width)
  horizontalSpacingMm: number; // custom horizontal gap in mm
  verticalSpacingMm: number; // custom vertical gap in mm
  alignment: 'pack' | 'grid' | 'centered';
  showRuler: boolean;
  showCalibrationCheckBar: boolean; // 50mm verification ruler on printed paper
  showCutLines: boolean; // global cut line overlay
  showPageInfo: boolean;
  paperOrientation: 'portrait' | 'landscape';
}

export interface PlacedStamp {
  instanceId: string;
  stampId: string;
  stamp: StampItem;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  pageIndex: number;
  indexInPage: number;
}

export interface LayoutResult {
  pages: {
    pageIndex: number;
    stamps: PlacedStamp[];
    utilizationPercent: number;
  }[];
  totalStampsCount: number;
  totalPages: number;
  overflowStampsCount: number;
}

export interface StandardPadPreset {
  id: string;
  name: string;
  shape: StampShape;
  widthMm: number;
  heightMm: number;
  category: '원형 (Circular)' | '사각 (Rectangular)' | '특수/이름 (Special)';
  description: string;
}
