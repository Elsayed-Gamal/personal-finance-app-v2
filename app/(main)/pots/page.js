import PotsContainer from "../../_features/pots/PotsContainer";
import PotsHeader from "../../_features/pots/PotsHeader";
import { getPots } from "../../_services/apiPots";
import { getThemes } from "../../_services/apiThemes";
import { getBalance } from "../../_services/apiBalance";

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
        <p
          role="status"
          className="mb-6 rounded-xl border border-yellow bg-white p-4 text-grey-900"
        >
          Your balance is not set up yet. You can manage your pots, but adding
          or withdrawing money and deleting pots with savings are unavailable
          until your opening balance is confirmed. Contact the administrator for
          help.
        </p>
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
