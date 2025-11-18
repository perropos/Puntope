import React, { useState, useEffect } from 'react';

interface Comment {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface CommentsSectionProps {
  articleId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`puntope_comments_${articleId}`);
    if (saved) {
      try {
        setComments(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading comments:", e);
      }
    } else {
      setComments([]);
    }
  }, [articleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userName: userName.trim(),
      text: newComment.trim(),
      timestamp: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`puntope_comments_${articleId}`, JSON.stringify(updatedComments));
    setNewComment('');
  };

  return (
    <div className="bg-gray-50 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
      <h3 className="font-heading font-bold text-xl text-theme-dark mb-6 flex items-center gap-2">
        Comentarios de lectores
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
          {comments.length}
        </span>
      </h3>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-white p-6 rounded-2xl shadow-sm">
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tu Nombre</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full bg-theme-bg rounded-xl px-4 py-3 text-sm font-bold text-theme-dark focus:outline-none focus:ring-2 focus:ring-gray-200"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tu Opinión</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="¿Qué opinas sobre esta noticia?"
            className="w-full bg-theme-bg rounded-xl px-4 py-3 text-sm font-medium text-theme-dark focus:outline-none focus:ring-2 focus:ring-gray-200 min-h-[100px] resize-none"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-theme-dark text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-black transition-colors"
          >
            Publicar Comentario
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm italic">
            Sé el primero en comentar esta noticia.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 animate-fade-in">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-peru-red/10 text-peru-red rounded-full flex items-center justify-center font-bold text-sm">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-theme-dark text-sm">{comment.userName}</span>
                  <span className="text-xs text-gray-400">• {comment.timestamp}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;