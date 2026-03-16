"use client";

import { motion, HTMLMotionProps } from "framer-motion";

export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionP = motion.p;
export const MotionH1 = motion.h1;
export const MotionH2 = motion.h2;
export const MotionH3 = motion.h3;
export const MotionSpan = motion.span;
export const MotionButton = motion.button;

export const fadeIn: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};
