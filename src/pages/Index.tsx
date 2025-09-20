import { DragDropProvider } from '../components/drag-drop/DragDropProvider';
import { AnimationProvider } from '../components/animations/AnimationProvider';
import { TestTheme } from '../components/TestTheme';

const Index = () => {
  // Test theme functionality first
  return (
    <DragDropProvider>
      <AnimationProvider>
        <TestTheme />
      </AnimationProvider>
    </DragDropProvider>
  );
};

export default Index;
