import { User, UserRole, Election, Position, Candidate, Block, AuditLog } from './types';
import { calculateBlockHash } from './utils/crypto';

// Standard university departments for voter stats
export const SEED_USERS: User[] = [
  {
    id: 'user-admin',
    studentId: 'ADMIN101',
    name: 'Administrator Profile',
    email: 'admin@university.edu.gh',
    passwordHash: 'admin123',
    role: UserRole.ADMIN,
    department: 'Computer Science',
    votedStatus: { 'elec-src-2026': false },
    otpVerified: true,
    registeredDate: '2026-05-01T08:00:00Z'
  },
  {
    id: 'user-officer',
    studentId: 'OFFICER202',
    name: 'Dr. Sarah Jenkins (Electoral Officer)',
    email: 's.jenkins@university.edu.gh',
    passwordHash: 'officer123',
    role: UserRole.OFFICER,
    department: 'Information Technology',
    votedStatus: { 'elec-src-2026': false },
    otpVerified: true,
    registeredDate: '2026-05-01T08:30:00Z'
  },
  // Active Voters
  {
    id: 'user-voter-1',
    studentId: 'STUD001',
    name: 'Emmanuel Kofi Mensah',
    email: 'e.mensah@student.edu.gh',
    passwordHash: 'student123',
    role: UserRole.VOTER,
    department: 'Computer Science',
    votedStatus: { 'elec-src-2026': true }, // Pre-voted
    otpVerified: true,
    registeredDate: '2026-06-05T09:00:00Z'
  },
  {
    id: 'user-voter-2',
    studentId: 'STUD002',
    name: 'Ama Serwaa Abara',
    email: 'a.abara@student.edu.gh',
    passwordHash: 'student123',
    role: UserRole.VOTER,
    department: 'Information Technology',
    votedStatus: { 'elec-src-2026': true }, // Pre-voted
    otpVerified: true,
    registeredDate: '2026-06-05T09:12:00Z'
  },
  {
    id: 'user-voter-3',
    studentId: 'STUD003',
    name: 'John Boateng Doe',
    email: 'j.doe@student.edu.gh',
    passwordHash: 'student123',
    role: UserRole.VOTER,
    department: 'Information Technology',
    votedStatus: { 'elec-src-2026': false }, // Can vote
    otpVerified: false,
    registeredDate: '2026-06-06T10:15:00Z'
  },
  {
    id: 'user-voter-4',
    studentId: 'STUD004',
    name: 'Jane Adjoa Smith',
    email: 'j.smith@student.edu.gh',
    passwordHash: 'student123',
    role: UserRole.VOTER,
    department: 'Electrical Engineering',
    votedStatus: { 'elec-src-2026': false }, // Can vote
    otpVerified: false,
    registeredDate: '2026-06-06T11:00:00Z'
  },
  {
    id: 'user-voter-5',
    studentId: 'STUD005',
    name: 'Kwame Opoku Ware',
    email: 'k.opoku@student.edu.gh',
    passwordHash: 'student123',
    role: UserRole.VOTER,
    department: 'Business Administration',
    votedStatus: { 'elec-src-2026': false }, // Can vote
    otpVerified: false,
    registeredDate: '2026-06-07T14:40:00Z'
  },
  {
    id: 'user-voter-6',
    studentId: 'STUD006',
    name: 'Abiba Yakubu Moro',
    email: 'a.moro@student.edu.gh',
    passwordHash: 'student123',
    role: UserRole.VOTER,
    department: 'Mechanical Engineering',
    votedStatus: { 'elec-src-2026': true }, // Pre-voted
    otpVerified: true,
    registeredDate: '2026-06-07T15:20:00Z'
  },
  {
    id: 'user-voter-7',
    studentId: 'STUD007',
    name: 'Prince Ebenezer Boateng',
    email: 'p.boateng@student.edu.gh',
    passwordHash: 'student123',
    role: UserRole.VOTER,
    department: 'Computer Science',
    votedStatus: { 'elec-src-2026': true }, // Pre-voted
    otpVerified: true,
    registeredDate: '2026-06-08T09:45:00Z'
  }
];

export const SEED_ELECTIONS: Election[] = [
  {
    id: 'elec-src-2026',
    title: 'SRC General Student Elections 2026',
    startDate: '2026-06-12T08:00:00.000Z',
    endDate: '2026-06-16T17:00:00.000Z',
    status: 'active'
  },
  {
    id: 'elec-dept-it-2026',
    title: 'IT Department Executives Election 2026',
    startDate: '2026-06-01T09:00:00.000Z',
    endDate: '2026-06-02T16:00:00.000Z',
    status: 'completed'
  }
];

export const SEED_POSITIONS: Position[] = [
  // For SRC active election
  { id: 'pos-pres', electionId: 'elec-src-2026', positionName: 'SRC President' },
  { id: 'pos-vpres', electionId: 'elec-src-2026', positionName: 'SRC Vice President' },
  { id: 'pos-sec', electionId: 'elec-src-2026', positionName: 'General Secretary' },
  { id: 'pos-fin', electionId: 'elec-src-2026', positionName: 'Financial Secretary' },
  
  // For IT past election
  { id: 'pos-it-pres', electionId: 'elec-dept-it-2026', positionName: 'IT Department President' }
];

export const SEED_CANDIDATES: Candidate[] = [
  // SRC President candidates
  {
    id: 'cand-pres-1',
    positionId: 'pos-pres',
    electionId: 'elec-src-2026',
    name: 'Daniel Richmond Tetteh',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    department: 'Computer Science',
    manifesto: 'Restoring transparency and academic empowerment. I promise to renegotiate campus Wi-Fi density limits, introduce 24/7 solar study pods, and establish a micro-grant funding pipeline for student startup projects.',
    approved: true
  },
  {
    id: 'cand-pres-2',
    positionId: 'pos-pres',
    electionId: 'elec-src-2026',
    name: 'Miriam Ofori Ama',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    department: 'Information Technology',
    manifesto: 'Innovating student support structures. My manifest centering points are digital hybrid lecture halls, subsidized shuttle transportation cards, mental health support peer systems, and direct feedback forums with administration.',
    approved: true
  },
  {
    id: 'cand-pres-3',
    positionId: 'pos-pres',
    electionId: 'elec-src-2026',
    name: 'Samuel Kwabena Darko',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    department: 'Business Administration',
    manifesto: 'Pragmatic leadership with measurable growth. Focusing on campus entrepreneurship markets, introducing secure digital student portfolios, upgrading sports and recreational infrastructure, and creating a food bank program for off-campus hostels.',
    approved: true
  },
  
  // SRC Vice President candidates
  {
    id: 'cand-vpres-1',
    positionId: 'pos-vpres',
    electionId: 'elec-src-2026',
    name: 'Evelyn Gifty Mensah',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    department: 'Electrical Engineering',
    manifesto: 'Promising cohesive synergy with student representatives. Championing practical skill-development labs, industrial placements, and an open student grievance digital tracking board.',
    approved: true
  },
  {
    id: 'cand-vpres-2',
    positionId: 'pos-vpres',
    electionId: 'elec-src-2026',
    name: 'Isaac Appiah Kwaku',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    department: 'Mechanical Engineering',
    manifesto: 'Building a sustainable campus together. Upgrading mechanical workspace assets, introducing green recycling loops, and ensuring reliable on-campus dispensary medical coverage.',
    approved: true
  },
  
  // Secretary candidates
  {
    id: 'cand-sec-1',
    positionId: 'pos-sec',
    electionId: 'elec-src-2026',
    name: 'Cynthia Naa Dei',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    department: 'Information Technology',
    manifesto: 'Seamless communication. I plan to digitize SRC newsletters into an instant WhatsApp/Telegram alerts gateway, publish committee reports on a public hub, and optimize general student senate minutes logs.',
    approved: true
  },
  {
    id: 'cand-sec-2',
    positionId: 'pos-sec',
    electionId: 'elec-src-2026',
    name: 'Patrick Clinton Asare',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    department: 'Computer Science',
    manifesto: 'A professional student registry system. Ensuring absolute structural records preservation, clean calendar updates, and a prompt response guarantee from secretariat handlers.',
    approved: true
  },
  
  // Financial Secretary candidates
  {
    id: 'cand-fin-1',
    positionId: 'pos-fin',
    electionId: 'elec-src-2026',
    name: 'Dominic Selorm Agbenu',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    department: 'Business Administration',
    manifesto: 'Absolute transparency. Implementing a real-time ledger dashboard where every cedi of the SRC budget is documented with scanned receipts, providing audit logs to the public weekly.',
    approved: true
  },
  {
    id: 'cand-fin-2',
    positionId: 'pos-fin',
    electionId: 'elec-src-2026',
    name: 'Benedicta Efua Taylor',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    department: 'Computer Science',
    manifesto: 'Automating financial claims. Transitioning paper reimbursement claims into a fast, secure electronic approval workflow that reduces wait times from 2 weeks to 48 hours.',
    approved: true
  },

  // Past IT election candidates
  {
    id: 'cand-it-pres-1',
    positionId: 'pos-it-pres',
    electionId: 'elec-dept-it-2026',
    name: 'Kelvin Johnson Sackey',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    department: 'Information Technology',
    manifesto: 'Pioneering student coding hackathons and dev partnerships.',
    approved: true
  }
];

// Re-cast initial blockchain with genesis block plus some pre-loaded votes to simulate a running election!
export function getInitialBlocks(): Block[] {
  const genesisBlock: Block = {
    index: 0,
    timestamp: '2026-06-12T08:00:00.000Z',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: '00b9a8cfdcb83d162ba7650f94fe4b1f6a1e367fc9b6df65c82de9da9b87df1c',
    electionId: 'system',
    positionId: 'genesis',
    candidateId: 'genesis',
    nonce: 42
  };
  
  // Create 4 blocks for 4 voters who already voted
  // Voter 1: Kofi Mensah (STUD001) chooses:
  // - President: cand-pres-1 (Daniel)
  // - Vice President: cand-vpres-1 (Evelyn)
  // - Secretary: cand-sec-2 (Patrick)
  // - Financial: cand-fin-1 (Dominic)
  
  const b1: Block = {
    index: 1,
    timestamp: '2026-06-12T09:15:00.000Z',
    previousHash: genesisBlock.hash,
    hash: calculateBlockHash(1, '2026-06-12T09:15:00.000Z', genesisBlock.hash, 'elec-src-2026', 'pos-pres', 'cand-pres-1', 101),
    electionId: 'elec-src-2026',
    positionId: 'pos-pres',
    candidateId: 'cand-pres-1',
    nonce: 101
  };
  
  const b2: Block = {
    index: 2,
    timestamp: '2026-06-12T09:15:30.000Z',
    previousHash: b1.hash,
    hash: calculateBlockHash(2, '2026-06-12T09:15:30.000Z', b1.hash, 'elec-src-2026', 'pos-vpres', 'cand-vpres-1', 102),
    electionId: 'elec-src-2026',
    positionId: 'pos-vpres',
    candidateId: 'cand-vpres-1',
    nonce: 102
  };
  
  const b3: Block = {
    index: 3,
    timestamp: '2026-06-12T09:16:00.000Z',
    previousHash: b2.hash,
    hash: calculateBlockHash(3, '2026-06-12T09:16:00.000Z', b2.hash, 'elec-src-2026', 'pos-sec', 'cand-sec-1', 103),
    electionId: 'elec-src-2026',
    positionId: 'pos-sec',
    candidateId: 'cand-sec-1',
    nonce: 103
  };

  const b4: Block = {
    index: 4,
    timestamp: '2026-06-12T09:16:30.000Z',
    previousHash: b3.hash,
    hash: calculateBlockHash(4, '2026-06-12T09:16:30.000Z', b3.hash, 'elec-src-2026', 'pos-fin', 'cand-fin-1', 104),
    electionId: 'elec-src-2026',
    positionId: 'pos-fin',
    candidateId: 'cand-fin-1',
    nonce: 104
  };

  // Voter 2: Ama Serwaa Abara (STUD002)
  const b5: Block = {
    index: 5,
    timestamp: '2026-06-12T10:30:00.000Z',
    previousHash: b4.hash,
    hash: calculateBlockHash(5, '2026-06-12T10:30:00.000Z', b4.hash, 'elec-src-2026', 'pos-pres', 'cand-pres-2', 105),
    electionId: 'elec-src-2026',
    positionId: 'pos-pres',
    candidateId: 'cand-pres-2',
    nonce: 105
  };

  const b6: Block = {
    index: 6,
    timestamp: '2026-06-12T10:30:30.000Z',
    previousHash: b5.hash,
    hash: calculateBlockHash(6, '2026-06-12T10:30:30.000Z', b5.hash, 'elec-src-2026', 'pos-vpres', 'cand-vpres-2', 106),
    electionId: 'elec-src-2026',
    positionId: 'pos-vpres',
    candidateId: 'cand-vpres-2',
    nonce: 106
  };

  const b7: Block = {
    index: 7,
    timestamp: '2026-06-12T10:31:00.000Z',
    previousHash: b6.hash,
    hash: calculateBlockHash(7, '2026-06-12T10:31:00.000Z', b6.hash, 'elec-src-2026', 'pos-sec', 'cand-sec-1', 107),
    electionId: 'elec-src-2026',
    positionId: 'pos-sec',
    candidateId: 'cand-sec-1',
    nonce: 107
  };

  const b8: Block = {
    index: 8,
    timestamp: '2026-06-12T10:31:30.000Z',
    previousHash: b7.hash,
    hash: calculateBlockHash(8, '2026-06-12T10:31:30.000Z', b7.hash, 'elec-src-2026', 'pos-fin', 'cand-fin-2', 108),
    electionId: 'elec-src-2026',
    positionId: 'pos-fin',
    candidateId: 'cand-fin-2',
    nonce: 108
  };

  // Voter 6: Abiba Yakubu Moro (STUD006)
  const b9: Block = {
    index: 9,
    timestamp: '2026-06-12T15:20:00.000Z',
    previousHash: b8.hash,
    hash: calculateBlockHash(9, '2026-06-12T15:20:00.000Z', b8.hash, 'elec-src-2026', 'pos-pres', 'cand-pres-2', 109),
    electionId: 'elec-src-2026',
    positionId: 'pos-pres',
    candidateId: 'cand-pres-2',
    nonce: 109
  };

  const b10: Block = {
    index: 10,
    timestamp: '2026-06-12T15:20:40.000Z',
    previousHash: b9.hash,
    hash: calculateBlockHash(10, '2026-06-12T15:20:40.000Z', b9.hash, 'elec-src-2026', 'pos-vpres', 'cand-vpres-1', 110),
    electionId: 'elec-src-2026',
    positionId: 'pos-vpres',
    candidateId: 'cand-vpres-1',
    nonce: 110
  };

  // Voter 7: Prince Ebenezer Boateng (STUD007)
  const b11: Block = {
    index: 11,
    timestamp: '2026-06-12T16:10:00.000Z',
    previousHash: b10.hash,
    hash: calculateBlockHash(11, '2026-06-12T16:10:00.000Z', b10.hash, 'elec-src-2026', 'pos-pres', 'cand-pres-3', 111),
    electionId: 'elec-src-2026',
    positionId: 'pos-pres',
    candidateId: 'cand-pres-3',
    nonce: 111
  };

  return [genesisBlock, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11];
}

export const SEED_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-admin',
    userName: 'Admin System',
    role: 'Administrator',
    action: 'Election voting database booted for SRC Elections 2026',
    dateTime: '2026-06-12T08:00:00.000Z',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
  {
    id: 'log-2',
    userId: 'user-admin',
    userName: 'Admin System',
    role: 'Administrator',
    action: 'Cryptographic Genesis Block created for election chain',
    dateTime: '2026-06-12T08:00:01.000Z',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
  {
    id: 'log-3',
    userId: 'user-voter-1',
    userName: 'Emmanuel Kofi Mensah',
    role: 'Voter',
    action: 'Student credential ID STUDENT001 validated using Password Auth',
    dateTime: '2026-06-12T09:12:30.000Z',
    ipAddress: '192.168.10.45',
    status: 'success'
  },
  {
    id: 'log-4',
    userId: 'user-voter-1',
    userName: 'Emmanuel Kofi Mensah',
    role: 'Voter',
    action: 'OTP code verified successfully: 827419',
    dateTime: '2026-06-12T09:14:00.000Z',
    ipAddress: '192.168.10.45',
    status: 'success'
  },
  {
    id: 'log-5',
    userId: 'user-voter-1',
    userName: 'Emmanuel Kofi Mensah',
    role: 'Voter',
    action: 'Cast double-hashed ballot for SRC President POS-PRES / cand-pres-1',
    dateTime: '2026-06-12T09:15:00.000Z',
    ipAddress: '192.168.10.45',
    status: 'success'
  },
  {
    id: 'log-6',
    userId: 'user-voter-2',
    userName: 'Ama Serwaa Abara',
    role: 'Voter',
    action: 'Student ID STUD002 OTP dispatch triggered',
    dateTime: '2026-06-12T10:28:00.000Z',
    ipAddress: '192.168.10.59',
    status: 'success'
  },
  {
    id: 'log-7',
    userId: 'user-voter-2',
    userName: 'Ama Serwaa Abara',
    role: 'Voter',
    action: 'Cast ballot for SRC President and SRC Vice President',
    dateTime: '2026-06-12T10:31:30.000Z',
    ipAddress: '192.168.10.59',
    status: 'success'
  },
  {
    id: 'log-8',
    userId: 'user-admin',
    userName: 'Admin System',
    role: 'Administrator',
    action: 'Suspicious quick login attempt blocked for student STUD003',
    dateTime: '2026-06-12T11:05:00.000Z',
    ipAddress: '109.28.140.22',
    status: 'warning'
  },
  {
    id: 'log-9',
    userId: 'user-officer',
    userName: 'Dr. Sarah Jenkins',
    role: 'Election Officer',
    action: 'Electoral integrity statistics audit passed',
    dateTime: '2026-06-12T14:00:00.000Z',
    ipAddress: '192.168.2.140',
    status: 'success'
  }
];
