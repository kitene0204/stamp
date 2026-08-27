import { StandardPadPreset } from '../types';

// Standard Popping Machine Pad Size Specifications
export const STANDARD_PAD_PRESETS: StandardPadPreset[] = [
  {
    id: 'circle-10',
    name: '10mm 원형',
    shape: 'circle',
    widthMm: 10,
    heightMm: 10,
    category: '원형 (Circular)',
    description: '미니 확인용, 체크용 초소형 도장',
  },
  {
    id: 'circle-13',
    name: '13mm 원형',
    shape: 'circle',
    widthMm: 13,
    heightMm: 13,
    category: '원형 (Circular)',
    description: '알림장, 칭찬 스티커 대용 소형 도장',
  },
  {
    id: 'circle-15',
    name: '15mm 원형',
    shape: 'circle',
    widthMm: 15,
    heightMm: 15,
    category: '원형 (Circular)',
    description: '가장 많이 쓰이는 기본 확인 도장',
  },
  {
    id: 'circle-18',
    name: '18mm 원형',
    shape: 'circle',
    widthMm: 18,
    heightMm: 18,
    category: '원형 (Circular)',
    description: '캐릭터 및 짧은 칭찬 문구 도장',
  },
  {
    id: 'circle-20',
    name: '20mm 원형',
    shape: 'circle',
    widthMm: 20,
    heightMm: 20,
    category: '원형 (Circular)',
    description: '표준 칭찬 도장 ("참 잘했어요")',
  },
  {
    id: 'circle-25',
    name: '25mm 원형',
    shape: 'circle',
    widthMm: 25,
    heightMm: 25,
    category: '원형 (Circular)',
    description: '중형 칭찬/피드백 도장',
  },
  {
    id: 'circle-30',
    name: '30mm 원형',
    shape: 'circle',
    widthMm: 30,
    heightMm: 30,
    category: '원형 (Circular)',
    description: '대형 문구/선생님 캐리커처 도장',
  },
  {
    id: 'circle-38',
    name: '38mm 원형',
    shape: 'circle',
    widthMm: 38,
    heightMm: 38,
    category: '원형 (Circular)',
    description: '특대형 이벤트/상장용 도장',
  },
  {
    id: 'circle-45',
    name: '45mm 원형',
    shape: 'circle',
    widthMm: 45,
    heightMm: 45,
    category: '원형 (Circular)',
    description: '대형 엠블럼 도장',
  },
  {
    id: 'circle-50',
    name: '50mm 원형 (최대)',
    shape: 'circle',
    widthMm: 50,
    heightMm: 50,
    category: '원형 (Circular)',
    description: '팝핑 머신 지원 최대 원형 규격',
  },
  {
    id: 'rect-10-10',
    name: '10 x 10mm 정사각',
    shape: 'rectangle',
    widthMm: 10,
    heightMm: 10,
    category: '사각 (Rectangular)',
    description: '초소형 사각 체크 도장',
  },
  {
    id: 'rect-15-15',
    name: '15 x 15mm 정사각',
    shape: 'rectangle',
    widthMm: 15,
    heightMm: 15,
    category: '사각 (Rectangular)',
    description: '기본 한자/한글 인감형 사각 도장',
  },
  {
    id: 'rect-20-20',
    name: '20 x 20mm 정사각',
    shape: 'rectangle',
    widthMm: 20,
    heightMm: 20,
    category: '사각 (Rectangular)',
    description: '전결, 결재, 확인용 정사각 도장',
  },
  {
    id: 'rect-10-40',
    name: '10 x 40mm 네임 도장',
    shape: 'rectangle',
    widthMm: 40,
    heightMm: 10,
    category: '특수/이름 (Special)',
    description: '선생님 성함, 학생 이름 라벨형 도장',
  },
  {
    id: 'rect-15-30',
    name: '15 x 30mm 직사각',
    shape: 'rectangle',
    widthMm: 30,
    heightMm: 15,
    category: '사각 (Rectangular)',
    description: '2줄 문구 (과제확인, 날짜란 등)',
  },
  {
    id: 'rect-20-40',
    name: '20 x 40mm 직사각',
    shape: 'rectangle',
    widthMm: 40,
    heightMm: 20,
    category: '사각 (Rectangular)',
    description: '피드백 문구 및 서명란 도장',
  },
  {
    id: 'rect-25-50',
    name: '25 x 50mm 대형 직사각',
    shape: 'rectangle',
    widthMm: 50,
    heightMm: 25,
    category: '사각 (Rectangular)',
    description: '상세 검사기준표/칭찬표 도장',
  },
];

// Helper to generate SVG Data URLs for built-in teacher stamp samples
export function createSvgStampDataUrl(
  title: string,
  subText: string,
  symbol: string,
  type: 'circle' | 'square' | 'praise' | 'check' | 'star'
): string {
  let svg = '';
  
  if (type === 'circle' || type === 'praise') {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#000000" stroke-width="8" />
        <circle cx="150" cy="150" r="126" fill="none" stroke="#000000" stroke-width="3" stroke-dasharray="6,4" />
        <text x="150" y="80" font-family="'Noto Sans KR', sans-serif" font-weight="900" font-size="28" fill="#000000" text-anchor="middle">${subText}</text>
        <text x="150" y="165" font-family="'Noto Sans KR', sans-serif" font-weight="900" font-size="44" fill="#000000" text-anchor="middle">${title}</text>
        <text x="150" y="235" font-family="'Noto Sans KR', sans-serif" font-weight="800" font-size="42" fill="#000000" text-anchor="middle">${symbol}</text>
      </svg>
    `;
  } else if (type === 'check') {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#000000" stroke-width="10" />
        <rect x="50" y="50" width="200" height="200" rx="16" fill="none" stroke="#000000" stroke-width="5" />
        <text x="150" y="170" font-family="'Noto Sans KR', sans-serif" font-weight="900" font-size="62" fill="#000000" text-anchor="middle" letter-spacing="8">${title}</text>
        <text x="150" y="225" font-family="'Noto Sans KR', sans-serif" font-weight="600" font-size="22" fill="#000000" text-anchor="middle">${subText}</text>
      </svg>
    `;
  } else if (type === 'star') {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#000000" stroke-width="8" />
        <path d="M150,45 L175,115 L250,115 L190,160 L212,230 L150,185 L88,230 L110,160 L50,115 L125,115 Z" fill="none" stroke="#000000" stroke-width="6" />
        <text x="150" y="165" font-family="'Noto Sans KR', sans-serif" font-weight="900" font-size="34" fill="#000000" text-anchor="middle">${title}</text>
        <text x="150" y="270" font-family="'Noto Sans KR', sans-serif" font-weight="700" font-size="24" fill="#000000" text-anchor="middle">${subText}</text>
      </svg>
    `;
  } else {
    // Square / Rect
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect x="15" y="15" width="270" height="270" rx="20" fill="none" stroke="#000000" stroke-width="10" />
        <rect x="30" y="30" width="240" height="240" rx="12" fill="none" stroke="#000000" stroke-width="3" />
        <text x="150" y="130" font-family="'Noto Sans KR', sans-serif" font-weight="900" font-size="46" fill="#000000" text-anchor="middle">${title}</text>
        <line x1="50" y1="160" x2="250" y2="160" stroke="#000000" stroke-width="4" />
        <text x="150" y="210" font-family="'Noto Sans KR', sans-serif" font-weight="700" font-size="28" fill="#000000" text-anchor="middle">${subText}</text>
      </svg>
    `;
  }

  const encoded = encodeURIComponent(svg.trim());
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export interface PresetSampleItem {
  name: string;
  category: string;
  defaultWidthMm: number;
  defaultHeightMm: number;
  shape: 'circle' | 'rectangle';
  title: string;
  subText: string;
  symbol: string;
  type: 'circle' | 'square' | 'praise' | 'check' | 'star';
}

export const PRESET_SAMPLES: PresetSampleItem[] = [
  {
    name: '참 잘했어요 (기본 원형 20mm)',
    category: '칭찬 도장',
    defaultWidthMm: 20,
    defaultHeightMm: 20,
    shape: 'circle',
    title: '참 잘했어요',
    subText: 'GREAT JOB',
    symbol: '★ ★ ★',
    type: 'praise',
  },
  {
    name: '최고예요! (별 도장 22mm)',
    category: '칭찬 도장',
    defaultWidthMm: 22,
    defaultHeightMm: 22,
    shape: 'circle',
    title: '최고예요',
    subText: 'EXCELLENT',
    symbol: '★★★★★',
    type: 'star',
  },
  {
    name: '확인 (기본 결재 15mm)',
    category: '확인/검사 도장',
    defaultWidthMm: 15,
    defaultHeightMm: 15,
    shape: 'circle',
    title: '확 인',
    subText: '선생님',
    symbol: '✔',
    type: 'check',
  },
  {
    name: '숙제 검사완료 (사각 20x20mm)',
    category: '확인/검사 도장',
    defaultWidthMm: 20,
    defaultHeightMm: 20,
    shape: 'rectangle',
    title: '숙제검사',
    subText: '확인완료',
    symbol: '',
    type: 'square',
  },
  {
    name: '다시 풀어보세요 (원형 20mm)',
    category: '학습 지도 도장',
    defaultWidthMm: 20,
    defaultHeightMm: 20,
    shape: 'circle',
    title: '다시풀기',
    subText: 'TRY AGAIN',
    symbol: '✏️',
    type: 'circle',
  },
  {
    name: '스스로 학습 완료 (원형 25mm)',
    category: '칭찬 도장',
    defaultWidthMm: 25,
    defaultHeightMm: 25,
    shape: 'circle',
    title: '스스로학습',
    subText: 'SELF-STUDY',
    symbol: '💯',
    type: 'praise',
  },
];
