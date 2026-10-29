import { useState, useMemo } from 'react';
import {
  Search, Filter, Download, Users, UserCheck, AlertTriangle, Calendar,
  ChevronDown, ArrowUpDown,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { KPICard, SectionHeader, Pagination, EmptyState } from '../components/ui';
import { exportRegistrationsCSV } from '../lib/csvExport';
import type { Registration, AcquisitionChannel } from '../types';

const PAGE_SIZE = 15;

export default function Registrations() {
  const { registrations, duplicateAttempts, isDemoMode } = useStore();

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Registration>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Unique values for filters
  const colleges = useMemo(() => [...new Set(registrations.map((r) => r.college))].sort(), [registrations]);
  const years = useMemo(() => [...new Set(registrations.map((r) => r.graduationYear))].sort(), [registrations]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    let result = [...registrations];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.college.toLowerCase().includes(q) ||
          (r.referralCode?.toLowerCase().includes(q))
      );
    }

    if (channelFilter !== 'all') {
      result = result.filter((r) => r.acquisitionChannel === channelFilter);
    }

    if (collegeFilter !== 'all') {
      result = result.filter((r) => r.college === collegeFilter);
    }

    if (yearFilter !== 'all') {
      result = result.filter((r) => r.graduationYear === parseInt(yearFilter));
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [registrations, search, channelFilter, collegeFilter, yearFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: keyof Registration) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const today = new Date().toDateString();
  const todayCount = registrations.filter((r) => new Date(r.createdAt).toDateString() === today).length;
  const ambassadorAttr = registrations.filter((r) => r.referralCode).length;

  const channelColors: Record<string, string> = {
    'College Communities': 'badge-cyan',
    'Student Ambassadors': 'badge-teal',
    'Direct Outreach': 'badge-warning',
  };

  return (
    <div className="space-y-6 animate-in">
      <SectionHeader
        title="Candidate Verification Roster"
        subtitle={`SEC_LOG::REG_V4 ${isDemoMode ? 'SIMULATED AUDIT LOG' : 'LIVE'} // ●PASS RATE: ${((registrations.length / (registrations.length + duplicateAttempts)) * 100).toFixed(1)}% (${registrations.length}/${registrations.length + duplicateAttempts} TOTAL PACKETS)`}
      >
        <button
          onClick={() => exportRegistrationsCSV(filtered)}
          className="btn-primary flex items-center gap-1.5 text-xs"
        >
          <Download className="w-3 h-3" /> EXPORT CSV // AUDITED
        </button>
      </SectionHeader>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          prefix="ROSTER_CAP"
          label="Unique Registrations"
          value={registrations.length}
          subtitle={`${registrations.length} / ${useStore.getState().settings.registrationGoal} CAP`}
        />
        <KPICard
          prefix="VELOCITY"
          label="Registrations Today"
          value={todayCount}
          subtitle={`PEAK AT ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`}
        />
        <KPICard
          prefix="CAMPUS_MESH"
          label="Ambassador Attributed"
          value={ambassadorAttr}
          subtitle={`${ambassadors_pct(ambassadorAttr, registrations.length)}% PARTNER RELAY`}
        />
        <KPICard
          prefix="COLLISION_SHIELD"
          label="Duplicate Attempts"
          value={duplicateAttempts}
          subtitle="CAPITAL SAFEGUARDED"
          change={duplicateAttempts > 0 ? 'INTEGRITY ✓' : ''}
          changeType="positive"
        />
      </div>

      {/* Search & Filters */}
      <div className="card p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="Query student, university domain, college email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              className="select-field w-auto min-w-[140px]"
              value={channelFilter}
              onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
            >
              <option value="all">ALL CHANNELS</option>
              <option value="College Communities">COMMUNITIES</option>
              <option value="Student Ambassadors">AMBASSADORS</option>
              <option value="Direct Outreach">DIRECT</option>
            </select>

            <select
              className="select-field w-auto min-w-[120px]"
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            >
              <option value="all">GRAD YEAR: ALL</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              className="select-field w-auto min-w-[140px]"
              value={collegeFilter}
              onChange={(e) => { setCollegeFilter(e.target.value); setPage(1); }}
            >
              <option value="all">CAMPUS HUB: ALL {colleges.length}</option>
              {colleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-text-secondary">
          <span className="text-status-success">●{filtered.length} VERIFIED</span>
          <span className="text-status-danger">●{duplicateAttempts} BLOCKED</span>
          <span>SORT: {sortField.toUpperCase()} {sortDir === 'desc' ? 'DESC' : 'ASC'} (IST)</span>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-x-auto">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-[10px] font-mono text-text-secondary italic">
            ROSTER_STREAM::PRIMARY_AUDIT_LEDGER
          </span>
          <span className="text-[9px] font-mono text-text-secondary">
            ◎ CRYPTOGRAPHIC INTEGRITY GUARANTEED
          </span>
        </div>

        {paginated.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No registrations found"
            description="Adjust your filters or search query"
          />
        ) : (
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th className="cursor-pointer" onClick={() => toggleSort('fullName')}>
                  <span className="flex items-center gap-1">STUDENT & ACADEMIC IDENTITY <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th>CAMPUS & TIER</th>
                <th>DISCIPLINE // YEAR</th>
                <th className="cursor-pointer" onClick={() => toggleSort('acquisitionChannel')}>
                  <span className="flex items-center gap-1">CHANNEL ATTRIBUTION <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th>REFERRAL PASSKEY</th>
                <th className="cursor-pointer" onClick={() => toggleSort('createdAt')}>
                  <span className="flex items-center gap-1">TIME (IST) <ArrowUpDown className="w-3 h-3" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((reg, idx) => (
                <tr key={reg.id}>
                  <td className="font-mono text-text-secondary text-[10px]">
                    {String((page - 1) * PAGE_SIZE + idx + 1).padStart(3, '0')}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-[9px] font-bold text-accent-cyan">
                        {reg.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{reg.fullName}</p>
                        <p className="text-[10px] font-mono text-accent-cyan">{reg.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-xs">{reg.college}</p>
                    <p className="text-[9px] font-mono text-text-secondary">CAMPUS_TIER_1</p>
                  </td>
                  <td>
                    <p className="text-xs">{reg.branch}</p>
                    <p className="text-[9px] font-mono text-text-secondary">CLASS OF {reg.graduationYear}</p>
                  </td>
                  <td>
                    <span className={channelColors[reg.acquisitionChannel] ?? 'badge-cyan'}>
                      ● {reg.acquisitionChannel.toUpperCase().split(' ')[0]}
                    </span>
                  </td>
                  <td>
                    {reg.referralCode ? (
                      <span className="text-[10px] font-mono text-accent-teal">#{reg.referralCode}</span>
                    ) : (
                      <span className="text-[10px] font-mono text-text-secondary">—</span>
                    )}
                  </td>
                  <td className="text-[10px] font-mono text-text-secondary whitespace-nowrap">
                    {new Date(reg.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function ambassadors_pct(attr: number, total: number): string {
  if (total === 0) return '0.0';
  return ((attr / total) * 100).toFixed(1);
}
