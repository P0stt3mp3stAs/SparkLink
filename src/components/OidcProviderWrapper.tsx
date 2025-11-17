'use client';

import { AuthProvider, useAuth } from 'react-oidc-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY!,
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID!,
  redirect_uri: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!,
  post_logout_redirect_uri: process.env.NEXT_PUBLIC_OIDC_LOGOUT_URI!,
  response_type: 'code',
  scope: 'openid email profile',
  loadUserInfo: true,
  automaticSilentRenew: true,
  monitorSession: true,
  // This callback runs after OIDC login success
  onSigninCallback: () => {
    // remove any OIDC fragments
    window.history.replaceState({}, document.title, window.location.pathname);
    // redirect to profile or home as needed
    window.location.replace('/profile');
  },
};

function RedirectAfterLogin() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // redirect to /profile only if authenticated and on the home page
    if (auth.isAuthenticated && window.location.pathname === '/') {
      router.replace('/profile');
    }
  }, [auth.isAuthenticated, router]);

  return null;
}

export default function OidcProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider {...oidcConfig}>
      <RedirectAfterLogin />
      {children}
    </AuthProvider>
  );
}
