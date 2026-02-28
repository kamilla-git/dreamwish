import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useSocket(wishlistSlug: string | null, onUpdate: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const onUpdateRef = useRef(onUpdate);

  // Обновляем ref при изменении callback
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!wishlistSlug) return;

    console.log('🔌 Connecting to Socket.IO:', SOCKET_URL);

    // Подключаемся к Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      socket.emit('join_wishlist', wishlistSlug);
    });

    socket.on('wishlist_updated', (data) => {
      console.log('📡 Wishlist updated:', data);
      onUpdateRef.current(data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });

    return () => {
      if (socket) {
        console.log('🔌 Disconnecting from Socket.IO');
        socket.emit('leave_wishlist', wishlistSlug);
        socket.disconnect();
      }
    };
  }, [wishlistSlug]);

  return socketRef.current;
}

export default useSocket;
