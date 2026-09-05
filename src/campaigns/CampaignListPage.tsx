import { Link } from "react-router/internal/react-server-client";
import { useCampaigns } from "./api";

export const CampaignListPage = () => {
  const { data: campaigns, isLoading, error } = useCampaigns();

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