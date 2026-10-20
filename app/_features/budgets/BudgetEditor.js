"use client";
import { useContext, useState, useTransition } from "react";
import Image from "next/image";
import Modal, { ModalContext } from "@/app/_UI/Modal";
import ConfirmAction from "@/app/_UI/ConfirmAction";
import {
  createBudget,
  editBudget,
  deleteBudget,
} from "@/app/_actions/budgetActions";
import Menus from "@/app/_UI/Menus";
import EllipsisIcon from "@/app/_UI/icons/EllipsisIcon";

function BudgetForm({ budget, categories, themes }) {
  const [id] = useState(() => budget?.id ?? crypto.randomUUID());
  const [category, setCategory] = useState(
    budget?.category_id ?? categories[0]?.id ?? "",
  );
  const [maximum, setMaximum] = useState(budget?.maximum ?? "");
  const [theme, setTheme] = useState(
    budget?.color ??
      themes.find((item) => item.color === "Green")?.hex_code ??
      themes[0]?.hex_code ??
      "",
  );
  const [themesOpen, setThemesOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const { close } = useContext(ModalContext);
  function submit(formData) {
    setError("");
    startTransition(async () => {
      try {
        const result = await (budget
          ? editBudget(id, formData)
          : createBudget(id, formData));
        if (result?.error) setError(result.error);
        else close();
      } catch {
        setError("Unable to save the budget. Please try again.");
      }
    });
  }
  return (
    <form action={submit} className="flex flex-col gap-5">
      <h2 className="pr-10 text-xl font-bold sm:text-[32px] sm:leading-[1.2]">
        {budget ? "Edit Budget" : "Add New Budget"}
      </h2>
      <p className="text-sm text-grey-500">
        {budget
          ? "As your budgets change, feel free to update your spending limits."
          : "Choose a category to set a spending budget. These categories can help you monitor spending."}
      </p>
      <fieldset disabled={pending} className="grid min-w-0 gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <label
            htmlFor={`budget-category-${id}`}
            className="text-xs font-bold text-grey-500"
          >
            Budget Category
          </label>
          <div className="relative">
            <select
              id={`budget-category-${id}`}
              className="form-input h-[45px] appearance-none px-5 py-3 pr-12 text-sm"
              name="category_id"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <Image
              src="/assets/images/icon-caret-down.svg"
              alt=""
              width={12}
              height={6}
              className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <label
            htmlFor={`budget-maximum-${id}`}
            className="text-xs font-bold text-grey-500"
          >
            Maximum Spend
          </label>
          <div className="flex h-[45px] items-center gap-3 rounded-lg border border-beige-500 px-5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-green">
            <span aria-hidden="true" className="text-sm text-beige-500">
              $
            </span>
            <input
              id={`budget-maximum-${id}`}
              className="min-w-0 flex-1 appearance-none bg-transparent text-sm text-grey-900 outline-none placeholder:text-beige-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              name="maximum"
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="e.g. 2000"
              value={maximum}
              onChange={(e) => setMaximum(e.target.value)}
            />
          </div>
        </div>

        <div className="relative flex min-w-0 flex-col gap-1">
          <label
            htmlFor={`budget-theme-${id}`}
            className="text-xs font-bold text-grey-500"
          >
            Theme
          </label>
          <input
            id={`budget-theme-${id}`}
            type="hidden"
            name="theme"
            value={theme}
          />
          <button
            type="button"
            className="form-input flex h-[45px] items-center gap-3 px-5 py-3 text-left text-sm"
            aria-haspopup="listbox"
            aria-expanded={themesOpen}
            onClick={() => setThemesOpen((open) => !open)}
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: theme }}
            />
            <span className="flex-1">
              {themes.find((item) => item.hex_code === theme)?.color ??
                "Select a theme"}
            </span>
            <Image
              src="/assets/images/icon-caret-down.svg"
              alt=""
              width={12}
              height={6}
            />
          </button>
          {themesOpen && (
            <div
              role="listbox"
              className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-beige-500 bg-white p-1 shadow-drop"
            >
              {themes.map((item) => (
                <button
                  key={item.hex_code}
                  type="button"
                  role="option"
                  aria-selected={item.hex_code === theme}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm text-grey-900 hover:bg-grey-100"
                  onClick={() => {
                    setTheme(item.hex_code);
                    setThemesOpen(false);
                  }}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: item.hex_code }}
                  />
                  {item.color}
                </button>
              ))}
            </div>
          )}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-red">
          {error}
        </p>
      )}
      <button
        className="button-primary w-full !p-4"
        disabled={pending || categories.length === 0 || themes.length === 0}
      >
        {pending ? "Saving..." : budget ? "Save Changes" : "Add Budget"}
      </button>
    </form>
  );
}

export default function BudgetEditor({ budget, categories, themes }) {
  return (
    <Modal>
      {budget ? (
        <Menus>
          <Menus.Toggle id={budget.id}>
            <EllipsisIcon />
            <span className="sr-only">Manage {budget.name} budget</span>
          </Menus.Toggle>
          <Menus.List id={budget.id}>
            <Modal.Open opens="budget-form">
              <Menus.Button>Edit Budget</Menus.Button>
            </Modal.Open>
            <div className="h-px bg-grey-100" />
            <Modal.Open opens="budget-delete">
              <Menus.Button type="delete">Delete Budget</Menus.Button>
            </Modal.Open>
          </Menus.List>
        </Menus>
      ) : (
        <Modal.Open opens="budget-form">
          <button type="button" className="button-primary">
            + Add New Budget
          </button>
        </Modal.Open>
      )}
      <Modal.Content
        name="budget-form"
        closeButtonClassName="sm:top-8 sm:right-8"
      >
        <BudgetForm budget={budget} categories={categories} themes={themes} />
      </Modal.Content>
      {budget && (
        <Modal.Content name="budget-delete">
          <ConfirmAction
            title={`Delete ${budget.name} budget?`}
            description="The budget will be removed. Your transactions and available balance will stay the same."
            action={() => deleteBudget(budget.id)}
          />
        </Modal.Content>
      )}
    </Modal>
  );
}
