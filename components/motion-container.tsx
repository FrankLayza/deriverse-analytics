import {motion} from "motion/react"
import { ReactNode } from "react"

interface MotionContainerProps {
    children: ReactNode,
    className?: string,
    delay?: number
}

export function MotionContainer({ children, className, delay = 0 }: MotionContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ 
        duration: 0.4, 
        delay: delay, 
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}