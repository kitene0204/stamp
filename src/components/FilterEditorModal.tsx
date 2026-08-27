import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Sun, 
  Contrast as ContrastIcon, 
  Layers, 
  FlipHorizontal,
  Info
} from 'lucide-react';
import { ImageFilterSettings, StampItem } from '../types';
import { processImageWithFilters, DEFAULT_FILTER_SETTINGS } from '../utils/imageProcessor';

interface FilterEditorModalProps {
  stamp: StampItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (stampId: string, filters: ImageFilterSettings, processedUrl: string) => void;
}

export const FilterEditorModal: React.FC<FilterEditorModalProps> = ({
  stamp,
  isOpen,
  onClose,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState<ImageFilterSettings>(DEFAULT_FILTER_SETTINGS);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (stamp && isOpen) {
      setFilters(stamp.filters || { ...DEFAULT_FILTER_SETTINGS });
    }
  }, [stamp, isOpen]);

  // Live filter rendering
  useEffect(() => {
    if (!stamp || !isOpen) return;

    let isMounted = true;
    setIsProcessing(true);

    processImageWithFilters(stamp.imageUrl, filters).then((res) => {
      if (isMounted) {
        setPreviewUrl(res);
        setIsProcessing(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stamp, filters, isOpen]);

  if (!isOpen || !stamp) return null;

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTER_SETTINGS });
  };

  const handleQuickBinarizePreset = () => {
    setFilters({
      binarize: true,
      threshold: 140,
      invert: false,
      removeBg: true,
      removeBgTolerance: 20,
      contrast: 130,
      brightness: 10,
    });
  };

  const handleSave = () => {
    onApplyFilters(stamp.id, filters, previewUrl || stamp.imageUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                팝핑 머신 흑백 & 대비 최적화 보정
              </h2>
              <p className="text-xs text-slate-500">
                플래시 노광 인식을 위해 이미지를 선명한 100% 흑백(K100)으로 변환하고 잡티를 제거합니다.
              </p>
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
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Live Comparison */}
          <div className="md:col-span-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Original */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">원본 이미지</span>
                <div className="w-full h-36 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
                  <img
                    src={stamp.imageUrl}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Processed (After) */}
              <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-200 text-center">
                <span className="text-[11px] font-bold text-rose-700 block mb-2">
                  보정 후 (인쇄 출력용)
                </span>
                <div className="w-full h-36 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden relative">
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <img
                      src={previewUrl || stamp.imageUrl}
                      alt="Processed"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Quick 1-click optimization button */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900">
                  <strong className="font-semibold">팝핑 머신 원리: </strong>
                  검은색(K100) 잉크 부분만 플래시 순간 열을 흡수하여 도장 고무 패드를 개방합니다. 흐릿한 회색이나 그라데이션은 이진화(Binarize) 처리를 해주시면 최상의 인쇄 품질이 나옵니다.
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickBinarizePreset}
                className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                ⚡ 팝핑 머신 최적 흑백 설정 원클릭 적용
              </button>
            </div>
          </div>

          {/* Right: Detailed Filters Control */}
          <div className="md:col-span-6 space-y-4 text-xs">
            {/* 1. Binarize (흑백 이진화) Toggle & Slider */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <input
                    type="checkbox"
                    checked={filters.binarize}
                    onChange={(e) => setFilters({ ...filters, binarize: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>흑백 이진화 (Binarize)</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono font-semibold">
                  임계값: {filters.threshold}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                그레이스케일을 순수 100% 흑과 백으로만 분리합니다.
              </p>
              {filters.binarize && (
                <input
                  type="range"
                  min="20"
                  max="240"
                  value={filters.threshold}
                  onChange={(e) =>
                    setFilters({ ...filters, threshold: parseInt(e.target.value) || 128 })
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              )}
            </div>

            {/* 2. Invert (흑백 반전) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <input
                    type="checkbox"
                    checked={filters.invert}
                    onChange={(e) => setFilters({ ...filters, invert: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>흑백 반전 (Invert Colors)</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  음각 도장 / 양각 도장 전환에 유용합니다.
                </p>
              </div>
              <FlipHorizontal className="w-5 h-5 text-slate-400" />
            </div>

            {/* 3. Remove White Background */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <input
                    type="checkbox"
                    checked={filters.removeBg}
                    onChange={(e) => setFilters({ ...filters, removeBg: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>흰색 배경 투명화 (Remove White BG)</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                도장 주변의 불필요한 흰색 사각 배경을 제거하여 외곽선을 깔끔하게 만듭니다.
              </p>
              {filters.removeBg && (
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>투명화 허용오차</span>
                    <span className="font-mono">{filters.removeBgTolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={filters.removeBgTolerance}
                    onChange={(e) =>
                      setFilters({ ...filters, removeBgTolerance: parseInt(e.target.value) || 20 })
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>
              )}
            </div>

            {/* 4. Contrast & Brightness Sliders */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span className="flex items-center space-x-1">
                    <ContrastIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>대비 (Contrast)</span>
                  </span>
                  <span className="font-mono text-slate-500">{filters.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) =>
                    setFilters({ ...filters, contrast: parseInt(e.target.value) || 100 })
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span className="flex items-center space-x-1">
                    <Sun className="w-3.5 h-3.5 text-slate-500" />
                    <span>밝기 (Brightness)</span>
                  </span>
                  <span className="font-mono text-slate-500">{filters.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={filters.brightness}
                  onChange={(e) =>
                    setFilters({ ...filters, brightness: parseInt(e.target.value) || 0 })
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
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
            <span>기본값 초기화</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>보정 적용하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
