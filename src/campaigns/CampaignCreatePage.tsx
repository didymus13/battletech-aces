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
    <main>
      <h1>New Campaign</h1>
      <form onSubmit={handleSubmit((values) => createCampaign.mutate(values))}>
        <p>
          <label htmlFor="campaign-name">Campaign name</label>
          <input
            id="campaign-name"
            {...register("name", { required: "Enter a campaign name" })}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <span role="alert">{errors.name.message}</span>}
        </p>
        <p>
          <label htmlFor="campaign-difficulty">Difficulty</label>
          <select
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
          {errors.difficulty && <span role="alert">{errors.difficulty.message}</span>}
        </p>
        <p>
          <label htmlFor="campaign-points">Points limit</label>
          <input
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
          {errors.startingSp && <span role="alert">{errors.startingSp.message}</span>}
        </p>
        {createCampaign.error && <p role="alert">{createCampaign.error.message}</p>}
        <button type="submit" disabled={createCampaign.isPending}>
          {createCampaign.isPending ? "Creating..." : "Create campaign"}
        </button>
      </form>
    </main>
  );
};

export default CampaignCreatePage;