import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GlassmorphismCard } from './glassmorphism-card';
import { cn } from '@/lib/utils';

interface GlassmorphismModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const GlassmorphismModal: React.FC<GlassmorphismModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-transparent border-none shadow-none p-0">
        <GlassmorphismCard 
          variant="default" 
          size="lg" 
          className={cn('w-full', className)}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-white text-xl font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>
          {children}
        </GlassmorphismCard>
      </DialogContent>
    </Dialog>
  );
};
