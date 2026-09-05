import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { Campaign } from "./Campaign";

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: campaign, isLoading, error } = useQuery<Campaign>({
    queryKey: ['campaign', id],
    queryFn: () => fetch(`/api/1.0/campaigns/${id}`).then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <div>
      <h1>{campaign.name}</h1>
      <p>Difficulty: {campaign.difficulty}</p>
      <p>Starting SP: {campaign.startingSp}</p>
      <p>Pilots: {campaign.pilots.length}</p>
      <p>Mechs: {campaign.mechs.length}</p>
      <p>Sorties: {campaign.sorties.length}</p>
    </div>
  );
};

export default CampaignPage;