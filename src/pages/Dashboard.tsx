import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
  Target, Zap, RefreshCw, Download, Activity, Cpu,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { KPICard, SectionHeader } from '../components/ui';
import { CHANNEL_TARGETS, getCampaignDay, formatCurrencyShort } from '../types';
import { generateInsights } from '../lib/insights';
import { exportRegistrationsCSV } from '../lib/csvExport';

export default function Dashboard() {
  const { registrations, ambassadors, settings, expenses, events, isDemoMode } = useStore();

  const metrics = useMemo(() => {
    const total = registrations.length;
    const goal = settings.registrationGoal;
    const completion = goal > 0 ? (total / goal) * 100 : 0;
    const remaining = Math.max(0, goal - total);
    const activeAmb = ambassadors.filter((a) => a.isActive).length;
    const totalSpend = expenses.reduce((s, e) => s + e.actualAmount, 0);
    const cpr = total > 0 ? totalSpend / total : 0;
    const campaignDay = getCampaignDay(settings.campaignStartDate);

    // Today's registrations
    const today = new Date().toDateString();
    const todayCount = registrations.filter(
      (r) => new Date(r.createdAt).toDateString() === today
    ).length;

    // Channel counts
    const channelCounts: Record<string, number> = {};
    registrations.forEach((r) => {
      channelCounts[r.acquisitionChannel] = (channelCounts[r.acquisitionChannel] ?? 0) + 1;
    });

    // Daily data for chart
    const start = new Date(settings.campaignStartDate);
    const dailyData: { day: string; actual: number; target: number; cumulative: number }[] = [];
    let cumulative = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toDateString();
      const count = registrations.filter(
        (r) => new Date(r.createdAt).toDateString() === dateStr
      ).length;
      cumulative += count;
      dailyData.push({
        day: `Day ${i + 1}`,
        actual: count,
        target: Math.round(goal / 7),
        cumulative,
      });
    }

    return {
      total, goal, completion, remaining, activeAmb, totalSpend, cpr,
      campaignDay, todayCount, channelCounts, dailyData,
    };
  }, [registrations, ambassadors, settings, expenses]);

  const insights = useMemo(
    () => generateInsights(registrations, ambassadors, settings, expenses),
    [registrations, ambassadors, settings, expenses]
  );

  const channelData = useMemo(() => {
    return CHANNEL_TARGETS.map(({ channel, target }) => ({
      channel: channel.replace('Student ', 'S. '),
      fullChannel: channel,
      actual: metrics.channelCounts[channel] ?? 0,
      target,
    }));
  }, [metrics.channelCounts]);

  // Progress grid
  const progressCells = useMemo(() => {
    const cellCount = 50; // 50 cells = 10 registrations each
    const filled = Math.floor((metrics.total / metrics.goal) * cellCount);
    return Array.from({ length: cellCount }, (_, i) => i < filled);
  }, [metrics.total, metrics.goal]);

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <SectionHeader
        title="Campaign Overview // 500 Registrations Sprint"
        subtitle={`SEC_LOG::DASH_V4 ${isDemoMode ? 'SIMULATED AUDIT LOG' : 'LIVE'} // DAY ${metrics.campaignDay} OF 7`}
      >
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="w-3 h-3" /> REFRESH PIPELINE
        </button>
        <button
          onClick={() => exportRegistrationsCSV(registrations)}
          className="btn-primary flex items-center gap-1.5 text-xs"
        >
          <Download className="w-3 h-3" /> EXPORT CSV
        </button>
      </SectionHeader>

      {/* Campaign Timeline Bar */}
      <div className="card-elevated p-3">
        <div className="flex items-center gap-3 overflow-x-auto text-[10px] font-mono">
          {metrics.dailyData.map((d, i) => (
            <div
              key={i}
              className={`flex flex-col items-center min-w-[70px] ${
                i + 1 === metrics.campaignDay ? 'text-accent-cyan font-bold' : 'text-text-secondary'
              }`}
            >
              <span className={i + 1 === metrics.campaignDay ? 'text-accent-cyan' : ''}>
                {d.day}{i + 1 === metrics.campaignDay ? ' [NOW]' : ''}
              </span>
              <span className="text-sm font-bold text-text-primary">{d.cumulative}</span>
            </div>
          ))}
          <div className="flex flex-col items-center min-w-[70px] text-accent-teal">
            <span>Target</span>
            <span className="text-sm font-bold">{metrics.goal}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard
          prefix="KPI-01"
          label="Unique Registrations"
          value={metrics.total}
          change={`+${((metrics.completion - 50) > 0 ? '+' : '')}${(metrics.completion - 50).toFixed(1)}%`}
          changeType={metrics.completion >= 50 ? 'positive' : 'negative'}
          subtitle={`${metrics.remaining} REMAINING`}
        />
        <KPICard
          prefix="KPI-02"
          label="Cohort Trajectory"
          value={`${metrics.completion.toFixed(1)}%`}
          change={metrics.completion >= 60 ? 'ON TRACK' : 'BEHIND'}
          changeType={metrics.completion >= 60 ? 'positive' : 'negative'}
          subtitle={`${metrics.total} / ${metrics.goal} GOAL`}
        />
        <KPICard
          prefix="KPI-03"
          label="Run-Rate Velocity"
          value={metrics.todayCount}
          change={`DAY ${metrics.campaignDay}`}
          subtitle={`BURST: ${(metrics.total / Math.max(1, metrics.campaignDay)).toFixed(1)}/day`}
        />
        <KPICard
          prefix="KPI-04"
          label="Ambassador Nodes"
          value={metrics.activeAmb}
          change={`${((metrics.channelCounts['Student Ambassadors'] ?? 0) / Math.max(1, metrics.total) * 100).toFixed(0)}% SHARE`}
          subtitle={`${metrics.channelCounts['Student Ambassadors'] ?? 0} REG ATTRIBUTED`}
        />
        <KPICard
          prefix="KPI-05"
          label="Unit CAC (Avg)"
          value={metrics.cpr > 0 ? formatCurrencyShort(metrics.cpr) : '—'}
          change={metrics.cpr > 0 ? `CAP: ₹${settings.totalBudget}` : ''}
          subtitle={`SPENT: ${formatCurrencyShort(metrics.totalSpend)}`}
        />
        <KPICard
          prefix="KPI-06"
          label="Campus Reach"
          value={new Set(registrations.map((r) => r.college)).size}
          change="INSTITUTIONS"
          subtitle={`${registrations.length > 0 ? Math.round(registrations.length / new Set(registrations.map((r) => r.college)).size) : 0} AVG/CAMPUS`}
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Registration Velocity Chart - 2 cols */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-cyan" />
                Registration Velocity Radar // Cumulative
              </h3>
              <p className="text-[10px] font-mono text-text-secondary mt-0.5">
                LINEAR 7D BENCHMARK __ ACTUAL REGISTERED
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5F2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E5F2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="day" tick={{ fill: '#929CA8', fontSize: 10 }} stroke="#30363D" />
                <YAxis tick={{ fill: '#929CA8', fontSize: 10 }} stroke="#30363D" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171A1F',
                    border: '1px solid #30363D',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#F4F7FA',
                  }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#00E5F2"
                  fill="url(#actualGrad)"
                  strokeWidth={2}
                  name="Cumulative Registrations"
                  dot={{ fill: '#00E5F2', r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#30363D"
                  fill="none"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Daily Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-text-secondary">
            <span>↗ ESTIMATED SPRINT FINISH: {Math.round(metrics.total / Math.max(0.1, metrics.campaignDay / 7))} REG</span>
            <span>{metrics.total > metrics.goal * (metrics.campaignDay / 7) ? '✓ AHEAD OF BASELINE' : '⚠ BEHIND BASELINE'}</span>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-cyan" />
            Acquisition Bus-Matrix // Channels
          </h3>
          <p className="text-[10px] font-mono text-text-secondary mb-4">
            CONV: {((metrics.total / metrics.goal) * 100).toFixed(1)}%
          </p>

          <div className="space-y-4">
            {channelData.map((ch) => {
              const pct = ch.target > 0 ? (ch.actual / ch.target) * 100 : 0;
              const cac = metrics.totalSpend > 0 && ch.actual > 0
                ? (metrics.totalSpend * (ch.actual / metrics.total)) / ch.actual
                : 0;

              return (
                <div key={ch.fullChannel}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-primary font-medium">{ch.fullChannel}</span>
                    <span className="font-mono text-accent-cyan">{ch.actual} / {ch.target}</span>
                  </div>
                  <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: pct >= 80 ? '#28D7A0' : pct >= 50 ? '#00E5F2' : '#FFB547',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-text-secondary mt-0.5">
                    <span>EFFICIENCY CAC: {cac > 0 ? `₹${cac.toFixed(2)}` : '—'}</span>
                    <span>{pct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campaign Progress Grid */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-cyan" />
              Campaign Progress Matrix
            </h3>
            <p className="text-[10px] font-mono text-text-secondary">
              {metrics.total} / {metrics.goal} UNIQUE // {metrics.completion.toFixed(1)}% COMPLETE // EACH CELL = {Math.ceil(metrics.goal / 50)} REGISTRATIONS
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {progressCells.map((filled, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-sm border transition-colors ${
                filled
                  ? 'bg-accent-cyan/40 border-accent-cyan/60 shadow-glow-sm'
                  : 'bg-bg-elevated border-border'
              }`}
              title={`${(i + 1) * Math.ceil(metrics.goal / 50)} registrations`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[9px] font-mono text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-accent-cyan/40 border border-accent-cyan/60 rounded-sm inline-block" />
            FILLED
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-bg-elevated border border-border rounded-sm inline-block" />
            REMAINING
          </span>
          <span>{metrics.remaining} SLOTS OPEN</span>
        </div>
      </div>

      {/* Bottom Grid: Insights + Activity Feed */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Growth Heuristics */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent-cyan" />
                Growth Heuristics // Intelligence
              </h3>
              <p className="text-[10px] font-mono text-text-secondary">
                AUTONOMOUS INFERENCE // CONFIDENCE: {insights.length > 0 ? `${(insights.reduce((s, i) => s + i.confidence, 0) / insights.length * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <span className="badge-cyan text-[9px]">RULES-BASED</span>
          </div>

          <div className="space-y-3">
            {insights.slice(0, 4).map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-md border ${
                  insight.priority === 'high'
                    ? 'border-status-warning/30 bg-status-warning/5'
                    : insight.priority === 'medium'
                    ? 'border-accent-cyan/20 bg-accent-cyan/5'
                    : 'border-border bg-bg-elevated/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold">{insight.title}</h4>
                  <span className="text-[9px] font-mono text-text-secondary">
                    CONF: {(insight.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary mb-1.5">{insight.description}</p>
                <div className="text-[9px] font-mono text-text-secondary flex items-center gap-3">
                  <span>METRIC: {insight.metric}</span>
                </div>
                <p className="text-[10px] text-accent-teal mt-1.5">→ {insight.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-cyan" />
                Live Ingestion Feed
              </h3>
              <p className="text-[10px] font-mono text-text-secondary">
                {isDemoMode ? 'SIMULATED EVENTS' : 'LIVE EVENTS'} // LAST 15
              </p>
            </div>
            <span className="inline-block w-2 h-2 bg-status-success rounded-full animate-pulse" />
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {events.slice(0, 15).map((event) => {
              const typeColors: Record<string, string> = {
                registration: 'text-status-success',
                referral_attributed: 'text-accent-teal',
                ambassador_activated: 'text-accent-cyan',
                ambassador_deactivated: 'text-status-warning',
                duplicate_blocked: 'text-status-danger',
                budget_updated: 'text-status-warning',
                settings_changed: 'text-text-secondary',
              };

              const typeLabels: Record<string, string> = {
                registration: 'REG_OK',
                referral_attributed: 'REF_OK',
                ambassador_activated: 'AMB_ON',
                ambassador_deactivated: 'AMB_OFF',
                duplicate_blocked: 'DUP_BLOCK',
                budget_updated: 'BUDGET',
                settings_changed: 'CONFIG',
              };

              return (
                <div key={event.id} className="flex items-start gap-2 py-1 text-[10px]">
                  <span className="font-mono text-text-secondary whitespace-nowrap">
                    {new Date(event.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-text-secondary">•</span>
                  <span className={`font-mono font-medium ${typeColors[event.eventType] ?? 'text-text-secondary'}`}>
                    {typeLabels[event.eventType] ?? event.eventType}
                  </span>
                  <span className="text-text-secondary truncate">{event.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
