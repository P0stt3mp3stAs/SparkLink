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
  onSigninCallback: () => {
  window.history.replaceState({}, document.title, '/profile');
  window.location.replace('/profile');
},
};

function RedirectAfterLogin() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated && window.location.pathname === '/') {
      router.replace('/profile'); // 🏃 Redirect to Fade page after login
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
