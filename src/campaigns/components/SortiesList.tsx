import type { Sortie } from "../Campaign";

const SortiesList = ({ sorties }: { sorties: Sortie[] }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-slate-800">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 text-left font-semibold" scope="col">Date played</th>
                  <th className="px-4 py-3 text-left font-semibold" scope="col">Scenario</th>
                  <th className="px-4 py-3 text-left font-semibold" scope="col">Win?</th>
                  <th className="px-4 py-3 text-right font-semibold" scope="col">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {sorties.length === 0 ? (
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-500" colSpan={4}>No sorties yet.</td>
                  </tr>
                ) : (
                  sorties.map((sortie) => {
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
    );
}

export default SortiesList;