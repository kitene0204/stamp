import React from 'react';
import { X, Settings, RotateCcw, Check, Sliders } from 'lucide-react';
import { LayoutSettings } from '../types';
import { DEFAULT_LAYOUT_SETTINGS } from '../utils/layoutEngine';

interface PageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LayoutSettings;
  onUpdateSettings: (settings: LayoutSettings) => void;
}

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleMarginChange = (key: keyof LayoutSettings['pageMarginMm'], value: number) => {
    onUpdateSettings({
      ...settings,
      pageMarginMm: {
        ...settings.pageMarginMm,
        [key]: Math.max(0, Math.min(50, value)),
      },
    });
  };

  const handleApplyMarginPreset = (val: number) => {
    onUpdateSettings({
      ...settings,
      pageMarginMm: {
        top: val,
        bottom: val,
        left: val,
        right: val,
      },
    });
  };

  const handleReset = () => {
    onUpdateSettings({ ...DEFAULT_LAYOUT_SETTINGS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">A4 용지 및 여백 설정</h2>
              <p className="text-xs text-slate-500">인쇄 시 적용될 여백 및 도장 간격을 세밀하게 조절합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Spacing between stamps */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">도장 간 최소 간격 (Spacing)</span>
              <span className="font-mono font-bold text-rose-600 text-sm">
                {settings.itemSpacingMm} mm
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              도장 칼선 및 가위질 여유 공간을 확보합니다 (기본 3mm 권장).
            </p>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={settings.itemSpacingMm}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  itemSpacingMm: parseFloat(e.target.value) || 3,
                })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Margins */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">A4 용지 외곽 여백 (Margin)</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleApplyMarginPreset(5)}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  절약(5mm)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyMarginPreset(10)}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  표준(10mm)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyMarginPreset(15)}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  넉넉(15mm)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-500 mb-1">상단 여백 (Top)</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={settings.pageMarginMm.top}
                    onChange={(e) =>
                      handleMarginChange('top', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold"
                  />
                  <span className="text-slate-500 font-mono">mm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">하단 여백 (Bottom)</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={settings.pageMarginMm.bottom}
                    onChange={(e) =>
                      handleMarginChange('bottom', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold"
                  />
                  <span className="text-slate-500 font-mono">mm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">좌측 여백 (Left)</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={settings.pageMarginMm.left}
                    onChange={(e) =>
                      handleMarginChange('left', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold"
                  />
                  <span className="text-slate-500 font-mono">mm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">우측 여백 (Right)</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={settings.pageMarginMm.right}
                    onChange={(e) =>
                      handleMarginChange('right', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold"
                  />
                  <span className="text-slate-500 font-mono">mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Auxiliary Options */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block mb-1">부가 인쇄 옵션</span>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showCalibrationCheckBar}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showCalibrationCheckBar: e.target.checked })
                }
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="text-slate-700 font-medium">
                우측 상단에 50mm 실측 검증 자 인쇄
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showCutLines}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showCutLines: e.target.checked })
                }
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="text-slate-700 font-medium">도장 외곽 재단 가이드선 인쇄</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showPageInfo}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showPageInfo: e.target.checked })
                }
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="text-slate-700 font-medium">페이지 번호 및 수량 정보 표시</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본값 복원</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};
