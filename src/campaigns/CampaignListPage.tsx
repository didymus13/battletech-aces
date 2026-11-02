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
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-slate-600" role="status">Loading campaigns...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-red-700" role="alert">Error loading campaigns: {error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Campaigns</h1>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            to="/campaigns/new"
          >
            Create campaign
          </Link>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" aria-label="Campaigns">
          {data?._embedded?.campaigns?.length ? (
            <ul className="divide-y divide-slate-200">
              {data._embedded.campaigns.map((campaign) => (
                <li className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={String(campaign.id)}>
                  <Link
                    className="font-semibold text-sky-800 hover:text-sky-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                    to={`/campaigns/${campaign.id}`}
                  >
                    {campaign.name}
                  </Link>
                  <span className="text-sm text-slate-600">Difficulty: {campaign.difficulty}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-slate-600">No campaigns yet.</p>
          )}
        </section>
      </div>
    </main>
  );
};