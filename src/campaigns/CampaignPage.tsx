import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { Campaign, Pilot } from "./Campaign";
import { apiFetch } from "../api";
import BattlemechList from "./components/BattlemechList";

interface PilotListProps {
  pilots: Pilot[];
  showSp: boolean;
  emptyMessage: string;
}

const PilotList = ({ pilots, showSp, emptyMessage }: PilotListProps) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm text-slate-800">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <th className="px-4 py-3 text-left font-semibold" scope="col">Name</th>
          {showSp && <th className="px-4 py-3 text-right font-semibold" scope="col">SP spent</th>}
        </tr>
      </thead>
      <tbody>
        {pilots.length === 0 ? (
          <tr className="border-b border-slate-100">
            <td className="px-4 py-3 text-slate-500" colSpan={showSp ? 2 : 1}>{emptyMessage}</td>
          </tr>
        ) : (
          pilots.map((pilot) => (
            <tr key={pilot.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3 text-left">
                {pilot.callsign}
                {pilot.isCo && !pilot.isDead && <span className="ml-1 font-medium text-slate-500">(CO)</span>}
              </td>
              {showSp && (
                <td className="px-4 py-3 text-right tabular-nums">
                  {(pilot.skillCost ?? 0) +
                    (pilot.edgeTokenCost ?? 0) +
                    (pilot.edgeAbilityCost ?? 0)}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

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

  const livingPilots = campaign.pilots.filter((pilot) => !pilot.isDead);
  const deadPilots = campaign.pilots.filter((pilot) => pilot.isDead);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{campaign.name}</h1>

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
          <PilotList pilots={livingPilots} showSp emptyMessage="No pilots available" />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="dead-pilots-heading">
          <h2 id="dead-pilots-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold">Dead pilots ({deadPilots.length})</h2>
          <PilotList pilots={deadPilots} showSp={false} emptyMessage="No dead pilots." />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="sorties-heading">
          <h2 id="sorties-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold">Sorties ({campaign.sorties.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-slate-800">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 text-left font-semibold" scope="col">Date played</th>
                  <th className="px-4 py-3 text-left font-semibold" scope="col">Scenario</th>
                  <th className="px-4 py-3 text-left font-semibold" scope="col">Win</th>
                  <th className="px-4 py-3 text-right font-semibold" scope="col">Earning</th>
                </tr>
              </thead>
              <tbody>
                {campaign.sorties.length === 0 ? (
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-500" colSpan={4}>No sorties yet.</td>
                  </tr>
                ) : (
                  campaign.sorties.map((sortie) => {
                    const playedDate = new Date(sortie.datePlayed);
                    return (
                      <tr key={sortie.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 text-left">{Number.isNaN(playedDate.getTime()) ? sortie.datePlayed : playedDate.toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-left">{sortie.scenarioName}</td>
                        <td className="px-4 py-3 text-left">{sortie.isWin ? "Yes" : "No"}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{sortie.earning}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CampaignPage;