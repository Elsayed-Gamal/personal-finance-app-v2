import Link from "next/link";

function BalanceSetupNotice() {
  return (
    <p
      role="status"
      className="rounded-xl border border-yellow bg-white p-4 text-sm text-grey-900"
    >
      Your opening balance has not been set. Set it on your{" "}
      <Link
        href="/profile"
        className="font-bold underline underline-offset-2"
      >
        Profile
      </Link>{" "}
      to enable balance-related actions.
    </p>
  );
}

export default BalanceSetupNotice;
