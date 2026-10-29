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
} from '../types';

// ─── College and Name data for realistic demo ───────────

const COLLEGES = [
  'VIT Vellore', 'IIT Madras', 'BITS Pilani', 'SRM IST', 'IIT Bombay',
  'NIT Trichy', 'IIT Delhi', 'IIIT Hyderabad', 'DTU Delhi', 'NIT Warangal',
  'Jadavpur University', 'IIT Kharagpur', 'RVCE Bangalore', 'PES University',
  'MSRIT Bangalore', 'MIT Manipal', 'KIIT Bhubaneswar', 'Amity Noida',
  'LPU Jalandhar', 'VIT Chennai', 'SVNIT Surat', 'IIT Roorkee',
  'NIT Surathkal', 'COEP Pune', 'VJTI Mumbai', 'CBIT Hyderabad',
  'SSN Chennai', 'PSG Coimbatore', 'Anna University', 'Thapar University',
];

const FIRST_NAMES = [
  'Rohan', 'Aditi', 'Pooja', 'Dev', 'Ananya', 'Vikram', 'Harini', 'Aakash',
  'Sneha', 'Rahul', 'Priya', 'Arjun', 'Meera', 'Karthik', 'Divya', 'Nikhil',
  'Anjali', 'Siddharth', 'Riya', 'Varun', 'Kavitha', 'Pranav', 'Nandini',
  'Aditya', 'Lakshmi', 'Manish', 'Swathi', 'Deepak', 'Shruti', 'Amit',
  'Tanvi', 'Gaurav', 'Ishita', 'Rajesh', 'Neha', 'Suresh', 'Pallavi',
  'Krishna', 'Sanjana', 'Vivek', 'Aparna', 'Tushar', 'Revathi', 'Akshay',
  'Bhavana', 'Chinmay', 'Dhanya', 'Esha', 'Farhan', 'Gauri',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Sen', 'Patel', 'Roy', 'Rao', 'Iyer', 'Kumar',
  'Gupta', 'Singh', 'Reddy', 'Nair', 'Joshi', 'Das', 'Mehta', 'Agarwal',
  'Krishnan', 'Banerjee', 'Chatterjee', 'Deshpande', 'Bhat', 'Menon',
  'Pillai', 'Rajan', 'Sundaram', 'Thakur', 'Malhotra', 'Kapoor', 'Saxena',
  'Pandey', 'Mishra', 'Chauhan', 'Tiwari', 'Yadav', 'Sinha', 'Ghosh',
];

const BRANCHES = [
  'Computer Science & Eng', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Electrical Engineering', 'Data Science & Analytics',
  'AI & Machine Learning', 'Aerospace & AI Modeling', 'Biotech & Neural Nets',
  'Civil Engineering', 'Chemical Engineering', 'EEE',
];

// ─── Seeded random for deterministic demo ───────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

// ─── Generate Demo Data ─────────────────────────────────

export function generateDemoAmbassadors(count: number, rand: () => number): Ambassador[] {
  const ambassadors: Ambassador[] = [];
  const usedCodes = new Set<string>();

  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES, rand);
    const lastName = pick(LAST_NAMES, rand);
    const name = `${firstName} ${lastName}`;
    let code = generateReferralCode(name);
    while (usedCodes.has(code)) {
      code = generateReferralCode(name);
    }
    usedCodes.add(code);

    ambassadors.push({
      id: createId(),
      displayName: name,
      college: pick(COLLEGES, rand),
      referralCode: code,
      isActive: rand() > 0.1,
      target: Math.floor(rand() * 20) + 10,
      createdAt: new Date(Date.now() - Math.floor(rand() * 7 * 86400000)).toISOString(),
    });
  }
  return ambassadors;
}

export function generateDemoRegistrations(
  count: number,
  ambassadors: Ambassador[],
  dayOfCampaign: number,
  campaignStartDate: string,
  rand: () => number
): Registration[] {
  const registrations: Registration[] = [];
  const usedEmails = new Set<string>();
  const activeAmbassadors = ambassadors.filter((a) => a.isActive);
  const startDate = new Date(campaignStartDate);

  // Distribute registrations across days with realistic growth curve
  const dayWeights = Array.from({ length: dayOfCampaign }, (_, i) => {
    // Exponential growth pattern
    return Math.pow(1.4, i) + (rand() * 2);
  });
  const totalWeight = dayWeights.reduce((a, b) => a + b, 0);
  const regsPerDay = dayWeights.map((w) => Math.round((w / totalWeight) * count));

  // Adjust to match exact count
  let assigned = regsPerDay.reduce((a, b) => a + b, 0);
  while (assigned < count) {
    regsPerDay[regsPerDay.length - 1]!++;
    assigned++;
  }
  while (assigned > count) {
    const idx = regsPerDay.findIndex((r) => r > 0);
    if (idx >= 0) { regsPerDay[idx]!--; assigned--; }
    else break;
  }

  for (let day = 0; day < dayOfCampaign; day++) {
    const dayCount = regsPerDay[day] ?? 0;
    for (let j = 0; j < dayCount; j++) {
      const firstName = pick(FIRST_NAMES, rand);
      const lastName = pick(LAST_NAMES, rand);
      const name = `${firstName} ${lastName}`;
      const college = pick(COLLEGES, rand);
      const collegeDomain = college.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '') + '.ac.in';
      let email = normalizeEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(rand() * 99)}@${collegeDomain}`);

      // Ensure unique
      while (usedEmails.has(email)) {
        email = normalizeEmail(`${firstName.toLowerCase()}${Math.floor(rand() * 9999)}@${collegeDomain}`);
      }
      usedEmails.add(email);

      // Channel distribution: ~50% communities, ~35% ambassadors, ~15% direct
      const channelRoll = rand();
      let channel: AcquisitionChannel;
      let referralCode: string | null = null;

      if (channelRoll < 0.35 && activeAmbassadors.length > 0) {
        channel = 'Student Ambassadors';
        referralCode = pick(activeAmbassadors, rand).referralCode;
      } else if (channelRoll < 0.85) {
        channel = 'College Communities';
      } else {
        channel = 'Direct Outreach';
      }

      const regDate = new Date(startDate);
      regDate.setDate(regDate.getDate() + day);
      regDate.setHours(Math.floor(rand() * 14) + 8, Math.floor(rand() * 60), Math.floor(rand() * 60));

      registrations.push({
        id: createId(),
        fullName: name,
        email,
        college,
        branch: pick(BRANCHES, rand),
        graduationYear: 2024 + Math.floor(rand() * 3),
        acquisitionChannel: channel,
        referralCode,
        attributionSource: referralCode ? `ambassador:${referralCode}` : channel.toLowerCase().replace(/\s/g, '_'),
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        consentTimestamp: regDate.toISOString(),
        createdAt: regDate.toISOString(),
      });
    }
  }

  return registrations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateDemoEvents(
  registrations: Registration[],
  ambassadors: Ambassador[],
  rand: () => number
): CampaignEvent[] {
  const events: CampaignEvent[] = [];

  // Registration events (last 20)
  registrations.slice(0, 20).forEach((reg) => {
    events.push({
      id: createId(),
      eventType: 'registration',
      description: `${reg.fullName.split(' ')[0]} ${reg.fullName.split(' ')[1]?.[0] ?? ''}. registered from ${reg.college}`,
      source: reg.acquisitionChannel,
      referralCode: reg.referralCode,
      createdAt: reg.createdAt,
    });
  });

  // Ambassador events
  ambassadors.slice(0, 5).forEach((amb) => {
    events.push({
      id: createId(),
      eventType: 'ambassador_activated',
      description: `${amb.displayName} activated as ambassador from ${amb.college}`,
      source: null,
      referralCode: amb.referralCode,
      createdAt: amb.createdAt,
    });
  });

  // Referral events
  registrations
    .filter((r) => r.referralCode)
    .slice(0, 10)
    .forEach((reg) => {
      events.push({
        id: createId(),
        eventType: 'referral_attributed',
        description: `Referral ${reg.referralCode} attributed for ${reg.fullName.split(' ')[0]}`,
        source: 'Student Ambassadors',
        referralCode: reg.referralCode,
        createdAt: reg.createdAt,
      });
    });

  // Duplicate events
  for (let i = 0; i < Math.floor(rand() * 8) + 3; i++) {
    const reg = pick(registrations, rand);
    events.push({
      id: createId(),
      eventType: 'duplicate_blocked',
      description: `Duplicate attempt blocked for ${reg.email}`,
      source: reg.acquisitionChannel,
      referralCode: null,
      createdAt: new Date(new Date(reg.createdAt).getTime() + 60000).toISOString(),
    });
  }

  return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateDemoExpenses(rand: () => number): Expense[] {
  return [
    {
      id: createId(),
      category: 'Ambassador Rewards',
      description: 'Performance-based incentives for top referrers',
      plannedAmount: 1000,
      actualAmount: Math.floor(rand() * 400) + 200,
      status: 'spent',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: createId(),
      category: 'Creative Assets',
      description: 'Workshop banners, social media creatives, WhatsApp posters',
      plannedAmount: 300,
      actualAmount: Math.floor(rand() * 150) + 100,
      status: 'spent',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: createId(),
      category: 'Contingency',
      description: 'Reserve fund for unexpected campaign needs',
      plannedAmount: 700,
      actualAmount: 0,
      status: 'planned',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getDefaultSettings(dayOfCampaign: number): CampaignSettings {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (dayOfCampaign - 1));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const workshopDate = new Date(endDate);
  workshopDate.setDate(workshopDate.getDate() + 3);

  return {
    campaignName: 'NxtWave G-Sprint-07',
    registrationGoal: 500,
    campaignStartDate: startDate.toISOString().split('T')[0]!,
    campaignEndDate: endDate.toISOString().split('T')[0]!,
    totalBudget: 2000,
    workshopDate: workshopDate.toISOString().split('T')[0]!,
    workshopTime: '14:00',
    updatedAt: new Date().toISOString(),
  };
}

export function generateFullDemoData(scenarioId: 'early' | 'mid' | 'near-target') {
  const scenario = {
    early: { count: 65, ambassadors: 5, day: 2 },
    mid: { count: 320, ambassadors: 12, day: 5 },
    'near-target': { count: 468, ambassadors: 15, day: 7 },
  }[scenarioId];

  const rand = seededRandom(scenarioId === 'early' ? 42 : scenarioId === 'mid' ? 137 : 256);
  const settings = getDefaultSettings(scenario.day);
  const ambassadors = generateDemoAmbassadors(scenario.ambassadors, rand);
  const registrations = generateDemoRegistrations(
    scenario.count,
    ambassadors,
    scenario.day,
    settings.campaignStartDate,
    rand
  );
  const events = generateDemoEvents(registrations, ambassadors, rand);
  const expenses = generateDemoExpenses(rand);

  return { settings, ambassadors, registrations, events, expenses };
}
