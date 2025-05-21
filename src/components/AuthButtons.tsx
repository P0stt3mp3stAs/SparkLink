'use client';

import { useAuth } from 'react-oidc-context';

export default function AuthButtons() {
  const auth = useAuth();

  if (auth.isLoading) return <div className="text-gray-500">Loading...</div>;

  if (auth.error) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-md shadow-sm text-yellow-800">
        <p className="mb-2">Authentication error: {auth.error.message}</p>
        <button
          onClick={() => auth.signinRedirect()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome, {auth.user?.profile.email}
        </h2>
        <button
          onClick={() => {
            // Clear any stored data
            localStorage.clear();
            sessionStorage.clear();

            // Redirect to Cognito to fully sign out
            window.location.href = `${process.env.NEXT_PUBLIC_OIDC_LOGOUT_DOMAIN}/logout?client_id=${process.env.NEXT_PUBLIC_OIDC_CLIENT_ID}&logout_uri=${process.env.NEXT_PUBLIC_OIDC_LOGOUT_URI}`;

          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => auth.signinRedirect()}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
    >
      Sign in
    </button>
  );
}