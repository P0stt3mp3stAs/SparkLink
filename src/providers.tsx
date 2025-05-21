'use client';

import { AuthProvider } from 'react-oidc-context';

const oidcConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_3zmSZExJX",
  client_id: "7ar51147ar8bsr4m18as5556dh",
  redirect_uri: "http://localhost:3000",
  post_logout_redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "openid email phone profile",
  loadUserInfo: true,
  automaticSilentRenew: true,
  monitorSession: true,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>;
}