"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const tabs = [
    { name: "Hem", href: "/", ariaLabel: "Gå till startsidan" },
    { name: "gallery", href: "/gallery", ariaLabel: "Gå till galleriet" },
    { name: "Loggin", href: "/register", ariaLabel: "Gå till registrering sida" },
    { name: "Om", href: "/om", ariaLabel: "Läs mer om vad vi är" },
  ];

  const activeTab = tabs.find((tab) => tab.href === pathname)?.name ?? "Hem";

  return (
    <header className="sticky top-3 z-20 flex items-center justify-center" role="banner">
      <div className="flex items-center justify-center">
        <nav
          className="flex gap-1 p-0.5 border border-white/15 rounded-full bg-neutral-500 backdrop-blur relative"
          role="navigation"
          aria-label="Huvudnavigation">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <motion.div
                className={`px-4 sm:px-7 sm:py-2 py-1.5 rounded-full text-sm font-semibold relative z-10 cursor-pointer ${
                  activeTab === tab.name ? "text-gray-900" : "text-white/70 hover:text-white"
                }`}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                aria-label={tab.ariaLabel}
                aria-current={activeTab === tab.name ? "page" : undefined}>
                {activeTab === tab.name && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    layoutId="activeTab"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.name}</span>
              </motion.div>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
