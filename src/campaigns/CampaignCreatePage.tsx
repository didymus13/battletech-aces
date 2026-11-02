import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { apiFetch } from "../api";
import type { Campaign } from "./Campaign";

interface CampaignFormValues {
  name: string;
  difficulty: Campaign["difficulty"];
  startingSp: number;
}

const difficulties: Campaign["difficulty"][] = [
  "ROOKIE",
  "STANDARD",
  "VETERAN",
  "ELITE",
  "LEGENDARY",
];

const CampaignCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<CampaignFormValues>();
  const fieldClassName = "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100";

  const createCampaign = useMutation({
    mutationFn: async (values: CampaignFormValues) => {
      const response = await apiFetch("/api/1.0/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error(`Unable to create campaign (${response.status})`);
      return response.json() as Promise<Campaign>;
    },
    onSuccess: (campaign) => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      navigate(`/campaigns/${campaign.id}`);
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">New campaign</h1>
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="campaign-setup-heading">
          <h2 id="campaign-setup-heading" className="border-b border-slate-200 px-5 py-4 text-lg font-semibold">Campaign details</h2>
          <form className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6" onSubmit={handleSubmit((values) => createCampaign.mutate(values))}>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="campaign-name">
          Campaign name
          <input
            className={fieldClassName}
            id="campaign-name"
            {...register("name", { required: "Enter a campaign name" })}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <span className="text-sm text-red-600" role="alert">{errors.name.message}</span>}
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700" htmlFor="campaign-difficulty">
          Difficulty
          <select
            className={fieldClassName}
            id="campaign-difficulty"
            defaultValue=""
            {...register("difficulty", { required: "Choose a difficulty" })}
            aria-invalid={Boolean(errors.difficulty)}
          >
            <option value="" disabled>Choose difficulty</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
          {errors.difficulty && <span className="text-sm text-red-600" role="alert">{errors.difficulty.message}</span>}
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700" htmlFor="campaign-points">
          Points limit
          <input
            className={fieldClassName}
            id="campaign-points"
            type="number"
            min="0"
            {...register("startingSp", {
              required: "Enter a points limit",
              valueAsNumber: true,
              min: { value: 0, message: "Points limit cannot be negative" },
            })}
            aria-invalid={Boolean(errors.startingSp)}
          />
          {errors.startingSp && <span className="text-sm text-red-600" role="alert">{errors.startingSp.message}</span>}
        </label>
        {createCampaign.error && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{createCampaign.error.message}</p>}
        <div className="sm:col-span-2">
          <button
            className="min-h-10 rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={createCampaign.isPending}
          >
            {createCampaign.isPending ? "Creating..." : "Create campaign"}
          </button>
        </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default CampaignCreatePage;