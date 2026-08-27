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

  // Clipboard paste support (Ctrl+V) for easy teacher uploads
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const imageFiles = Array.from(e.clipboardData.files).filter((f) =>
          f.type.startsWith('image/')
        );
        if (imageFiles.length > 0) {
          processFiles(imageFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsLoading(true);
    setUploadProgress({ current: 0, total: fileArray.length });

    try {
      const now = Date.now();
      const promises = fileArray.map(async (file, i) => {
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const meta = await readImageDimensions(dataUrl);
          const fileName = file.name.replace(/\.[^/.]+$/, '');

          // Determine default size (19mm standard for popping workshops)
          let initialWidth = 19;
          let initialHeight = 19;
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

          setUploadProgress((prev) => prev ? { ...prev, current: prev.current + 1 } : null);

          const stamp: StampItem = {
            id: `stamp-${now}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            name: fileName || `교사 도장 디자인 ${i + 1}`,
            imageUrl: dataUrl,
            originalWidth: meta.width,
            originalHeight: meta.height,
            aspectRatio: meta.aspectRatio,
            widthMm: Math.min(80, Math.max(1.5, initialWidth)),
            heightMm: Math.min(80, Math.max(1.5, initialHeight)),
            lockAspectRatio: true,
            shape: shape,
            copies: 1,
            showCutGuide: true,
            cutGuideColor: '#94a3b8',
            cutGuideStyle: 'solid',
            cutGuideMarginMm: 1.0,
            filters: { ...DEFAULT_FILTER_SETTINGS },
            sourceType: 'upload',
            createdAt: now + i,
          };

          return stamp;
        } catch (err) {
          console.error('File read error:', err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const newStamps = results.filter((s): s is StampItem => s !== null);

      if (newStamps.length > 0) {
        onAddStamps(newStamps);
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
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
          disabled={isLoading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          title="여러 이미지 파일을 한 번에 선택(Ctrl/Shift)하여 추가"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>+ 여러 도장 추가</span>
        </button>
        {uploadProgress && (
          <span className="text-[11px] text-rose-600 font-semibold animate-pulse">
            {uploadProgress.current}/{uploadProgress.total}개 등록 중...
          </span>
        )}
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
            ? 'border-rose-500 bg-rose-50/70 ring-4 ring-rose-100 scale-[1.01]'
            : 'border-slate-300 hover:border-rose-400 hover:bg-slate-50/80 bg-slate-50/40'
        }`}
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 shadow-xs">
          {isLoading ? (
            <div className="w-7 h-7 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          도장 도안 여러 개 한 번에 업로드 (다중 선택 지원)
        </h3>
        <p className="text-xs text-slate-600 mb-3 max-w-md mx-auto">
          여러 개의 이미지 파일(PNG, JPG, SVG, WebP)을 <strong className="text-rose-700 font-semibold">동시에 마우스로 끌어다 놓거나</strong>, 파일 선택창에서 <strong className="text-rose-700 font-semibold">Ctrl 또는 Shift 키를 누르고 한 번에 여러 장을 선택</strong>하세요!
        </p>

        {uploadProgress && (
          <div className="max-w-xs mx-auto mb-3 bg-white border border-rose-200 rounded-lg p-2.5 shadow-xs">
            <div className="flex justify-between text-xs font-semibold text-rose-700 mb-1">
              <span>이미지 변환 및 등록 중</span>
              <span>{uploadProgress.current} / {uploadProgress.total}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-rose-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2">
          <button
            type="button"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer transition-all"
          >
            <ImageIcon className="w-4 h-4" />
            <span>여러 이미지 한 번에 선택하기</span>
          </button>
        </div>
      </div>

      {/* Format Notice */}
      <div className="mt-3 flex items-start space-x-2 text-xs text-slate-600 bg-amber-50/80 border border-amber-200 rounded-lg p-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-900 font-semibold">연수 교사 유의사항: </strong>
          직접 그린 손그림이나 사진도 업로드 후 <strong className="text-indigo-700 font-semibold">⚡흑백 보정(✨)</strong> 버튼을 누르면 팝핑 머신 전용 K100 흑백 도안으로 즉시 변환됩니다. (기본 19mm 규격 적용)
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
