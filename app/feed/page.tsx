'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

export default function FeedPage() {
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [commentLoading, setCommentLoading] = useState<{[key: string]: boolean}>({});
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        text: newPost,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
        username: user.displayName || user.email?.split('@')[0] || 'Stars Fan',
        likes: [],
        comments: [],
      });
      setNewPost('');
    } catch (error) {
      console.error('Error adding post:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string, likes: string[] = []) => {
    if (!user) return;

    const postRef = doc(db, 'posts', postId);
    const hasLiked = likes.includes(user.uid);

    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !commentText[postId]?.trim()) return;

    setCommentLoading({ ...commentLoading, [postId]: true });
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          id: Date.now().toString(),
          text: commentText[postId],
          userId: user.uid,
          userEmail: user.email,
          username: user.displayName || user.email?.split('@')[0] || 'Stars Fan',
          createdAt: new Date().toISOString(),
        })
      });
      setCommentText({ ...commentText, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading({ ...commentLoading, [postId]: false });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        {/* Fan Feed Header */}
        <div className="max-w-2xl mx-auto mb-8 text-center px-4">
          <div className="text-7xl mb-2">🏒⭐</div>
          <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
          }}>
            STARS FAN FEED
          </h1>
          <p className="text-xl font-black text-white tracking-wide">THE HOME OF TRUE STARS FANS</p>
        </div>

        {/* Post Your Thoughts */}
        <div className="max-w-2xl mx-auto mb-6 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-black">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-2xl border-3 border-black mr-3">
                ⭐
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-wide">Sound Off!</h2>
            </div>
            <form onSubmit={handleAddPost}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Let's hear it, Stars fans! Share your thoughts, hot takes, game predictions... 🏒⭐"
                className="w-full p-4 border-3 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-4 focus:ring-green-600 focus:border-green-600 text-gray-900 font-medium text-lg"
                rows={4}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !newPost.trim()}
                  className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-black text-lg uppercase tracking-wider border-3 border-black shadow-lg transition-all"
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {loading ? '🏒 POSTING...' : '⭐ POST IT!'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="max-w-2xl mx-auto space-y-5 px-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center border-4 border-black">
              <div className="text-5xl mb-3">🏒</div>
              <p className="text-gray-600 font-bold text-lg">No posts yet. Be the first to post!</p>
              <p className="text-gray-500 mt-2">Let's get this fan feed started! ⭐</p>
            </div>
          ) : (
            posts.map((post) => {
              const likes = post.likes || [];
              const hasLiked = user ? likes.includes(user.uid) : false;
              const comments = post.comments || [];
              const isOwner = user?.uid === post.userId;

              return (
                <div key={post.id} className="bg-white rounded-lg shadow-xl p-6 border-4 border-black hover:shadow-2xl transition-shadow">
                  <div className="flex items-start mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-3xl border-3 border-black mr-4 flex-shrink-0">
                      ⭐
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-black text-black text-xl uppercase tracking-wide truncate">
                          {post.username || post.userEmail?.split('@')[0] || 'Stars Fan'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🏒</span>
                          {isOwner && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-800 font-bold text-sm transition-colors"
                              title="Delete post"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold">
                        {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="ml-[4.5rem] -mt-1">
                    <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">{post.text}</p>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center space-x-6">
                      <button
                        onClick={() => toggleLike(post.id, likes)}
                        className={`flex items-center space-x-2 font-bold transition-colors ${
                          hasLiked ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                        }`}
                      >
                        <span className="text-xl">{hasLiked ? '⭐' : '☆'}</span>
                        <span className="text-sm uppercase tracking-wide">
                          {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
                        </span>
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 font-bold transition-colors"
                      >
                        <span className="text-xl">💬</span>
                        <span className="text-sm uppercase tracking-wide">
                          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                        </span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-200">
                        {/* Existing Comments */}
                        {comments.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {comments.map((comment: any) => (
                              <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-lg">⭐</span>
                                  <p className="font-bold text-black text-sm uppercase">
                                    {comment.username || comment.userEmail?.split('@')[0] || 'Stars Fan'}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Just now'}
                                  </span>
                                </div>
                                <p className="text-gray-800 text-sm ml-7">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Form */}
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-sm border-2 border-black flex-shrink-0">
                            ⭐
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              placeholder="Add a comment..."
                              className="w-full p-2 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900 text-sm"
                              rows={2}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={commentLoading[post.id] || !commentText[post.id]?.trim()}
                              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-sm uppercase"
                            >
                              {commentLoading[post.id] ? 'Posting...' : 'Comment'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
