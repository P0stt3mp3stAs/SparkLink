// src/components/OidcProviderWrapper.tsx
'use client';

import { AuthProvider } from 'react-oidc-context';

const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY!,
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID!,
  redirect_uri: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!,
  post_logout_redirect_uri: process.env.NEXT_PUBLIC_OIDC_LOGOUT_URI!,
  response_type: "code",
  scope: "openid email profile",
  loadUserInfo: true,
  automaticSilentRenew: true,
  monitorSession: true,
};



export default function OidcProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>;
}