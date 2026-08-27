import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Users,
  QrCode,
  Copy,
  Check,
  Radio,
  Share2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Send,
} from 'lucide-react';
import QRCode from 'qrcode';
import { WorkshopRoom, TeacherParticipant } from '../types';
import confetti from 'canvas-confetti';

interface WorkshopRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: WorkshopRoom | null;
  currentUser: TeacherParticipant | null;
  onJoinOrCreate: (roomId: string, roomName: string, userName: string, role: 'host' | 'teacher') => void;
  onLeaveRoom: () => void;
  onSendReaction: (emoji: string) => void;
}

export const WorkshopRoomModal: React.FC<WorkshopRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  currentUser,
  onJoinOrCreate,
  onLeaveRoom,
  onSendReaction,
}) => {
  const [tab, setTab] = useState<'info' | 'create' | 'join'>('info');
  const [inputRoomId, setInputRoomId] = useState('POP2024');
  const [inputRoomName, setInputRoomName] = useState('2026학년도 교원 팝핑 도장 연수');
  const [inputUserName, setInputUserName] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (currentUser?.name) {
      setInputUserName(currentUser.name);
    }
  }, [currentUser]);

  // Generate QR Code whenever room changes
  useEffect(() => {
    if (room?.roomId) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(
        room.roomId
      )}`;
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#9f1239', // Rose 800
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [room?.roomId]);

  if (!isOpen) return null;

  const shareUrl = room
    ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room.roomId)}`
    : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = (inputRoomId || `POP${Math.floor(100 + Math.random() * 900)}`).trim().toUpperCase();
    const cleanUser = inputUserName.trim() || '연수 진행자';
    onJoinOrCreate(cleanId, inputRoomName.trim() || `${cleanId} 팝핑 도장 연수`, cleanUser, 'host');
    setTab('info');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputRoomId.trim().toUpperCase();
    if (!cleanId) return;
    const cleanUser = inputUserName.trim() || '선생님';
    onJoinOrCreate(cleanId, `${cleanId} 팝핑 연수방`, cleanUser, 'teacher');
    setTab('info');
  };

  const triggerConfetti = (emoji: string) => {
    onSendReaction(emoji);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <span>실시간 연수 수합방 (교사 도안 자동 수합)</span>
              </h2>
              <p className="text-xs text-rose-100">
                선생님들이 각자 올린 도안이 진행자 화면의 A4에 3cm 간격으로 실시간 수합됩니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          {room ? (
            /* Active Room View */
            <div className="space-y-4">
              {/* Room Card with QR and Link */}
              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl flex flex-col md:flex-row items-center gap-4">
                {/* QR Code */}
                {qrDataUrl && (
                  <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-xs shrink-0 text-center">
                    <img src={qrDataUrl} alt="연수방 QR코드" className="w-32 h-32 mx-auto rounded-lg" />
                    <span className="text-[10px] font-bold text-rose-700 mt-1 block">스마트폰 카메라로 스캔</span>
                  </div>
                )}

                {/* Room Info & Join Link */}
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-full">
                      수합 진행 중
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      개설: {new Date(room.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {room.roomName}
                  </h3>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-600 font-medium">수합방 코드:</span>
                    <strong className="text-lg font-mono font-black text-rose-600 tracking-wider bg-white px-2.5 py-0.5 rounded-lg border border-rose-300">
                      {room.roomId}
                    </strong>
                  </div>

                  {/* Share Link Box */}
                  <div className="flex items-center space-x-1.5 pt-1">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full text-xs font-mono bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 text-slate-600 truncate focus:outline-hidden select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                      }`}
                      title="선생님들께 공유할 링크 복사"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>복사됨!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>링크 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Connected Teachers List */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-sm">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>현재 접속 중인 선생님 ({room.participants.length}명)</span>
                  </div>
                  <span className="text-xs text-rose-600 font-bold">
                    총 수합 도장: {room.stamps.length}개
                  </span>
                </div>

                {room.participants.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">
                    선생님들이 링크나 QR코드로 접속하면 여기에 실시간으로 표시됩니다.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {room.participants.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-2"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: p.color || '#e11d48' }}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 text-xs truncate flex items-center space-x-1">
                            <span>{p.name}</span>
                            {p.role === 'host' && (
                              <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-semibold">
                                진행
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            제출 도장: <strong className="text-rose-600">{p.submittedCount}개</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cheering / Reactions */}
              <div className="flex items-center justify-between p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-xs font-bold text-amber-950 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>연수 참여 격려 리액션 보내기:</span>
                </span>
                <div className="flex items-center space-x-1.5">
                  {['👏', '🎉', '💖', '👍', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => triggerConfetti(emoji)}
                      className="p-1.5 hover:bg-white rounded-lg text-base transition-transform active:scale-125 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leave Room Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onLeaveRoom}
                  className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>수합방 나가기 / 새 방 만들기</span>
                </button>
              </div>
            </div>
          ) : (
            /* Create or Join Tabs */
            <div className="space-y-4">
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTab('create')}
                  className={`py-2 rounded-lg transition-all ${
                    tab === 'create'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. 진행자용 수합방 개설 (Host)
                </button>
                <button
                  type="button"
                  onClick={() => setTab('join')}
                  className={`py-2 rounded-lg transition-all ${
                    tab === 'join'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2. 참여 교사용 방 입장 (Teacher)
                </button>
              </div>

              {tab === 'create' ? (
                <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                  <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-rose-950 text-xs flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>연수 진행 교사 모드 (호스트 화면)</span>
                    </h4>
                    <p className="text-[11px] text-rose-800">
                      방을 개설하면 QR코드와 링크가 생성됩니다. 참여 선생님들이 도안을 올리면 내 A4 용지에 실시간으로 3cm 간격 배치되어 한 번에 1:1 정밀 인쇄할 수 있습니다.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      수합방 코드 (영문/숫자):
                    </label>
                    <input
                      type="text"
                      required
                      value={inputRoomId}
                      onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                      placeholder="예: POP2024"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      연수 제목 / 방 이름:
                    </label>
                    <input
                      type="text"
                      required
                      value={inputRoomName}
                      onChange={(e) => setInputRoomName(e.target.value)}
                      placeholder="예: 2026학년도 교원 팝핑 도장 만들기 연수"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      진행자 성함:
                    </label>
                    <input
                      type="text"
                      required
                      value={inputUserName}
                      onChange={(e) => setInputUserName(e.target.value)}
                      placeholder="예: 김선생님 (진행)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 active:bg-rose-800 shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Radio className="w-4 h-4" />
                    <span>실시간 수합방 개설하고 QR코드 생성하기</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-3.5">
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-indigo-950 text-xs flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>연수 참여 선생님 모드</span>
                    </h4>
                    <p className="text-[11px] text-indigo-800">
                      진행자 선생님이 알려주신 방 코드를 입력하고 성함을 적으시면, 도안 업로드 시 진행자의 인쇄 화면으로 바로 전달됩니다.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      수합방 코드 입력:
                    </label>
                    <input
                      type="text"
                      required
                      value={inputRoomId}
                      onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                      placeholder="예: POP2024"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      선생님 성함:
                    </label>
                    <input
                      type="text"
                      required
                      value={inputUserName}
                      onChange={(e) => setInputUserName(e.target.value)}
                      placeholder="예: 박민수 선생님"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>수합방 입장하여 도장 제출하기</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
