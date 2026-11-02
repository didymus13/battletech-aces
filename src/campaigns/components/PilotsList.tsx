import { Fragment, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { Pilot } from "../Campaign";
import { apiFetch } from "../../api";

interface PilotListProps {
  pilots: Pilot[];
  showSp: boolean;
  emptyMessage: string;
  campaignId?: number;
  allowCreate?: boolean;
}

interface PilotFormValues {
  callsign: string;
  skill: string;
  skillCost: string;
  edgeTokens: string;
  edgeTokenCost: string;
  edgeAbilities: string;
  edgeAbilityCost: string;
  timesMvp: string;
  isWounded: boolean;
  isDead: boolean;
  isCo: boolean;
}

interface EditingPilot {
  id: number;
  values: PilotFormValues;
}

const pilotToFormValues = (pilot: Pilot): PilotFormValues => ({
  callsign: pilot.callsign,
  skill: String(pilot.skill),
  skillCost: pilot.skillCost === null ? "" : String(pilot.skillCost),
  edgeTokens: String(pilot.edgeTokens),
  edgeTokenCost: pilot.edgeTokenCost === null ? "" : String(pilot.edgeTokenCost),
  edgeAbilities: pilot.edgeAbilities.join(", "),
  edgeAbilityCost: pilot.edgeAbilityCost === null ? "" : String(pilot.edgeAbilityCost),
  timesMvp: String(pilot.timesMvp ?? 0),
  isWounded: Boolean(pilot.isWounded),
  isDead: Boolean(pilot.isDead),
  isCo: Boolean(pilot.isCo),
});

const PilotList = ({ pilots, showSp, emptyMessage, campaignId, allowCreate = false }: PilotListProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PilotFormValues>();
  const [editingPilot, setEditingPilot] = useState<EditingPilot | null>(null);

  const createPilot = useMutation({
    mutationFn: async ({ callsign, skill, skillCost, edgeTokens, edgeTokenCost, edgeAbilities, edgeAbilityCost }: PilotFormValues) => {
      const response = await apiFetch(`/api/1.0/campaigns/${campaignId}/pilots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: null,
          campaignId,
          callsign,
          type: "MechWarrior",
          skill: Number(skill),
          skillCost: Number(skillCost),
          edgeTokens: Number(edgeTokens),
          edgeTokenCost: Number(edgeTokenCost),
          edgeAbilities: edgeAbilities.split(",").map((ability) => ability.trim()).filter(Boolean),
          edgeAbilityCost: Number(edgeAbilityCost),
          timesMvp: 0,
          isWounded: false,
          isDead: false,
          isCo: false,
        }),
      });
      if (!response.ok) throw new Error(`Unable to add pilot (${response.status})`);
      return response.json();
    },
    onSuccess: () => {
      reset();
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });

  const deletePilot = useMutation({
    mutationFn: async (pilotId: number) => {
      const response = await apiFetch(`/api/1.0/pilots/${pilotId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Unable to delete pilot (${response.status})`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });

  const updatePilot = useMutation({
    mutationFn: async ({ pilot, values }: { pilot: Pilot; values: PilotFormValues }) => {
      const response = await apiFetch(`/api/1.0/pilots/${pilot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pilot.id,
          campaignId,
          callsign: values.callsign.trim(),
          type: pilot.type,
          skill: Number(values.skill),
          skillCost: values.skillCost === "" ? null : Number(values.skillCost),
          edgeTokens: Number(values.edgeTokens),
          edgeTokenCost: values.edgeTokenCost === "" ? null : Number(values.edgeTokenCost),
          edgeAbilities: values.edgeAbilities.split(",").map((ability) => ability.trim()).filter(Boolean),
          edgeAbilityCost: values.edgeAbilityCost === "" ? null : Number(values.edgeAbilityCost),
          timesMvp: Number(values.timesMvp),
          isWounded: values.isWounded,
          isDead: values.isDead,
          isCo: values.isCo,
        }),
      });
      if (!response.ok) throw new Error(`Unable to update pilot (${response.status})`);
      return response.json();
    },
    onSuccess: () => {
      setEditingPilot(null);
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });

  const pilotInputClassName = "min-h-9 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100";
  const isValidNonNegativeNumber = (value: string, required = true) =>
    (!required && value === "") || (Number.isFinite(Number(value)) && Number(value) >= 0);

  return (
    <>
      <div className="overflow-x-auto">
        <table className={`w-full ${showSp ? "min-w-[760px]" : ""} border-collapse text-sm text-slate-800`}>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th className="px-4 py-3 text-left font-semibold" scope="col">Name</th>
              {showSp && <th className="px-4 py-3 text-right font-semibold" scope="col">Skill</th>}
              {showSp && <th className="px-4 py-3 text-right font-semibold" scope="col">Edge tokens</th>}
              {showSp && <th className="px-4 py-3 text-left font-semibold" scope="col">Edge abilities</th>}
              {showSp && <th className="px-4 py-3 text-right font-semibold" scope="col">SP spent</th>}
              <th className="px-4 py-3 text-right font-semibold" scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {pilots.length === 0 ? (
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-500" colSpan={showSp ? 6 : 2}>{emptyMessage}</td>
              </tr>
            ) : (
              pilots.map((pilot) => {
                const isEditing = editingPilot?.id === pilot.id;
                const values = editingPilot?.values;
                const canSave = values !== undefined &&
                  values.callsign.trim() !== "" &&
                  isValidNonNegativeNumber(values.skill) &&
                  isValidNonNegativeNumber(values.skillCost, false) &&
                  isValidNonNegativeNumber(values.edgeTokens) &&
                  isValidNonNegativeNumber(values.edgeTokenCost, false) &&
                  isValidNonNegativeNumber(values.edgeAbilityCost, false) &&
                  values.timesMvp !== "" && Number.isInteger(Number(values.timesMvp)) && Number(values.timesMvp) >= 0;

                return (
                  <Fragment key={pilot.id}>
                    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-left">
                        {pilot.callsign}
                        {pilot.isCo && !pilot.isDead && <span className="ml-1 font-medium text-slate-500">(CO)</span>}
                      </td>
                      {showSp && <td className="px-4 py-3 text-right tabular-nums">{pilot.skill}</td>}
                      {showSp && <td className="px-4 py-3 text-right tabular-nums">{pilot.edgeTokens}</td>}
                      {showSp && <td className="max-w-64 break-words px-4 py-3 text-left">{pilot.edgeAbilities?.join(", ") || "-"}</td>}
                      {showSp && (
                        <td className="px-4 py-3 text-right tabular-nums">
                          {(pilot.skillCost ?? 0) +
                            (pilot.edgeTokenCost ?? 0) +
                            (pilot.edgeAbilityCost ?? 0)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {campaignId !== undefined && !isEditing && (
                            <button
                              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                              disabled={updatePilot.isPending}
                              onClick={() => updatePilot.mutate({
                                pilot,
                                values: { ...pilotToFormValues(pilot), isDead: !pilot.isDead },
                              })}
                            >
                              {pilot.isDead ? "Revive" : "Mark dead"}
                            </button>
                          )}
                          {campaignId !== undefined && !isEditing && (
                            <button
                              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                              type="button"
                              onClick={() => setEditingPilot({ id: pilot.id, values: pilotToFormValues(pilot) })}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            className="rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            type="button"
                            disabled={deletePilot.isPending && deletePilot.variables === pilot.id}
                            onClick={() => {
                              if (window.confirm(`Delete pilot ${pilot.callsign}?`)) deletePilot.mutate(pilot.id);
                            }}
                          >
                            {deletePilot.isPending && deletePilot.variables === pilot.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isEditing && values && (
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td className="px-4 py-4" colSpan={showSp ? 6 : 2}>
                          <form
                            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                            onSubmit={(event) => {
                              event.preventDefault();
                              if (canSave) updatePilot.mutate({ pilot, values });
                            }}
                          >
                            <label className="grid gap-1 text-sm font-medium text-slate-700">
                              Callsign
                              <input className={pilotInputClassName} aria-label="Pilot callsign" value={values.callsign} onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, callsign: event.target.value } })} />
                            </label>
                            <label className="grid gap-1 text-sm font-medium text-slate-700">
                              Skill
                              <input className={pilotInputClassName} aria-label="Pilot skill" type="number" min="0" value={values.skill} onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, skill: event.target.value } })} />
                            </label>
                            <label className="grid gap-1 text-sm font-medium text-slate-700">
                              Skill cost
                              <input className={pilotInputClassName} aria-label="Pilot skill cost" type="number" min="0" value={values.skillCost} onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, skillCost: event.target.value } })} />
                            </label>
                            <label className="grid gap-1 text-sm font-medium text-slate-700">
                              Edge tokens
                              <input className={pilotInputClassName} aria-label="Pilot edge tokens" type="number" min="0" value={values.edgeTokens} onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, edgeTokens: event.target.value } })} />
                            </label>
                            <label className="grid gap-1 text-sm font-medium text-slate-700">
                              Edge token cost
                              <input className={pilotInputClassName} aria-label="Pilot edge token cost" type="number" min="0" value={values.edgeTokenCost} onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, edgeTokenCost: event.target.value } })} />
                            </label>
                            <label className="grid gap-1 text-sm font-medium text-slate-700">
                              Edge abilities (comma-separated)
                              <textarea className={pilotInputClassName} aria-label="Pilot edge abilities" value={values.edgeAbilities} onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, edgeAbilities: event.target.value } })} />
                            </label>
                            <label className="grid gap-1 text-sm font-medium text-slate-700">
                              Edge ability cost
                              <input className={pilotInputClassName} aria-label="Pilot edge ability cost" type="number" min="0" value={values.edgeAbilityCost} onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, edgeAbilityCost: event.target.value } })} />
                            </label>
                            <label className="grid gap-1 text-sm font-medium text-slate-700">
                              Times MVP
                              <input className={pilotInputClassName} aria-label="Pilot times MVP" type="number" min="0" step="1" value={values.timesMvp} onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, timesMvp: event.target.value } })} />
                            </label>
                            <label className="flex min-h-9 items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                className="size-4 accent-sky-700"
                                type="checkbox"
                                checked={Boolean(values.isWounded)}
                                onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, isWounded: event.target.checked } })}
                              />
                              Wounded
                            </label>
                            <label className="flex min-h-9 items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                className="size-4 accent-sky-700"
                                type="checkbox"
                                checked={Boolean(values.isCo)}
                                onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, isCo: event.target.checked } })}
                              />
                              Commander
                            </label>
                            <label className="flex min-h-9 items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                className="size-4 accent-sky-700"
                                type="checkbox"
                                checked={Boolean(values.isDead)}
                                onChange={(event) => setEditingPilot({ id: pilot.id, values: { ...values, isDead: event.target.checked } })}
                              />
                              Dead
                            </label>
                            <div className="flex items-end justify-start gap-2 sm:col-span-2 lg:col-span-3">
                              <button className="rounded-md bg-sky-700 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={!canSave || updatePilot.isPending}>
                                {updatePilot.isPending ? "Saving..." : "Save"}
                              </button>
                              <button className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100" type="button" onClick={() => setEditingPilot(null)}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {deletePilot.error && <p className="px-5 py-3 text-sm text-red-600" role="alert">{deletePilot.error.message}</p>}
      {updatePilot.error && <p className="px-5 py-3 text-sm text-red-600" role="alert">{updatePilot.error.message}</p>}
      {campaignId !== undefined && allowCreate && (
        <form
          className="grid gap-3 border-t border-slate-200 px-5 py-5 sm:grid-cols-[max-content_minmax(8rem,1fr)] sm:items-center"
          onSubmit={handleSubmit((values) => createPilot.mutate(values))}
        >
          <label className="text-sm font-medium text-slate-700" htmlFor="pilot-callsign">Callsign</label>
          <input
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            id="pilot-callsign"
            {...register("callsign", { required: "Enter a callsign" })}
            aria-invalid={Boolean(errors.callsign)}
          />
          <label className="text-sm font-medium text-slate-700" htmlFor="pilot-skill">Skill</label>
          <input
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            id="pilot-skill"
            type="number"
            min="0"
            {...register("skill", { required: "Enter a skill", min: { value: 0, message: "Skill cannot be negative" } })}
            aria-invalid={Boolean(errors.skill)}
          />
          <label className="text-sm font-medium text-slate-700" htmlFor="pilot-skill-cost">Skill cost</label>
          <input
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            id="pilot-skill-cost"
            type="number"
            min="0"
            {...register("skillCost", { required: "Enter a skill cost", min: { value: 0, message: "Skill cost cannot be negative" } })}
            aria-invalid={Boolean(errors.skillCost)}
          />
          <label className="text-sm font-medium text-slate-700" htmlFor="pilot-edge-tokens">Edge tokens</label>
          <input
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            id="pilot-edge-tokens"
            type="number"
            min="0"
            {...register("edgeTokens", { required: "Enter an edge token count", min: { value: 0, message: "Edge tokens cannot be negative" } })}
            aria-invalid={Boolean(errors.edgeTokens)}
          />
          <label className="text-sm font-medium text-slate-700" htmlFor="pilot-edge-token-cost">Edge token cost</label>
          <input
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            id="pilot-edge-token-cost"
            type="number"
            min="0"
            {...register("edgeTokenCost", { required: "Enter an edge token cost", min: { value: 0, message: "Edge token cost cannot be negative" } })}
            aria-invalid={Boolean(errors.edgeTokenCost)}
          />
          <label className="text-sm font-medium text-slate-700" htmlFor="pilot-edge-abilities">Edge abilities (comma-separated)</label>
          <textarea
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            id="pilot-edge-abilities"
            {...register("edgeAbilities")}
            aria-invalid={Boolean(errors.edgeAbilities)}
          />
          <label className="text-sm font-medium text-slate-700" htmlFor="pilot-edge-ability-cost">Total edge ability cost</label>
          <input
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            id="pilot-edge-ability-cost"
            type="number"
            min="0"
            {...register("edgeAbilityCost", { required: "Enter a total edge ability cost", min: { value: 0, message: "Edge ability cost cannot be negative" } })}
            aria-invalid={Boolean(errors.edgeAbilityCost)}
          />
          <button className="mt-1 min-h-10 justify-self-start rounded-md bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-2" type="submit" disabled={createPilot.isPending}>
            {createPilot.isPending ? "Adding..." : "Add pilot"}
          </button>
          {errors.callsign && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.callsign.message}</span>}
          {errors.skill && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.skill.message}</span>}
          {errors.skillCost && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.skillCost.message}</span>}
          {errors.edgeTokens && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.edgeTokens.message}</span>}
          {errors.edgeTokenCost && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.edgeTokenCost.message}</span>}
          {errors.edgeAbilityCost && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.edgeAbilityCost.message}</span>}
          {createPilot.error && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{createPilot.error.message}</span>}
        </form>
      )}
    </>
  );
};

export default PilotList;