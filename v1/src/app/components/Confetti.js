"use client"

import React, { useState, useEffect } from 'react'
import ReactConfetti from 'react-confetti'
import { motion } from 'framer'

export default function Confetti() {
  const [windowDimension, setDimension] = useState({width: window.innerWidth, height: window.innerHeight})

  const detectSize = () => {
    setDimension({width: window.innerWidth, height: window.innerHeight})
  }

  useEffect(() => {
    window.addEventListener('resize', detectSize)
    return () => window.removeEventListener('resize', detectSize)
  }, [])
  return (
    <motion.div
    initial={{ opacity: 1 }} // Start with opacity 0 and slight downward position
        animate={{ opacity: 0}} // Animate to full opacity and original position
        transition={{ duration: 8, ease: "easeOut" }}
    >
    <ReactConfetti style={{position: "fixed", zIndex: "3000"}} width={windowDimension.width} height={windowDimension.height} tweenDuration={1000 } />
    </motion.div>
  )
}