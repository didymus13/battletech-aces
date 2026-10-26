import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { Battlemech } from "../Campaign";
import { apiFetch } from "../../api";

interface BattlemechFormValues {
  name: string;
  model: string;
  pv: string;
}

interface BattlemechListProps {
  campaignId: number;
  battlemechs: Battlemech[];
}

const BattlemechList = ({ campaignId, battlemechs }: BattlemechListProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BattlemechFormValues>();
  const [editingMech, setEditingMech] = useState<BattlemechFormValues & { id: number } | null>(null);

  const createBattlemech = useMutation({
    mutationFn: async (values: BattlemechFormValues) => {
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
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });

  const updateBattlemech = useMutation({
    mutationFn: async ({ mechId, values }: {
      mechId: number;
      values: BattlemechFormValues;
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
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
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
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });

  const totalPv = battlemechs.reduce((total, mech) => {
    const pv = Number(mech.pv);
    return Number.isFinite(pv) ? total + pv : total;
  }, 0);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="units-heading">
      <h2 id="units-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold text-slate-900">Units ({battlemechs.length})</h2>
      <form
        className="grid gap-3 border-b border-slate-200 px-5 py-5 sm:grid-cols-[max-content_minmax(8rem,1fr)] sm:items-center"
        onSubmit={handleSubmit((values) => createBattlemech.mutate(values))}
      >
        <label className="text-sm font-medium text-slate-700" htmlFor="mech-name">Name</label>
        <input
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
          id="mech-name"
          {...register("name", { required: "Enter a unit name" })}
          aria-invalid={Boolean(errors.name)}
        />
        <label className="text-sm font-medium text-slate-700" htmlFor="mech-model">Model</label>
        <input
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
          id="mech-model"
          {...register("model", { required: "Enter a model" })}
          aria-invalid={Boolean(errors.model)}
        />
        <label className="text-sm font-medium text-slate-700" htmlFor="mech-pv">PV</label>
        <input
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
          id="mech-pv"
          type="number"
          min="0"
          {...register("pv", {
            required: "Enter PV",
            min: { value: 0, message: "PV cannot be negative" },
          })}
          aria-invalid={Boolean(errors.pv)}
        />
        <button className="mt-1 min-h-10 justify-self-start rounded-md bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-2" type="submit" disabled={createBattlemech.isPending}>
          {createBattlemech.isPending ? "Adding..." : "Add unit"}
        </button>
        {errors.name && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.name.message}</span>}
        {errors.model && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.model.message}</span>}
        {errors.pv && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{errors.pv.message}</span>}
        {createBattlemech.error && <span className="text-sm text-red-600 sm:col-start-2" role="alert">{createBattlemech.error.message}</span>}
      </form>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm text-slate-800">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th className="px-4 py-3 text-left font-semibold" scope="col">Unit</th>
              <th className="px-4 py-3 text-left font-semibold" scope="col">Model</th>
              <th className="px-4 py-3 text-right font-semibold" scope="col">PV</th>
              <th className="px-4 py-3 text-right font-semibold" scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {battlemechs.length === 0 ? (
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-500" colSpan={4}>No units yet.</td>
              </tr>
            ) : (
              battlemechs.map((mech) => {
                const isEditing = editingMech?.id === mech.id;
                const inputClassName = "min-h-9 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100";
                return (
                  <tr key={mech.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-left">
                      {isEditing ? (
                        <input className={inputClassName} aria-label="Unit name" value={editingMech.name} onChange={(event) => setEditingMech({ ...editingMech, name: event.target.value })} />
                      ) : mech.name}
                    </td>
                    <td className="px-4 py-3 text-left">
                      {isEditing ? (
                        <input className={inputClassName} aria-label="Unit model" value={editingMech.model} onChange={(event) => setEditingMech({ ...editingMech, model: event.target.value })} />
                      ) : mech.model}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {isEditing ? (
                        <input className={`${inputClassName} text-right`} aria-label="Unit PV" type="number" min="0" value={editingMech.pv} onChange={(event) => setEditingMech({ ...editingMech, pv: event.target.value })} />
                      ) : mech.pv}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-md bg-sky-700 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
                            type="button"
                            disabled={updateBattlemech.isPending || !editingMech.name.trim() || !editingMech.model.trim() || editingMech.pv === "" || Number(editingMech.pv) < 0}
                            onClick={() => updateBattlemech.mutate({ mechId: mech.id, values: editingMech })}
                          >
                            {updateBattlemech.isPending ? "Saving..." : "Save"}
                          </button>
                          <button className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100" type="button" onClick={() => setEditingMech(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100" type="button" onClick={() => setEditingMech({ id: mech.id, name: mech.name, model: mech.model, pv: mech.pv })}>Edit</button>
                          <button
                            className="rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            type="button"
                            disabled={deleteBattlemech.isPending && deleteBattlemech.variables === mech.id}
                            onClick={() => {
                              if (window.confirm(`Delete ${mech.name}?`)) deleteBattlemech.mutate(mech.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 text-slate-900">
              <th className="px-4 py-3 text-left font-semibold" scope="row" colSpan={2}>Total PV</th>
              <td className="px-4 py-3 text-right tabular-nums font-semibold">{totalPv}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default BattlemechList;
