import PotsContainer from "../../_features/pots/PotsContainer";
import PotsHeader from "../../_features/pots/PotsHeader";
import { getPots } from "../../_services/apiPots";
import { getThemes } from "../../_services/apiThemes";
import { getBalance } from "../../_services/apiBalance";
import BalanceSetupNotice from "../../_UI/BalanceSetupNotice";

async function PotsPage() {
  const [pots, themes, balance] = await Promise.all([
    getPots(),
    getThemes(),
    getBalance(),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1060px]">
      <PotsHeader themes={themes} />
      {balance === null && (
        <div className="mb-6">
          <BalanceSetupNotice />
        </div>
      )}
      {pots.length === 0 ? (
        <section className="rounded-xl bg-white p-10 text-center">
          <h2 className="text-xl font-bold">Start saving toward a goal</h2>
          <p className="mt-3 text-grey-500">
            Create your first pot to track progress for something important.
          </p>
        </section>
      ) : (
        <PotsContainer pots={pots} themes={themes} balance={balance} />
      )}
    </div>
  );
}

export default PotsPage;
