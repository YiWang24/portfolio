"use client";


import { motion } from "framer-motion";

export function TerminalBio() {
    return (
        <div className="cli-motd py-2 mb-4">
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="w-full flex justify-center mb-6"
            >
                <p className="font-mono italic text-sm md:text-base text-slate-400 dark:text-zinc-500">
                    <span className="opacity-50 mr-2">{"/**"}</span>
                    <span>Architecting scalable AI agents & seamless interfaces</span>
                    <span className="opacity-50 ml-2">{"*/"}</span>
                </p>
            </motion.div>
        </div>
    );
}
