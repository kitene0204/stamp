/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  StampItem, 
  LayoutSettings, 
  ImageFilterSettings 
} from './types';
import { 
  DEFAULT_LAYOUT_SETTINGS, 
  calculateA4Layout 
} from './utils/layoutEngine';
import { 
  DEFAULT_FILTER_SETTINGS 
} from './utils/imageProcessor';
import { 
  PRESET_SAMPLES, 
  createSvgStampDataUrl 
} from './data/presets';
import { exportLayoutToPdf } from './utils/pdfExport';

// Components
import { Header } from './components/Header';
import { StampList } from './components/StampList';
import { A4PreviewCanvas } from './components/A4PreviewCanvas';
import { TextStampModal } from './components/TextStampModal';
import { PresetLibraryModal } from './components/PresetLibraryModal';
import { FilterEditorModal } from './components/FilterEditorModal';
import { PrintGuideModal } from './components/PrintGuideModal';
import { PageSettingsModal } from './components/PageSettingsModal';
import { PrintAreaDOM } from './components/PrintAreaDOM';

// Initial Starter Stamps for instant gratification (includes 19mm popping standard)
const INITIAL_STARTER_STAMPS: StampItem[] = [
  {
    id: 'starter-popping-19',
    name: '19mm 팝핑 표준 도장 (참 잘했어요)',
    imageUrl: createSvgStampDataUrl(
      '참 잘했어요',
      'POP-STAMP 19MM',
      '★ ★ ★',
      'praise'
    ),
    originalWidth: 300,
    originalHeight: 300,
    aspectRatio: 1,
    widthMm: 19,
    heightMm: 19,
    lockAspectRatio: true,
    shape: 'circle',
    copies: 2,
    showCutGuide: true,
    cutGuideColor: '#94a3b8',
    cutGuideStyle: 'solid',
    cutGuideMarginMm: 1.0,
    filters: { ...DEFAULT_FILTER_SETTINGS },
    sourceType: 'preset',
    createdAt: Date.now() - 4000,
  },
  {
    id: 'starter-check-2',
    name: '선생님 확인 (15mm 원형)',
    imageUrl: createSvgStampDataUrl(
      '확 인',
      '선생님',
      '✔',
      'check'
    ),
    originalWidth: 300,
    originalHeight: 300,
    aspectRatio: 1,
    widthMm: 15,
    heightMm: 15,
    lockAspectRatio: true,
    shape: 'circle',
    copies: 2,
    showCutGuide: true,
    cutGuideColor: '#94a3b8',
    cutGuideStyle: 'solid',
    cutGuideMarginMm: 1.0,
    filters: { ...DEFAULT_FILTER_SETTINGS },
    sourceType: 'preset',
    createdAt: Date.now() - 2000,
  },
  {
    id: 'starter-star-3',
    name: '최고예요! (19mm 정사각 패드)',
    imageUrl: createSvgStampDataUrl(
      '최고예요',
      'EXCELLENT',
      '★★★★★',
      'star'
    ),
    originalWidth: 300,
    originalHeight: 300,
    aspectRatio: 1,
    widthMm: 19,
    heightMm: 19,
    lockAspectRatio: true,
    shape: 'rectangle',
    copies: 2,
    showCutGuide: true,
    cutGuideColor: '#94a3b8',
    cutGuideStyle: 'solid',
    cutGuideMarginMm: 1.0,
    filters: { ...DEFAULT_FILTER_SETTINGS },
    sourceType: 'preset',
    createdAt: Date.now() - 1000,
  },
];

export default function App() {
  const [stamps, setStamps] = useState<StampItem[]>(INITIAL_STARTER_STAMPS);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT_SETTINGS);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Modals state
  const [isTextStampModalOpen, setIsTextStampModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrintGuideModalOpen, setIsPrintGuideModalOpen] = useState(false);
  const [filterModalStamp, setFilterModalStamp] = useState<StampItem | null>(null);

  // Calculate A4 Layout real-time
  const layoutResult = useMemo(() => {
    return calculateA4Layout(stamps, layoutSettings);
  }, [stamps, layoutSettings]);

  const totalCopies = useMemo(() => {
    return stamps.reduce((acc, s) => acc + (s.copies || 1), 0);
  }, [stamps]);

  // Stamp CRUD handlers
  const handleAddStamps = (newStamps: StampItem[]) => {
    setStamps((prev) => [...newStamps, ...prev]);
  };

  const handleUpdateStamp = (updated: StampItem) => {
    setStamps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteStamp = (id: string) => {
    setStamps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDuplicateStamp = (stamp: StampItem) => {
    const copy: StampItem = {
      ...stamp,
      id: `stamp-copy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${stamp.name} (복사본)`,
      createdAt: Date.now(),
    };
    setStamps((prev) => [copy, ...prev]);
  };

  const handleClearAll = () => {
    if (window.confirm('등록된 모든 도장 디자인을 목록에서 삭제하시겠습니까?')) {
      setStamps([]);
    }
  };

  // Filter application
  const handleApplyFilters = (
    stampId: string,
    filters: ImageFilterSettings,
    processedUrl: string
  ) => {
    setStamps((prev) =>
      prev.map((s) =>
        s.id === stampId
          ? {
              ...s,
              filters,
              processedImageUrl: processedUrl,
            }
          : s
      )
    );
  };

  // Print system
  const handleDirectPrint = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleOpenPrintFlow = () => {
    // Show the essential print guide modal
    setIsPrintGuideModalOpen(true);
  };

  // PDF Export
  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await exportLayoutToPdf(layoutResult, layoutSettings);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Focus card on canvas click
  const handleSelectStampFromCanvas = (stampId: string) => {
    const el = document.getElementById(`stamp-card-${stampId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-rose-400');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-rose-400');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 1. Interactive App Header */}
      <Header
        stampsCount={stamps.length}
        totalPages={layoutResult.totalPages}
        totalCopies={totalCopies}
        onOpenTextStampModal={() => setIsTextStampModalOpen(true)}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenPrintGuide={() => setIsPrintGuideModalOpen(true)}
        onPrint={handleOpenPrintFlow}
        onExportPdf={handleExportPdf}
        onReset={handleClearAll}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* 2. Main Content Split View (Desktop 2-Column, Mobile Stacked) */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
          {/* Left Column: Stamp Management & Upload Zone (5 Cols) */}
          <section className="lg:col-span-5 space-y-4">
            <StampList
              stamps={stamps}
              onUpdateStamp={handleUpdateStamp}
              onDeleteStamp={handleDeleteStamp}
              onDuplicateStamp={handleDuplicateStamp}
              onAddStamps={handleAddStamps}
              onOpenFilterModal={(s) => setFilterModalStamp(s)}
              onOpenTextStampModal={() => setIsTextStampModalOpen(true)}
              onClearAll={handleClearAll}
            />
          </section>

          {/* Right Column: Real-time A4 Visual Preview & Canvas (7 Cols) */}
          <section className="lg:col-span-7 lg:sticky lg:top-20 h-[calc(100vh-6.5rem)] min-h-[560px]">
            <A4PreviewCanvas
              layoutResult={layoutResult}
              settings={layoutSettings}
              onUpdateSettings={setLayoutSettings}
              onSelectStamp={handleSelectStampFromCanvas}
            />
          </section>
        </div>
      </main>

      {/* 3. Dedicated Print DOM for 1:1 Physical Printing */}
      <PrintAreaDOM
        layoutResult={layoutResult}
        settings={layoutSettings}
      />

      {/* 4. Modals */}
      <TextStampModal
        isOpen={isTextStampModalOpen}
        onClose={() => setIsTextStampModalOpen(false)}
        onAddStamp={(s) => setStamps((prev) => [s, ...prev])}
      />

      <PresetLibraryModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onAddStamps={handleAddStamps}
      />

      <FilterEditorModal
        stamp={filterModalStamp}
        isOpen={!!filterModalStamp}
        onClose={() => setFilterModalStamp(null)}
        onApplyFilters={handleApplyFilters}
      />

      <PageSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={layoutSettings}
        onUpdateSettings={setLayoutSettings}
      />

      <PrintGuideModal
        isOpen={isPrintGuideModalOpen}
        onClose={() => setIsPrintGuideModalOpen(false)}
        onProceedPrint={handleDirectPrint}
      />
    </div>
  );
}
