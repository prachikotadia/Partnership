import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onStart,
  onStop,
  placeholder = "Tap to start voice input",
  className = "",
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      setupSpeechRecognition();
    } else {
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      onStart?.();
      startVolumeMonitoring();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      onStop?.();
      stopVolumeMonitoring();
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      onStop?.();
      stopVolumeMonitoring();
    };

    recognitionRef.current = recognition;
  };

  const startVolumeMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateVolume = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(average);
          animationRef.current = requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (err) {
      console.warn('Could not access microphone for volume monitoring:', err);
    }
  };

  const stopVolumeMonitoring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setVolume(0);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setTranscript('');
    }
  };

  const handleClear = () => {
    setTranscript('');
    setError('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={`voice-input-container ${className}`}>
      <NeumorphicCard className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Voice Input</h3>
            <div className="flex items-center space-x-2">
              <NeumorphicButton
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="p-2"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </NeumorphicButton>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`} />
            <span className="text-sm text-gray-600">
              {isListening ? 'Listening...' : isSupported ? 'Ready' : 'Not supported'}
            </span>
          </div>

          {/* Volume Indicator */}
          {isListening && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(volume * 2, 100)}%` }}
              />
            </div>
          )}

          {/* Transcript Display */}
          <div className="min-h-[100px] p-3 bg-gray-50 rounded-lg border">
            {transcript ? (
              <p className="text-gray-900">{transcript}</p>
            ) : (
              <p className="text-gray-500 italic">{placeholder}</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isListening ? (
              <NeumorphicButton
                onClick={startListening}
                disabled={!isSupported || disabled}
                className="flex items-center space-x-2 px-6 py-3"
              >
                <Mic className="h-5 w-5" />
                <span>Start Listening</span>
              </NeumorphicButton>
            ) : (
              <NeumorphicButton
                onClick={stopListening}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white"
              >
                <Square className="h-5 w-5" />
                <span>Stop</span>
              </NeumorphicButton>
            )}

            {transcript && (
              <>
                <NeumorphicButton
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white"
                >
                  <Play className="h-4 w-4" />
                  <span>Submit</span>
                </NeumorphicButton>
                
                <NeumorphicButton
                  onClick={handleClear}
                  variant="ghost"
                  className="flex items-center space-x-2 px-4 py-2"
                >
                  <span>Clear</span>
                </NeumorphicButton>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            {isSupported ? (
              <>
                Click "Start Listening" and speak clearly.<br />
                Click "Stop" when finished, then "Submit" to use the text.
              </>
            ) : (
              'Voice input is not supported in this browser. Please use Chrome or Safari.'
            )}
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
