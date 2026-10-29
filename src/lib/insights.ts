import { Registration, Ambassador, CampaignSettings, Expense, CHANNEL_TARGETS, AcquisitionChannel } from '../types';

export interface Insight {
  id: string;
  title: string;
  description: string;
  metric: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  type: 'observation' | 'recommendation';
}

export function generateInsights(
  registrations: Registration[],
  ambassadors: Ambassador[],
  settings: CampaignSettings,
  expenses: Expense[]
): Insight[] {
  const insights: Insight[] = [];
  const total = registrations.length;
  const goal = settings.registrationGoal;
  const completion = (total / goal) * 100;

  // Channel performance
  const channelCounts: Record<AcquisitionChannel, number> = {
    'College Communities': 0,
    'Student Ambassadors': 0,
    'Direct Outreach': 0,
  };
  registrations.forEach((r) => channelCounts[r.acquisitionChannel]++);

  const totalSpend = expenses.reduce((s, e) => s + e.actualAmount, 0);
  const cpr = total > 0 ? totalSpend / total : 0;

  // Pace analysis
  const startDate = new Date(settings.campaignStartDate);
  const now = new Date();
  const daysPassed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / 86400000) + 1);
  const dailyRate = total / daysPassed;
  const daysRemaining = 7 - daysPassed;
  const projectedTotal = total + dailyRate * Math.max(0, daysRemaining);

  // Channel performance insights
  CHANNEL_TARGETS.forEach(({ channel, target }) => {
    const actual = channelCounts[channel];
    const pct = (actual / target) * 100;

    if (pct < 40) {
      insights.push({
        id: `channel-underperform-${channel}`,
        title: `${channel} Underperforming`,
        description: `${channel} has achieved only ${actual} of ${target} target registrations (${pct.toFixed(1)}%).`,
        metric: `${actual}/${target} (${pct.toFixed(1)}%)`,
        action: `Investigate and boost ${channel} channel. Consider reallocating resources from higher-performing channels.`,
        priority: 'high',
        confidence: 0.92,
        type: 'recommendation',
      });
    } else if (pct > 90) {
      insights.push({
        id: `channel-strong-${channel}`,
        title: `${channel} Exceeding Target`,
        description: `${channel} is performing strongly at ${pct.toFixed(1)}% of target.`,
        metric: `${actual}/${target} (${pct.toFixed(1)}%)`,
        action: `Maintain current strategy. Consider shifting excess capacity to underperforming channels.`,
        priority: 'low',
        confidence: 0.95,
        type: 'observation',
      });
    }
  });

  // Pace analysis
  if (projectedTotal < goal * 0.9 && daysRemaining > 0) {
    insights.push({
      id: 'pace-behind',
      title: 'Registration Pace Below Target',
      description: `Current daily rate of ${dailyRate.toFixed(1)} registrations projects ${Math.round(projectedTotal)} total, ${Math.round(goal - projectedTotal)} short of goal.`,
      metric: `${dailyRate.toFixed(1)}/day → ${Math.round(projectedTotal)} projected`,
      action: `Need ${((goal - total) / Math.max(1, daysRemaining)).toFixed(0)} registrations/day for remaining ${daysRemaining} days. Activate additional ambassador nodes.`,
      priority: 'high',
      confidence: 0.88,
      type: 'recommendation',
    });
  } else if (projectedTotal >= goal) {
    insights.push({
      id: 'pace-ahead',
      title: 'On Track to Exceed Goal',
      description: `Current trajectory projects ${Math.round(projectedTotal)} registrations, ${Math.round(projectedTotal - goal)} above target.`,
      metric: `${dailyRate.toFixed(1)}/day → ${Math.round(projectedTotal)} projected`,
      action: `Maintain momentum. Consider raising quality thresholds or expanding target.`,
      priority: 'low',
      confidence: 0.90,
      type: 'observation',
    });
  }

  // Ambassador utilization
  const activeAmbassadors = ambassadors.filter((a) => a.isActive);
  const ambassadorRegs = channelCounts['Student Ambassadors'];
  const avgPerAmbassador = activeAmbassadors.length > 0 ? ambassadorRegs / activeAmbassadors.length : 0;

  if (avgPerAmbassador < 5 && activeAmbassadors.length > 3) {
    insights.push({
      id: 'ambassador-low-avg',
      title: 'Low Ambassador Productivity',
      description: `Average ${avgPerAmbassador.toFixed(1)} registrations per active ambassador. Consider targeted enablement.`,
      metric: `${avgPerAmbassador.toFixed(1)} avg regs/ambassador`,
      action: `Identify and support low-performing ambassadors. Share best practices from top performers.`,
      priority: 'medium',
      confidence: 0.85,
      type: 'recommendation',
    });
  }

  // Top ambassador recognition
  if (activeAmbassadors.length > 0) {
    const topAmbassadors = activeAmbassadors
      .map((a) => ({
        ...a,
        regs: registrations.filter((r) => r.referralCode === a.referralCode).length,
      }))
      .sort((a, b) => b.regs - a.regs);

    const top = topAmbassadors[0];
    if (top && top.regs > 10) {
      insights.push({
        id: 'top-ambassador',
        title: 'Top Ambassador Performance',
        description: `${top.displayName} leads with ${top.regs} attributed registrations from ${top.college}.`,
        metric: `${top.regs} registrations via ${top.referralCode}`,
        action: `Consider featuring ${top.displayName} as a case study. Replicate their strategy across other campus nodes.`,
        priority: 'medium',
        confidence: 0.96,
        type: 'observation',
      });
    }
  }

  // Budget efficiency
  if (cpr > 0) {
    insights.push({
      id: 'budget-efficiency',
      title: 'Cost Efficiency Analysis',
      description: `Current cost per registration is ₹${cpr.toFixed(2)}. Budget utilization at ${((totalSpend / settings.totalBudget) * 100).toFixed(1)}%.`,
      metric: `₹${cpr.toFixed(2)} CPR | ₹${totalSpend} of ₹${settings.totalBudget} spent`,
      action: totalSpend / settings.totalBudget > 0.8
        ? 'Budget nearing limit. Prioritize organic and referral channels.'
        : 'Budget headroom available. Consider strategic micro-investments in high-ROI channels.',
      priority: totalSpend / settings.totalBudget > 0.8 ? 'high' : 'low',
      confidence: 0.93,
      type: 'recommendation',
    });
  }

  // Goal proximity
  if (completion >= 90 && completion < 100) {
    insights.push({
      id: 'near-goal',
      title: 'Goal Within Reach',
      description: `Only ${goal - total} registrations remaining to reach the ${goal} target.`,
      metric: `${total}/${goal} (${completion.toFixed(1)}%)`,
      action: `Final push: activate all ambassador channels and deploy remaining budget for targeted outreach.`,
      priority: 'high',
      confidence: 0.97,
      type: 'recommendation',
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
