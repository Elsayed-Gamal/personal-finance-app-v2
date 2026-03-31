import PotsContainer from '../../_features/pots/PotsContainer';
import PotsHeader from '../../_features/pots/PotsHeader';
import { getPots } from '../../_services/apiPots';
import { getThemes } from '../../_services/apiThemes';

async function PotsPage() {
  const pots = await getPots();
  const themes = await getThemes();

  return (
    <div>
      <PotsHeader themes={themes} />
      <PotsContainer pots={pots} themes={themes} />
    </div>
  );
}

export default PotsPage;
