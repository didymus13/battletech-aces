import { useQuery } from "@tanstack/react-query";
import type { Campaign } from "./Campaign";

const API_BASE_URL = 'http://localhost:8081';

export const useCampaigns = () => {
  return useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: () => fetch(`${API_BASE_URL}/api/1.0/campaigns`).then((res) => res.json()),
  });
};