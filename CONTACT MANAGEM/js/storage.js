/**
 * Pulse Contacts - Storage Management Layer
 */

const STORAGE_KEY = 'pulse_contacts_data_v1';
const THEME_KEY = 'pulse_contacts_theme';
const VIEW_KEY = 'pulse_contacts_view';

const INITIAL_CONTACTS = [
  {
    id: 'seed-1',
    firstName: 'Alex',
    lastName: 'Vance',
    email: 'alex.vance@blackmesa.io',
    phone: '+1 (555) 234-5678',
    company: 'Black Mesa Research',
    jobTitle: 'Senior Quantum Engineer',
    category: 'work',
    color: '#6366f1',
    avatarUrl: '',
    address: 'Sector 7, High-Tech Corridor, Seattle, WA',
    birthday: '1992-04-14',
    notes: 'Key collaborator on the quantum computing project. Prefers communications via Slack or Email.',
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'seed-2',
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia.chen@novadesign.co',
    phone: '+1 (555) 876-5432',
    company: 'Nova UI Labs',
    jobTitle: 'Creative Art Director',
    category: 'work',
    color: '#06b6d4',
    avatarUrl: '',
    address: '450 Innovation Way, San Francisco, CA',
    birthday: '1995-08-22',
    notes: 'Lead designer for upcoming brand identity overhaul. Great eye for typography & micro-interactions.',
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'seed-3',
    firstName: 'Marcus',
    lastName: 'Aurelius',
    email: 'marcus.a@stoiccapital.com',
    phone: '+1 (555) 349-1120',
    company: 'Stoic Ventures',
    jobTitle: 'Managing Partner',
    category: 'vip',
    color: '#f43f5e',
    avatarUrl: '',
    address: '100 Wall Street, Suite 4200, New York, NY',
    birthday: '1988-11-05',
    notes: 'Angel investor and strategic advisor. Always schedule calls 2 days in advance.',
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'seed-4',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@helios-energy.org',
    phone: '+44 20 7946 0912',
    company: 'Helios Clean Tech',
    jobTitle: 'VP of Sustainability',
    category: 'client',
    color: '#2dd4bf',
    avatarUrl: '',
    address: '22 Bishopsgate, London EC2N 4BQ, UK',
    birthday: '1990-03-18',
    notes: 'Overseeing the European green transition account. Next quarterly review is in October.',
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'seed-5',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller99@gmail.com',
    phone: '+1 (555) 782-9901',
    company: 'Freelance / Sound Studio',
    jobTitle: 'Audio Producer',
    category: 'friends',
    color: '#fbbf24',
    avatarUrl: '',
    address: '124 Austin Blvd, Austin, TX',
    birthday: '1994-06-30',
    notes: 'College roommate. Loves music festivals, analog synths, and cycling.',
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'seed-6',
    firstName: 'Grandma',
    lastName: 'Clara',
    email: 'clara.family@icloud.com',
    phone: '+1 (555) 912-3344',
    company: 'Family',
    jobTitle: 'Home Chef & Gardener',
    category: 'family',
    color: '#34d399',
    avatarUrl: '',
    address: '88 Maple Grove, Portland, OR',
    birthday: '1952-12-10',
    notes: 'Sunday family dinner host. Remind her about fresh orchard apples!',
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'seed-7',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    email: 'liam.oc@celtic-consulting.ie',
    phone: '+353 1 496 0000',
    company: 'Celtic Solutions',
    jobTitle: 'Cloud Architect',
    category: 'work',
    color: '#38bdf8',
    avatarUrl: '',
    address: 'Grand Canal Dock, Dublin, Ireland',
    birthday: '1991-09-02',
    notes: 'Consultant helping with AWS infrastructure migration and Kubernetes orchestration.',
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'seed-8',
    firstName: 'Maya',
    lastName: 'Patel',
    email: 'maya.p@zenithwellness.com',
    phone: '+1 (555) 654-0987',
    company: 'Zenith Wellness Studio',
    jobTitle: 'Nutritionist & Coach',
    category: 'personal',
    color: '#c084fc',
    avatarUrl: '',
    address: '710 Boulder Ave, Denver, CO',
    birthday: '1996-01-25',
    notes: 'Personal fitness and nutrition coach. Weekly check-in every Tuesday at 8 AM.',
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  }
];

class StorageManager {
  loadContacts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveContacts(INITIAL_CONTACTS);
        return INITIAL_CONTACTS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this.saveContacts(INITIAL_CONTACTS);
        return INITIAL_CONTACTS;
      }
      return parsed;
    } catch (e) {
      console.error('Failed to load contacts from localStorage:', e);
      return INITIAL_CONTACTS;
    }
  }

  saveContacts(contacts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      return true;
    } catch (e) {
      console.error('Failed to save contacts to localStorage:', e);
      return false;
    }
  }

  resetToDemo() {
    this.saveContacts(INITIAL_CONTACTS);
    return INITIAL_CONTACTS;
  }

  getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  getViewMode() {
    return localStorage.getItem(VIEW_KEY) || 'grid';
  }

  setViewMode(view) {
    localStorage.setItem(VIEW_KEY, view);
  }
}

const Storage = new StorageManager();
