import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

// Define types locally for server runtime
interface TeacherParticipant {
  id: string;
  name: string;
  school?: string;
  role: 'host' | 'teacher';
  joinedAt: number;
  submittedCount: number;
  color: string;
}

interface WorkshopRoom {
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  createdAt: number;
  stamps: any[];
  participants: TeacherParticipant[];
  settings: any;
  allowTeacherDelete: boolean;
}

const DEFAULT_SETTINGS = {
  pageMarginMm: { top: 15, bottom: 15, left: 15, right: 15 },
  itemSpacingMm: 30, // 3cm (30mm) default spacing
  spacingMode: 'custom',
  padSpacingRatio: 1.5,
  horizontalSpacingMm: 30,
  verticalSpacingMm: 30,
  alignment: 'pack',
  showRuler: true,
  showCalibrationCheckBar: true,
  showCutLines: true,
  showPageInfo: true,
  paperOrientation: 'portrait',
};

// In-Memory Storage for Active Workshop Rooms
const rooms = new Map<string, WorkshopRoom>();
const roomSockets = new Map<string, Set<{ ws: WebSocket; user: TeacherParticipant }>>();

// Helper to broadcast to all sockets in a room
function broadcastToRoom(roomId: string, message: any, excludeWs?: WebSocket) {
  const sockets = roomSockets.get(roomId);
  if (!sockets) return;

  const payload = JSON.stringify(message);
  for (const client of sockets) {
    if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(payload);
      } catch (err) {
        console.error('Failed to send to client', err);
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // High body size limit for base64 / SVG stamp images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size });
  });

  // Create or Join Room
  app.post('/api/rooms', (req, res) => {
    const { roomId, roomName, hostName, hostId } = req.body;
    const cleanRoomId = (roomId || `STAMP-${Math.floor(100 + Math.random() * 900)}`).trim().toUpperCase();

    let room = rooms.get(cleanRoomId);
    if (!room) {
      room = {
        roomId: cleanRoomId,
        roomName: roomName || `${cleanRoomId} 팝핑 도장 연수 수합방`,
        hostId: hostId || `host-${Date.now()}`,
        hostName: hostName || '연수 진행 교사',
        createdAt: Date.now(),
        stamps: [],
        participants: [],
        settings: { ...DEFAULT_SETTINGS },
        allowTeacherDelete: true,
      };
      rooms.set(cleanRoomId, room);
    }

    res.json({ success: true, room });
  });

  // Get Room Details
  app.get('/api/rooms/:roomId', (req, res) => {
    const cleanRoomId = req.params.roomId.trim().toUpperCase();
    const room = rooms.get(cleanRoomId);
    if (!room) {
      return res.status(404).json({ error: '수합방을 찾을 수 없습니다. 방 번호를 확인해 주세요.' });
    }
    res.json({ success: true, room });
  });

  // Add Stamp to Room (Teacher submission)
  app.post('/api/rooms/:roomId/stamps', (req, res) => {
    const cleanRoomId = req.params.roomId.trim().toUpperCase();
    const room = rooms.get(cleanRoomId);
    if (!room) {
      return res.status(404).json({ error: '수합방이 존재하지 않습니다.' });
    }

    const { stamp, userName } = req.body;
    if (!stamp || !stamp.id) {
      return res.status(400).json({ error: '도장 데이터가 올바르지 않습니다.' });
    }

    // Attach submitter info if present
    const stampWithAuthor = {
      ...stamp,
      authorName: userName || stamp.authorName || '선생님',
      createdAt: Date.now(),
    };

    // Add or replace by ID
    const existingIndex = room.stamps.findIndex((s) => s.id === stampWithAuthor.id);
    if (existingIndex >= 0) {
      room.stamps[existingIndex] = stampWithAuthor;
    } else {
      room.stamps.push(stampWithAuthor);
    }

    // Update participant submitted count
    const participant = room.participants.find((p) => p.name === userName);
    if (participant) {
      participant.submittedCount = room.stamps.filter((s) => s.authorName === userName).length;
    }

    // Broadcast real-time update
    broadcastToRoom(cleanRoomId, {
      type: 'stamp_added',
      stamp: stampWithAuthor,
      userName: userName || '참여 선생님',
      totalCount: room.stamps.length,
    });

    res.json({ success: true, stamp: stampWithAuthor, totalCount: room.stamps.length });
  });

  // Update Stamp in Room
  app.put('/api/rooms/:roomId/stamps/:stampId', (req, res) => {
    const cleanRoomId = req.params.roomId.trim().toUpperCase();
    const room = rooms.get(cleanRoomId);
    if (!room) return res.status(404).json({ error: '방을 찾을 수 없습니다.' });

    const stampId = req.params.stampId;
    const updatedData = req.body.stamp;

    const idx = room.stamps.findIndex((s) => s.id === stampId);
    if (idx >= 0) {
      room.stamps[idx] = { ...room.stamps[idx], ...updatedData };
      broadcastToRoom(cleanRoomId, {
        type: 'stamp_updated',
        stamp: room.stamps[idx],
      });
      res.json({ success: true, stamp: room.stamps[idx] });
    } else {
      res.status(404).json({ error: '해당 도장을 찾을 수 없습니다.' });
    }
  });

  // Delete Stamp from Room
  app.delete('/api/rooms/:roomId/stamps/:stampId', (req, res) => {
    const cleanRoomId = req.params.roomId.trim().toUpperCase();
    const room = rooms.get(cleanRoomId);
    if (!room) return res.status(404).json({ error: '방을 찾을 수 없습니다.' });

    const stampId = req.params.stampId;
    const userName = (req.query.userName as string) || '진행자';

    room.stamps = room.stamps.filter((s) => s.id !== stampId);

    broadcastToRoom(cleanRoomId, {
      type: 'stamp_deleted',
      stampId,
      userName,
      totalCount: room.stamps.length,
    });

    res.json({ success: true, remaining: room.stamps.length });
  });

  // Clear All Stamps in Room (Host only)
  app.delete('/api/rooms/:roomId/stamps', (req, res) => {
    const cleanRoomId = req.params.roomId.trim().toUpperCase();
    const room = rooms.get(cleanRoomId);
    if (!room) return res.status(404).json({ error: '방을 찾을 수 없습니다.' });

    room.stamps = [];
    broadcastToRoom(cleanRoomId, {
      type: 'stamps_cleared',
    });

    res.json({ success: true, stamps: [] });
  });

  // Update Settings in Room
  app.put('/api/rooms/:roomId/settings', (req, res) => {
    const cleanRoomId = req.params.roomId.trim().toUpperCase();
    const room = rooms.get(cleanRoomId);
    if (!room) return res.status(404).json({ error: '방을 찾을 수 없습니다.' });

    room.settings = { ...room.settings, ...req.body.settings };
    broadcastToRoom(cleanRoomId, {
      type: 'settings_updated',
      settings: room.settings,
    });

    res.json({ success: true, settings: room.settings });
  });

  // Send Cheer/Reaction
  app.post('/api/rooms/:roomId/react', (req, res) => {
    const cleanRoomId = req.params.roomId.trim().toUpperCase();
    const { from, emoji } = req.body;
    broadcastToRoom(cleanRoomId, {
      type: 'reaction',
      from: from || '선생님',
      emoji: emoji || '🎉',
    });
    res.json({ success: true });
  });

  // Create HTTP & WebSocket Server
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    let currentRoomId = '';
    let currentUser: TeacherParticipant | null = null;

    ws.on('message', (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());

        if (data.type === 'join') {
          const roomId = (data.roomId || '').trim().toUpperCase();
          const user: TeacherParticipant = data.user || {
            id: `user-${Date.now()}`,
            name: '선생님',
            role: 'teacher',
            joinedAt: Date.now(),
            submittedCount: 0,
            color: '#f43f5e',
          };

          currentRoomId = roomId;
          currentUser = user;

          let room = rooms.get(roomId);
          if (!room) {
            room = {
              roomId,
              roomName: `${roomId} 팝핑 도장 연수방`,
              hostId: user.id,
              hostName: user.name,
              createdAt: Date.now(),
              stamps: [],
              participants: [],
              settings: { ...DEFAULT_SETTINGS },
              allowTeacherDelete: true,
            };
            rooms.set(roomId, room);
          }

          // Update participant list
          const existingUserIdx = room.participants.findIndex((p) => p.id === user.id);
          if (existingUserIdx >= 0) {
            room.participants[existingUserIdx] = user;
          } else {
            room.participants.push(user);
          }

          // Register socket
          if (!roomSockets.has(roomId)) {
            roomSockets.set(roomId, new Set());
          }
          roomSockets.get(roomId)!.add({ ws, user });

          // Send current authoritative room state to newcomer
          ws.send(
            JSON.stringify({
              type: 'sync_state',
              room,
            })
          );

          // Broadcast user joined
          broadcastToRoom(
            roomId,
            {
              type: 'user_joined',
              user,
              participants: room.participants,
            },
            ws
          );
        } else if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('Error handling WS message', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentUser) {
        const sockets = roomSockets.get(currentRoomId);
        if (sockets) {
          for (const s of sockets) {
            if (s.ws === ws) {
              sockets.delete(s);
              break;
            }
          }
          if (sockets.size === 0) {
            roomSockets.delete(currentRoomId);
          }
        }

        const room = rooms.get(currentRoomId);
        if (room) {
          room.participants = room.participants.filter((p) => p.id !== currentUser!.id);
          broadcastToRoom(currentRoomId, {
            type: 'user_left',
            userId: currentUser.id,
            userName: currentUser.name,
            participants: room.participants,
          });
        }
      }
    });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Pop-Stamp Print Master server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
