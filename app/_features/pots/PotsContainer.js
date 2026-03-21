'use client';

import Menus from '@/app/_UI/Menus';
import { AnimatePresence, motion } from 'motion/react';
import Pot from './Pot';

const parentVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function PotsContainer({ pots, themes }) {
  return (
    <motion.div
      className="grid grid-cols-[repeat(auto-fit,minmax(450px,1fr))] gap-6"
      variants={parentVariant}
      initial="hidden"
      animate="visible"
    >
      <Menus>
        <AnimatePresence mode="popLayout">
          {pots.map((pot) => (
            <motion.div
              key={pot.name}
              variants={itemVariant}
              layout
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Pot pot={pot} themes={themes} />
            </motion.div>
          ))}
        </AnimatePresence>
      </Menus>
    </motion.div>
  );
}

export default PotsContainer;
