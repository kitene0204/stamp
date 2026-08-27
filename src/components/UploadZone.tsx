import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, Sparkles, Plus } from 'lucide-react';
import { StampItem } from '../types';
import { DEFAULT_FILTER_SETTINGS, readImageDimensions } from '../utils/imageProcessor';
import { PRESET_SAMPLES, createSvgStampDataUrl } from '../data/presets';

interface UploadZoneProps {
  onAddStamps: (stamps: StampItem[]) => void;
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onAddStamps, compact = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setIsLoading(true);
    const newStamps: StampItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const meta = await readImageDimensions(dataUrl);
        const fileName = file.name.replace(/\.[^/.]+$/, '');

        // Determine default size (e.g. 20mm default, maintaining aspect ratio)
        let initialWidth = 20;
        let initialHeight = 20;
        let shape: 'circle' | 'rectangle' = 'circle';

        if (Math.abs(meta.aspectRatio - 1) > 0.2) {
          // Rectangular image
          shape = 'rectangle';
          if (meta.aspectRatio > 1) {
            initialWidth = 30;
            initialHeight = Math.round((30 / meta.aspectRatio) * 10) / 10;
          } else {
            initialHeight = 30;
            initialWidth = Math.round((30 * meta.aspectRatio) * 10) / 10;
          }
        }

        const stamp: StampItem = {
          id: `stamp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          name: fileName || `도장 디자인 ${i + 1}`,
          imageUrl: dataUrl,
          originalWidth: meta.width,
          originalHeight: meta.height,
          aspectRatio: meta.aspectRatio,
          widthMm: Math.min(50, Math.max(1.5, initialWidth)),
          heightMm: Math.min(50, Math.max(1.5, initialHeight)),
          lockAspectRatio: true,
          shape: shape,
          copies: 1,
          showCutGuide: true,
          cutGuideColor: '#94a3b8',
          cutGuideStyle: 'solid',
          cutGuideMarginMm: 1.0,
          filters: { ...DEFAULT_FILTER_SETTINGS },
          sourceType: 'upload',
          createdAt: Date.now(),
        };

        newStamps.push(stamp);
      } catch (err) {
        console.error('File read error:', err);
      }
    }

    if (newStamps.length > 0) {
      onAddStamps(newStamps);
    }
    setIsLoading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // reset so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleAddSamplePreset = (index: number) => {
    const sample = PRESET_SAMPLES[index];
    if (!sample) return;

    const dataUrl = createSvgStampDataUrl(
      sample.title,
      sample.subText,
      sample.symbol,
      sample.type
    );

    const stamp: StampItem = {
      id: `stamp-sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
  };

  const handleAddAllSamplePresets = () => {
    const stamps = PRESET_SAMPLES.map((sample, idx) => {
      const dataUrl = createSvgStampDataUrl(
        sample.title,
        sample.subText,
        sample.symbol,
        sample.type
      );
      return {
        id: `stamp-sample-${Date.now()}-${idx}`,
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
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-compact"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          id="btn-upload-more"
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>도장 이미지 추가</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload-input"
      />

      {/* Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        id="dropzone-area"
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-rose-500 bg-rose-50/60 ring-4 ring-rose-100'
            : 'border-slate-300 hover:border-rose-400 hover:bg-slate-50/80 bg-slate-50/40'
        }`}
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">
          도장 이미지 업로드 (다중 선택 가능)
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          이미지 파일(PNG, JPG, WEBP)을 마우스로 끌어다 놓거나 클릭하여 선택하세요.
        </p>

        <button
          type="button"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
        >
          <ImageIcon className="w-4 h-4" />
          <span>내 PC에서 이미지 파일 선택</span>
        </button>
      </div>

      {/* Format Notice */}
      <div className="mt-3 flex items-start space-x-2 text-xs text-slate-600 bg-amber-50/80 border border-amber-200 rounded-lg p-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-900 font-semibold">선생님을 위한 팁: </strong>
          도장 테두리 외곽이 깔끔하게 인쇄되도록 <span className="font-semibold text-amber-900">배경이 투명한 PNG 파일</span>을 권장합니다. (흰색 배경 이미지도 내장 흑백 변환 필터로 즉시 최적화 가능)
        </div>
      </div>

      {/* Quick Preset Sample Starters */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>빠른 테스트용 추천 스탬프 샘플</span>
          </span>
          <button
            onClick={handleAddAllSamplePresets}
            id="btn-load-all-presets"
            className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline cursor-pointer"
          >
            + 6종 전체 불러오기
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_SAMPLES.slice(0, 3).map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleAddSamplePreset(idx)}
              id={`btn-load-preset-${idx}`}
              className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-800 shrink-0 border border-slate-200">
                {sample.shape === 'circle' ? '●' : '■'}
              </div>
              <div className="truncate">
                <p className="font-semibold text-slate-800 truncate">{sample.title}</p>
                <p className="text-[10px] text-slate-500">{sample.defaultWidthMm}mm</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
