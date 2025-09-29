import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory maps (for demo only - use Redis for production)
const broadcasters: Record<string, { socketId: string; walletAddress?: string; streamTitle?: string }> = {};
const viewers: Record<string, { socketId: string; broadcasterId: string; walletAddress?: string }> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // For Vercel deployment, we need to handle this differently
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    // In production on Vercel, return a simple HTTP response
    // WebSocket connections won't work on Vercel's serverless functions
    res.status(200).json({ 
      message: 'Socket.IO not supported on Vercel serverless functions',
      suggestion: 'Use polling transport only or deploy to a server with WebSocket support'
    });
    return;
  }

  // Type assertion for Socket.IO server (for local development)
  const socketServer = res.socket as any;
  
  if (!socketServer?.server?.io) {
    console.log('🚀 Initializing Socket.IO server for WebRTC signaling (Development Mode)');
    
    const io = new Server(socketServer.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false
      },
      // For development, prefer polling over websockets for Vercel compatibility
      transports: ['polling', 'websocket'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    socketServer.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Broadcaster joins with their stream info
      socket.on('broadcaster-join', ({ broadcasterId, walletAddress, streamTitle }) => {
        broadcasters[broadcasterId] = { 
          socketId: socket.id, 
          walletAddress,
          streamTitle 
        };
        console.log('Broadcaster joined:', broadcasterId, 'wallet:', walletAddress);
        
        // Notify all clients about new stream
        socket.broadcast.emit('stream-started', { 
          broadcasterId, 
          streamTitle,
          walletAddress 
        });
      });

      // Viewer wants to join a stream
      socket.on('viewer-join', ({ broadcasterId, viewerId, walletAddress }) => {
        console.log('Viewer wants to join:', broadcasterId, 'viewerId:', viewerId);
        
        const broadcaster = broadcasters[broadcasterId];
        if (broadcaster) {
          // Store viewer info
          viewers[viewerId] = { 
            socketId: socket.id, 
            broadcasterId,
            walletAddress 
          };
          
          // Notify broadcaster about new viewer
          io.to(broadcaster.socketId).emit('viewer-join', { 
            viewerId, 
            walletAddress 
          });
          
          // Update viewer count
          const viewerCount = Object.values(viewers).filter(v => v.broadcasterId === broadcasterId).length;
          io.emit('viewer-count-update', { broadcasterId, count: viewerCount });
        } else {
          // No broadcaster found
          socket.emit('no-broadcaster', { broadcasterId });
        }
      });

      // WebRTC signaling: Broadcaster sends signal to viewer
      socket.on('broadcaster-signal', ({ broadcasterId, viewerId, signal }) => {
        const viewer = viewers[viewerId];
        if (viewer) {
          io.to(viewer.socketId).emit('broadcaster-signal', { 
            broadcasterId, 
            viewerId, 
            signal 
          });
        }
      });

      // WebRTC signaling: Viewer responds with signal
      socket.on('viewer-signal', ({ broadcasterId, viewerId, signal }) => {
        const broadcaster = broadcasters[broadcasterId];
        if (broadcaster) {
          io.to(broadcaster.socketId).emit('viewer-signal', { 
            viewerId, 
            signal 
          });
        }
      });

      // Chat messages
      socket.on('chat-message', ({ broadcasterId, message, senderAddress, senderName }) => {
        console.log('Chat message:', message, 'from:', senderAddress);
        
        // Broadcast to all viewers and broadcaster of this stream
        const broadcaster = broadcasters[broadcasterId];
        if (broadcaster) {
          // Send to broadcaster
          io.to(broadcaster.socketId).emit('chat-message', {
            broadcasterId,
            message,
            senderAddress,
            senderName,
            timestamp: Date.now()
          });
          
          // Send to all viewers of this stream
          Object.values(viewers)
            .filter(v => v.broadcasterId === broadcasterId)
            .forEach(viewer => {
              io.to(viewer.socketId).emit('chat-message', {
                broadcasterId,
                message,
                senderAddress,
                senderName,
                timestamp: Date.now()
              });
            });
        }
      });

      // Stream quality/stats updates
      socket.on('stream-stats', ({ broadcasterId, stats }) => {
        const broadcaster = broadcasters[broadcasterId];
        if (broadcaster && socket.id === broadcaster.socketId) {
          // Broadcast stats to all viewers
          Object.values(viewers)
            .filter(v => v.broadcasterId === broadcasterId)
            .forEach(viewer => {
              io.to(viewer.socketId).emit('stream-stats', { broadcasterId, stats });
            });
        }
      });

      // Handle disconnections
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove from broadcasters
        for (const [broadcasterId, broadcaster] of Object.entries(broadcasters)) {
          if (broadcaster.socketId === socket.id) {
            delete broadcasters[broadcasterId];
            console.log('Broadcaster disconnected:', broadcasterId);
            
            // Notify all viewers that stream ended
            Object.values(viewers)
              .filter(v => v.broadcasterId === broadcasterId)
              .forEach(viewer => {
                io.to(viewer.socketId).emit('stream-ended', { broadcasterId });
              });
            
            // Remove all viewers of this stream
            for (const [viewerId, viewer] of Object.entries(viewers)) {
              if (viewer.broadcasterId === broadcasterId) {
                delete viewers[viewerId];
              }
            }
            
            // Notify all clients that stream ended
            socket.broadcast.emit('stream-ended', { broadcasterId });
            break;
          }
        }
        
        // Remove from viewers
        for (const [viewerId, viewer] of Object.entries(viewers)) {
          if (viewer.socketId === socket.id) {
            const { broadcasterId } = viewer;
            delete viewers[viewerId];
            console.log('Viewer disconnected:', viewerId);
            
            // Update viewer count
            const viewerCount = Object.values(viewers).filter(v => v.broadcasterId === broadcasterId).length;
            io.emit('viewer-count-update', { broadcasterId, count: viewerCount });
            break;
          }
        }
      });

      // Get active streams
      socket.on('get-active-streams', () => {
        const activeStreams = Object.entries(broadcasters).map(([broadcasterId, broadcaster]) => ({
          broadcasterId,
          streamTitle: broadcaster.streamTitle,
          walletAddress: broadcaster.walletAddress,
          viewerCount: Object.values(viewers).filter(v => v.broadcasterId === broadcasterId).length
        }));
        
        socket.emit('active-streams', activeStreams);
      });
    });
  }

  res.end();
}
