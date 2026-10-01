import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { CampaignListPage } from './campaigns/CampaignListPage.tsx'
import CampaignPage from './campaigns/CampaignPage.tsx'
import { POST_LOGIN_REDIRECT_KEY } from './api.ts'

const RestoreLoginPath = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const path = window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
    if (path && window.location.pathname === '/') {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      const destination = new URL(path, window.location.origin);
      if (path.startsWith('/') && destination.origin === window.location.origin) {
        navigate(`${destination.pathname}${destination.search}${destination.hash}`, { replace: true });
      }
    }
  }, [navigate]);

  return null;
};

const Router = () => {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RestoreLoginPath />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/campaigns" element={<CampaignListPage />} />
          <Route path="/campaigns/:id" element={<CampaignPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default Router
