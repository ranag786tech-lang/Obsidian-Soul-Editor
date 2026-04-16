import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion } from 'framer-motion';
import { GitBranch, Save, Share2, Sparkles } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';

export const MarkdownEditor = ({ content, onChange, onSave }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = content.trim().split(/\s+/).length;
    setWordCount(words);
  }, [content]);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      toast.success('Soul saved ✨');
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Soul Bar */}
      <div className="glass-panel mx-4 mt-4 p-2 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className={`px-4 py-2 rounded-lg transition-all ${isEditing ? 'bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            ✍️ Write
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={`px-4 py-2 rounded-lg transition-all ${!isEditing ? 'bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            👁️ Preview
          </button>
        </div>

        <div className="flex gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Sparkles size={14} /> {wordCount} words
          </span>
          <button onClick={onSave} className="hover:text-white transition-colors">
            <Save size={18} />
          </button>
          <button className="hover:text-white transition-colors">
            <GitBranch size={18} />
          </button>
          <button className="hover:text-white transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 m-4 glass-panel overflow-hidden">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-transparent text-gray-200 p-8 focus:outline-none font-mono text-lg leading-relaxed resize-none"
                placeholder="Start writing your soul... ✨"
                style={{ fontFamily: "'Fira Code', monospace" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="prose prose-invert prose-lg max-w-none p-8 overflow-y-auto h-full"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] bg-clip-text text-transparent"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-3xl font-semibold mt-8 mb-4 text-[#7dcfff]" {...props} />
                  ),
                  code: ({ node, inline, className, children, ...props }) => (
                    <code
                      className={`${
                        inline
                          ? 'bg-gray-800 px-1 py-0.5 rounded text-[#9ece6a]'
                          : 'block bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto'
                      } ${className}`}
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-[#7aa2f7] hover:underline" target="_blank" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-[#7aa2f7] pl-4 italic my-4 text-gray-300"
                      {...props}
                    />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Soul Companion Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-20 right-6 text-right text-xs text-gray-500"
      >
        <span className="bg-gray-800/50 px-3 py-1 rounded-full">💫 Ctrl+S to save your soul</span>
      </motion.div>
    </div>
  );
};
