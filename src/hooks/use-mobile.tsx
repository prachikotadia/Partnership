import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      try {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      } catch (error) {
        console.warn('Error in mobile detection:', error);
        setIsMobile(false);
      }
    };
    
    // Use addEventListener for modern browsers
    if (mql && mql.addEventListener) {
      mql.addEventListener("change", onChange);
    } else if (mql && mql.addListener) {
      // Fallback for older browsers
      mql.addListener(onChange);
    }
    
    // Set initial value safely
    try {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    } catch (error) {
      console.warn('Error in initial mobile detection:', error);
      setIsMobile(false);
    }
    
    return () => {
      // Use removeEventListener for modern browsers
      if (mql && mql.removeEventListener) {
        mql.removeEventListener("change", onChange);
      } else if (mql && mql.removeListener) {
        // Fallback for older browsers
        mql.removeListener(onChange);
      }
    };
  }, []);

  return !!isMobile;
}
