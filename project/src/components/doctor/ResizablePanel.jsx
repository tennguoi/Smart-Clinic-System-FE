import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

export default function ResizablePanel({ children, isOpen }) {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('ai-panel-width');
    return saved ? Math.max(360, Math.min(960, parseInt(saved, 10))) : 500;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Media query từ react-responsive
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });

  useEffect(() => {
    localStorage.setItem('ai-panel-width', width.toString());
  }, [width]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 360 && newWidth <= 960) setWidth(newWidth);
    };
    const handleUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (!isOpen) return null;

  // Chỉ hiển thị panel khi isOpen và là desktop (lg trở lên)
  if (!isDesktop) return null;

  return (
    <div
      className="h-full bg-gray-50 border-l-4 border-transparent shadow-2xl flex flex-col relative flex"
      style={{ width: `${width}px` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:w-4 transition-all bg-gradient-to-b from-blue-500 to-purple-600 opacity-70 hover:opacity-100 z-10"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 h-32 bg-white/60 rounded-full" />
      </div>
      <div className="h-full">{children}</div>
    </div>
  );
}