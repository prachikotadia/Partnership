import { DragDropProvider } from '@/components/drag-drop/DragDropProvider';
import { AnimationProvider } from '@/components/animations/AnimationProvider';
import { IOSDashboard } from '@/components/layout/IOSDashboard';

const Index = () => {
  // Use iOS neumorphic layout for all devices
  return (
    <DragDropProvider>
      <AnimationProvider>
        <IOSDashboard userName="Person1" partnerName="Person2" />
      </AnimationProvider>
    </DragDropProvider>
  );
};

export default Index;
