import { motion } from "motion/react";

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-40 right-32 w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg opacity-50 rotate-45"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
          rotate: [45, 135, 45],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      <motion.div
        className="absolute bottom-40 left-1/3 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-70"
        animate={{
          y: [0, -25, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-10 w-2 h-8 bg-gradient-to-b from-purple-400 to-transparent rounded-full opacity-40"
        animate={{
          scaleY: [1, 1.5, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-20 w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-50"
        animate={{
          y: [0, -30, 0],
          x: [0, -10, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
    </div>
  );
}