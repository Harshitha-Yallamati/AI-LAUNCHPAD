import { Registration } from '../types';

export function exportRegistrationsCSV(registrations: Registration[]): void {
  const headers = [
    'ID',
    'Full Name',
    'Email',
    'College',
    'Branch',
    'Graduation Year',
    'Acquisition Channel',
    'Referral Code',
    'Attribution Source',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Registered At',
  ];

  const rows = registrations.map((r) => [
    r.id,
    r.fullName,
    r.email,
    r.college,
    r.branch,
    r.graduationYear.toString(),
    r.acquisitionChannel,
    r.referralCode ?? '',
    r.attributionSource ?? '',
    r.utmSource ?? '',
    r.utmMedium ?? '',
    r.utmCampaign ?? '',
    r.createdAt,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `registrations_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
