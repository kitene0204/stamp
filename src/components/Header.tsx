import React from 'react';
import { 
  Printer, 
  Download, 
  Sparkles, 
  Settings, 
  HelpCircle, 
  Layers, 
  RotateCcw,
  Stamp,
  Radio
} from 'lucide-react';

interface HeaderProps {
  stampsCount: number;
  totalPages: number;
  totalCopies: number;
  onOpenTextStampModal: () => void;
  onOpenPresetModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPrintGuide: () => void;
  onOpenRoomModal?: () => void;
  isRoomActive?: boolean;
  onPrint: () => void;
  onExportPdf: () => void;
  onReset: () => void;
  isGeneratingPdf: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stampsCount,
  totalPages,
  totalCopies,
  onOpenTextStampModal,
  onOpenPresetModal,
  onOpenSettingsModal,
  onOpenPrintGuide,
  onOpenRoomModal,
  isRoomActive = false,
  onPrint,
  onExportPdf,
  onReset,
  isGeneratingPdf,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 py-2.5 min-h-[4rem]">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-200 shrink-0">
              <Stamp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                  Pop-Stamp <span className="text-rose-600">Print Master</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                  팝핑 머신 1:1 정밀 인쇄
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate max-w-xs sm:max-w-md hidden md:block">
                도장 이미지 자동 최적 배치 및 1.5mm ~ 80mm 실측 출력 도구
              </p>
            </div>
          </div>

          {/* Quick Info Badge (Stats) */}
          <div className="hidden xl:flex items-center space-x-3 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap shrink-0">
            <span className="text-slate-600 whitespace-nowrap">
              등록 도장: <strong className="text-slate-900 font-bold ml-1">{stampsCount}종</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 whitespace-nowrap">
              총 출력 수량: <strong className="text-rose-600 font-bold ml-1">{totalCopies}개</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 whitespace-nowrap">
              A4 용지: <strong className="text-indigo-600 font-bold ml-1">{totalPages}장</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 ml-auto">
            {/* Workshop Room Button */}
            {onOpenRoomModal && (
              <button
                onClick={onOpenRoomModal}
                id="btn-open-workshop-room"
                className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-2xs ${
                  isRoomActive
                    ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
                title="교원 연수 실시간 도안 수합방"
              >
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
                <span className="whitespace-nowrap">연수 수합방</span>
              </button>
            )}

            {/* Text Stamp Maker */}
            <button
              onClick={onOpenTextStampModal}
              id="btn-open-text-stamp"
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors whitespace-nowrap shrink-0"
              title="간단한 텍스트로 도장 디자인 만들기"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
              <span className="whitespace-nowrap">텍스트 도장 생성</span>
            </button>

            {/* Presets Button */}
            <button
              onClick={onOpenPresetModal}
              id="btn-open-presets"
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors whitespace-nowrap shrink-0"
              title="추천 템플릿 및 규격 도장 불러오기"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
              <span className="whitespace-nowrap">규격 템플릿</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettingsModal}
              id="btn-open-settings"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              title="페이지 여백 및 간격 설정"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Help & Guide */}
            <button
              onClick={onOpenPrintGuide}
              id="btn-open-guide"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              title="1:1 인쇄 가이드 확인"
            >
              <HelpCircle className="w-4 h-4 text-sky-600" />
            </button>

            {/* PDF Export */}
            <button
              onClick={onExportPdf}
              disabled={stampsCount === 0 || isGeneratingPdf}
              id="btn-export-pdf"
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
              title="A4 규격 PDF로 저장하기"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">PDF 저장</span>
            </button>

            {/* Primary Print Button */}
            <button
              onClick={onPrint}
              disabled={stampsCount === 0}
              id="btn-print-action"
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">인쇄하기 (1:1)</span>
            </button>

            {/* Reset All */}
            {stampsCount > 0 && (
              <button
                onClick={onReset}
                id="btn-reset-all"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="전체 초기화"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
