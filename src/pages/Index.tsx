import { DragDropProvider } from '../components/drag-drop/DragDropProvider';
import { AnimationProvider } from '../components/animations/AnimationProvider';
import { ExactNeumorphicDashboard } from '../components/layout/ExactNeumorphicDashboard';

const Index = () => {
  // Use exact neumorphic dashboard matching the image
  return (
    <DragDropProvider>
      <AnimationProvider>
        <ExactNeumorphicDashboard />
      </AnimationProvider>
    </DragDropProvider>
  );
};

export default Index;
