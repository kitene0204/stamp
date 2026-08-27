import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Ruler, 
  Settings2,
  FileCheck
} from 'lucide-react';

interface PrintGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedPrint: () => void;
}

export const PrintGuideModal: React.FC<PrintGuideModalProps> = ({
  isOpen,
  onClose,
  onProceedPrint,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1:1 정밀 인쇄 브라우저 설정 가이드
              </h2>
              <p className="text-xs text-rose-700 font-medium">
                실제 도장 패드 규격과 100% 오차 없이 출력하기 위한 필수 설정입니다.
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
        <div className="p-6 space-y-4 text-xs">
          {/* Main 3 Steps */}
          <div className="space-y-3">
            {/* Step 1: Scale 100% */}
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    배율(Scale): <span className="text-rose-600">"100%"</span> 또는 <span className="text-rose-600">"맞춤 해제"</span>
                  </h3>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                    가장 중요 ★
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  브라우저 인쇄 대화상자의 <strong>설정 더보기 &gt; 배율</strong>에서 "페이지에 맞춤"을 <strong>해제</strong>하고 반드시 <strong>100% (기본값)</strong>으로 설정하세요.
                </p>
              </div>
            </div>

            {/* Step 2: Margin None or Default */}
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  여백(Margins): <strong>"없음 (None)"</strong> 또는 "기본"
                </h3>
                <p className="text-slate-600 mt-1">
                  여백을 '없음'으로 선택하시면 웹앱에서 지정한 정확한 A4 여백 기준(상하좌우 10mm)이 1:1로 반영됩니다.
                </p>
              </div>
            </div>

            {/* Step 3: Headers & Footers */}
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  머리글 및 바닥글: <strong>체크 해제</strong>
                </h3>
                <p className="text-slate-600 mt-1">
                  웹사이트 URL이나 인쇄 일자 등 브라우저 기본 머리글/바닥글이 도장 영역을 가리지 않도록 체크를 해제해 주세요.
                </p>
              </div>
            </div>
          </div>

          {/* Verification check callout */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
            <Ruler className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">인쇄 후 100% 실측 검증 방법</h4>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                출력된 용지 우측 상단의 <strong className="underline">50mm 확인 자</strong>에 실제 플라스틱 자를 대보세요. 눈금이 정확히 5cm(50mm)와 일치하면 팝핑 머신 제작에 100% 완벽한 출력 상태입니다!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onProceedPrint();
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>확인 후 바로 인쇄 창 열기 (1:1)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
