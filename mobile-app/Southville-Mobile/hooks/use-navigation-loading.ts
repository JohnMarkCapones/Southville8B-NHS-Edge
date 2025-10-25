import { useState, useCallback } from 'react';
import { router } from 'expo-router';

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const navigateWithLoading = useCallback(async (
    path: string,
    delay: number = 800
  ) => {
    setIsLoading(true);
    
    // Add a small delay to show the loading animation
    setTimeout(() => {
      router.push(path);
      // Hide loading after navigation
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, delay);
  }, []);

  const navigateBackWithLoading = useCallback(async (delay: number = 800) => {
    setIsLoading(true);
    
    setTimeout(() => {
      router.back();
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, delay);
  }, []);

  return {
    isLoading,
    navigateWithLoading,
    navigateBackWithLoading,
    setIsLoading,
  };
}
