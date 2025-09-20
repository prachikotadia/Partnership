import { DragDropProvider } from '../components/drag-drop/DragDropProvider';
import { AnimationProvider } from '../components/animations/AnimationProvider';
import { ExactNeumorphicDashboard } from '../components/layout/ExactNeumorphicDashboard';

const Index = () => {
  // Use exact neumorphic layout matching the image
  return (
    <DragDropProvider>
      <AnimationProvider>
        <ExactNeumorphicDashboard userName="Person1" partnerName="Person2" />
      </AnimationProvider>
    </DragDropProvider>
  );
};

export default Index;
