import { AnimatePresence, motion } from 'motion/react';

/**
 * FeedbackView RELOADING: overlayLoader rgba(255,255,255,0.6) over the screen + Loader
 * (react-native-spinkit "Pulse", size 37, loaderColor #3866DF).
 */
export function Reloader({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="reloader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--nk-palette-white-alpha60)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.span
            style={{ width: 37, height: 37, borderRadius: '50%', background: 'var(--nk-palette-accent-color)' }}
            animate={{ scale: [0, 1], opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
