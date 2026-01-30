'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

export default function LiveChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const { user, isGuest } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen to last 100 messages in real-time
    const q = query(
      collection(db, 'chatMessages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Reverse to show oldest first
      setMessages(messagesData.reverse());
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setSending(true);
    const messageText = message;
    const replyData = replyingTo;
    setMessage(''); // Clear immediately for better UX
    setReplyingTo(null); // Clear reply

    try {
      const messageData: any = {
        text: messageText,
        createdAt: serverTimestamp(),
        userId: user.uid,
        username: user.displayName || user.email?.split('@')[0] || 'Stars Fan',
      };

      // Add reply data if replying to a message
      if (replyData) {
        messageData.replyTo = {
          id: replyData.id,
          text: replyData.text,
          username: replyData.username,
        };
      }

      await addDoc(collection(db, 'chatMessages'), messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageText); // Restore message on error
      setReplyingTo(replyData); // Restore reply
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <ProtectedRoute allowGuests={true}>
      <div className="min-h-screen flex flex-col" style={{backgroundColor: '#007A33'}}>
        {/* Header */}
        <div className="bg-black border-b-4 border-white py-4 px-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <span className="text-4xl">🏒</span>
              <h1 className="text-4xl font-black text-white tracking-wider" style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                LIVE GAME CHAT
              </h1>
              <span className="text-4xl">⭐</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-black text-white tracking-wide uppercase">Live Now</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-white font-bold text-lg">No messages yet</p>
                <p className="text-white text-sm mt-2">Be the first to chat! Go Stars! 🏒⭐</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = user?.uid === msg.userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      onClick={() => setReplyingTo(msg)}
                      className={`max-w-[75%] ${
                        isOwnMessage
                          ? 'bg-black text-white border-3 border-white'
                          : 'bg-white text-black border-3 border-black'
                      } rounded-lg p-3 shadow-lg cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm">⭐</span>
                        <p className={`font-black text-xs uppercase tracking-wide ${
                          isOwnMessage ? 'text-green-400' : 'text-green-600'
                        }`}>
                          {msg.username || 'Stars Fan'}
                        </p>
                        <span className={`text-xs ${
                          isOwnMessage ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>

                      {/* Show Replied-to Message */}
                      {msg.replyTo && (
                        <div className={`mb-2 p-2 rounded border-l-4 ${
                          isOwnMessage
                            ? 'bg-gray-800 border-green-400'
                            : 'bg-gray-100 border-green-600'
                        }`}>
                          <p className={`text-xs font-bold ${
                            isOwnMessage ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ↩️ {msg.replyTo.username}
                          </p>
                          <p className={`text-xs ${
                            isOwnMessage ? 'text-gray-300' : 'text-gray-600'
                          } truncate`}>
                            {msg.replyTo.text}
                          </p>
                        </div>
                      )}

                      <p className="text-sm font-medium leading-relaxed break-words">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input - Fixed at Bottom */}
        <div className="bg-black border-t-4 border-white p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto">
            {/* Reply Preview */}
            {replyingTo && (
              <div className="mb-3 bg-gray-800 rounded-lg p-3 border-2 border-green-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-green-400 mb-1">
                      ↩️ Replying to {replyingTo.username}
                    </p>
                    <p className="text-sm text-white truncate">
                      {replyingTo.text}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-2 text-white hover:text-red-400 font-bold text-lg transition-colors"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isGuest ? "Sign up to join the conversation..." : (replyingTo ? "Write a reply..." : "Send a message... Let's Go Stars! 🏒")}
                  className="w-full px-4 py-3 bg-white border-3 border-white rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500 text-black font-medium text-base disabled:bg-gray-200 disabled:cursor-not-allowed"
                  maxLength={200}
                  disabled={sending || isGuest}
                />
              </div>
              <button
                type="submit"
                disabled={sending || !message.trim() || isGuest}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed font-black uppercase tracking-wider border-3 border-white shadow-lg transition-all flex items-center space-x-2"
              >
                <span>{sending ? '📤' : '⭐'}</span>
                <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
            <p className="text-xs text-white text-center mt-2 font-semibold">
              {isGuest ? '👋 Browsing as guest - Sign up to chat!' : (replyingTo ? 'Replying to a message - Click ✕ to cancel' : 'Click any message to reply!')}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
