import type { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } },
};

export const floatSlow = {
  y: [0, -10, 0],
  rotate: [0, 4, 0],
  transition: { duration: 8, repeat: Infinity, ease: [0.16, 1, 0.3, 1] },
};

export const seatPop = {
  whileTap: { scale: 0.88 },
  whileHover: { scale: 1.06 },
};

export const confetti: Variants = {
  hidden: { scale: 0, rotate: -20, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 18 },
  },
};
