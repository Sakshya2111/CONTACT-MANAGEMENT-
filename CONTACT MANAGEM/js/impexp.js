/**
 * Pulse Contacts - Import & Export Engine (JSON, CSV, vCard)
 */

class ImportExportEngine {
  /**
   * Export contacts to JSON file
   */
  exportJSON(contacts, filename = 'pulse-contacts.json') {
    const dataStr = JSON.stringify(contacts, null, 2);
    this._downloadFile(dataStr, filename, 'application/json');
  }

  /**
   * Export contacts to CSV file
   */
  exportCSV(contacts, filename = 'pulse-contacts.csv') {
    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts to export.');
    }

    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Job Title',
      'Category',
      'Address',
      'Birthday',
      'Favorite',
      'Notes'
    ];

    const rows = contacts.map(c => [
      c.firstName || '',
      c.lastName || '',
      c.email || '',
      c.phone || '',
      c.company || '',
      c.jobTitle || '',
      c.category || '',
      c.address || '',
      c.birthday || '',
      c.isFavorite ? 'Yes' : 'No',
      c.notes || ''
    ]);

    const csvContent = [
      headers.map(h => this._escapeCSV(h)).join(','),
      ...rows.map(row => row.map(cell => this._escapeCSV(cell)).join(','))
    ].join('\r\n');

    this._downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Export single or multiple contacts to vCard (.vcf)
   */
  exportVCard(contacts, filename = 'pulse-contacts.vcf') {
    if (!Array.isArray(contacts)) contacts = [contacts];
    if (contacts.length === 0) throw new Error('No contacts to export.');

    const vcards = contacts.map(c => {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${this._escapeVCard(c.lastName || '')};${this._escapeVCard(c.firstName || '')};;;`,
        `FN:${this._escapeVCard(`${c.firstName || ''} ${c.lastName || ''}`.trim())}`
      ];

      if (c.company) lines.push(`ORG:${this._escapeVCard(c.company)}`);
      if (c.jobTitle) lines.push(`TITLE:${this._escapeVCard(c.jobTitle)}`);
      if (c.email) lines.push(`EMAIL;type=INTERNET,pref:${this._escapeVCard(c.email)}`);
      if (c.phone) lines.push(`TEL;type=CELL,voice:${this._escapeVCard(c.phone)}`);
      if (c.address) lines.push(`ADR;type=HOME:;;${this._escapeVCard(c.address)};;;;`);
      if (c.birthday) lines.push(`BDAY:${c.birthday}`);
      if (c.category) lines.push(`CATEGORIES:${this._escapeVCard(c.category)}`);
      if (c.notes) lines.push(`NOTE:${this._escapeVCard(c.notes)}`);

      lines.push('END:VCARD');
      return lines.join('\r\n');
    });

    const vcfContent = vcards.join('\r\n\r\n');
    this._downloadFile(vcfContent, filename, 'text/vcard;charset=utf-8;');
  }

  /**
   * Parse JSON string or file content into contacts array
   */
  parseJSON(jsonString) {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new Error('Invalid JSON format. Please check the file content.');
    }

    if (!Array.isArray(parsed)) {
      if (typeof parsed === 'object' && parsed !== null) {
        parsed = [parsed];
      } else {
        throw new Error('JSON must contain an array of contacts or a contact object.');
      }
    }

    return parsed.map(item => this._normalizeContact(item));
  }

  /**
   * Parse CSV string into contacts array
   */
  parseCSV(csvString) {
    const lines = this._parseCSVLines(csvString);
    if (lines.length < 2) {
      throw new Error('CSV file must have a header row and at least one contact row.');
    }

    const header = lines[0].map(h => h.trim().toLowerCase());
    const contacts = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

      const rowObj = {};
      header.forEach((key, idx) => {
        rowObj[key] = (row[idx] || '').trim();
      });

      const contact = {
        id: 'imported-' + Math.random().toString(36).substring(2, 9),
        firstName: rowObj['first name'] || rowObj['firstname'] || rowObj['first'] || rowObj['name'] || '',
        lastName: rowObj['last name'] || rowObj['lastname'] || rowObj['last'] || '',
        email: rowObj['email'] || rowObj['e-mail'] || rowObj['mail'] || '',
        phone: rowObj['phone'] || rowObj['tel'] || rowObj['telephone'] || rowObj['mobile'] || '',
        company: rowObj['company'] || rowObj['organization'] || rowObj['org'] || '',
        jobTitle: rowObj['job title'] || rowObj['jobtitle'] || rowObj['title'] || rowObj['role'] || '',
        category: (rowObj['category'] || rowObj['group'] || 'personal').toLowerCase(),
        address: rowObj['address'] || rowObj['location'] || '',
        birthday: rowObj['birthday'] || rowObj['bday'] || '',
        isFavorite: ['yes', 'true', '1', 'y'].includes((rowObj['favorite'] || '').toLowerCase()),
        notes: rowObj['notes'] || rowObj['note'] || rowObj['comments'] || '',
        color: this._getRandomColor(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (contact.firstName || contact.lastName || contact.email || contact.phone) {
        contacts.push(contact);
      }
    }

    if (contacts.length === 0) {
      throw new Error('No valid contacts found in CSV.');
    }

    return contacts;
  }

  _normalizeContact(item) {
    return {
      id: item.id || ('imported-' + Math.random().toString(36).substring(2, 9)),
      firstName: (item.firstName || item.name || '').trim(),
      lastName: (item.lastName || '').trim(),
      email: (item.email || '').trim(),
      phone: (item.phone || '').trim(),
      company: (item.company || '').trim(),
      jobTitle: (item.jobTitle || item.title || '').trim(),
      category: (item.category || 'personal').toLowerCase(),
      address: (item.address || '').trim(),
      birthday: (item.birthday || '').trim(),
      isFavorite: Boolean(item.isFavorite),
      notes: (item.notes || '').trim(),
      color: item.color || this._getRandomColor(),
      avatarUrl: item.avatarUrl || '',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  _escapeCSV(str) {
    if (str === null || str === undefined) return '""';
    const stringVal = String(str);
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  }

  _escapeVCard(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  _downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  _parseCSVLines(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell);
        if (currentRow.length > 0 && currentRow.some(c => c.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }

    return rows;
  }

  _getRandomColor() {
    const colors = ['#6366f1', '#06b6d4', '#38bdf8', '#c084fc', '#34d399', '#fbbf24', '#f43f5e', '#2dd4bf'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

const ImpExp = new ImportExportEngine();
