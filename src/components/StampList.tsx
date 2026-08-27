import React, { useState } from 'react';
import { 
  StampItem, 
  StampShape 
} from '../types';
import { StampCard } from './StampCard';
import { UploadZone } from './UploadZone';
import { 
  Sliders, 
  Trash2, 
  PlusCircle, 
  Sparkles, 
  Scissors,
  CheckSquare
} from 'lucide-react';
import { STANDARD_PAD_PRESETS } from '../data/presets';

interface StampListProps {
  stamps: StampItem[];
  onUpdateStamp: (updated: StampItem) => void;
  onDeleteStamp: (id: string) => void;
  onDuplicateStamp: (stamp: StampItem) => void;
  onAddStamps: (newStamps: StampItem[]) => void;
  onOpenFilterModal: (stamp: StampItem) => void;
  onOpenTextStampModal: () => void;
  onClearAll: () => void;
}

export const StampList: React.FC<StampListProps> = ({
  stamps,
  onUpdateStamp,
  onDeleteStamp,
  onDuplicateStamp,
  onAddStamps,
  onOpenFilterModal,
  onOpenTextStampModal,
  onClearAll,
}) => {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchSize, setBatchSize] = useState<number>(20);
  const [batchShape, setBatchShape] = useState<StampShape>('circle');
  const [batchCopies, setBatchCopies] = useState<number>(1);

  const applyBatchSettings = () => {
    stamps.forEach((stamp) => {
      onUpdateStamp({
        ...stamp,
        widthMm: batchSize,
        heightMm: batchSize,
        shape: batchShape,
        copies: batchCopies,
      });
    });
    setShowBatchModal(false);
  };

  const toggleAllCutGuides = (enable: boolean) => {
    stamps.forEach((stamp) => {
      onUpdateStamp({
        ...stamp,
        showCutGuide: enable,
      });
    });
  };

  const increaseAllCopies = (delta: number) => {
    stamps.forEach((stamp) => {
      onUpdateStamp({
        ...stamp,
        copies: Math.max(1, stamp.copies + delta),
      });
    });
  };

  if (stamps.length === 0) {
    return (
      <div className="space-y-4">
        <UploadZone onAddStamps={onAddStamps} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Header with Batch controls */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-bold text-slate-900">
            도장 목록 ({stamps.length}개)
          </h2>
          <UploadZone onAddStamps={onAddStamps} compact />
        </div>

        {/* Batch action buttons */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 ml-auto">
          <button
            onClick={() => setShowBatchModal(!showBatchModal)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            title="모든 도장 크기 및 규격 일괄 적용"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="whitespace-nowrap">일괄 변경</span>
          </button>

          <button
            onClick={() => increaseAllCopies(1)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            title="모든 도장 수량 1개씩 추가"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
            <span className="whitespace-nowrap">수량 +1</span>
          </button>

          <button
            onClick={() => toggleAllCutGuides(true)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            title="모든 도장에 재단 가이드선 표시"
          >
            <Scissors className="w-3.5 h-3.5 text-slate-500" />
            <span className="whitespace-nowrap">재단선 전체ON</span>
          </button>

          <button
            onClick={onClearAll}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs transition-colors shrink-0"
            title="목록 전체 비우기"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Batch Edit Drawer */}
      {showBatchModal && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>전체 도장 규격 일괄 변경</span>
            </h3>
            <button
              onClick={() => setShowBatchModal(false)}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-indigo-900 font-medium mb-1">일괄 크기 (mm)</label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="1.5"
                  max="80"
                  step="0.5"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseFloat(e.target.value) || 20)}
                  className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 font-semibold"
                />
                <span className="text-indigo-900 font-mono">mm</span>
              </div>
            </div>

            <div>
              <label className="block text-indigo-900 font-medium mb-1">일괄 도장 형태</label>
              <select
                value={batchShape}
                onChange={(e) => setBatchShape(e.target.value as StampShape)}
                className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 font-medium"
              >
                <option value="circle">원형 (Circle)</option>
                <option value="rectangle">사각 (Rectangle)</option>
                <option value="rounded">둥근 사각 (Rounded)</option>
              </select>
            </div>

            <div>
              <label className="block text-indigo-900 font-medium mb-1">일괄 인쇄 수량</label>
              <input
                type="number"
                min="1"
                max="500"
                value={batchCopies}
                onChange={(e) => setBatchCopies(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 font-semibold"
              />
            </div>
          </div>

          {/* Quick presets buttons for batch */}
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1">
            <span className="text-[11px] text-indigo-800 font-medium">자주 쓰는 규격:</span>
            {[15, 19, 20, 25, 30, 50, 60, 80].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setBatchSize(size);
                  setBatchShape('circle');
                }}
                className="text-[11px] px-2 py-0.5 bg-white border border-indigo-200 rounded hover:bg-indigo-100 text-indigo-900 font-semibold"
              >
                {size}mm 원형{size === 19 ? '★' : size === 80 ? ' (최대)' : ''}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={applyBatchSettings}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              모든 도장에 적용하기
            </button>
          </div>
        </div>
      )}

      {/* Cards List */}
      <div className="space-y-3">
        {stamps.map((stamp, idx) => (
          <StampCard
            key={stamp.id}
            index={idx}
            stamp={stamp}
            onUpdate={onUpdateStamp}
            onDelete={onDeleteStamp}
            onDuplicate={onDuplicateStamp}
            onOpenFilterModal={onOpenFilterModal}
          />
        ))}
      </div>

      {/* Bottom Quick Multi-Upload Area */}
      <div className="pt-2">
        <UploadZone onAddStamps={onAddStamps} />
      </div>
    </div>
  );
};
