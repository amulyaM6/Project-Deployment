'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { FileUp, LayoutDashboard, GitCompare, Cpu, LogIn, UserPlus } from 'lucide-react'

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  const navLinks = [
    { href: '/upload', label: 'Upload Policy', icon: FileUp },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/compare', label: 'Compare Policies', icon: GitCompare },
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 px-6 lg:px-12 py-3.5 flex items-center justify-between transition-all shadow-sm">
      <Link href="/" className="flex items-center gap-3 group">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20"
        >
          <div className="w-full h-full bg-white rounded-[10.5px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-indigo-600 group-hover:text-purple-600 transition-colors" />
          </div>
        </motion.div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            Policy<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">Sim</span>
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-full shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
          v2.0 ABM+MC
        </span>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {isSignedIn ? (
          <>
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href

                return (
                  <Link key={link.href} href={link.href} className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/80"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'text-indigo-600 font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="hidden md:inline">{link.label}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="pl-3 border-l border-slate-200 ml-1">
              <UserButton />
            </div>
          </>
        ) : (
          <>
            <Link href="/sign-in">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </motion.button>
            </Link>
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative group overflow-hidden rounded-xl p-[1px] text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 transition-all group-hover:opacity-95" />
                <span className="relative flex items-center gap-1.5 px-4 py-2 rounded-[11px] bg-slate-900 text-white transition-colors group-hover:bg-indigo-600">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </span>
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}