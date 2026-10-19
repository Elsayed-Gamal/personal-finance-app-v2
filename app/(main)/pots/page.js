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
    <div>
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
      <PotsContainer pots={pots} themes={themes} balance={balance} />
    </div>
  );
}

export default PotsPage;
