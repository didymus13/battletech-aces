import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { CampaignListPage } from './campaigns/CampaignListPage.tsx'
import CampaignPage from './campaigns/CampaignPage.tsx'

const LOGIN_REDIRECT_KEY = 'postLoginRedirect';

const RestoreLoginPath = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const path = sessionStorage.getItem(LOGIN_REDIRECT_KEY);
    if (path && window.location.pathname === '/') {
      navigate(path, { replace: true });
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
