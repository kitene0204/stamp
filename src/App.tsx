/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  StampItem, 
  LayoutSettings, 
  ImageFilterSettings,
  WorkshopRoom,
  TeacherParticipant
} from './types';
import { 
  DEFAULT_LAYOUT_SETTINGS, 
  calculateA4Layout 
} from './utils/layoutEngine';
import { 
  DEFAULT_FILTER_SETTINGS 
} from './utils/imageProcessor';
import { 
  createSvgStampDataUrl 
} from './data/presets';
import { exportLayoutToPdf } from './utils/pdfExport';
import { workshopSocket, WorkshopClient } from './services/workshopApi';

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
import { WorkshopRoomModal } from './components/WorkshopRoomModal';
import { WorkshopBanner } from './components/WorkshopBanner';

// Toast Notification
interface ToastMsg {
  id: string;
  title: string;
  desc?: string;
  type?: 'success' | 'info' | 'reaction';
  emoji?: string;
}

// Initial Starter Stamps for instant gratification
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
    authorName: '진행 교사',
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
    authorName: '진행 교사',
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
    authorName: '진행 교사',
    createdAt: Date.now() - 1000,
  },
];

export default function App() {
  const [stamps, setStamps] = useState<StampItem[]>(INITIAL_STARTER_STAMPS);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT_SETTINGS);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Workshop Real-time Room State
  const [currentRoom, setCurrentRoom] = useState<WorkshopRoom | null>(null);
  const [currentUser, setCurrentUser] = useState<TeacherParticipant | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Modals state
  const [isTextStampModalOpen, setIsTextStampModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrintGuideModalOpen, setIsPrintGuideModalOpen] = useState(false);
  const [filterModalStamp, setFilterModalStamp] = useState<StampItem | null>(null);

  const addToast = useCallback((msg: Omit<ToastMsg, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { ...msg, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Calculate A4 Layout real-time
  const layoutResult = useMemo(() => {
    return calculateA4Layout(stamps, layoutSettings);
  }, [stamps, layoutSettings]);

  const totalCopies = useMemo(() => {
    return stamps.reduce((acc, s) => acc + (s.copies || 1), 0);
  }, [stamps]);

  // Handle incoming real-time socket events
  const handleSocketMessage = useCallback(
    (action: any) => {
      if (action.type === 'sync_state' && action.room) {
        setCurrentRoom(action.room);
        if (action.room.stamps && action.room.stamps.length > 0) {
          setStamps(action.room.stamps);
        }
        if (action.room.settings) {
          setLayoutSettings(action.room.settings);
        }
      } else if (action.type === 'stamp_added' && action.stamp) {
        setStamps((prev) => {
          // Idempotency check: don't duplicate if already present
          if (prev.some((s) => s.id === action.stamp.id)) {
            return prev.map((s) => (s.id === action.stamp.id ? action.stamp : s));
          }
          return [action.stamp, ...prev];
        });

        // Trigger confetti celebration on screen
        try {
          confetti({
            particleCount: 35,
            spread: 55,
            origin: { y: 0.6, x: 0.8 },
          });
        } catch {
          // ignore
        }

        addToast({
          title: `도안 수합 완료! 📥`,
          desc: `[${action.userName || '선생님'}]의 도장이 A4에 3cm 간격으로 수합되었습니다.`,
          type: 'success',
        });
      } else if (action.type === 'stamp_updated' && action.stamp) {
        setStamps((prev) =>
          prev.map((s) => (s.id === action.stamp.id ? action.stamp : s))
        );
      } else if (action.type === 'stamp_deleted') {
        setStamps((prev) => prev.filter((s) => s.id !== action.stampId));
        addToast({
          title: '도장 삭제됨',
          desc: `도안이 목록에서 제거되었습니다.`,
          type: 'info',
        });
      } else if (action.type === 'stamps_cleared') {
        setStamps([]);
      } else if (action.type === 'settings_updated' && action.settings) {
        setLayoutSettings(action.settings);
      } else if (action.type === 'user_joined' && action.user) {
        setCurrentRoom((prev) =>
          prev
            ? {
                ...prev,
                participants: action.participants || [
                  ...prev.participants.filter((p) => p.id !== action.user.id),
                  action.user,
                ],
              }
            : null
        );
        addToast({
          title: `선생님 입장 👋`,
          desc: `${action.user.name}께서 연수방에 접속하셨습니다.`,
          type: 'info',
        });
      } else if (action.type === 'user_left') {
        setCurrentRoom((prev) =>
          prev
            ? {
                ...prev,
                participants: action.participants || prev.participants.filter((p) => p.id !== action.userId),
              }
            : null
        );
      } else if (action.type === 'reaction') {
        addToast({
          title: `${action.from}님의 응원!`,
          desc: `${action.emoji} ${action.emoji} ${action.emoji}`,
          type: 'reaction',
          emoji: action.emoji,
        });
        try {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      }
    },
    [addToast]
  );

  // Check URL params on initial load (e.g. ?room=POP2024)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      // Auto open room modal to prompt join
      setIsRoomModalOpen(true);
    }
  }, []);

  // Join or Create Workshop Room
  const handleJoinOrCreateRoom = async (
    roomId: string,
    roomName: string,
    userName: string,
    role: 'host' | 'teacher'
  ) => {
    const user: TeacherParticipant = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: userName,
      role: role,
      joinedAt: Date.now(),
      submittedCount: 0,
      color: role === 'host' ? '#e11d48' : '#4f46e5',
    };

    setCurrentUser(user);

    try {
      const res = await WorkshopClient.createOrJoinRoom(roomId, roomName, userName, user.id);
      if (res.success && res.room) {
        setCurrentRoom(res.room);
        if (res.room.stamps && res.room.stamps.length > 0) {
          setStamps(res.room.stamps);
        }

        // Connect WebSocket for real-time push
        workshopSocket.connect(roomId, user, handleSocketMessage);

        addToast({
          title: `연수 수합방 [${res.room.roomId}] 연결됨!`,
          desc:
            role === 'host'
              ? '선생님들께 QR코드나 링크를 공유하여 도안을 수합하세요.'
              : '도장을 올리면 진행자 선생님의 인쇄 용지로 바로 전달됩니다.',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Room connection error:', err);
    }
  };

  const handleLeaveRoom = () => {
    workshopSocket.disconnect();
    setCurrentRoom(null);
    setCurrentUser(null);
    addToast({
      title: '수합방 연결 해제',
      desc: '로컬 단독 모드로 전환되었습니다.',
      type: 'info',
    });
  };

  const handleSendReaction = (emoji: string) => {
    if (currentRoom) {
      WorkshopClient.sendReaction(currentRoom.roomId, currentUser?.name || '선생님', emoji);
    }
  };

  // Stamp CRUD handlers
  const handleAddStamps = async (newStamps: StampItem[]) => {
    const stampsWithUser = newStamps.map((s) => ({
      ...s,
      authorName: s.authorName || currentUser?.name || '연수 교사',
    }));

    // Local optimistic update
    setStamps((prev) => [...stampsWithUser, ...prev]);

    // If connected to room, broadcast to all participants & host!
    if (currentRoom) {
      for (const st of stampsWithUser) {
        try {
          await WorkshopClient.submitStamp(currentRoom.roomId, st, currentUser?.name || '선생님');
        } catch (err) {
          console.error('Failed to sync stamp to room:', err);
        }
      }
      addToast({
        title: '도장 수합 전송 완료! 🚀',
        desc: '진행자 선생님의 A4 인쇄 화면에 3cm 간격으로 수합되었습니다.',
        type: 'success',
      });
    }
  };

  const handleUpdateStamp = (updated: StampItem) => {
    setStamps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (currentRoom) {
      WorkshopClient.updateStamp(currentRoom.roomId, updated.id, updated);
    }
  };

  const handleDeleteStamp = (id: string) => {
    setStamps((prev) => prev.filter((s) => s.id !== id));
    if (currentRoom) {
      WorkshopClient.deleteStamp(currentRoom.roomId, id, currentUser?.name || '사용자');
    }
  };

  const handleDuplicateStamp = (stamp: StampItem) => {
    const copy: StampItem = {
      ...stamp,
      id: `stamp-copy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${stamp.name} (복사본)`,
      createdAt: Date.now(),
    };
    handleAddStamps([copy]);
  };

  const handleClearAll = () => {
    if (window.confirm('등록된 모든 도장 디자인을 목록에서 삭제하시겠습니까?')) {
      setStamps([]);
      if (currentRoom && currentUser?.role === 'host') {
        WorkshopClient.clearAllStamps(currentRoom.roomId);
      }
    }
  };

  // Filter application
  const handleApplyFilters = (
    stampId: string,
    filters: ImageFilterSettings,
    processedUrl: string
  ) => {
    setStamps((prev) =>
      prev.map((s) => {
        if (s.id === stampId) {
          const updated = {
            ...s,
            filters,
            processedImageUrl: processedUrl,
          };
          if (currentRoom) {
            WorkshopClient.updateStamp(currentRoom.roomId, stampId, updated);
          }
          return updated;
        }
        return s;
      })
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
        onOpenRoomModal={() => setIsRoomModalOpen(true)}
        isRoomActive={!!currentRoom}
        onPrint={handleOpenPrintFlow}
        onExportPdf={handleExportPdf}
        onReset={handleClearAll}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* 2. Real-time Workshop Collection Banner */}
      <WorkshopBanner
        room={currentRoom}
        currentUser={currentUser}
        stampsCount={stamps.length}
        onOpenRoomModal={() => setIsRoomModalOpen(true)}
      />

      {/* 3. Main Content Split View (Desktop 2-Column, Mobile Stacked) */}
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
              onUpdateSettings={(newSettings) => {
                setLayoutSettings(newSettings);
                if (currentRoom && currentUser?.role === 'host') {
                  WorkshopClient.updateSettings(currentRoom.roomId, newSettings);
                }
              }}
              onSelectStamp={handleSelectStampFromCanvas}
            />
          </section>
        </div>
      </main>

      {/* 4. Dedicated Print DOM for 1:1 Physical Printing */}
      <PrintAreaDOM
        layoutResult={layoutResult}
        settings={layoutSettings}
      />

      {/* 5. Live Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md transition-all animate-slide-in pointer-events-auto flex items-start space-x-3"
          >
            {t.emoji ? (
              <span className="text-2xl shrink-0">{t.emoji}</span>
            ) : (
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white">{t.title}</h4>
              {t.desc && <p className="text-[11px] text-slate-300 mt-0.5">{t.desc}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* 6. Modals */}
      <WorkshopRoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={currentRoom}
        currentUser={currentUser}
        onJoinOrCreate={handleJoinOrCreateRoom}
        onLeaveRoom={handleLeaveRoom}
        onSendReaction={handleSendReaction}
      />

      <TextStampModal
        isOpen={isTextStampModalOpen}
        onClose={() => setIsTextStampModalOpen(false)}
        onAddStamp={(s) => handleAddStamps([s])}
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
        onUpdateSettings={(newSettings) => {
          setLayoutSettings(newSettings);
          if (currentRoom && currentUser?.role === 'host') {
            WorkshopClient.updateSettings(currentRoom.roomId, newSettings);
          }
        }}
      />

      <PrintGuideModal
        isOpen={isPrintGuideModalOpen}
        onClose={() => setIsPrintGuideModalOpen(false)}
        onProceedPrint={handleDirectPrint}
      />
    </div>
  );
}
