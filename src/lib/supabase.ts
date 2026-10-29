import { createClient } from '@supabase/supabase-js';
import type { RegistrationFormData } from './validation';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export async function validateReferralCode(code: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_active_referral', { p_referral_code: code });
  return !error && data === true;
}

export async function registerWorkshop(
  data: RegistrationFormData & {
    referralCode: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  },
): Promise<{ success: boolean; outcome: 'registered' | 'duplicate' | 'invalid_referral' | 'error'; error?: string }> {
  if (!supabase) return { success: false, outcome: 'error', error: 'Production registration is not configured.' };
  const { data: response, error } = await supabase.rpc('register_workshop', {
    p_full_name: data.fullName,
    p_email: data.email.trim().toLowerCase(),
    p_college: data.college,
    p_branch: data.branch,
    p_graduation_year: data.graduationYear,
    p_referral_code: data.referralCode,
    p_utm_source: data.utmSource,
    p_utm_medium: data.utmMedium,
    p_utm_campaign: data.utmCampaign,
  });
  if (error) return { success: false, outcome: 'error', error: 'Unable to save your registration. Please try again.' };
  const outcome = response?.[0]?.outcome as 'registered' | 'duplicate' | 'invalid_referral' | undefined;
  if (outcome === 'registered') return { success: true, outcome };
  if (outcome === 'duplicate') return { success: false, outcome, error: 'This email is already registered for the workshop.' };
  if (outcome === 'invalid_referral') return { success: false, outcome, error: 'This referral link is no longer active.' };
  return { success: false, outcome: 'error', error: 'Unable to save your registration. Please try again.' };
}
