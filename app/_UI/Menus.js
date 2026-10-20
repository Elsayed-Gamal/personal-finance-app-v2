"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { calcPosition } from "../_utils/helpers";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import useHydrated from "../_hooks/useHydrated";

const MenusContext = createContext();

function Menus({ children }) {
  const [openId, setOpenId] = useState(null);
  const [position, setPosition] = useState(null);
  const [activeToggle, setActiveToggle] = useState(null);

  const open = setOpenId;
  const close = () => {
    setOpenId(null);
    setActiveToggle(null);
  };

  return (
    <MenusContext.Provider
      value={{
        open,
        close,
        openId,
        setPosition,
        position,
        activeToggle,
        setActiveToggle,
      }}
    >
      {children}
    </MenusContext.Provider>
  );
}

function Toggle({ children, id, "aria-label": ariaLabel }) {
  const { open, openId, close, setPosition, setActiveToggle } =
    useContext(MenusContext);
  const toggleRef = useRef();

  const isOpen = openId === id;

  const handleClick = (e) => {
    e.stopPropagation();
    const position = calcPosition(toggleRef.current);
    setPosition(position);
    setActiveToggle(toggleRef.current);

    isOpen ? close() : open(id);
  };

  return (
    <button
      type="button"
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label={ariaLabel}
      ref={toggleRef}
    >
      {children}
    </button>
  );
}

function List({ id, children, className = "w-36" }) {
  const { openId, position, close, activeToggle, setPosition } =
    useContext(MenusContext);
  const isOpen = openId === id;
  const listRef = useRef();
  const mounted = useHydrated();

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        listRef.current &&
        !listRef.current.contains(e.target) &&
        activeToggle &&
        !activeToggle.contains(e.target)
      ) {
        close();
      }
    }

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeToggle, close, isOpen]);

  useEffect(() => {
    function handleScroll() {
      if (isOpen && activeToggle) {
        const position = calcPosition(activeToggle);
        setPosition(position);
      }
    }

    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen, activeToggle, setPosition]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.ul
          role="menu"
          className={`fixed z-50 flex flex-col justify-between rounded-lg bg-white px-5 py-3 ${className}`}
          style={{
            top: position.y,
            right: position.x,
            boxShadow:
              "0px 4px 24px rgba(0, 0, 0, 0.25), 0px 4px 4px rgba(0, 0, 0, 0.25)",
          }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          ref={listRef}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Button({ type = "submit", onClick, children, disabled = false }) {
  const { close } = useContext(MenusContext);
  const handleClick = () => {
    close();
    onClick?.();
  };

  return (
    <li>
      <button
        type="button"
        role="menuitem"
        disabled={disabled}
        className={`${type === "delete" ? "text-red" : "text-grey-900"} w-full cursor-pointer rounded py-1 text-left focus-visible:outline-2 focus-visible:outline-green disabled:cursor-not-allowed disabled:opacity-50`}
        style={{ font: "var(--text-preset-4)" }}
        onClick={handleClick}
      >
        {children}
      </button>
    </li>
  );
}

Menus.Toggle = Toggle;
Menus.List = List;
Menus.Button = Button;

export default Menus;
