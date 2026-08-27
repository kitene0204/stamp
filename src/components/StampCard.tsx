import React, { useState } from 'react';
import { 
  Trash2, 
  Copy, 
  SlidersHorizontal, 
  Lock, 
  Unlock, 
  AlertTriangle,
  Scissors,
  Check,
  Circle,
  Square,
  Sparkles
} from 'lucide-react';
import { StampItem, StampShape } from '../types';
import { STANDARD_PAD_PRESETS } from '../data/presets';

interface StampCardProps {
  stamp: StampItem;
  onUpdate: (updatedStamp: StampItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (stamp: StampItem) => void;
  onOpenFilterModal: (stamp: StampItem) => void;
  index: number;
}

export const StampCard: React.FC<StampCardProps> = ({
  stamp,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenFilterModal,
  index,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleWidthChange = (val: number) => {
    const clamped = Math.min(60, Math.max(1.0, val));
    if (stamp.lockAspectRatio && stamp.aspectRatio > 0) {
      const newHeight = Math.round((clamped / stamp.aspectRatio) * 10) / 10;
      onUpdate({
        ...stamp,
        widthMm: clamped,
        heightMm: Math.min(60, Math.max(1.0, newHeight)),
      });
    } else {
      onUpdate({ ...stamp, widthMm: clamped });
    }
  };

  const handleHeightChange = (val: number) => {
    const clamped = Math.min(60, Math.max(1.0, val));
    if (stamp.lockAspectRatio && stamp.aspectRatio > 0) {
      const newWidth = Math.round((clamped * stamp.aspectRatio) * 10) / 10;
      onUpdate({
        ...stamp,
        heightMm: clamped,
        widthMm: Math.min(60, Math.max(1.0, newWidth)),
      });
    } else {
      onUpdate({ ...stamp, heightMm: clamped });
    }
  };

  const handleApplyPresetSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    if (!presetId) return;
    const found = STANDARD_PAD_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onUpdate({
        ...stamp,
        widthMm: found.widthMm,
        heightMm: found.heightMm,
        shape: found.shape,
      });
    }
  };

  const isOverLimit = stamp.widthMm > 50 || stamp.heightMm > 50;
  const isUnderLimit = stamp.widthMm < 1.5 || stamp.heightMm < 1.5;

  const currentDisplayImg = stamp.processedImageUrl || stamp.imageUrl;

  return (
    <div 
      id={`stamp-card-${stamp.id}`}
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
        isOverLimit ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'
      }`}
    >
      {/* Card Header */}
      <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <input
            type="text"
            value={stamp.name}
            onChange={(e) => onUpdate({ ...stamp, name: e.target.value })}
            className="text-xs font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:bg-white px-1 py-0.5 rounded outline-hidden truncate max-w-[140px] sm:max-w-[200px]"
            title="도장 이름 편집"
          />
        </div>

        {/* Top actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onOpenFilterModal(stamp)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs transition-colors"
            title="흑백 변환 및 대비 조절 (팝핑 머신 최적화)"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicate(stamp)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg text-xs transition-colors"
            title="도장 복제"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(stamp.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs transition-colors"
            title="도장 삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-4 space-y-3.5">
        {/* Preview Thumbnail & Shape badge */}
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group">
            {/* Stamp guide outline visual */}
            <div
              className={`absolute inset-1 pointer-events-none ${
                stamp.shape === 'circle'
                  ? 'rounded-full'
                  : stamp.shape === 'rounded'
                  ? 'rounded-md'
                  : 'rounded-none'
              } border-2 border-dashed border-rose-400/70 z-10`}
            />
            <img
              src={currentDisplayImg}
              alt={stamp.name}
              referrerPolicy="no-referrer"
              className="max-w-[90%] max-h-[90%] object-contain filter drop-shadow-xs"
            />
            <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
              {stamp.widthMm}x{stamp.heightMm}mm
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Preset Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                규격 프리셋 선택
              </label>
              <select
                onChange={handleApplyPresetSize}
                defaultValue=""
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:bg-white focus:border-rose-500 outline-hidden"
              >
                <option value="">직접 수치 입력 중...</option>
                <optgroup label="원형 규격 (Circular)">
                  {STANDARD_PAD_PRESETS.filter((p) => p.shape === 'circle').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="사각/이름 규격 (Rectangular)">
                  {STANDARD_PAD_PRESETS.filter((p) => p.shape === 'rectangle').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Shape Buttons */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                도장 패드 모양
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => onUpdate({ ...stamp, shape: 'circle' })}
                  className={`flex items-center justify-center space-x-1 py-1 rounded text-xs font-medium border transition-colors ${
                    stamp.shape === 'circle'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Circle className="w-3 h-3" />
                  <span>원형</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...stamp, shape: 'rectangle' })}
                  className={`flex items-center justify-center space-x-1 py-1 rounded text-xs font-medium border transition-colors ${
                    stamp.shape === 'rectangle'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Square className="w-3 h-3" />
                  <span>사각</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...stamp, shape: 'rounded' })}
                  className={`flex items-center justify-center space-x-1 py-1 rounded text-xs font-medium border transition-colors ${
                    stamp.shape === 'rounded'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[11px]">▢</span>
                  <span>둥근사각</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Size Sliders and Inputs */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">도장 실측 크기 (mm)</span>
            <button
              type="button"
              onClick={() => onUpdate({ ...stamp, lockAspectRatio: !stamp.lockAspectRatio })}
              className={`inline-flex items-center space-x-1 text-[11px] px-1.5 py-0.5 rounded border ${
                stamp.lockAspectRatio
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title={stamp.lockAspectRatio ? '비율 고정됨' : '비율 고정 해제됨'}
            >
              {stamp.lockAspectRatio ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>비율 유지</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3" />
                  <span>자유 비율</span>
                </>
              )}
            </button>
          </div>

          {/* Width Size Control */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">
                {stamp.shape === 'circle' ? '지름 (가로)' : '가로 (Width)'}:
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="1.5"
                  max="50"
                  step="0.5"
                  value={stamp.widthMm}
                  onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 1.5)}
                  className="w-16 text-right text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:bg-white focus:border-rose-500 outline-hidden"
                />
                <span className="text-slate-500 text-xs font-mono">mm</span>
              </div>
            </div>
            <input
              type="range"
              min="1.5"
              max="50"
              step="0.5"
              value={stamp.widthMm}
              onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Height Size Control (if not circle or if free ratio) */}
          {(!stamp.lockAspectRatio || stamp.shape !== 'circle') && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">
                  {stamp.shape === 'circle' ? '지름 (세로)' : '세로 (Height)'}:
                </span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1.5"
                    max="50"
                    step="0.5"
                    value={stamp.heightMm}
                    onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 1.5)}
                    className="w-16 text-right text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:bg-white focus:border-rose-500 outline-hidden"
                  />
                  <span className="text-slate-500 text-xs font-mono">mm</span>
                </div>
              </div>
              <input
                type="range"
                min="1.5"
                max="50"
                step="0.5"
                value={stamp.heightMm}
                onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
          )}
        </div>

        {/* Warning messages */}
        {isOverLimit && (
          <div className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>최대 규격 50mm를 초과하였습니다. 팝핑 머신 규격에 맞게 조정하세요.</span>
          </div>
        )}

        {isUnderLimit && (
          <div className="flex items-center space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>도장 최소 크기는 1.5mm 이상을 권장합니다.</span>
          </div>
        )}

        {/* Copies (인쇄 수량) and Cut guide settings */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-600 font-medium">출력 수량:</span>
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => onUpdate({ ...stamp, copies: Math.max(1, stamp.copies - 1) })}
                className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-xs"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="500"
                value={stamp.copies}
                onChange={(e) =>
                  onUpdate({ ...stamp, copies: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="w-10 text-center font-bold text-xs bg-transparent border-none outline-hidden"
              />
              <button
                type="button"
                onClick={() => onUpdate({ ...stamp, copies: stamp.copies + 1 })}
                className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Cut guide toggle */}
          <button
            type="button"
            onClick={() => onUpdate({ ...stamp, showCutGuide: !stamp.showCutGuide })}
            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
              stamp.showCutGuide
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
            title="도장 재단용 외곽 가이드라인 인쇄"
          >
            <Scissors className="w-3 h-3" />
            <span>외곽 재단선 {stamp.showCutGuide ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
