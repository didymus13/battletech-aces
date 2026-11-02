import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import type { Campaign } from "./Campaign";
import { apiFetch } from "../api";
import BattlemechList from "./components/BattlemechList";
import PilotList from "./components/PilotsList";
import SortiesList from "./components/SortiesList";

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: campaign, isLoading, error } = useQuery<Campaign>({
    queryKey: ['campaign', id],
    queryFn: () => apiFetch(`/api/1.0/campaigns/${id}`).then(res => res.json()),
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

  const livingPilots = campaign.pilots.filter((pilot) => !pilot.isDead && !pilot.isWounded);
  const woundedPilots = campaign.pilots.filter((pilot) => !pilot.isDead && pilot.isWounded);
  const deadPilots = campaign.pilots.filter((pilot) => pilot.isDead);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-3">
          <Link
            className="inline-flex text-sm font-medium text-sky-800 hover:text-sky-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            to="/campaigns"
          >
            Back to campaigns
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{campaign.name}</h1>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="campaign-details-heading">
          <h2 id="campaign-details-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold">Campaign details</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-slate-800">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-5 py-3 text-left font-semibold" scope="col">Difficulty</th>
                  <th className="px-5 py-3 text-left font-semibold" scope="col">Force PV modifier</th>
                  <th className="px-5 py-3 text-left font-semibold" scope="col">SP modifier</th>
                  <th className="px-5 py-3 text-left font-semibold" scope="col">Starting SP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-5 py-4">{campaign.difficulty}</td>
                  <td className="px-5 py-4 tabular-nums">{campaign.playerForceModifier.toFixed(1)}x</td>
                  <td className="px-5 py-4 tabular-nums">{campaign.spEarnedModifier.toFixed(1)}x</td>
                  <td className="px-5 py-4 tabular-nums">{campaign.startingSp}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <BattlemechList battlemechs={campaign.mechs} campaignId={campaign.id} />

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="living-pilots-heading">
          <h2 id="living-pilots-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold">Living pilots ({livingPilots.length})</h2>
          <PilotList pilots={livingPilots} showSp emptyMessage="No pilots available" campaignId={campaign.id} allowCreate />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="wounded-pilots-heading">
          <h2 id="wounded-pilots-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold">Wounded pilots ({woundedPilots.length})</h2>
          <PilotList pilots={woundedPilots} showSp emptyMessage="No wounded pilots." campaignId={campaign.id} />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="dead-pilots-heading">
          <h2 id="dead-pilots-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold">Dead pilots ({deadPilots.length})</h2>
          <PilotList pilots={deadPilots} showSp={false} emptyMessage="No dead pilots." campaignId={campaign.id} />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="sorties-heading">
          <h2 id="sorties-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold">Sorties ({campaign.sorties.length})</h2>
          <SortiesList sorties={campaign.sorties} campaignId={campaign.id} />
        </section>
      </div>
    </main>
  );
};

export default CampaignPage;