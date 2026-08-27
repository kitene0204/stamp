import React from 'react';
import { LayoutResult, LayoutSettings } from '../types';
import { A4_HEIGHT_MM, A4_WIDTH_MM } from '../utils/layoutEngine';

interface PrintAreaDOMProps {
  layoutResult: LayoutResult;
  settings: LayoutSettings;
}

export const PrintAreaDOM: React.FC<PrintAreaDOMProps> = ({
  layoutResult,
  settings,
}) => {
  const isPortrait = settings.paperOrientation === 'portrait';
  const paperWidthMm = isPortrait ? A4_WIDTH_MM : A4_HEIGHT_MM;
  const paperHeightMm = isPortrait ? A4_HEIGHT_MM : A4_WIDTH_MM;

  return (
    <div className="print-area-only">
      {layoutResult.pages.map((page, pIdx) => (
        <div
          key={`print-page-${page.pageIndex}-${pIdx}`}
          className="print-page"
          style={{
            width: `${paperWidthMm}mm`,
            height: `${paperHeightMm}mm`,
            position: 'relative',
            background: '#ffffff',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Top 50mm Verification ruler */}
          {settings.showCalibrationCheckBar && (
            <div
              style={{
                position: 'absolute',
                top: '4mm',
                right: '10mm',
                width: '50mm',
                zIndex: 50,
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '0.2mm',
                  background: '#333333',
                  position: 'relative',
                }}
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((tick) => (
                  <div
                    key={tick}
                    style={{
                      position: 'absolute',
                      left: `${tick}mm`,
                      top: 0,
                      width: '0.2mm',
                      height: tick % 10 === 0 ? '2.5mm' : '1.5mm',
                      background: '#333333',
                      transform: 'translateX(-50%)',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontSize: '6pt',
                  fontFamily: 'sans-serif',
                  color: '#666666',
                  marginTop: '1.5mm',
                }}
              >
                50mm 실측 확인 자 (100% 인쇄 검증)
              </div>
            </div>
          )}

          {/* Top Page info */}
          {settings.showPageInfo && (
            <div
              style={{
                position: 'absolute',
                top: '4mm',
                left: '10mm',
                fontSize: '6pt',
                fontFamily: 'sans-serif',
                color: '#888888',
                zIndex: 50,
              }}
            >
              Pop-Stamp Print Master | P.{pIdx + 1}/{layoutResult.totalPages} | 도장 {page.stamps.length}개
            </div>
          )}

          {/* Placed Stamps */}
          {page.stamps.map((item) => {
            const { stamp, xMm, yMm, widthMm, heightMm } = item;
            const displayImg = stamp.processedImageUrl || stamp.imageUrl;
            const cutMargin = stamp.showCutGuide && settings.showCutLines ? stamp.cutGuideMarginMm : 0;

            return (
              <div
                key={`print-item-${item.instanceId}`}
                style={{
                  position: 'absolute',
                  left: `${xMm}mm`,
                  top: `${yMm}mm`,
                  width: `${widthMm}mm`,
                  height: `${heightMm}mm`,
                  boxSizing: 'border-box',
                }}
              >
                {/* Cut Guideline if enabled */}
                {stamp.showCutGuide && settings.showCutLines && (
                  <div
                    style={{
                      position: 'absolute',
                      top: `-${cutMargin}mm`,
                      left: `-${cutMargin}mm`,
                      width: `${widthMm + cutMargin * 2}mm`,
                      height: `${heightMm + cutMargin * 2}mm`,
                      borderColor: stamp.cutGuideColor || '#94a3b8',
                      borderStyle: stamp.cutGuideStyle || 'solid',
                      borderWidth: '0.2mm',
                      borderRadius:
                        stamp.shape === 'circle'
                          ? '9999px'
                          : stamp.shape === 'rounded'
                          ? '1.5mm'
                          : '0',
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Stamp Graphic with shape clipping */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius:
                      stamp.shape === 'circle'
                        ? '9999px'
                        : stamp.shape === 'rounded'
                        ? '1.5mm'
                        : '0',
                  }}
                >
                  <img
                    src={displayImg}
                    alt={stamp.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
