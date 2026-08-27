import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  Stamp, 
  Circle, 
  Square, 
  Check 
} from 'lucide-react';
import { StampItem, StampShape } from '../types';
import { DEFAULT_FILTER_SETTINGS } from '../utils/imageProcessor';

interface TextStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStamp: (stamp: StampItem) => void;
}

const FONT_OPTIONS = [
  { id: "'Noto Sans KR', sans-serif", name: '고딕 (Noto Sans)' },
  { id: "'Black Han Sans', sans-serif", name: '굵은 고딕 (Black Han)' },
  { id: "'Do Hyeon', sans-serif", name: '도현체 (Do Hyeon)' },
  { id: "'Gowun Dodum', sans-serif", name: '고운 돋움 (Gowun Dodum)' },
  { id: "'Gowun Batang', serif", name: '고운 바탕 (Gowun Batang)' },
  { id: "'Jua', sans-serif", name: '주아체 (Jua)' },
  { id: "'Gaegu', cursive", name: '개구체 (Gaegu - 손글씨)' },
  { id: "'Nanum Pen Script', cursive", name: '나눔 손글씨 펜' },
];

const SYMBOL_PRESETS = ['★', '★★★★★', '💮', '💯', '👍', '😊', '✏️', '📚', '👑', '🍀', '❤️', '✔'];

const TEMPLATES = [
  {
    name: '참 잘했어요 (기본)',
    topText: 'GREAT JOB',
    mainText: '참 잘했어요',
    bottomText: '★ ★ ★',
    shape: 'circle' as StampShape,
    borderStyle: 'double',
    font: "'Noto Sans KR', sans-serif",
    sizeMm: 20,
  },
  {
    name: '선생님 확인 (결재)',
    topText: '선생님',
    mainText: '확 인',
    bottomText: '✔',
    shape: 'circle' as StampShape,
    borderStyle: 'single',
    font: "'Black Han Sans', sans-serif",
    sizeMm: 15,
  },
  {
    name: '숙제 검사완료 (사각)',
    topText: '과제확인',
    mainText: '검사완료',
    bottomText: '💯',
    shape: 'rectangle' as StampShape,
    borderStyle: 'double',
    font: "'Do Hyeon', sans-serif",
    sizeMm: 20,
  },
  {
    name: '스스로 학습 최고 (손글씨)',
    topText: 'SELF-STUDY',
    mainText: '스스로 최고!',
    bottomText: '👍',
    shape: 'circle' as StampShape,
    borderStyle: 'single',
    font: "'Jua', sans-serif",
    sizeMm: 25,
  },
];

export const TextStampModal: React.FC<TextStampModalProps> = ({
  isOpen,
  onClose,
  onAddStamp,
}) => {
  const [topText, setTopText] = useState('GREAT JOB');
  const [mainText, setMainText] = useState('참 잘했어요');
  const [bottomText, setBottomText] = useState('★ ★ ★');
  const [shape, setShape] = useState<StampShape>('circle');
  const [borderStyle, setBorderStyle] = useState<'single' | 'double' | 'dotted'>('double');
  const [borderWidth, setBorderWidth] = useState<number>(8);
  const [fontFamily, setFontFamily] = useState<string>("'Noto Sans KR', sans-serif");
  const [sizeMm, setSizeMm] = useState<number>(20);
  const [inkColor, setInkColor] = useState<string>('#000000'); // Popping flash stamps use black
  const [copies, setCopies] = useState<number>(1);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setTopText(t.topText);
    setMainText(t.mainText);
    setBottomText(t.bottomText);
    setShape(t.shape);
    setBorderStyle(t.borderStyle as any);
    setFontFamily(t.font);
    setSizeMm(t.sizeMm);
  };

  // Render SVG/Canvas preview
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    const size = 500;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = inkColor;
    ctx.strokeStyle = inkColor;

    const cx = size / 2;
    const cy = size / 2;

    if (shape === 'circle') {
      const radius = size / 2 - 20;

      // Outer Border
      ctx.lineWidth = borderWidth;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Border if double or dotted
      if (borderStyle === 'double') {
        ctx.lineWidth = Math.max(2, borderWidth * 0.4);
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 16, 0, Math.PI * 2);
        ctx.stroke();
      } else if (borderStyle === 'dotted') {
        ctx.lineWidth = Math.max(2, borderWidth * 0.5);
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Top text (Curved or straight top)
      if (topText.trim()) {
        ctx.font = `bold 36px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(topText, cx, cy - 110);
      }

      // Main Center text (Large)
      if (mainText.trim()) {
        const textLen = mainText.length;
        const fontSize = textLen <= 2 ? 80 : textLen <= 4 ? 64 : textLen <= 6 ? 52 : 42;
        ctx.font = `900 ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mainText, cx, cy);
      }

      // Bottom text / symbol
      if (bottomText.trim()) {
        ctx.font = `bold 44px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bottomText, cx, cy + 110);
      }
    } else {
      // Rectangle / Rounded
      const pad = 24;
      const w = size - pad * 2;
      const h = size - pad * 2;
      const r = shape === 'rounded' ? 32 : 8;

      ctx.lineWidth = borderWidth;
      ctx.beginPath();
      ctx.roundRect(pad, pad, w, h, r);
      ctx.stroke();

      if (borderStyle === 'double') {
        ctx.lineWidth = Math.max(2, borderWidth * 0.4);
        ctx.beginPath();
        ctx.roundRect(pad + 16, pad + 16, w - 32, h - 32, Math.max(0, r - 8));
        ctx.stroke();
      }

      if (topText.trim()) {
        ctx.font = `bold 36px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(topText, cx, cy - 100);
      }

      if (mainText.trim()) {
        const textLen = mainText.length;
        const fontSize = textLen <= 2 ? 84 : textLen <= 4 ? 68 : textLen <= 6 ? 54 : 44;
        ctx.font = `900 ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mainText, cx, cy);
      }

      if (bottomText.trim()) {
        ctx.font = `bold 42px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bottomText, cx, cy + 100);
      }
    }

    setPreviewDataUrl(canvas.toDataURL('image/png'));
  }, [
    isOpen,
    topText,
    mainText,
    bottomText,
    shape,
    borderStyle,
    borderWidth,
    fontFamily,
    inkColor,
  ]);

  if (!isOpen) return null;

  const handleCreateAndAdd = () => {
    if (!previewDataUrl) return;

    const stamp: StampItem = {
      id: `text-stamp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: mainText || '텍스트 도장',
      imageUrl: previewDataUrl,
      originalWidth: 500,
      originalHeight: 500,
      aspectRatio: 1,
      widthMm: sizeMm,
      heightMm: sizeMm,
      lockAspectRatio: true,
      shape: shape,
      copies: copies,
      showCutGuide: false,
      cutGuideColor: '#94a3b8',
      cutGuideStyle: 'solid',
      cutGuideMarginMm: 1.0,
      filters: { ...DEFAULT_FILTER_SETTINGS },
      sourceType: 'text-generator',
      createdAt: Date.now(),
    };

    onAddStamp(stamp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                선생님 전용 텍스트 도장 제작기
              </h2>
              <p className="text-xs text-slate-500">
                원하는 칭찬 문구나 확인 도장을 손쉽게 디자인하고 바로 인쇄 배치에 추가하세요.
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
          {/* Left: Live Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-2">실시간 도장 미리보기</div>
            <div className="w-52 h-52 bg-white rounded-xl shadow-md border border-slate-200 p-3 flex items-center justify-center relative overflow-hidden">
              <img
                src={previewDataUrl}
                alt="Stamp Preview"
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute bottom-1 right-1 bg-slate-900/75 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                실측: {sizeMm} x {sizeMm} mm
              </div>
            </div>

            {/* Quick Templates */}
            <div className="w-full mt-4">
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                추천 템플릿 바로 적용:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {TEMPLATES.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="text-left p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-[11px] font-medium text-slate-700 transition-colors"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Controls & Form */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* Text Inputs */}
            <div className="space-y-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  상단 서브 문구 (영문/짧은 문구)
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="예: GREAT JOB, 1학년 2반"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  중앙 메인 문구 (핵심 칭찬/단어) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={mainText}
                  onChange={(e) => setMainText(e.target.value)}
                  placeholder="예: 참 잘했어요, 확인, 최고예요"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold text-sm focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  하단 문구 또는 기호
                </label>
                <div className="flex space-x-1.5 mb-1.5">
                  <input
                    type="text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="예: ★ ★ ★, 김선생님"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-rose-500 outline-hidden"
                  />
                </div>
                {/* Symbol quick clickers */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                  <span className="text-[10px] text-slate-400 shrink-0">기호:</span>
                  {SYMBOL_PRESETS.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setBottomText(sym)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-semibold shrink-0"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shape & Border Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">도장 형태</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setShape('circle')}
                    className={`py-1.5 rounded-lg border text-center font-medium ${
                      shape === 'circle'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    원형
                  </button>
                  <button
                    type="button"
                    onClick={() => setShape('rectangle')}
                    className={`py-1.5 rounded-lg border text-center font-medium ${
                      shape === 'rectangle'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    사각
                  </button>
                  <button
                    type="button"
                    onClick={() => setShape('rounded')}
                    className={`py-1.5 rounded-lg border text-center font-medium ${
                      shape === 'rounded'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    둥근사각
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">외곽 테두리 스타일</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setBorderStyle('single')}
                    className={`py-1.5 rounded-lg border text-center font-medium ${
                      borderStyle === 'single'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    단선
                  </button>
                  <button
                    type="button"
                    onClick={() => setBorderStyle('double')}
                    className={`py-1.5 rounded-lg border text-center font-medium ${
                      borderStyle === 'double'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    이중선
                  </button>
                  <button
                    type="button"
                    onClick={() => setBorderStyle('dotted')}
                    className={`py-1.5 rounded-lg border text-center font-medium ${
                      borderStyle === 'dotted'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    점선
                  </button>
                </div>
              </div>
            </div>

            {/* Font Picker */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">서체 (글꼴)</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-rose-500 outline-hidden"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Size & Copies */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">도장 크기 (직접 기입):</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="5"
                      max="80"
                      step="0.5"
                      value={sizeMm}
                      onChange={(e) => setSizeMm(parseFloat(e.target.value) || 19)}
                      className="w-14 text-center text-xs font-mono font-bold bg-white border border-rose-300 text-rose-700 rounded px-1 py-0.5"
                    />
                    <span className="text-slate-500 font-mono">mm</span>
                  </div>
                </div>

                {/* Quick 19mm / standard buttons */}
                <div className="flex items-center space-x-1 mb-1.5 flex-wrap gap-y-1">
                  {[15, 18, 19, 20, 25, 30, 50, 80].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSizeMm(sz)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        sizeMm === sz
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : sz === 19
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {sz}mm{sz === 19 ? '★' : ''}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="5"
                  max="80"
                  step="0.5"
                  value={sizeMm}
                  onChange={(e) => setSizeMm(parseFloat(e.target.value) || 19)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">출력 수량</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleCreateAndAdd}
            disabled={!mainText.trim()}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 disabled:opacity-50 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>스탬프 생성 후 배치에 추가</span>
          </button>
        </div>
      </div>
    </div>
  );
};
