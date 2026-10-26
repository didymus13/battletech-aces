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
  <table className={showSp ? "pilot-list pilot-list-with-sp" : "pilot-list"}>
    <thead>
      <tr>
        <th scope="col">Name</th>
        {showSp && <th scope="col">SP spent</th>}
      </tr>
    </thead>
    <tbody>
      {pilots.length === 0 ? (
        <tr>
          <td colSpan={showSp ? 2 : 1}>{emptyMessage}</td>
        </tr>
      ) : (
        pilots.map((pilot) => (
          <tr key={pilot.id}>
            <td>
              {pilot.callsign}
              {pilot.isCo && !pilot.isDead && " (CO)"}
            </td>
            {showSp && (
              <td>
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
    <main>
      <h1>{campaign.name}</h1>
      <section aria-labelledby="campaign-details-heading">
        <h2 id="campaign-details-heading">Campaign details</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Difficulty</th>
              <th scope="col">Force PV modifier</th>
              <th scope="col">SP modifier</th>
              <th scope="col">Starting SP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{campaign.difficulty}</td>
              <td>{campaign.playerForceModifier.toFixed(1)}x</td>
              <td>{campaign.spEarnedModifier.toFixed(1)}x</td>
              <td>{campaign.startingSp}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <BattlemechList battlemechs={campaign.mechs} campaignId={campaign.id} />
      <section aria-labelledby="living-pilots-heading">
        <h2 id="living-pilots-heading">Living pilots ({livingPilots.length})</h2>
        <PilotList pilots={livingPilots} showSp emptyMessage="No pilots available" />
      </section>
      <section aria-labelledby="dead-pilots-heading">
        <h2 id="dead-pilots-heading">Dead pilots ({deadPilots.length})</h2>
        <PilotList pilots={deadPilots} showSp={false} emptyMessage="No dead pilots." />
      </section>
      <section aria-labelledby="sorties-heading">
        <h2 id="sorties-heading">Sorties ({campaign.sorties.length})</h2>
        <table className="sortie-list">
          <thead>
            <tr>
              <th scope="col">Date played</th>
              <th scope="col">Scenario</th>
              <th scope="col">Win</th>
              <th scope="col">Earning</th>
            </tr>
          </thead>
          <tbody>
            {campaign.sorties.length === 0 ? (
              <tr>
                <td colSpan={4}>No sorties yet.</td>
              </tr>
            ) : (
              campaign.sorties.map((sortie) => {
                const playedDate = new Date(sortie.datePlayed);
                return (
                  <tr key={sortie.id}>
                    <td>{Number.isNaN(playedDate.getTime()) ? sortie.datePlayed : playedDate.toLocaleDateString()}</td>
                    <td>{sortie.scenarioName}</td>
                    <td>{sortie.isWin ? "Yes" : "No"}</td>
                    <td>{sortie.earning}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default CampaignPage;