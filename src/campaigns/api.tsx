import { useQuery } from "@tanstack/react-query";
import type { Campaign } from "./Campaign";

export const useCampaigns = () => {
  return useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/1.0/campaigns');

      if (response.status === 401) {
        window.location.assign('/oauth2/authorization/spring');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        throw new Error(`Campaign request failed: ${response.status}`);
      }

      return response.json();
    },
  });
};