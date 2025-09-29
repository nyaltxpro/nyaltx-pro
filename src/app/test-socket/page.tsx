'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export default function TestSocketPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    console.log('🔌 Testing Socket.IO connection...');
    
    const newSocket = io({
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setSocket(newSocket);
      setConnected(true);
      addMessage(`Connected with ID: ${newSocket.id}`);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      addMessage(`Connection error: ${error.message}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setConnected(false);
      addMessage(`Disconnected: ${reason}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBroadcaster = () => {
    if (socket) {
      const broadcasterId = 'test-broadcaster-' + Date.now();
      socket.emit('broadcaster-join', {
        broadcasterId,
        walletAddress: '0x1234567890123456789012345678901234567890',
        streamTitle: 'Test Stream'
      });
      addMessage(`Sent broadcaster-join for ${broadcasterId}`);
    }
  };

  const testViewer = () => {
    if (socket) {
      const viewerId = 'test-viewer-' + Date.now();
      socket.emit('viewer-join', {
        broadcasterId: 'test-broadcaster',
        viewerId,
        walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      });
      addMessage(`Sent viewer-join for ${viewerId}`);
    }
  };

  const getActiveStreams = () => {
    if (socket) {
      socket.emit('get-active-streams');
      addMessage('Requested active streams');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1923] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Socket.IO Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className={`flex items-center gap-2 mb-4`}>
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            {socket && (
              <div className="text-sm text-gray-300">
                <p>Socket ID: {socket.id}</p>
                <p>Transport: {socket.io.engine.transport.name}</p>
              </div>
            )}
          </div>

          {/* Test Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-3">
              <button
                onClick={testBroadcaster}
                disabled={!connected}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Broadcaster Join
              </button>
              
              <button
                onClick={testViewer}
                disabled={!connected}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Viewer Join
              </button>
              
              <button
                onClick={getActiveStreams}
                disabled={!connected}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Active Streams
              </button>
            </div>
          </div>
        </div>

        {/* Messages Log */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Messages Log</h2>
          <div className="bg-black rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet...</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-1">
                  {message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-200">
            <li>Check if the connection status shows "Connected"</li>
            <li>Click "Test Broadcaster Join" to simulate a broadcaster joining</li>
            <li>Click "Test Viewer Join" to simulate a viewer joining</li>
            <li>Click "Get Active Streams" to test stream listing</li>
            <li>Check the browser console for detailed logs</li>
            <li>Check the server terminal for Socket.IO server logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
