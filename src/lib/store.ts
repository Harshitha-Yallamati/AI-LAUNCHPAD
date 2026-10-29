import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Registration,
  Ambassador,
  CampaignEvent,
  CampaignSettings,
  Expense,
  AcquisitionChannel,
  createId,
  normalizeEmail,
  generateReferralCode,
  CHANNEL_TARGETS,
} from '../types';
import { generateFullDemoData, getDefaultSettings } from './demoData';

// ─── Store State ────────────────────────────────────────

interface AppState {
  // Data
  registrations: Registration[];
  ambassadors: Ambassador[];
  events: CampaignEvent[];
  settings: CampaignSettings;
  expenses: Expense[];

  // UI state
  isDemoMode: boolean;
  currentScenario: 'early' | 'mid' | 'near-target';
  isAuthenticated: boolean;
  duplicateAttempts: number;
  sidebarOpen: boolean;
  activeReferralCode: string | null;

  // Auth
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;

  // Demo
  setDemoMode: (enabled: boolean) => void;
  switchScenario: (scenario: 'early' | 'mid' | 'near-target') => void;
  resetDemoData: () => void;

  // Registrations
  addRegistration: (data: Omit<Registration, 'id' | 'createdAt' | 'consentTimestamp'>) => { success: boolean; error?: string; registration?: Registration };
  isDuplicateEmail: (email: string) => boolean;

  // Ambassadors
  addAmbassador: (data: { displayName: string; college: string; target: number }) => { success: boolean; error?: string; ambassador?: Ambassador };
  toggleAmbassadorStatus: (id: string) => void;
  getAmbassadorByCode: (code: string) => Ambassador | undefined;
  getAmbassadorRegistrations: (code: string) => number;

  // Events
  addEvent: (event: Omit<CampaignEvent, 'id' | 'createdAt'>) => void;

  // Settings
  updateSettings: (updates: Partial<CampaignSettings>) => void;

  // Expenses
  addExpense: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Referral
  setActiveReferralCode: (code: string | null) => void;

  // UI
  setSidebarOpen: (open: boolean) => void;

  // Computed helpers
  getUniqueRegistrations: () => Registration[];
  getRegistrationsToday: () => Registration[];
  getChannelCounts: () => Record<AcquisitionChannel, number>;
  getDailyRegistrations: () => { day: string; count: number; target: number }[];
  getTotalActualSpend: () => number;
  getCostPerRegistration: () => number;
}

// ─── Initial Data ───────────────────────────────────────

const initialDemo = generateFullDemoData('mid');

// ─── Store ──────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial data (mid scenario)
      registrations: initialDemo.registrations,
      ambassadors: initialDemo.ambassadors,
      events: initialDemo.events,
      settings: initialDemo.settings,
      expenses: initialDemo.expenses,

      isDemoMode: true,
      currentScenario: 'mid',
      isAuthenticated: true, // Start authenticated for demo
      duplicateAttempts: 0,
      sidebarOpen: true,
      activeReferralCode: null,

      // ─── Auth ──────────────────────────────

      adminLogin: (password: string) => {
        // Demo admin password
        if (password === 'admin123' || password === 'growth2024') {
          set({ isAuthenticated: true });
          get().addEvent({
            eventType: 'settings_changed',
            description: 'Admin logged in',
            source: null,
            referralCode: null,
          });
          return true;
        }
        return false;
      },

      adminLogout: () => {
        set({ isAuthenticated: false });
      },

      // ─── Demo Mode ────────────────────────

      setDemoMode: (enabled: boolean) => {
        set({ isDemoMode: enabled });
        if (enabled) {
          get().switchScenario(get().currentScenario);
        }
      },

      switchScenario: (scenario) => {
        const data = generateFullDemoData(scenario);
        set({
          currentScenario: scenario,
          registrations: data.registrations,
          ambassadors: data.ambassadors,
          events: data.events,
          settings: data.settings,
          expenses: data.expenses,
          duplicateAttempts: Math.floor(Math.random() * 15) + 5,
        });
      },

      resetDemoData: () => {
        const data = generateFullDemoData(get().currentScenario);
        set({
          registrations: data.registrations,
          ambassadors: data.ambassadors,
          events: data.events,
          settings: data.settings,
          expenses: data.expenses,
          duplicateAttempts: 0,
        });
      },

      // ─── Registrations ────────────────────

      addRegistration: (data) => {
        const state = get();
        const email = normalizeEmail(data.email);

        if (state.isDuplicateEmail(email)) {
          set({ duplicateAttempts: state.duplicateAttempts + 1 });
          get().addEvent({
            eventType: 'duplicate_blocked',
            description: `Duplicate registration blocked for ${email}`,
            source: data.acquisitionChannel,
            referralCode: data.referralCode,
          });
          return { success: false, error: 'This email is already registered for the workshop.' };
        }

        const registration: Registration = {
          ...data,
          id: createId(),
          email,
          createdAt: new Date().toISOString(),
          consentTimestamp: new Date().toISOString(),
        };

        set({ registrations: [registration, ...state.registrations] });

        get().addEvent({
          eventType: 'registration',
          description: `${data.fullName} registered from ${data.college}`,
          source: data.acquisitionChannel,
          referralCode: data.referralCode,
        });

        if (data.referralCode) {
          get().addEvent({
            eventType: 'referral_attributed',
            description: `Referral ${data.referralCode} attributed for ${data.fullName}`,
            source: 'Student Ambassadors',
            referralCode: data.referralCode,
          });
        }

        return { success: true, registration };
      },

      isDuplicateEmail: (email: string) => {
        const normalized = normalizeEmail(email);
        return get().registrations.some((r) => r.email === normalized);
      },

      // ─── Ambassadors ──────────────────────

      addAmbassador: (data) => {
        const code = generateReferralCode(data.displayName);
        const state = get();

        if (state.ambassadors.some((a) => a.referralCode === code)) {
          return { success: false, error: 'Generated code conflict. Please try again.' };
        }

        const ambassador: Ambassador = {
          id: createId(),
          displayName: data.displayName,
          college: data.college,
          referralCode: code,
          isActive: true,
          target: data.target,
          createdAt: new Date().toISOString(),
        };

        set({ ambassadors: [...state.ambassadors, ambassador] });

        get().addEvent({
          eventType: 'ambassador_activated',
          description: `${data.displayName} activated as ambassador from ${data.college}`,
          source: null,
          referralCode: code,
        });

        return { success: true, ambassador };
      },

      toggleAmbassadorStatus: (id: string) => {
        const state = get();
        const ambassador = state.ambassadors.find((a) => a.id === id);
        if (!ambassador) return;

        set({
          ambassadors: state.ambassadors.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        });

        get().addEvent({
          eventType: ambassador.isActive ? 'ambassador_deactivated' : 'ambassador_activated',
          description: `${ambassador.displayName} ${ambassador.isActive ? 'deactivated' : 'activated'}`,
          source: null,
          referralCode: ambassador.referralCode,
        });
      },

      getAmbassadorByCode: (code: string) => {
        return get().ambassadors.find((a) => a.referralCode === code);
      },

      getAmbassadorRegistrations: (code: string) => {
        return get().registrations.filter((r) => r.referralCode === code).length;
      },

      // ─── Events ───────────────────────────

      addEvent: (event) => {
        const newEvent: CampaignEvent = {
          ...event,
          id: createId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          events: [newEvent, ...state.events].slice(0, 100),
        }));
      },

      // ─── Settings ─────────────────────────

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates, updatedAt: new Date().toISOString() },
        }));
        get().addEvent({
          eventType: 'settings_changed',
          description: 'Campaign settings updated',
          source: null,
          referralCode: null,
        });
      },

      // ─── Expenses ─────────────────────────

      addExpense: (data) => {
        const expense: Expense = {
          ...data,
          id: createId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ expenses: [...state.expenses, expense] }));
        get().addEvent({
          eventType: 'budget_updated',
          description: `Expense added: ${data.category} - ${data.description}`,
          source: null,
          referralCode: null,
        });
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      // ─── Referral ─────────────────────────

      setActiveReferralCode: (code) => {
        set({ activeReferralCode: code });
      },

      // ─── UI ────────────────────────────────

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      // ─── Computed Helpers ──────────────────

      getUniqueRegistrations: () => {
        return get().registrations;
      },

      getRegistrationsToday: () => {
        const today = new Date().toDateString();
        return get().registrations.filter(
          (r) => new Date(r.createdAt).toDateString() === today
        );
      },

      getChannelCounts: () => {
        const counts: Record<AcquisitionChannel, number> = {
          'College Communities': 0,
          'Student Ambassadors': 0,
          'Direct Outreach': 0,
        };
        get().registrations.forEach((r) => {
          counts[r.acquisitionChannel]++;
        });
        return counts;
      },

      getDailyRegistrations: () => {
        const state = get();
        const start = new Date(state.settings.campaignStartDate);
        const days: { day: string; count: number; target: number }[] = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          const dateStr = date.toDateString();
          const count = state.registrations.filter(
            (r) => new Date(r.createdAt).toDateString() === dateStr
          ).length;

          // Linear target distribution
          const dailyTarget = Math.round(state.settings.registrationGoal / 7);
          days.push({
            day: `Day ${i + 1}`,
            count,
            target: dailyTarget,
          });
        }
        return days;
      },

      getTotalActualSpend: () => {
        return get().expenses.reduce((sum, e) => sum + e.actualAmount, 0);
      },

      getCostPerRegistration: () => {
        const total = get().getTotalActualSpend();
        const regs = get().registrations.length;
        if (regs === 0) return 0;
        return total / regs;
      },
    }),
    {
      name: 'ai-launchpad-store',
      partialize: (state) => ({
        registrations: state.registrations,
        ambassadors: state.ambassadors,
        events: state.events,
        settings: state.settings,
        expenses: state.expenses,
        isDemoMode: state.isDemoMode,
        currentScenario: state.currentScenario,
        isAuthenticated: state.isAuthenticated,
        duplicateAttempts: state.duplicateAttempts,
        activeReferralCode: state.activeReferralCode,
      }),
    }
  )
);
