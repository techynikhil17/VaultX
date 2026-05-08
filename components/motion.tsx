"use client";
import { motion, useReducedMotion } from "framer-motion";

const listVariants = {
  hidden: {},
  visible: (reduced: boolean) => ({
    transition: { staggerChildren: reduced ? 0 : 0.065 },
  }),
};

const itemVariants = {
  hidden: (reduced: boolean) => ({ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 }),
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

export function MotionList({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      custom={reduced}
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div custom={reduced} variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
