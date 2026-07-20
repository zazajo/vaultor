"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface NavLink {
  label: string;
  href: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const overlayVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
};

const listVariants = {
  open: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const linkVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: 16 },
};

export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={overlayVariants}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg-void/95 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="absolute right-6 top-4 flex h-10 w-10 items-center justify-center text-3xl leading-none text-text-primary"
          >
            &times;
          </button>

          <motion.ul
            initial="closed"
            animate="open"
            exit="closed"
            variants={listVariants}
            className="flex flex-col items-center gap-7"
          >
            {links.map((link) => (
              <motion.li key={link.href} variants={linkVariants} transition={{ duration: 0.4, ease: EASE }}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-medium tracking-tight text-text-primary"
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
      >
        <span className="h-px w-6 bg-text-primary" />
        <span className="h-px w-6 bg-text-primary" />
        <span className="h-px w-6 bg-text-primary" />
      </button>

      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
