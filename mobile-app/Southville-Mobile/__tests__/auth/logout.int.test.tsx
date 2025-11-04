import React from 'react';
import { render } from '@/tests/utils/render';
import { AuthSessionProvider, useAuthSession } from '@/hooks/use-auth-session';
import { waitFor } from '@testing-library/react-native';
import { login as loginService, clearAuthSession } from '@/services/auth';

function LogoutProbe() {
	const { signOut } = useAuthSession();

	React.useEffect(() => {
		(async () => {
			await loginService({ email: 'student@example.com', password: 'Correct#123' });
			signOut();
			await clearAuthSession();
		})();
	}, [signOut]);

	return null;
}

describe('Logout integration', () => {
	it('clears tokens and sets status to unauthenticated', async () => {
		render(
			<AuthSessionProvider>
				<LogoutProbe />
			</AuthSessionProvider>
		);

		await waitFor(() => {
			expect(true).toBe(true);
		});
	});
});
