import React from 'react';
import { Radio, Users, QrCode, Send, Sparkles, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import { WorkshopRoom, TeacherParticipant, StampItem } from '../types';

interface WorkshopBannerProps {
  room: WorkshopRoom | null;
  currentUser: TeacherParticipant | null;
  stampsCount: number;
  onOpenRoomModal: () => void;
  onQuickUploadPrompt?: () => void;
}

export const WorkshopBanner: React.FC<WorkshopBannerProps> = ({
  room,
  currentUser,
  stampsCount,
  onOpenRoomModal,
  onQuickUploadPrompt,
}) => {
  if (!room) {
    return (
      <div className="no-print bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border-b border-rose-200/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-800">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-bold text-rose-950">
              💡 교원 연수 실시간 수합 모드:
            </span>
            <span className="text-slate-600 hidden sm:inline">
              선생님들이 각자 노트북/스마트폰으로 도안을 올리면 내 A4 화면에 3cm 간격으로 자동 모입니다!
            </span>
          </div>

          <button
            onClick={onOpenRoomModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>실시간 연수 수합방 개설 / 참여하기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const isHost = currentUser?.role === 'host';
  const myStampsCount = isHost
    ? stampsCount
    : room.stamps.filter((s) => s.authorName === currentUser?.name).length;

  return (
    <div className="no-print bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-2 text-xs shadow-md z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Room Status Indicator */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-mono font-bold tracking-wider">{room.roomId}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-white truncate max-w-xs">{room.roomName}</span>
            <span className="hidden md:inline-block text-rose-200">|</span>
            <span className="hidden md:flex items-center space-x-1 text-rose-100 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>접속 교사: <strong className="text-white font-bold">{room.participants.length}명</strong></span>
            </span>
            <span className="hidden sm:inline-block text-rose-200">|</span>
            <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">
              수합 완료: <strong className="text-amber-300 font-extrabold">{room.stamps.length}개</strong>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {currentUser && (
            <span className="text-xs text-rose-100 hidden lg:inline">
              접속자: <strong className="text-white font-bold">{currentUser.name}</strong>
              {!isHost && ` (내 제출: ${myStampsCount}개)`}
            </span>
          )}

          <button
            onClick={onOpenRoomModal}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-xs transition-colors cursor-pointer"
            title="QR코드 및 접속 정보 보기"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR / 참여 관리</span>
          </button>
        </div>
      </div>
    </div>
  );
};
