import { useMemo, useState } from 'react';
import { Copy, MessageCircle, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { KPICard, Modal, SectionHeader, StatusBadge, showToast } from '../components/ui';
import { ambassadorSchema } from '../lib/validation';

export default function Ambassadors() {
  const { ambassadors, registrations, addAmbassador, toggleAmbassadorStatus } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ displayName: '', college: '', target: 15 });
  const ranked = useMemo(() => [...ambassadors].sort((a, b) => registrations.filter((r) => r.referralCode === b.referralCode).length - registrations.filter((r) => r.referralCode === a.referralCode).length), [ambassadors, registrations]);
  const active = ambassadors.filter((a) => a.isActive);
  const attributed = registrations.filter((r) => r.referralCode).length;
  const baseUrl = window.location.origin;
  const create = () => {
    const parsed = ambassadorSchema.safeParse(form);
    if (!parsed.success) return showToast('error', parsed.error.issues[0]?.message ?? 'Check ambassador details');
    const result = addAmbassador(parsed.data);
    if (!result.success) return showToast('error', result.error ?? 'Unable to create ambassador');
    setOpen(false); setForm({ displayName: '', college: '', target: 15 }); showToast('success', `Ambassador created: ${result.ambassador?.referralCode}`);
  };
  return <div className="space-y-6 animate-in"><SectionHeader title="Ambassador Network" subtitle="REFERRAL NODES // FIRST-TOUCH ATTRIBUTION"><button className="btn-primary text-xs flex items-center gap-1.5" onClick={() => setOpen(true)}><Plus className="w-3.5 h-3.5" /> Add ambassador</button></SectionHeader><div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KPICard label="Total ambassadors" value={ambassadors.length} prefix="NODES" /><KPICard label="Active ambassadors" value={active.length} prefix="ONLINE" /><KPICard label="Attributed registrations" value={attributed} prefix="REFERRALS" /><KPICard label="Average / active node" value={active.length ? (attributed / active.length).toFixed(1) : '0'} prefix="VELOCITY" /></div><div className="card p-0 overflow-x-auto"><table className="data-table min-w-[850px]"><thead><tr><th>Rank</th><th>Ambassador</th><th>Referral code</th><th>Unique registrations</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead><tbody>{ranked.map((a, index) => { const count = registrations.filter((r) => r.referralCode === a.referralCode).length; const link = `${baseUrl}/?ref=${a.referralCode}`; return <tr key={a.id}><td className="font-mono text-accent-cyan">#{index + 1}</td><td><p className="text-xs font-medium">{a.displayName}</p><p className="text-[10px] text-text-secondary">{a.college}</p></td><td className="font-mono text-xs text-accent-teal">{a.referralCode}</td><td>{count}</td><td><div className="w-28"><div className="flex justify-between text-[10px] font-mono mb-1"><span>{count}</span><span>{a.target}</span></div><div className="h-1.5 rounded bg-bg-elevated"><div className="h-full rounded bg-accent-cyan" style={{ width: `${Math.min(100, count / a.target * 100)}%` }} /></div></div></td><td><StatusBadge status={a.isActive ? 'active' : 'inactive'} /></td><td><div className="flex gap-1"><button className="btn-secondary p-1.5" onClick={() => { navigator.clipboard.writeText(link); showToast('success', 'Referral link copied'); }}><Copy className="w-3 h-3" /></button><button className="btn-secondary p-1.5" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(link)}`, '_blank')}><MessageCircle className="w-3 h-3" /></button><button className="btn-secondary text-[10px] px-2" onClick={() => toggleAmbassadorStatus(a.id)}>{a.isActive ? 'Deactivate' : 'Activate'}</button></div></td></tr>; })}</tbody></table></div><Modal isOpen={open} onClose={() => setOpen(false)} title="Add ambassador" subtitle="A unique URL-safe referral code will be generated"><div className="space-y-3"><input className="input-field" placeholder="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /><input className="input-field" placeholder="College or community" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /><input className="input-field" type="number" min="1" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} /><button className="btn-primary w-full text-xs" onClick={create}>Generate ambassador referral</button></div></Modal></div>;
}
