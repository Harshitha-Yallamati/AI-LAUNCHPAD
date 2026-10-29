import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Award,
  BarChart3,
  Wallet,
  Settings,
  X,
  Menu,
  Cpu,
  Radio,
} from 'lucide-react';
import { useStore } from '../lib/store';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, shortcut: 'G O' },
  { path: '/registrations', label: 'Registrations', icon: Users, shortcut: 'G R' },
  { path: '/ambassadors', label: 'Ambassadors', icon: Award, shortcut: 'G A' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, shortcut: 'G Y' },
  { path: '/budget', label: 'Budget & Spend', icon: Wallet, shortcut: 'G B' },
  { path: '/settings', label: 'Campaign Settings', icon: Settings, shortcut: 'G S' },
];

export function Sidebar() {
  const { isDemoMode, setDemoMode, sidebarOpen, setSidebarOpen, registrations, ambassadors, settings } =
    useStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-bg-sidebar border-r border-border z-50
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-accent-cyan" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-text-primary tracking-tight">AI LAUNCHPAD</h1>
                <p className="text-[10px] font-mono text-accent-cyan tracking-wider">// GROWTH ENGINE V4.2</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feed Status */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="section-label text-[10px]">DIRECT_FEED</span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-status-success">
            <Radio className="w-3 h-3" />
            SECURE
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            // Badges
            let badge: React.ReactNode = null;
            if (item.path === '/registrations') {
              badge = (
                <span className="ml-auto flex items-center gap-1">
                  <span className="badge-cyan text-[10px]">{registrations.length}</span>
                </span>
              );
            } else if (item.path === '/ambassadors') {
              badge = (
                <span className="ml-auto badge-teal text-[10px]">
                  {ambassadors.filter((a) => a.isActive).length} NODES
                </span>
              );
            } else if (item.path === '/budget') {
              badge = (
                <span className="ml-auto badge-warning text-[10px]">
                  ₹{(settings.totalBudget / 1000).toFixed(0)}K CAP
                </span>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link group ${isActive ? 'active' : ''}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent-cyan' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {badge}
                <span className="hidden xl:block text-[9px] font-mono text-text-secondary/40 ml-1">
                  {item.shortcut}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border p-3 space-y-3">
          {/* Hardware Node */}
          <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary">
            <span>HARDWARE NODE</span>
            <span className="text-status-success">ONLINE</span>
          </div>
          <div className="text-[9px] font-mono text-text-secondary/60">
            MEM: 1.4GB // SHA-256 AIR-SEALED
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-text-secondary" />
              <span className="text-xs text-text-secondary">Demo Mode</span>
            </div>
            <button
              onClick={() => setDemoMode(!isDemoMode)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                isDemoMode ? 'bg-accent-cyan' : 'bg-bg-elevated'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  isDemoMode ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 pt-1">
            <div className="w-7 h-7 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-[10px] font-bold text-accent-cyan">
              AD
            </div>
            <div>
              <p className="text-xs font-medium text-text-primary">SysAdmin // Op#09</p>
              <p className="text-[9px] font-mono text-text-secondary">LEVEL 4 CLEARANCE</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopBar() {
  const { settings, registrations, isDemoMode, setSidebarOpen } = useStore();
  const total = registrations.length;
  const goal = settings.registrationGoal;

  return (
    <header className="h-11 bg-bg-sidebar border-b border-border flex items-center px-3 gap-3 flex-shrink-0">
      {/* Mobile menu */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-text-secondary hover:text-text-primary"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Campaign info */}
      <div className="hidden md:flex items-center gap-2 text-[10px] font-mono">
        <span className="text-accent-cyan">●</span>
        <span className="text-text-primary font-medium">{settings.campaignName}</span>
        <span className="text-text-secondary">// COHORT 18</span>
        <span className="text-text-secondary">// SIM-ENV: AIR-GAPPED</span>
        <span className="text-text-secondary">// LATENCY: 14ms</span>
      </div>

      <div className="flex-1" />

      {/* Goal indicator */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="badge-cyan text-[10px] flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-slow" />
          {total} UNIQUE R.
        </div>
        <div className="badge-teal text-[10px]">
          ◎ {goal} TARGET
        </div>
      </div>

      {/* Sim badge */}
      {isDemoMode && (
        <div className="badge-warning text-[9px]">
          SIMULATION
        </div>
      )}

      {/* Command search */}
      <div className="hidden lg:flex items-center gap-1.5 bg-bg-elevated border border-border rounded px-2 py-1 text-[10px] font-mono text-text-secondary cursor-pointer hover:border-accent-cyan/30 transition-colors">
        COMMAND SEARCH
        <kbd className="bg-bg-card border border-border rounded px-1 text-[9px]">⌘K</kbd>
      </div>

      {/* Profile */}
      <div className="w-7 h-7 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-[10px] font-bold text-accent-cyan cursor-pointer hover:shadow-glow-sm transition-shadow">
        O
      </div>
    </header>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
