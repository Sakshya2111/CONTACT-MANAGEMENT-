/**
 * Pulse Contacts - Contact State & Operations Store
 */

class ContactStore {
  constructor() {
    this.contacts = [];
    this.selectedIds = new Set();
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'name-asc';
    this.lastDeletedContact = null;
    this.lastDeletedIndex = -1;
  }

  init() {
    this.contacts = Storage.loadContacts();
  }

  getAll() {
    return this.contacts;
  }

  getById(id) {
    return this.contacts.find(c => c.id === id) || null;
  }

  add(contactData) {
    const newContact = {
      id: 'cnt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7),
      firstName: (contactData.firstName || '').trim(),
      lastName: (contactData.lastName || '').trim(),
      email: (contactData.email || '').trim(),
      phone: (contactData.phone || '').trim(),
      company: (contactData.company || '').trim(),
      jobTitle: (contactData.jobTitle || '').trim(),
      category: (contactData.category || 'personal').toLowerCase(),
      address: (contactData.address || '').trim(),
      birthday: (contactData.birthday || '').trim(),
      notes: (contactData.notes || '').trim(),
      color: contactData.color || '#6366f1',
      avatarUrl: (contactData.avatarUrl || '').trim(),
      isFavorite: Boolean(contactData.isFavorite),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.contacts.unshift(newContact);
    Storage.saveContacts(this.contacts);
    return newContact;
  }

  update(id, updateData) {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return null;

    const existing = this.contacts[index];
    const updated = {
      ...existing,
      ...updateData,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    this.contacts[index] = updated;
    Storage.saveContacts(this.contacts);
    return updated;
  }

  delete(id) {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.lastDeletedContact = this.contacts[index];
    this.lastDeletedIndex = index;

    this.contacts.splice(index, 1);
    this.selectedIds.delete(id);
    Storage.saveContacts(this.contacts);
    return true;
  }

  undoDelete() {
    if (!this.lastDeletedContact) return null;

    const restored = this.lastDeletedContact;
    const insertIdx = Math.min(Math.max(0, this.lastDeletedIndex), this.contacts.length);
    this.contacts.splice(insertIdx, 0, restored);

    this.lastDeletedContact = null;
    this.lastDeletedIndex = -1;

    Storage.saveContacts(this.contacts);
    return restored;
  }

  toggleFavorite(id) {
    const contact = this.getById(id);
    if (!contact) return false;
    contact.isFavorite = !contact.isFavorite;
    contact.updatedAt = new Date().toISOString();
    Storage.saveContacts(this.contacts);
    return contact.isFavorite;
  }

  bulkDelete(ids) {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    const prevCount = this.contacts.length;
    this.contacts = this.contacts.filter(c => !idSet.has(c.id));
    this.selectedIds.clear();
    Storage.saveContacts(this.contacts);
    return prevCount - this.contacts.length;
  }

  bulkSetCategory(ids, newCategory) {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    let updatedCount = 0;
    this.contacts.forEach(c => {
      if (idSet.has(c.id)) {
        c.category = newCategory.toLowerCase();
        c.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    });
    Storage.saveContacts(this.contacts);
    return updatedCount;
  }

  importContacts(newContacts) {
    if (!Array.isArray(newContacts) || newContacts.length === 0) return 0;
    
    // Check duplicates by email or phone if present
    const existingEmails = new Set(this.contacts.map(c => c.email.toLowerCase()).filter(Boolean));
    const existingPhones = new Set(this.contacts.map(c => c.phone.replace(/\D/g, '')).filter(Boolean));

    let addedCount = 0;
    newContacts.forEach(nc => {
      // If contact has unique email or unique phone or neither is given, add it
      const cleanPhone = (nc.phone || '').replace(/\D/g, '');
      const cleanEmail = (nc.email || '').toLowerCase();

      const isDuplicate = (cleanEmail && existingEmails.has(cleanEmail)) || 
                          (cleanPhone && existingPhones.has(cleanPhone));

      if (!isDuplicate) {
        if (cleanEmail) existingEmails.add(cleanEmail);
        if (cleanPhone) existingPhones.add(cleanPhone);
        this.contacts.unshift(nc);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      Storage.saveContacts(this.contacts);
    }
    return addedCount;
  }

  resetDemo() {
    this.contacts = Storage.resetToDemo();
    this.selectedIds.clear();
    return this.contacts;
  }

  getFilteredAndSorted() {
    let result = [...this.contacts];

    // Filter by Category
    if (this.activeCategory === 'favorites') {
      result = result.filter(c => c.isFavorite);
    } else if (this.activeCategory !== 'all') {
      result = result.filter(c => (c.category || '').toLowerCase() === this.activeCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c => {
        const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
        const email = (c.email || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        const company = (c.company || '').toLowerCase();
        const jobTitle = (c.jobTitle || '').toLowerCase();
        const notes = (c.notes || '').toLowerCase();
        const address = (c.address || '').toLowerCase();

        return fullName.includes(q) ||
               email.includes(q) ||
               phone.includes(q) ||
               company.includes(q) ||
               jobTitle.includes(q) ||
               notes.includes(q) ||
               address.includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc': {
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
          return nameA.localeCompare(nameB);
        }
        case 'name-desc': {
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
          return nameB.localeCompare(nameA);
        }
        case 'company-asc': {
          const compA = (a.company || '').trim().toLowerCase();
          const compB = (b.company || '').trim().toLowerCase();
          return compA.localeCompare(compB);
        }
        case 'recent': {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        case 'oldest': {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        default:
          return 0;
      }
    });

    return result;
  }

  getStats() {
    const total = this.contacts.length;
    const favorites = this.contacts.filter(c => c.isFavorite).length;
    
    // Group counts
    const categories = {
      all: total,
      favorites: favorites,
      work: 0,
      personal: 0,
      family: 0,
      friends: 0,
      vip: 0,
      client: 0
    };

    this.contacts.forEach(c => {
      const cat = (c.category || 'personal').toLowerCase();
      if (categories[cat] !== undefined) {
        categories[cat]++;
      } else {
        categories[cat] = 1;
      }
    });

    return categories;
  }

  toggleSelection(id) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  selectAll(filteredContacts) {
    filteredContacts.forEach(c => this.selectedIds.add(c.id));
  }

  deselectAll() {
    this.selectedIds.clear();
  }
}

const Contacts = new ContactStore();
