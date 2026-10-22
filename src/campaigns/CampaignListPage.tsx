import { useQuery } from "@tanstack/react-query";
import type { Campaign, CollectionResponse } from "./Campaign";
import { Link } from "react-router";
import { apiFetch } from "../api";

export const CampaignListPage = () => {
  const { data, isLoading, error } = useQuery<CollectionResponse<Campaign>>({
    queryKey: ["campaigns"],
    queryFn: () => apiFetch("/api/1.0/campaigns").then((res) => res.json())
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
      <Link to="/campaigns/new">Create campaign</Link>
      <ul>
        {data?._embedded?.campaigns?.map((campaign) => (
          <li key={String(campaign.id)}>
            <Link to={`/campaigns/${campaign.id}`}>{campaign.name}</Link> - Difficulty: {campaign.difficulty}
          </li>
        ))}
      </ul>
    </div>
  );
};