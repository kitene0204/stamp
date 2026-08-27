import React, { useState } from 'react';
import { X, Layers, Plus, Check, Stamp } from 'lucide-react';
import { PRESET_SAMPLES, STANDARD_PAD_PRESETS, createSvgStampDataUrl } from '../data/presets';
import { StampItem } from '../types';
import { DEFAULT_FILTER_SETTINGS } from '../utils/imageProcessor';

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStamps: (stamps: StampItem[]) => void;
}

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddStamps,
}) => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'pads'>('teacher');
  const [selectedPadSize, setSelectedPadSize] = useState<number>(20);
  const [padShape, setPadShape] = useState<'circle' | 'rectangle'>('circle');
  const [padCopies, setPadCopies] = useState<number>(1);
  const [padName, setPadName] = useState<string>('표준 규격 패드 20mm');

  if (!isOpen) return null;

  const handleAddSample = (sample: typeof PRESET_SAMPLES[0]) => {
    const dataUrl = createSvgStampDataUrl(
      sample.title,
      sample.subText,
      sample.symbol,
      sample.type
    );

    const stamp: StampItem = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: sample.name,
      imageUrl: dataUrl,
      originalWidth: 300,
      originalHeight: 300,
      aspectRatio: 1,
      widthMm: sample.defaultWidthMm,
      heightMm: sample.defaultHeightMm,
      lockAspectRatio: true,
      shape: sample.shape,
      copies: 1,
      showCutGuide: true,
      cutGuideColor: '#94a3b8',
      cutGuideStyle: 'solid',
      cutGuideMarginMm: 1.0,
      filters: { ...DEFAULT_FILTER_SETTINGS },
      sourceType: 'preset',
      createdAt: Date.now(),
    };

    onAddStamps([stamp]);
    onClose();
  };

  const handleAddStandardPadPlaceholder = (preset: typeof STANDARD_PAD_PRESETS[0]) => {
    // Generates a clean border guideline placeholder stamp for testing
    const dataUrl = createSvgStampDataUrl(
      preset.name,
      `${preset.widthMm}x${preset.heightMm}mm`,
      'POPPING',
      preset.shape === 'circle' ? 'circle' : 'square'
    );

    const stamp: StampItem = {
      id: `pad-preset-${Date.now()}-${preset.id}`,
      name: `${preset.name} 규격`,
      imageUrl: dataUrl,
      originalWidth: 300,
      originalHeight: 300,
      aspectRatio: preset.widthMm / preset.heightMm,
      widthMm: preset.widthMm,
      heightMm: preset.heightMm,
      lockAspectRatio: true,
      shape: preset.shape,
      copies: 1,
      showCutGuide: true,
      cutGuideColor: '#94a3b8',
      cutGuideStyle: 'solid',
      cutGuideMarginMm: 1.0,
      filters: { ...DEFAULT_FILTER_SETTINGS },
      sourceType: 'preset',
      createdAt: Date.now(),
    };

    onAddStamps([stamp]);
    onClose();
  };

  const handleAddAllTeacherSamples = () => {
    const stamps = PRESET_SAMPLES.map((sample, idx) => {
      const dataUrl = createSvgStampDataUrl(
        sample.title,
        sample.subText,
        sample.symbol,
        sample.type
      );
      return {
        id: `preset-batch-${Date.now()}-${idx}`,
        name: sample.name,
        imageUrl: dataUrl,
        originalWidth: 300,
        originalHeight: 300,
        aspectRatio: 1,
        widthMm: sample.defaultWidthMm,
        heightMm: sample.defaultHeightMm,
        lockAspectRatio: true,
        shape: sample.shape,
        copies: 1,
        showCutGuide: true,
        cutGuideColor: '#94a3b8',
        cutGuideStyle: 'solid' as const,
        cutGuideMarginMm: 1.0,
        filters: { ...DEFAULT_FILTER_SETTINGS },
        sourceType: 'preset' as const,
        createdAt: Date.now() + idx,
      };
    });
    onAddStamps(stamps);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                추천 템플릿 & 팝핑 머신 표준 규격
              </h2>
              <p className="text-xs text-slate-500">
                선생님들이 자주 사용하는 검증된 도장 디자인 및 머신 규격을 바로 불러옵니다.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('teacher')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'teacher'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            선생님 추천 스탬프 ({PRESET_SAMPLES.length}종)
          </button>
          <button
            onClick={() => setActiveTab('pads')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'pads'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            팝핑 머신 표준 패드 규격 ({STANDARD_PAD_PRESETS.length}종)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'teacher' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  클릭하면 즉시 A4 배치 영역에 1:1 실측 크기로 추가됩니다.
                </span>
                <button
                  onClick={handleAddAllTeacherSamples}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  + 전체 템플릿 한 번에 추가
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_SAMPLES.map((sample, idx) => {
                  const svgUrl = createSvgStampDataUrl(
                    sample.title,
                    sample.subText,
                    sample.symbol,
                    sample.type
                  );
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all flex items-center justify-between space-x-3 bg-white"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-14 h-14 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center shrink-0 p-1">
                          <img
                            src={svgUrl}
                            alt={sample.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            {sample.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                            {sample.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            규격: {sample.defaultWidthMm}mm ({sample.shape === 'circle' ? '원형' : '사각'})
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddSample(sample)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-rose-600 hover:text-white transition-colors shrink-0"
                      >
                        추가
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                시중에서 판매되는 팝핑 머신 및 플래시 스탬프 패드의 표준 규격 가이드라인입니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STANDARD_PAD_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-between bg-white"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{preset.description}</p>
                    </div>

                    <button
                      onClick={() => handleAddStandardPadPlaceholder(preset)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                    >
                      규격 추가
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
