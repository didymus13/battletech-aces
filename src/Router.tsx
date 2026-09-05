import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { CampaignListPage } from './campaigns/CampaignListPage.tsx'

const Router = () => {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/campaigns" element={<CampaignListPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default Router
