import { StampItem, WorkshopRoom, TeacherParticipant, LayoutSettings } from '../types';

export class WorkshopClient {
  private ws: WebSocket | null = null;
  private roomId: string = '';
  private user: TeacherParticipant | null = null;
  private onMessageCallback: ((action: any) => void) | null = null;
  private reconnectTimer: any = null;

  constructor() {}

  public connect(
    roomId: string,
    user: TeacherParticipant,
    onMessage: (action: any) => void
  ) {
    this.roomId = roomId.trim().toUpperCase();
    this.user = user;
    this.onMessageCallback = onMessage;

    this.disconnect();
    this.initSocket();
  }

  private initSocket() {
    if (!this.roomId || !this.user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Send join payload
        this.ws?.send(
          JSON.stringify({
            type: 'join',
            roomId: this.roomId,
            user: this.user,
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const action = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(action);
          }
        } catch (err) {
          console.error('Error parsing WS message', err);
        }
      };

      this.ws.onclose = () => {
        // Auto-reconnect after 3 seconds if not explicitly closed
        if (this.roomId && this.user) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.initSocket();
          }, 3000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WS error', err);
      };
    } catch (err) {
      console.error('WebSocket connection failed', err);
    }
  }

  public disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  // REST API Methods for reliability
  public static async createOrJoinRoom(
    roomId: string,
    roomName: string,
    hostName: string,
    hostId: string
  ): Promise<{ success: boolean; room: WorkshopRoom }> {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, roomName, hostName, hostId }),
    });
    return res.json();
  }

  public static async getRoom(roomId: string): Promise<{ success: boolean; room?: WorkshopRoom; error?: string }> {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`);
    return res.json();
  }

  public static async submitStamp(
    roomId: string,
    stamp: StampItem,
    userName: string
  ): Promise<{ success: boolean; stamp: StampItem }> {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/stamps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stamp, userName }),
    });
    return res.json();
  }

  public static async updateStamp(
    roomId: string,
    stampId: string,
    stamp: Partial<StampItem>
  ): Promise<{ success: boolean; stamp: StampItem }> {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/stamps/${stampId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stamp }),
    });
    return res.json();
  }

  public static async deleteStamp(
    roomId: string,
    stampId: string,
    userName: string
  ): Promise<{ success: boolean }> {
    const res = await fetch(
      `/api/rooms/${encodeURIComponent(roomId)}/stamps/${stampId}?userName=${encodeURIComponent(userName)}`,
      { method: 'DELETE' }
    );
    return res.json();
  }

  public static async clearAllStamps(roomId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/stamps`, {
      method: 'DELETE',
    });
    return res.json();
  }

  public static async updateSettings(
    roomId: string,
    settings: LayoutSettings
  ): Promise<{ success: boolean }> {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    return res.json();
  }

  public static async sendReaction(
    roomId: string,
    from: string,
    emoji: string
  ): Promise<{ success: boolean }> {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, emoji }),
    });
    return res.json();
  }
}

export const workshopSocket = new WorkshopClient();
