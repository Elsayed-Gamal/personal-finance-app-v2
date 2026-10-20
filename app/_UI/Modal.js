"use client";

import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useId,
} from "react";
import { createPortal } from "react-dom";
import CloseModalIcon from "./icons/CloseModalIcon";
import { AnimatePresence, motion } from "motion/react";
import useHydrated from "../_hooks/useHydrated";

export const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState("");

  const close = useCallback(() => setOpenName(""), []);
  const open = useCallback((name) => setOpenName(name), []);

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opens }) {
  const { open } = useContext(ModalContext);

  return cloneElement(children, {
    onClick: () => open(opens),
  });
}

function Content({ children, name, closeButtonClassName = "" }) {
  const { openName, close } = useContext(ModalContext);
  const content = useRef();
  const titleId = useId();
  const isOpen = openName === name;
  const mounted = useHydrated();

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const heading = content.current?.querySelector("h2");
    if (heading) heading.id = titleId;
    const focusable =
      'button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]';
    const firstInput = content.current?.querySelector(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled])',
    );
    (firstInput ?? content.current)?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = [
        ...(content.current?.querySelectorAll(focusable) ?? []),
      ];
      const first = elements[0];
      const last = elements.at(-1);
      if (!first) {
        event.preventDefault();
        content.current?.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === content.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === content.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleClickOutside(e) {
      if (content.current && !content.current.contains(e.target)) close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [close, isOpen, mounted, titleId]);

  if (!mounted) return null; // ← لا تُرنِّد شيئًا على السيرفر

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex min-h-dvh w-full items-center justify-center bg-black/50 p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative max-h-[calc(100dvh-24px)] w-full max-w-140 overscroll-contain overflow-y-auto rounded-xl bg-white p-5 outline-none sm:max-h-[90dvh] sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            ref={content}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <button
              type="button"
              aria-label="Close dialog"
              className={`absolute top-5 right-5 rounded p-1 focus-visible:outline-2 focus-visible:outline-green sm:top-6 sm:right-6 ${closeButtonClassName}`}
              onClick={close}
            >
              <CloseModalIcon />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

Modal.Open = Open;
Modal.Content = Content;

export default Modal;
