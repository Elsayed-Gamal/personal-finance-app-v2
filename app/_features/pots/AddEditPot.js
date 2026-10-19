"use client";

import AddEditPotForm from "./AddEditPotForm";
import { useTransition } from "react";

function AddEditPot({ type, pot, themes }) {
  const [isPending, startTransition] = useTransition();

  const potName = pot?.name || "";
  const potTarget = pot?.target || "";
  const potTheme = pot?.theme || "";

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-grey-900" style={{ font: "var(--text-preset-1)" }}>
        {type === "add" ? "Add New Pot" : "Edit Pot"}
      </h2>
      <p className="text-grey-500" style={{ font: "var(--text-preset-4)" }}>
        {type === "add"
          ? "Create a pot to set savings targets. These can help keep you on track as you save for special purchases."
          : "If your saving targets change, feel free to update your pots."}
      </p>
      <AddEditPotForm
        type={type}
        potId={pot?.id}
        potName={potName}
        potTarget={potTarget}
        potTheme={potTheme}
        themes={themes}
        startTransition={startTransition}
        isPending={isPending}
      />
    </div>
  );
}

export default AddEditPot;
