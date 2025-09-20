import { DragDropProvider } from '@/components/drag-drop/DragDropProvider';
import { AnimationProvider } from '@/components/animations/AnimationProvider';
import { EnhancedDashboard } from '@/components/layout/EnhancedDashboard';

const Index = () => {
  // Use enhanced neumorphic layout for all devices
  return (
    <DragDropProvider>
      <AnimationProvider>
        <EnhancedDashboard userName="Person1" partnerName="Person2" />
      </AnimationProvider>
    </DragDropProvider>
  );
};

export default Index;
