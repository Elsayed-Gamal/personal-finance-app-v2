'use client';

import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import CloseModalIcon from './icons/CloseModalIcon';
import { AnimatePresence, motion } from 'motion/react';

export const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState('');

  const close = () => setOpenName('');
  const open = (name) => setOpenName(name);

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

function Content({ children, name }) {
  const { openName, close } = useContext(ModalContext);
  const content = useRef();
  const isOpen = openName === name;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (content.current && !content.current.contains(e.target)) close();
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [close, isOpen]);

  if (!mounted) return null; // ← لا تُرنِّد شيئًا على السيرفر

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex h-full w-full items-center justify-center scroll-auto bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-140 rounded-xl bg-white p-8"
            ref={content}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <CloseModalIcon
              className="absolute top-9.5 right-9.5 cursor-pointer"
              onClick={close}
            />
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
