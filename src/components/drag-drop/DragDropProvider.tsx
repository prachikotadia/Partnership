import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DragItem {
  id: string;
  type: 'task' | 'event' | 'note' | 'expense';
  data: any;
  source: string;
}

export interface DropZone {
  id: string;
  type: 'task' | 'event' | 'note' | 'expense';
  accept: string[];
  onDrop: (item: DragItem) => void;
}

interface DragDropContextType {
  draggedItem: DragItem | null;
  setDraggedItem: (item: DragItem | null) => void;
  registerDropZone: (zone: DropZone) => void;
  unregisterDropZone: (id: string) => void;
  dropZones: Map<string, DropZone>;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: React.ReactNode;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropZones, setDropZones] = useState<Map<string, DropZone>>(new Map());

  const registerDropZone = useCallback((zone: DropZone) => {
    setDropZones(prev => new Map(prev.set(zone.id, zone)));
  }, []);

  const unregisterDropZone = useCallback((id: string) => {
    setDropZones(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  return (
    <DragDropContext.Provider
      value={{
        draggedItem,
        setDraggedItem,
        registerDropZone,
        unregisterDropZone,
        dropZones,
        isDragging,
        setIsDragging,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};
