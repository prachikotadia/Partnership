import React, { useState, useRef } from 'react';
import { useDragDrop } from './DragDropProvider';

interface DraggableItemProps {
  id: string;
  type: 'task' | 'event' | 'note' | 'expense';
  data: any;
  source: string;
  children: React.ReactNode;
  className?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  type,
  data,
  source,
  children,
  className = '',
  onDragStart,
  onDragEnd,
}) => {
  const { setDraggedItem, setIsDragging } = useDragDrop();
  const [isDragging, setIsDraggingLocal] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type, data, source }));
    
    setDraggedItem({ id, type, data, source });
    setIsDragging(true);
    setIsDraggingLocal(true);
    
    if (onDragStart) onDragStart();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setIsDragging(false);
    setIsDraggingLocal(false);
    
    if (onDragEnd) onDragEnd();
  };

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`cursor-move transition-all duration-200 ${
        isDraggingLocal ? 'opacity-50 scale-95' : 'hover:scale-105'
      } ${className}`}
    >
      {children}
    </div>
  );
};
