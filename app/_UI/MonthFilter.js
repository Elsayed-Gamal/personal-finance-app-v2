export default function MonthFilter({ month, label = "Reporting month" }) {
  return (
    <form className="flex flex-wrap items-end gap-3" method="get">
      <label className="field-label">
        {label}
        <input
          key={month}
          className="form-input"
          type="month"
          name="month"
          defaultValue={month}
          min="1900-01"
          max="2199-12"
          required
        />
      </label>
      <button className="button-secondary" type="submit">
        View month
      </button>
    </form>
  );
}
