import { DragDropProvider } from '../components/drag-drop/DragDropProvider';
import { AnimationProvider } from '../components/animations/AnimationProvider';
import { SimpleEnhancedDashboard } from '../components/layout/SimpleEnhancedDashboard';

const Index = () => {
  // Use enhanced neumorphic layout for all devices
  return (
    <DragDropProvider>
      <AnimationProvider>
        <SimpleEnhancedDashboard userName="Person1" partnerName="Person2" />
      </AnimationProvider>
    </DragDropProvider>
  );
};

export default Index;
