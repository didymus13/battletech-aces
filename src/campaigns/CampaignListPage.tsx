import { useQuery } from "@tanstack/react-query";
import type { Campaign } from "./Campaign";
import { Link } from "react-router";

export const CampaignListPage = () => {
  const { data: campaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: () => fetch("/api/1.0/campaigns").then((res) => res.json())
  });

  if (isLoading) {
    return <div>Loading campaigns...</div>;
  }

  if (error) {
    return <div>Error loading campaigns: {error.message}</div>;
  }

  return (
    <div>
      <h1>Campaign List</h1>
      <ul>
        {campaigns?.map((campaign) => (
          <li key={String(campaign.id)}>
            <Link to={`/campaigns/${campaign.id}`}>{campaign.name}</Link> - Difficulty: {campaign.difficulty}
          </li>
        ))}
      </ul>
    </div>
  );
};