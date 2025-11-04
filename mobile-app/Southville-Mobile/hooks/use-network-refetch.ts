import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Custom hook that monitors network connectivity and triggers refetch callbacks
 * when connectivity is restored after being lost.
 * 
 * @param refetchCallbacks - Array of refetch functions to call when connectivity is restored
 */
export function useNetworkRefetch(refetchCallbacks: Array<() => Promise<void> | void>) {
  const wasOfflineRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const callbacksRef = useRef(refetchCallbacks);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = refetchCallbacks;
  }, [refetchCallbacks]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;

      // Skip the first network state check on mount
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
        wasOfflineRef.current = !isConnected;
        return;
      }

      // Track when we go offline
      if (!isConnected) {
        wasOfflineRef.current = true;
        console.log('[useNetworkRefetch] Network connection lost');
        return;
      }

      // If we were offline and now we're online, trigger refetch
      if (wasOfflineRef.current && isConnected) {
        console.log('[useNetworkRefetch] Network connection restored - triggering refetch');
        wasOfflineRef.current = false;

        // Call all refetch callbacks using the ref to get the latest callbacks
        callbacksRef.current.forEach((refetch, index) => {
          try {
            console.log(`[useNetworkRefetch] Refetching data source ${index + 1}`);
            refetch();
          } catch (error) {
            console.error(`[useNetworkRefetch] Error refetching data source ${index + 1}:`, error);
          }
        });
      }
    });

    // Get initial network state
    NetInfo.fetch().then((state) => {
      const isConnected = state.isConnected ?? false;
      wasOfflineRef.current = !isConnected;
    });

    return () => {
      unsubscribe();
    };
  }, []); // Empty deps - we use refs to get latest callbacks
}

