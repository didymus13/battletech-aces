import { useQuery } from "@tanstack/react-query";
import type { Campaign } from "./Campaign";

const LOGIN_REDIRECT_KEY = 'postLoginRedirect';

export const useCampaigns = () => {
  return useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/1.0/campaigns');

      if (response.status === 401) {
        if (!sessionStorage.getItem(LOGIN_REDIRECT_KEY)) {
          sessionStorage.setItem(
            LOGIN_REDIRECT_KEY,
            window.location.pathname + window.location.search + window.location.hash,
          );
          window.location.assign('/oauth2/authorization/spring');
        }
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        throw new Error(`Campaign request failed: ${response.status}`);
      }

      sessionStorage.removeItem(LOGIN_REDIRECT_KEY);
      return response.json();
    },
  });
};