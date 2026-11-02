import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { Sortie } from "../Campaign";
import { apiFetch } from "../../api";

type SortieFormValues = Omit<Sortie, "id" | "campaignId">;
type NumericSortieField = Exclude<keyof SortieFormValues, "datePlayed" | "scenarioNumber" | "scenarioName" | "isWin">;

interface SortiesListProps {
  campaignId: number;
  sorties: Sortie[];
}

const incomeFields: { name: NumericSortieField; label: string; step?: string }[] = [
  { name: "primaryObjectiveSp", label: "Primary objective SP" },
  { name: "otherObjectiveSp", label: "Other objective SP" },
  { name: "spModifier", label: "SP modifier", step: "any" },
  { name: "totalIncome", label: "Total income" },
];

const expenseFields: { name: NumericSortieField; label: string }[] = [
  { name: "reconSp", label: "Recon SP" },
  { name: "waypoints", label: "Waypoints" },
  { name: "rearming", label: "Rearming" },
  { name: "personnelWounded", label: "Personnel wounded" },
  { name: "personnelNew", label: "New personnel" },
  { name: "repairsDestroyed", label: "Repairs: destroyed" },
  { name: "repairsCrippled", label: "Repairs: crippled" },
  { name: "repairsStructure", label: "Repairs: structure" },
  { name: "repairsArmor", label: "Repairs: armor" },
  { name: "totalExpenses", label: "Total expenses" },
  { name: "earning", label: "Earnings" },
];

const sortieFieldGroups: { title: string; fields: { name: NumericSortieField; label: string; step?: string }[] }[] = [
  { title: "Income", fields: incomeFields },
  { title: "Expenses", fields: expenseFields },
];

const createEmptyValues = (): SortieFormValues => ({
  datePlayed: "",
  scenarioNumber: "",
  scenarioName: "",
  isWin: false,
  primaryObjectiveSp: 0,
  otherObjectiveSp: 0,
  spModifier: 1,
  totalIncome: 0,
  reconSp: 0,
  waypoints: 0,
  rearming: 0,
  personnelWounded: 0,
  personnelNew: 0,
  repairsDestroyed: 0,
  repairsCrippled: 0,
  repairsStructure: 0,
  repairsArmor: 0,
  totalExpenses: 0,
  earning: 0,
});

const toFormValues = (sortie: Sortie): SortieFormValues => ({
  datePlayed: sortie.datePlayed,
  scenarioNumber: sortie.scenarioNumber,
  scenarioName: sortie.scenarioName,
  isWin: sortie.isWin,
  primaryObjectiveSp: sortie.primaryObjectiveSp,
  otherObjectiveSp: sortie.otherObjectiveSp,
  spModifier: sortie.spModifier,
  totalIncome: sortie.totalIncome,
  reconSp: sortie.reconSp,
  waypoints: sortie.waypoints,
  rearming: sortie.rearming,
  personnelWounded: sortie.personnelWounded,
  personnelNew: sortie.personnelNew,
  repairsDestroyed: sortie.repairsDestroyed,
  repairsCrippled: sortie.repairsCrippled,
  repairsStructure: sortie.repairsStructure,
  repairsArmor: sortie.repairsArmor,
  totalExpenses: sortie.totalExpenses,
  earning: sortie.earning,
});

const SortiesList = ({ campaignId, sorties }: SortiesListProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SortieFormValues>({
    defaultValues: createEmptyValues(),
  });
  const [editingSortieId, setEditingSortieId] = useState<number | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const createSortie = useMutation({
    mutationFn: async (values: SortieFormValues) => {
      const response = await apiFetch("/api/1.0/sorties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, id: null, campaignId }),
      });
      if (!response.ok) throw new Error(`Unable to add sortie (${response.status})`);
      return response.json();
    },
    onSuccess: () => {
      reset(createEmptyValues());
      setIsAddFormOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });

  const updateSortie = useMutation({
    mutationFn: async ({ sortieId, values }: { sortieId: number; values: SortieFormValues }) => {
      const response = await apiFetch(`/api/1.0/sorties/${sortieId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, id: sortieId, campaignId }),
      });
      if (!response.ok) throw new Error(`Unable to update sortie (${response.status})`);
      return response.json();
    },
    onSuccess: () => {
      setEditingSortieId(null);
      reset(createEmptyValues());
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });

  const deleteSortie = useMutation({
    mutationFn: async (sortieId: number) => {
      const response = await apiFetch(`/api/1.0/sorties/${sortieId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Unable to delete sortie (${response.status})`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });

  const inputClassName = "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100";
  const fieldLabelClassName = "grid gap-1.5 text-sm font-medium text-slate-700";
  const formMutationError = editingSortieId === null ? createSortie.error : updateSortie.error;
  const isSaving = createSortie.isPending || updateSortie.isPending;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm text-slate-800">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th className="px-4 py-3 text-left font-semibold" scope="col">Date played</th>
              <th className="px-4 py-3 text-left font-semibold" scope="col">Scenario</th>
              <th className="px-4 py-3 text-left font-semibold" scope="col">Win?</th>
              <th className="px-4 py-3 text-right font-semibold" scope="col">Earnings</th>
              <th className="px-4 py-3 text-right font-semibold" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorties.length === 0 ? (
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-500" colSpan={5}>No sorties yet.</td>
              </tr>
            ) : (
              sorties.map((sortie) => {
                return (
                  <tr key={sortie.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-left">{sortie.datePlayed}</td>
                    <td className="px-4 py-3 text-left">{sortie.scenarioName}</td>
                    <td className="px-4 py-3 text-left">{sortie.isWin ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{sortie.earning}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                          type="button"
                          onClick={() => {
                            setIsAddFormOpen(false);
                            updateSortie.reset();
                            setEditingSortieId(sortie.id);
                            reset(toFormValues(sortie));
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          disabled={deleteSortie.isPending && deleteSortie.variables === sortie.id}
                          onClick={() => {
                            if (window.confirm(`Delete sortie for ${sortie.scenarioName}?`)) deleteSortie.mutate(sortie.id);
                          }}
                        >
                          {deleteSortie.isPending && deleteSortie.variables === sortie.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {deleteSortie.error && <p className="px-5 py-3 text-sm text-red-600" role="alert">{deleteSortie.error.message}</p>}
      {editingSortieId === null && !isAddFormOpen && (
        <div className="border-t border-slate-200 px-5 py-4">
          <button
            className="min-h-10 rounded-md bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
            type="button"
            onClick={() => {
              reset(createEmptyValues());
              createSortie.reset();
              updateSortie.reset();
              setIsAddFormOpen(true);
            }}
          >
            Add sortie
          </button>
        </div>
      )}
      {(isAddFormOpen || editingSortieId !== null) && <form
        className="grid gap-5 border-t border-slate-200 px-5 py-5"
        onSubmit={handleSubmit((values) => {
          if (editingSortieId === null) createSortie.mutate(values);
          else updateSortie.mutate({ sortieId: editingSortieId, values });
        })}
      >
        <h3 className="text-base font-semibold text-slate-900">
          {editingSortieId === null ? "Add sortie" : "Edit sortie"}
        </h3>

        <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <legend className="mb-3 text-sm font-semibold text-slate-700">Scenario and result</legend>
          <label className={fieldLabelClassName}>
            Date played
            <input className={inputClassName} type="date" {...register("datePlayed", { required: true })} />
          </label>
          <label className={fieldLabelClassName}>
            Scenario number
            <input className={inputClassName} {...register("scenarioNumber", { required: true })} />
          </label>
          <label className={fieldLabelClassName}>
            Scenario name
            <input className={inputClassName} {...register("scenarioName", { required: true })} />
          </label>
          <label className={fieldLabelClassName}>
            Result
            <select className={inputClassName} {...register("isWin", { setValueAs: (value) => value === "true" })}>
              <option value="false">Loss</option>
              <option value="true">Win</option>
            </select>
          </label>
        </fieldset>

        {sortieFieldGroups.map(({ title, fields }) => (
          <fieldset key={title} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <legend className="mb-3 text-sm font-semibold text-slate-700">{title}</legend>
            {fields.map(({ name, label, step }) => (
              <label className={fieldLabelClassName} key={name}>
                {label}
                <input
                  className={inputClassName}
                  type="number"
                  step={step ?? "1"}
                  {...register(name, { required: true, valueAsNumber: true })}
                />
              </label>
            ))}
          </fieldset>
        ))}

        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-red-600" role="alert">Complete all required sortie fields.</p>
        )}
        {formMutationError && <p className="text-sm text-red-600" role="alert">{formMutationError.message}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            className="min-h-10 rounded-md bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : editingSortieId === null ? "Add sortie" : "Save sortie"}
          </button>
          <button
            className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            type="button"
            disabled={isSaving}
            onClick={() => {
              setEditingSortieId(null);
              setIsAddFormOpen(false);
              reset(createEmptyValues());
              createSortie.reset();
              updateSortie.reset();
            }}
          >
            Cancel
          </button>
        </div>
      </form>}
    </div>
  );
};

export default SortiesList;