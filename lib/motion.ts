export const motionPresets = {
  fadeUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
  stagger: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06 },
    },
  },
};
