import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Grid, 
  Ruler, 
  Layers,
  Sparkles,
  Scissors
} from 'lucide-react';
import { LayoutResult, LayoutSettings, PlacedStamp } from '../types';
import { A4_HEIGHT_MM, A4_WIDTH_MM } from '../utils/layoutEngine';

interface A4PreviewCanvasProps {
  layoutResult: LayoutResult;
  settings: LayoutSettings;
  onUpdateSettings: (settings: LayoutSettings) => void;
  onSelectStamp?: (stampId: string) => void;
}

export const A4PreviewCanvas: React.FC<A4PreviewCanvasProps> = ({
  layoutResult,
  settings,
  onUpdateSettings,
  onSelectStamp,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(0.75); // 75% default for desktop view
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, layoutResult.totalPages);
  const activePageData = layoutResult.pages[currentPage] || layoutResult.pages[0] || {
    pageIndex: 0,
    stamps: [],
    utilizationPercent: 0,
  };

  const isPortrait = settings.paperOrientation === 'portrait';
  const paperWidthMm = isPortrait ? A4_WIDTH_MM : A4_HEIGHT_MM;
  const paperHeightMm = isPortrait ? A4_HEIGHT_MM : A4_WIDTH_MM;

  // Auto-fit calculate on mount/resize
  useEffect(() => {
    if (!autoFit || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          // Standard A4 in 96 DPI pixels is ~ 794px x 1123px
          const a4PxWidth = paperWidthMm * 3.78;
          const a4PxHeight = paperHeightMm * 3.78;
          
          const scaleX = (width - 48) / a4PxWidth;
          const scaleY = (height - 48) / a4PxHeight;
          const bestScale = Math.min(scaleX, scaleY, 1.0);
          setZoomLevel(Math.max(0.3, Math.round(bestScale * 100) / 100));
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoFit, paperWidthMm, paperHeightMm]);

  const handleZoomChange = (delta: number) => {
    setAutoFit(false);
    setZoomLevel((prev) => Math.min(2.0, Math.max(0.3, Math.round((prev + delta) * 10) / 10)));
  };

  const handleResetFit = () => {
    setAutoFit(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/5 rounded-2xl border border-slate-200/80 overflow-hidden shadow-inner">
      {/* Top Toolbar */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 z-10 text-xs">
        {/* Page Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
            A4 미리보기 (실제 인쇄 배치)
          </span>
          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5 whitespace-nowrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
              title="이전 페이지"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700 whitespace-nowrap">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
              title="다음 페이지"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold whitespace-nowrap">
            용지 사용률: {activePageData.utilizationPercent}%
          </span>
        </div>

        {/* View Options & Zoom */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs shrink-0 ml-auto">
          {/* Spacing Selector (3cm / 2cm / Pad) */}
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <span className="text-[10px] text-slate-500 font-semibold px-1 hidden md:inline">도장 간격:</span>
            {[
              { label: '3cm (30mm)', val: 30 },
              { label: '2cm (20mm)', val: 20 },
              { label: '1.5cm', val: 15 },
            ].map((sp) => (
              <button
                key={sp.val}
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    spacingMode: 'custom',
                    itemSpacingMm: sp.val,
                    horizontalSpacingMm: sp.val,
                    verticalSpacingMm: sp.val,
                  })
                }
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all whitespace-nowrap ${
                  settings.spacingMode === 'custom' && settings.itemSpacingMm === sp.val
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                title={`도장 사이 간격을 좌우/상하 ${sp.label}로 설정`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              showGrid
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="10mm 모눈눈금선 토글"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Cutlines Toggle */}
          <button
            onClick={() =>
              onUpdateSettings({ ...settings, showCutLines: !settings.showCutLines })
            }
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              settings.showCutLines
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="재단 가이드 라인 토글"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>

          {/* Zoom In/Out */}
          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5 shrink-0 whitespace-nowrap">
            <button
              onClick={() => handleZoomChange(-0.1)}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="축소"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono px-1 font-semibold text-slate-700 min-w-[38px] text-center whitespace-nowrap">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoomChange(0.1)}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="확대"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetFit}
            className={`px-2 py-1 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 ${
              autoFit
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="화면에 맞추기"
          >
            <Maximize2 className="w-3 h-3 inline-block mr-1" />
            <span className="hidden sm:inline whitespace-nowrap">화면 맞춤</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-200/60 relative"
      >
        {/* Scaled A4 Container */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: autoFit ? 'transform 0.15s ease-out' : 'none',
          }}
          className="relative shadow-2xl transition-shadow shrink-0"
        >
          {/* Exact Physical A4 Dimension Box */}
          <div
            style={{
              width: `${paperWidthMm}mm`,
              height: `${paperHeightMm}mm`,
            }}
            className="bg-white relative border border-slate-300 overflow-hidden select-none"
          >
            {/* Optional 10mm Grid Overlay */}
            {showGrid && (
              <div
                style={{
                  backgroundSize: '10mm 10mm',
                  backgroundImage:
                    'linear-gradient(to right, rgba(200, 210, 225, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(200, 210, 225, 0.4) 1px, transparent 1px)',
                }}
                className="absolute inset-0 pointer-events-none z-0"
              />
            )}

            {/* Printable Margin Indicator */}
            <div
              style={{
                top: `${settings.pageMarginMm.top}mm`,
                bottom: `${settings.pageMarginMm.bottom}mm`,
                left: `${settings.pageMarginMm.left}mm`,
                right: `${settings.pageMarginMm.right}mm`,
              }}
              className="absolute border border-dashed border-slate-300/80 pointer-events-none z-0"
            />

            {/* Header: Calibration check ruler & page info */}
            {settings.showCalibrationCheckBar && (
              <div
                style={{
                  top: '4mm',
                  right: '10mm',
                  width: '50mm',
                }}
                className="absolute pointer-events-none z-10 text-right"
              >
                {/* 50mm ruler line */}
                <div className="w-full h-[1px] bg-slate-700 relative">
                  {/* Ticks at every 5mm */}
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((t) => (
                    <div
                      key={t}
                      style={{
                        left: `${t}mm`,
                        height: t % 10 === 0 ? '3mm' : '1.8mm',
                      }}
                      className="absolute top-0 w-[1px] bg-slate-700 -translate-x-1/2"
                    />
                  ))}
                </div>
                <p className="text-[7px] text-slate-600 font-mono mt-1 font-semibold">
                  50mm 실측 확인 자 (100% 인쇄 검증)
                </p>
              </div>
            )}

            {/* Header info */}
            {settings.showPageInfo && (
              <div
                style={{
                  top: '4mm',
                  left: '10mm',
                }}
                className="absolute pointer-events-none z-10"
              >
                <p className="text-[7px] text-slate-400 font-mono font-medium">
                  Pop-Stamp Print Master | P.{currentPage + 1}/{totalPages} | 배치 도장:{' '}
                  {activePageData.stamps.length}개
                </p>
              </div>
            )}

            {/* Placed Stamps */}
            {activePageData.stamps.map((item) => {
              const { stamp, xMm, yMm, widthMm, heightMm } = item;
              const displayImg = stamp.processedImageUrl || stamp.imageUrl;
              const cutMargin = stamp.showCutGuide && settings.showCutLines ? stamp.cutGuideMarginMm : 0;

              return (
                <div
                  key={item.instanceId}
                  onClick={() => onSelectStamp && onSelectStamp(stamp.id)}
                  style={{
                    left: `${xMm}mm`,
                    top: `${yMm}mm`,
                    width: `${widthMm}mm`,
                    height: `${heightMm}mm`,
                  }}
                  className="absolute cursor-pointer hover:ring-2 hover:ring-rose-500 hover:ring-offset-1 transition-all group z-10"
                  title={`${stamp.name} (${widthMm}x${heightMm}mm)`}
                >
                  {/* Cut Guide Line (if enabled) */}
                  {stamp.showCutGuide && settings.showCutLines && (
                    <div
                      style={{
                        top: `-${cutMargin}mm`,
                        left: `-${cutMargin}mm`,
                        width: `${widthMm + cutMargin * 2}mm`,
                        height: `${heightMm + cutMargin * 2}mm`,
                        borderColor: stamp.cutGuideColor || '#94a3b8',
                        borderStyle: stamp.cutGuideStyle || 'solid',
                        borderWidth: '0.25mm',
                      }}
                      className={`absolute pointer-events-none z-20 ${
                        stamp.shape === 'circle'
                          ? 'rounded-full'
                          : stamp.shape === 'rounded'
                          ? 'rounded-xs'
                          : 'rounded-none'
                      }`}
                    />
                  )}

                  {/* Stamp Graphic */}
                  <div
                    className={`w-full h-full flex items-center justify-center overflow-hidden ${
                      stamp.shape === 'circle'
                        ? 'rounded-full'
                        : stamp.shape === 'rounded'
                        ? 'rounded-xs'
                        : 'rounded-none'
                    }`}
                  >
                    <img
                      src={displayImg}
                      alt={stamp.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Dimension tag on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap z-30 pointer-events-none">
                    {widthMm}x{heightMm}mm
                  </div>
                </div>
              );
            })}

            {/* Empty page state notice */}
            {activePageData.stamps.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Sparkles className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">배치된 도장이 없습니다</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  좌측에서 도장 이미지를 업로드하거나 추천 템플릿을 추가하면 여기에 실시간으로 자동 배치됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Info bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3">
          <span>
            규격: <strong className="text-slate-700">A4 ({paperWidthMm} x {paperHeightMm} mm)</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            여백: <strong className="text-slate-700">상하 {settings.pageMarginMm.top}mm, 좌우 {settings.pageMarginMm.left}mm</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            간격: <strong className="text-slate-700">{settings.itemSpacingMm}mm</strong>
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>1:1 브라우저 하드웨어 인쇄 연동 준비됨</span>
        </div>
      </div>
    </div>
  );
};
