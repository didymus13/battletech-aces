import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import type { Campaign, Pilot } from "./Campaign";
import { apiFetch } from "../api";

interface PilotListProps {
  pilots: Pilot[];
  showSp: boolean;
  emptyMessage: string;
}

interface BattlemechFormValues {
  name: string;
  model: string;
  pv: string;
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
  
  const queryClient = useQueryClient();
  const { data: campaign, isLoading, error } = useQuery<Campaign>({
    queryKey: ['campaign', id],
    queryFn: () => apiFetch(`/api/1.0/campaigns/${id}`).then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BattlemechFormValues>();
  const [editingMech, setEditingMech] = useState<BattlemechFormValues & { id: number } | null>(null);
  const createBattlemech = useMutation({
    mutationFn: async ({ values, campaignId }: { values: BattlemechFormValues; campaignId: number }) => {
      const response = await apiFetch("/api/1.0/battlemechs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, id: null, campaignId }),
      });
      if (!response.ok) throw new Error(`Unable to add unit (${response.status})`);
      return response.json();
    },
    onSuccess: () => {
      reset();
      void queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });
  const updateBattlemech = useMutation({
    mutationFn: async ({ mechId, values, campaignId }: {
      mechId: number;
      values: BattlemechFormValues;
      campaignId: number;
    }) => {
      const response = await apiFetch(`/api/1.0/battlemechs/${mechId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, id: mechId, campaignId }),
      });
      if (!response.ok) throw new Error(`Unable to update unit (${response.status})`);
      return response.json();
    },
    onSuccess: () => {
      setEditingMech(null);
      void queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });
  const deleteBattlemech = useMutation({
    mutationFn: async (battlemechId: number) => {
      const response = await apiFetch(`/api/1.0/battlemechs/${battlemechId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Unable to delete unit (${response.status})`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
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

  const totalPv = campaign.mechs.reduce((total, mech) => {
    const pv = Number(mech.pv);
    return Number.isFinite(pv) ? total + pv : total;
  }, 0);
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
      <section aria-labelledby="units-heading">
        <h2 id="units-heading">Units ({campaign.mechs.length})</h2>
        <form
          className="mech-form"
          onSubmit={handleSubmit((values) => createBattlemech.mutate({ values, campaignId: campaign.id }))}
        >
          <label htmlFor="mech-name">Name</label>
          <input
            id="mech-name"
            {...register("name", { required: "Enter a unit name" })}
            aria-invalid={Boolean(errors.name)}
          />
          <label htmlFor="mech-model">Model</label>
          <input
            id="mech-model"
            {...register("model", { required: "Enter a model" })}
            aria-invalid={Boolean(errors.model)}
          />
          <label htmlFor="mech-pv">PV</label>
          <input
            id="mech-pv"
            type="number"
            min="0"
            {...register("pv", {
              required: "Enter PV",
              min: { value: 0, message: "PV cannot be negative" },
            })}
            aria-invalid={Boolean(errors.pv)}
          />
          <button type="submit" disabled={createBattlemech.isPending}>
            {createBattlemech.isPending ? "Adding..." : "Add unit"}
          </button>
          {errors.name && <span role="alert">{errors.name.message}</span>}
          {errors.model && <span role="alert">{errors.model.message}</span>}
          {errors.pv && <span role="alert">{errors.pv.message}</span>}
          {createBattlemech.error && <span role="alert">{createBattlemech.error.message}</span>}
        </form>
        <table className="mech-table">
          <thead>
            <tr>
              <th scope="col">Unit</th>
              <th scope="col">Model</th>
              <th scope="col">PV</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {campaign.mechs.length === 0 ? (
              <tr>
                <td colSpan={4}>No units yet.</td>
              </tr>
            ) : (
              campaign.mechs.map((mech) => {
                const isEditing = editingMech?.id === mech.id;
                return (
                  <tr key={mech.id}>
                    <td>
                      {isEditing ? (
                        <input
                          aria-label="Unit name"
                          value={editingMech.name}
                          onChange={(event) => setEditingMech({ ...editingMech, name: event.target.value })}
                        />
                      ) : mech.name}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          aria-label="Unit model"
                          value={editingMech.model}
                          onChange={(event) => setEditingMech({ ...editingMech, model: event.target.value })}
                        />
                      ) : mech.model}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          aria-label="Unit PV"
                          type="number"
                          min="0"
                          value={editingMech.pv}
                          onChange={(event) => setEditingMech({ ...editingMech, pv: event.target.value })}
                        />
                      ) : mech.pv}
                    </td>
                    <td>
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            disabled={
                              updateBattlemech.isPending ||
                              !editingMech.name.trim() ||
                              !editingMech.model.trim() ||
                              editingMech.pv === "" ||
                              Number(editingMech.pv) < 0
                            }
                            onClick={() => updateBattlemech.mutate({
                              mechId: mech.id,
                              values: editingMech,
                              campaignId: campaign.id,
                            })}
                          >
                            {updateBattlemech.isPending ? "Saving..." : "Save"}
                          </button>{" "}
                          <button type="button" onClick={() => setEditingMech(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingMech({ id: mech.id, name: mech.name, model: mech.model, pv: mech.pv })}
                          >
                            Edit
                          </button>{" "}
                          <button
                            type="button"
                            disabled={deleteBattlemech.isPending && deleteBattlemech.variables === mech.id}
                            onClick={() => {
                              if (window.confirm(`Delete ${mech.name}?`)) {
                                deleteBattlemech.mutate(mech.id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={2}>Total PV</th>
              <td>{totalPv}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </section>
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