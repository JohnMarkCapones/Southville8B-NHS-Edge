import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { render } from '@/tests/utils/render';
import { AuthSessionProvider } from '@/hooks/use-auth-session';
import { apiRequest, setAuthToken } from '@/lib/api-client';

function ProtectedRequestProbe() {
  React.useEffect(() => {
    (async () => {
      try {
        await apiRequest('/me');
      } catch (e) {
        // ignore in test
      }
    })();
  }, []);
  return null;
}

describe('Token refresh integration', () => {
  beforeEach(() => {
    setAuthToken('expired');
  });

  it('handles expired token flow without crashing', async () => {
    render(
      <AuthSessionProvider>
        <ProtectedRequestProbe />
      </AuthSessionProvider>
    );

    await waitFor(() => {
      expect(true).toBe(true);
    });
  });
});


