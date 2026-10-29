import { v4 as uuidv4 } from 'uuid';

// ─── Core Types ─────────────────────────────────────────

export type AcquisitionChannel = 'College Communities' | 'Student Ambassadors' | 'Direct Outreach';

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  college: string;
  branch: string;
  graduationYear: number;
  acquisitionChannel: AcquisitionChannel;
  referralCode: string | null;
  attributionSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  consentTimestamp: string;
  createdAt: string;
  isDuplicate?: boolean;
}

export interface Ambassador {
  id: string;
  displayName: string;
  college: string;
  referralCode: string;
  isActive: boolean;
  target: number;
  createdAt: string;
}

export interface CampaignEvent {
  id: string;
  eventType: 'registration' | 'referral_attributed' | 'ambassador_activated' | 'ambassador_deactivated' | 'budget_updated' | 'duplicate_blocked' | 'settings_changed';
  description: string;
  source: string | null;
  referralCode: string | null;
  createdAt: string;
}

export interface CampaignSettings {
  campaignName: string;
  registrationGoal: number;
  campaignStartDate: string;
  campaignEndDate: string;
  totalBudget: number;
  workshopDate: string;
  workshopTime: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  status: 'planned' | 'approved' | 'spent' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ChannelTarget {
  channel: AcquisitionChannel;
  target: number;
}

export interface DemoScenario {
  id: 'early' | 'mid' | 'near-target';
  name: string;
  description: string;
  registrationCount: number;
  ambassadorCount: number;
  dayOfCampaign: number;
}

// ─── Channel Targets ────────────────────────────────────

export const CHANNEL_TARGETS: ChannelTarget[] = [
  { channel: 'College Communities', target: 250 },
  { channel: 'Student Ambassadors', target: 175 },
  { channel: 'Direct Outreach', target: 75 },
];

// ─── Demo Scenarios ─────────────────────────────────────

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'early',
    name: 'Early Campaign (Day 2)',
    description: 'Campaign just started, initial traction from first ambassadors.',
    registrationCount: 65,
    ambassadorCount: 5,
    dayOfCampaign: 2,
  },
  {
    id: 'mid',
    name: 'Mid-Campaign (Day 5)',
    description: 'Peak momentum with strong ambassador performance and community traction.',
    registrationCount: 320,
    ambassadorCount: 12,
    dayOfCampaign: 5,
  },
  {
    id: 'near-target',
    name: 'Near Target (Day 7)',
    description: 'Final push toward 500 registrations goal.',
    registrationCount: 468,
    ambassadorCount: 15,
    dayOfCampaign: 7,
  },
];

// ─── Helpers ────────────────────────────────────────────

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateReferralCode(name: string): string {
  const prefix = name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyShort(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function getCampaignDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.max(1, Math.min(diff + 1, 7));
}

export function createId(): string {
  return uuidv4();
}
