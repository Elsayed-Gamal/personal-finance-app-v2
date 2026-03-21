'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { calcPosition } from '../_utils/helpers';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

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

function Toggle({ children, id }) {
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
      className="h-3 cursor-pointer"
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="true"
      ref={toggleRef}
    >
      {children}
    </button>
  );
}

function List({ id, children }) {
  const { openId, position, close, activeToggle, setPosition } =
    useContext(MenusContext);
  const isOpen = openId === id;
  const listRef = useRef();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
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
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, activeToggle, setPosition]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.ul
          className="fixed z-10 flex w-[114px] flex-col justify-between rounded-lg bg-white p-4 px-5 py-3"
          style={{
            top: position.y,
            right: position.x,
            boxShadow:
              '0px 4px 24px rgba(0, 0, 0, 0.25), 0px 4px 4px rgba(0, 0, 0, 0.25)',
          }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 91 }}
          exit={{ opacity: 0, height: 0 }}
          ref={listRef}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Button({ type = 'submit', onClick, children }) {
  const { close } = useContext(MenusContext);
  const handleClick = () => {
    close();
    onClick?.();
  };

  return (
    <li>
      <button
        className={`${type === 'delete' ? 'text-red' : 'text-grey-900'} w-full cursor-pointer text-left`}
        style={{ font: 'var(--text-preset-4)' }}
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
