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
          {/* Spacing Mode Control (User Request: separate by pad size) */}
          <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950 text-sm">인쇄 시 도장 간격 (좌우/상하)</span>
              <span className="text-[10px] font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
                {settings.spacingMode === 'pad-size' ? '패드 크기만큼 띄움' : `${settings.itemSpacingMm}mm 고정`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    spacingMode: 'pad-size',
                    padSpacingRatio: 1.0,
                  })
                }
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.spacingMode === 'pad-size'
                    ? 'bg-white border-rose-500 ring-2 ring-rose-200 text-rose-900 shadow-xs'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>패드 크기만큼 띄우기</span>
                  {settings.spacingMode === 'pad-size' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  도장 본체 크기만큼 좌우/상하 여유 공간 확보 (가위질 및 패드 장착 최적화)
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    spacingMode: 'custom',
                  })
                }
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.spacingMode === 'custom'
                    ? 'bg-white border-rose-500 ring-2 ring-rose-200 text-rose-900 shadow-xs'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>직접 mm 간격 지정</span>
                  {settings.spacingMode === 'custom' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  원하는 간격(예: 5mm, 15mm, 20mm)을 수치로 직접 제어
                </p>
              </button>
            </div>

            {/* Custom Spacing Slider if custom mode */}
            {settings.spacingMode === 'custom' && (
              <div className="space-y-2.5 pt-2 border-t border-rose-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">도장 사이 간격 (mm/cm):</span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.itemSpacingMm}
                      onChange={(e) => {
                        const val = Math.max(1, parseFloat(e.target.value) || 1);
                        onUpdateSettings({
                          ...settings,
                          itemSpacingMm: val,
                          horizontalSpacingMm: val,
                          verticalSpacingMm: val,
                        });
                      }}
                      className="w-16 text-center font-bold text-sm bg-white border border-rose-400 text-rose-700 rounded px-1.5 py-0.5"
                    />
                    <span className="font-mono text-slate-600 font-semibold">
                      mm ({((settings.itemSpacingMm || 30) / 10).toFixed(1)}cm)
                    </span>
                  </div>
                </div>

                {/* Quick 3cm, 2cm, 1.5cm buttons */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="text-[10px] text-slate-500 font-medium">빠른 간격:</span>
                  {[
                    { label: '3cm (30mm) ★', val: 30 },
                    { label: '2cm (20mm)', val: 20 },
                    { label: '1.5cm (15mm)', val: 15 },
                    { label: '4cm (40mm)', val: 40 },
                    { label: '5cm (50mm)', val: 50 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          ...settings,
                          itemSpacingMm: p.val,
                          horizontalSpacingMm: p.val,
                          verticalSpacingMm: p.val,
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                        settings.itemSpacingMm === p.val
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={settings.itemSpacingMm}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 30;
                    onUpdateSettings({
                      ...settings,
                      itemSpacingMm: val,
                      horizontalSpacingMm: val,
                      verticalSpacingMm: val,
                    });
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>
            )}
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
