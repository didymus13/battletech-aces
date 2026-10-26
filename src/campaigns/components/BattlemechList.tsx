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
    <section aria-labelledby="units-heading">
      <h2 id="units-heading">Units ({battlemechs.length})</h2>
      <form
        className="mech-form"
        onSubmit={handleSubmit((values) => createBattlemech.mutate(values))}
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
          {battlemechs.length === 0 ? (
            <tr>
              <td colSpan={4}>No units yet.</td>
            </tr>
          ) : (
            battlemechs.map((mech) => {
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
                          onClick={() => updateBattlemech.mutate({ mechId: mech.id, values: editingMech })}
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
  );
};

export default BattlemechList;
