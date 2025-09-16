import React, { useState, useEffect, useRef } from 'react';
import { useDragDrop } from './DragDropProvider';

interface DropZoneProps {
  id: string;
  type: 'task' | 'event' | 'note' | 'expense';
  accept: string[];
  onDrop: (item: any) => void;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  hoverClassName?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  type,
  accept,
  onDrop,
  children,
  className = '',
  activeClassName = 'bg-blue-50 border-blue-300',
  hoverClassName = 'bg-blue-100 border-blue-400',
}) => {
  const { draggedItem, setDraggedItem, registerDropZone, unregisterDropZone, isDragging } = useDragDrop();
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerDropZone({
      id,
      type,
      accept,
      onDrop,
    });

    return () => unregisterDropZone(id);
  }, [id, type, accept, onDrop, registerDropZone, unregisterDropZone]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem && accept.includes(draggedItem.type)) {
      setIsHovered(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    setIsActive(false);

    if (draggedItem && accept.includes(draggedItem.type)) {
      onDrop(draggedItem);
      setDraggedItem(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem && accept.includes(draggedItem.type)) {
      setIsActive(true);
    }
  };

  const getClassName = () => {
    let baseClass = className;
    
    if (isActive) {
      baseClass += ` ${activeClassName}`;
    } else if (isHovered) {
      baseClass += ` ${hoverClassName}`;
    }
    
    return baseClass;
  };

  return (
    <div
      ref={dropRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      className={getClassName()}
    >
      {children}
    </div>
  );
};
