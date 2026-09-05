/**
 * Pulse Contacts - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Contacts Store
  Contacts.init();

  // Elements Cache
  const app = {
    // Top Bar & Controls
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    addContactBtn: document.getElementById('addContactBtn'),
    mobileAddBtn: document.getElementById('mobileAddBtn'),
    importExportBtn: document.getElementById('importExportBtn'),
    resetDemoBtn: document.getElementById('resetDemoBtn'),

    // Navigation & Categories
    navCategoryBtns: document.querySelectorAll('.nav-item-btn'),
    mobileCategoryStrip: document.getElementById('mobileCategoryStrip'),

    // Toolbar & View Switches
    viewGridBtn: document.getElementById('viewGridBtn'),
    viewListBtn: document.getElementById('viewListBtn'),
    sortSelect: document.getElementById('sortSelect'),
    toolbarTitle: document.getElementById('toolbarTitle'),
    toolbarCount: document.getElementById('toolbarCount'),

    // Batch Action Bar
    batchBar: document.getElementById('batchBar'),
    batchCountText: document.getElementById('batchCountText'),
    batchDeleteBtn: document.getElementById('batchDeleteBtn'),
    batchCategoryBtn: document.getElementById('batchCategoryBtn'),
    batchExportBtn: document.getElementById('batchExportBtn'),
    batchDeselectBtn: document.getElementById('batchDeselectBtn'),

    // Main Content Containers
    contactsGrid: document.getElementById('contactsGrid'),
    contactsTableWrap: document.getElementById('contactsTableWrap'),
    contactsTableBody: document.getElementById('contactsTableBody'),
    emptyState: document.getElementById('emptyState'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptyDesc: document.getElementById('emptyDesc'),
    emptyActionBtn: document.getElementById('emptyActionBtn'),

    // Stats
    statTotal: document.getElementById('statTotal'),
    statFavorites: document.getElementById('statFavorites'),

    // Contact Form Modal
    contactModalOverlay: document.getElementById('contactModalOverlay'),
    contactModalForm: document.getElementById('contactModalForm'),
    modalTitle: document.getElementById('modalTitle'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalCancelBtn: document.getElementById('modalCancelBtn'),
    contactIdInput: document.getElementById('contactIdInput'),
    inputFirstName: document.getElementById('inputFirstName'),
    inputLastName: document.getElementById('inputLastName'),
    inputEmail: document.getElementById('inputEmail'),
    inputPhone: document.getElementById('inputPhone'),
    inputCompany: document.getElementById('inputCompany'),
    inputJobTitle: document.getElementById('inputJobTitle'),
    inputCategory: document.getElementById('inputCategory'),
    inputAddress: document.getElementById('inputAddress'),
    inputBirthday: document.getElementById('inputBirthday'),
    inputNotes: document.getElementById('inputNotes'),
    colorSwatches: document.querySelectorAll('.color-swatch-btn'),

    // Detail Drawer
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    contactDrawer: document.getElementById('contactDrawer'),
    drawerCloseBtn: document.getElementById('drawerCloseBtn'),
    drawerAvatar: document.getElementById('drawerAvatar'),
    drawerName: document.getElementById('drawerName'),
    drawerSubtitle: document.getElementById('drawerSubtitle'),
    drawerTag: document.getElementById('drawerTag'),
    drawerCallBtn: document.getElementById('drawerCallBtn'),
    drawerEmailBtn: document.getElementById('drawerEmailBtn'),
    drawerFavoriteBtn: document.getElementById('drawerFavoriteBtn'),
    drawerEmailVal: document.getElementById('drawerEmailVal'),
    drawerPhoneVal: document.getElementById('drawerPhoneVal'),
    drawerCompanyVal: document.getElementById('drawerCompanyVal'),
    drawerAddressVal: document.getElementById('drawerAddressVal'),
    drawerBirthdayVal: document.getElementById('drawerBirthdayVal'),
    drawerNotesVal: document.getElementById('drawerNotesVal'),
    drawerEditBtn: document.getElementById('drawerEditBtn'),
    drawerDeleteBtn: document.getElementById('drawerDeleteBtn'),

    // Delete Confirmation Dialog
    confirmModalOverlay: document.getElementById('confirmModalOverlay'),
    confirmTitle: document.getElementById('confirmTitle'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmOkBtn: document.getElementById('confirmOkBtn'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),

    // Batch Category Modal
    batchCategoryModalOverlay: document.getElementById('batchCategoryModalOverlay'),
    batchCategorySelect: document.getElementById('batchCategorySelect'),
    batchCategoryApplyBtn: document.getElementById('batchCategoryApplyBtn'),
    batchCategoryCancelBtn: document.getElementById('batchCategoryCancelBtn'),

    // Import/Export Modal
    impExpModalOverlay: document.getElementById('impExpModalOverlay'),
    impExpCloseBtn: document.getElementById('impExpCloseBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    exportVcfBtn: document.getElementById('exportVcfBtn'),
    csvFileInput: document.getElementById('csvFileInput'),
    jsonFileInput: document.getElementById('jsonFileInput'),
    modalResetDemoBtn: document.getElementById('modalResetDemoBtn')
  };

  // Internal State
  let currentView = Storage.getViewMode();
  let selectedColor = '#6366f1';
  let activeDrawerContactId = null;
  let confirmCallback = null;

  // Initialize Theme
  const savedTheme = Storage.getTheme();
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Initialize View Mode
  setViewMode(currentView);

  // Render Initial View
  render();

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  // Theme Toggle
  app.themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Storage.setTheme(next);
    updateThemeIcon(next);
    Toast.info(`Switched to ${next} mode`);
  });

  // Search Input
  let searchDebounceTimer;
  app.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      Contacts.searchQuery = e.target.value.trim();
      app.searchClearBtn.style.display = Contacts.searchQuery ? 'flex' : 'none';
      render();
    }, 150);
  });

  app.searchClearBtn.addEventListener('click', () => {
    app.searchInput.value = '';
    Contacts.searchQuery = '';
    app.searchClearBtn.style.display = 'none';
    app.searchInput.focus();
    render();
  });

  // View Switchers
  app.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
  app.viewListBtn.addEventListener('click', () => setViewMode('list'));

  // Sort Dropdown
  app.sortSelect.addEventListener('change', (e) => {
    Contacts.sortBy = e.target.value;
    render();
  });

  // Sidebar Category Filter Buttons
  app.navCategoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      setActiveCategory(category);
    });
  });

  // Add Contact Buttons
  app.addContactBtn.addEventListener('click', () => openContactModal());
  if (app.mobileAddBtn) {
    app.mobileAddBtn.addEventListener('click', () => openContactModal());
  }
  app.emptyActionBtn.addEventListener('click', () => openContactModal());

  // Color Swatches
  app.colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      app.colorSwatches.forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      selectedColor = swatch.getAttribute('data-color');
    });
  });

  // Contact Form Submission
  app.contactModalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleContactFormSubmit();
  });

  app.modalCloseBtn.addEventListener('click', closeContactModal);
  app.modalCancelBtn.addEventListener('click', closeContactModal);

  // Drawer Controls
  app.drawerCloseBtn.addEventListener('click', closeDrawer);
  app.drawerBackdrop.addEventListener('click', closeDrawer);

  app.drawerFavoriteBtn.addEventListener('click', () => {
    if (!activeDrawerContactId) return;
    const isFav = Contacts.toggleFavorite(activeDrawerContactId);
    updateDrawerDetails(Contacts.getById(activeDrawerContactId));
    render();
    Toast.success(isFav ? 'Added to favorites' : 'Removed from favorites');
  });

  app.drawerEditBtn.addEventListener('click', () => {
    if (!activeDrawerContactId) return;
    const contact = Contacts.getById(activeDrawerContactId);
    closeDrawer();
    openContactModal(contact);
  });

  app.drawerDeleteBtn.addEventListener('click', () => {
    if (!activeDrawerContactId) return;
    const contact = Contacts.getById(activeDrawerContactId);
    showConfirmDialog(
      'Delete Contact',
      `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`,
      () => {
        Contacts.delete(contact.id);
        closeDrawer();
        render();
        Toast.show({
          message: `Deleted ${contact.firstName} ${contact.lastName}`,
          type: 'warning',
          actionText: 'Undo',
          onAction: () => {
            Contacts.undoDelete();
            render();
            Toast.success('Contact restored');
          }
        });
      }
    );
  });

  // Copy Buttons in Drawer
  document.querySelectorAll('.copy-mini-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl && targetEl.textContent && targetEl.textContent !== '—') {
        navigator.clipboard.writeText(targetEl.textContent.trim());
        Toast.info('Copied to clipboard!');
      }
    });
  });

  // Batch Action Bar Buttons
  app.batchDeselectBtn.addEventListener('click', () => {
    Contacts.deselectAll();
    render();
  });

  app.batchDeleteBtn.addEventListener('click', () => {
    const count = Contacts.selectedIds.size;
    if (count === 0) return;
    showConfirmDialog(
      'Delete Selected Contacts',
      `Are you sure you want to delete ${count} selected contact${count > 1 ? 's' : ''}?`,
      () => {
        const deleted = Contacts.bulkDelete(Array.from(Contacts.selectedIds));
        render();
        Toast.warning(`Deleted ${deleted} contacts.`);
      }
    );
  });

  app.batchCategoryBtn.addEventListener('click', () => {
    if (Contacts.selectedIds.size === 0) return;
    openBatchCategoryModal();
  });

  app.batchCategoryCancelBtn.addEventListener('click', closeBatchCategoryModal);
  app.batchCategoryApplyBtn.addEventListener('click', () => {
    const newCat = app.batchCategorySelect.value;
    const updated = Contacts.bulkSetCategory(Array.from(Contacts.selectedIds), newCat);
    closeBatchCategoryModal();
    Contacts.deselectAll();
    render();
    Toast.success(`Updated category for ${updated} contacts.`);
  });

  app.batchExportBtn.addEventListener('click', () => {
    const selectedContacts = Contacts.getAll().filter(c => Contacts.selectedIds.has(c.id));
    if (selectedContacts.length === 0) return;
    ImpExp.exportCSV(selectedContacts, `contacts-selected-${Date.now()}.csv`);
    Toast.success(`Exported ${selectedContacts.length} contacts to CSV.`);
  });

  // Import / Export Modal
  app.importExportBtn.addEventListener('click', openImpExpModal);
  app.impExpCloseBtn.addEventListener('click', closeImpExpModal);

  app.exportCsvBtn.addEventListener('click', () => {
    const contacts = Contacts.getFilteredAndSorted();
    try {
      ImpExp.exportCSV(contacts, `contacts-${Contacts.activeCategory}-${Date.now()}.csv`);
      Toast.success('Exported contacts as CSV');
    } catch (e) {
      Toast.error(e.message);
    }
  });

  app.exportJsonBtn.addEventListener('click', () => {
    const contacts = Contacts.getFilteredAndSorted();
    try {
      ImpExp.exportJSON(contacts, `contacts-${Contacts.activeCategory}-${Date.now()}.json`);
      Toast.success('Exported contacts as JSON');
    } catch (e) {
      Toast.error(e.message);
    }
  });

  app.exportVcfBtn.addEventListener('click', () => {
    const contacts = Contacts.getFilteredAndSorted();
    try {
      ImpExp.exportVCard(contacts, `contacts-${Contacts.activeCategory}-${Date.now()}.vcf`);
      Toast.success('Exported contacts as vCard');
    } catch (e) {
      Toast.error(e.message);
    }
  });

  app.csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = ImpExp.parseCSV(event.target.result);
        const count = Contacts.importContacts(parsed);
        render();
        closeImpExpModal();
        Toast.success(`Successfully imported ${count} new contact${count !== 1 ? 's' : ''}!`);
      } catch (err) {
        Toast.error(err.message || 'Error parsing CSV file');
      }
      app.csvFileInput.value = '';
    };
    reader.readAsText(file);
  });

  app.jsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = ImpExp.parseJSON(event.target.result);
        const count = Contacts.importContacts(parsed);
        render();
        closeImpExpModal();
        Toast.success(`Successfully imported ${count} new contact${count !== 1 ? 's' : ''}!`);
      } catch (err) {
        Toast.error(err.message || 'Error parsing JSON file');
      }
      app.jsonFileInput.value = '';
    };
    reader.readAsText(file);
  });

  // Reset to Demo Data
  const handleResetDemo = () => {
    showConfirmDialog(
      'Reset Demo Contacts',
      'This will reset all contacts back to the original sample dataset. Continue?',
      () => {
        Contacts.resetDemo();
        render();
        closeImpExpModal();
        Toast.info('Demo contacts restored');
      }
    );
  };

  if (app.resetDemoBtn) app.resetDemoBtn.addEventListener('click', handleResetDemo);
  if (app.modalResetDemoBtn) app.modalResetDemoBtn.addEventListener('click', handleResetDemo);

  // Confirm Dialog Cancel & OK
  app.confirmCancelBtn.addEventListener('click', closeConfirmDialog);
  app.confirmOkBtn.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirmDialog();
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape closes modals and drawers
    if (e.key === 'Escape') {
      closeContactModal();
      closeDrawer();
      closeConfirmDialog();
      closeImpExpModal();
      closeBatchCategoryModal();
    }

    // '/' or Ctrl+K focuses search
    if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement !== app.searchInput && !isAnyModalOpen()) {
      e.preventDefault();
      app.searchInput.focus();
    }

    // 'n' key opens new contact when not typing in inputs
    if (e.key.toLowerCase() === 'n' && !isFormInput(document.activeElement) && !isAnyModalOpen()) {
      e.preventDefault();
      openContactModal();
    }
  });

  /* ==========================================================================
     Render Pipeline
     ========================================================================== */

  function render() {
    const filtered = Contacts.getFilteredAndSorted();
    const stats = Contacts.getStats();

    // Update Toolbar Headers
    const categoryTitle = Contacts.activeCategory === 'all' 
      ? 'All Contacts' 
      : Contacts.activeCategory === 'favorites' 
        ? 'Favorite Contacts' 
        : `${capitalize(Contacts.activeCategory)} Contacts`;

    app.toolbarTitle.textContent = categoryTitle;
    app.toolbarCount.textContent = `(${filtered.length})`;

    // Update Stats Numbers
    if (app.statTotal) app.statTotal.textContent = stats.all;
    if (app.statFavorites) app.statFavorites.textContent = stats.favorites;

    // Update Category Nav Badges
    app.navCategoryBtns.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const badge = btn.querySelector('.nav-badge');
      if (badge && stats[cat] !== undefined) {
        badge.textContent = stats[cat];
      }
      btn.classList.toggle('active', cat === Contacts.activeCategory);
    });

    // Render Mobile Category Strip
    renderMobileCategoryStrip(stats);

    // Update Batch Bar
    const selectedCount = Contacts.selectedIds.size;
    if (selectedCount > 0) {
      app.batchBar.style.display = 'flex';
      app.batchCountText.textContent = `${selectedCount} contact${selectedCount > 1 ? 's' : ''} selected`;
    } else {
      app.batchBar.style.display = 'none';
    }

    // Check Empty State
    if (filtered.length === 0) {
      app.contactsGrid.style.display = 'none';
      app.contactsTableWrap.style.display = 'none';
      app.emptyState.style.display = 'flex';

      if (Contacts.searchQuery) {
        app.emptyTitle.textContent = 'No contacts found';
        app.emptyDesc.textContent = `We couldn't find any contacts matching "${Contacts.searchQuery}". Try a different keyword.`;
        app.emptyActionBtn.style.display = 'none';
      } else if (Contacts.activeCategory === 'favorites') {
        app.emptyTitle.textContent = 'No favorite contacts yet';
        app.emptyDesc.textContent = 'Star your most important contacts to access them quickly here.';
        app.emptyActionBtn.style.display = 'none';
      } else {
        app.emptyTitle.textContent = 'No contacts in this category';
        app.emptyDesc.textContent = 'Add a new contact or import from a file to get started.';
        app.emptyActionBtn.style.display = 'inline-flex';
      }
      return;
    }

    app.emptyState.style.display = 'none';

    if (currentView === 'grid') {
      app.contactsGrid.style.display = 'grid';
      app.contactsTableWrap.style.display = 'none';
      renderGridView(filtered);
    } else {
      app.contactsGrid.style.display = 'none';
      app.contactsTableWrap.style.display = 'block';
      renderTableView(filtered);
    }
  }

  function renderMobileCategoryStrip(stats) {
    if (!app.mobileCategoryStrip) return;
    const categories = [
      { id: 'all', label: 'All' },
      { id: 'favorites', label: 'Favorites' },
      { id: 'work', label: 'Work' },
      { id: 'personal', label: 'Personal' },
      { id: 'family', label: 'Family' },
      { id: 'friends', label: 'Friends' },
      { id: 'vip', label: 'VIP' },
      { id: 'client', label: 'Client' }
    ];

    app.mobileCategoryStrip.innerHTML = categories.map(cat => {
      const activeClass = cat.id === Contacts.activeCategory ? 'active' : '';
      const count = stats[cat.id] || 0;
      return `
        <button type="button" class="mobile-category-pill ${activeClass}" data-category="${cat.id}">
          <span class="category-dot ${cat.id}"></span>
          <span>${cat.label}</span>
          <span style="opacity:0.7">(${count})</span>
        </button>
      `;
    }).join('');

    app.mobileCategoryStrip.querySelectorAll('.mobile-category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        setActiveCategory(cat);
      });
    });
  }

  function renderGridView(contacts) {
    app.contactsGrid.innerHTML = contacts.map(c => {
      const initials = getInitials(c.firstName, c.lastName);
      const isSelected = Contacts.selectedIds.has(c.id);
      const isFav = c.isFavorite;

      return `
        <div class="contact-card fade-in ${isSelected ? 'selected' : ''}" data-id="${c.id}">
          <div class="card-header">
            <div class="card-identity">
              <div class="avatar" style="background-color: ${c.color || '#6366f1'}">
                ${c.avatarUrl ? `<img src="${c.avatarUrl}" alt="${c.firstName}">` : initials}
              </div>
              <div class="card-name-wrap">
                <div class="card-name">${escapeHtml(`${c.firstName} ${c.lastName}`.trim())}</div>
                <div class="card-company">${escapeHtml(c.jobTitle ? `${c.jobTitle} ${c.company ? '• ' + c.company : ''}` : c.company || 'Personal Contact')}</div>
              </div>
            </div>
            <div class="card-top-actions">
              <button type="button" class="star-btn ${isFav ? 'active' : ''}" data-action="favorite" data-id="${c.id}" title="${isFav ? 'Remove Favorite' : 'Add Favorite'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </button>
              <input type="checkbox" class="card-checkbox" data-action="select" data-id="${c.id}" ${isSelected ? 'checked' : ''} title="Select Contact">
            </div>
          </div>

          <div class="card-body">
            ${c.email ? `
              <a href="mailto:${escapeHtml(c.email)}" class="card-info-item" data-action="prevent-card" title="Send Email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                <span>${escapeHtml(c.email)}</span>
              </a>
            ` : ''}

            ${c.phone ? `
              <a href="tel:${escapeHtml(c.phone)}" class="card-info-item" data-action="prevent-card" title="Call Phone">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>${escapeHtml(c.phone)}</span>
              </a>
            ` : ''}
          </div>

          <div class="card-footer">
            <span class="badge badge-${c.category || 'personal'}">${escapeHtml(c.category || 'personal')}</span>
            <div class="card-actions-quick">
              <button type="button" class="quick-action-btn" data-action="edit" data-id="${c.id}" title="Edit Contact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
              </button>
              <button type="button" class="quick-action-btn delete" data-action="delete" data-id="${c.id}" title="Delete Contact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindContactCardEvents(app.contactsGrid);
  }

  function renderTableView(contacts) {
    const allSelected = contacts.length > 0 && contacts.every(c => Contacts.selectedIds.has(c.id));

    app.contactsTableBody.innerHTML = contacts.map(c => {
      const initials = getInitials(c.firstName, c.lastName);
      const isSelected = Contacts.selectedIds.has(c.id);
      const isFav = c.isFavorite;

      return `
        <tr class="${isSelected ? 'selected' : ''}" data-id="${c.id}">
          <td style="width: 40px;" data-action="prevent-card">
            <input type="checkbox" class="card-checkbox" data-action="select" data-id="${c.id}" ${isSelected ? 'checked' : ''}>
          </td>
          <td style="width: 40px;" data-action="prevent-card">
            <button type="button" class="star-btn ${isFav ? 'active' : ''}" data-action="favorite" data-id="${c.id}" title="${isFav ? 'Remove Favorite' : 'Add Favorite'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
          </td>
          <td>
            <div class="table-identity">
              <div class="avatar sm" style="background-color: ${c.color || '#6366f1'}">
                ${c.avatarUrl ? `<img src="${c.avatarUrl}" alt="${c.firstName}">` : initials}
              </div>
              <div>
                <div class="table-name">${escapeHtml(`${c.firstName} ${c.lastName}`.trim())}</div>
                <div class="table-title">${escapeHtml(c.jobTitle || '')}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(c.email || '—')}</td>
          <td>${escapeHtml(c.phone || '—')}</td>
          <td>${escapeHtml(c.company || '—')}</td>
          <td><span class="badge badge-${c.category || 'personal'}">${escapeHtml(c.category || 'personal')}</span></td>
          <td style="text-align: right;" data-action="prevent-card">
            <div class="table-actions">
              <button type="button" class="quick-action-btn" data-action="edit" data-id="${c.id}" title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
              </button>
              <button type="button" class="quick-action-btn delete" data-action="delete" data-id="${c.id}" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const tableSelectAll = document.getElementById('tableSelectAll');
    if (tableSelectAll) {
      tableSelectAll.checked = allSelected;
      tableSelectAll.onchange = () => {
        if (tableSelectAll.checked) {
          Contacts.selectAll(contacts);
        } else {
          Contacts.deselectAll();
        }
        render();
      };
    }

    bindContactCardEvents(app.contactsTableBody);
  }

  function bindContactCardEvents(container) {
    container.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      const cardEl = e.target.closest('[data-id]');
      if (!cardEl) return;

      const contactId = cardEl.getAttribute('data-id');

      if (actionEl) {
        const action = actionEl.getAttribute('data-action');

        if (action === 'prevent-card') {
          return;
        }

        if (action === 'favorite') {
          e.stopPropagation();
          const isFav = Contacts.toggleFavorite(contactId);
          render();
          Toast.success(isFav ? 'Added to favorites' : 'Removed from favorites');
          return;
        }

        if (action === 'select') {
          e.stopPropagation();
          Contacts.toggleSelection(contactId);
          render();
          return;
        }

        if (action === 'edit') {
          e.stopPropagation();
          const contact = Contacts.getById(contactId);
          if (contact) openContactModal(contact);
          return;
        }

        if (action === 'delete') {
          e.stopPropagation();
          const contact = Contacts.getById(contactId);
          if (!contact) return;
          showConfirmDialog(
            'Delete Contact',
            `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`,
            () => {
              Contacts.delete(contact.id);
              render();
              Toast.show({
                message: `Deleted ${contact.firstName} ${contact.lastName}`,
                type: 'warning',
                actionText: 'Undo',
                onAction: () => {
                  Contacts.undoDelete();
                  render();
                  Toast.success('Contact restored');
                }
              });
            }
          );
          return;
        }
      }

      // If clicked anywhere else on the card/row, open detail drawer
      const contact = Contacts.getById(contactId);
      if (contact) {
        openDrawer(contact);
      }
    });
  }

  /* ==========================================================================
     Modal & Drawer Handlers
     ========================================================================== */

  function openContactModal(contact = null) {
    if (contact) {
      app.modalTitle.textContent = 'Edit Contact';
      app.contactIdInput.value = contact.id;
      app.inputFirstName.value = contact.firstName || '';
      app.inputLastName.value = contact.lastName || '';
      app.inputEmail.value = contact.email || '';
      app.inputPhone.value = contact.phone || '';
      app.inputCompany.value = contact.company || '';
      app.inputJobTitle.value = contact.jobTitle || '';
      app.inputCategory.value = contact.category || 'personal';
      app.inputAddress.value = contact.address || '';
      app.inputBirthday.value = contact.birthday || '';
      app.inputNotes.value = contact.notes || '';
      selectedColor = contact.color || '#6366f1';
    } else {
      app.modalTitle.textContent = 'New Contact';
      app.contactModalForm.reset();
      app.contactIdInput.value = '';
      app.inputCategory.value = Contacts.activeCategory !== 'all' && Contacts.activeCategory !== 'favorites' ? Contacts.activeCategory : 'personal';
      selectedColor = '#6366f1';
    }

    app.colorSwatches.forEach(swatch => {
      swatch.classList.toggle('selected', swatch.getAttribute('data-color') === selectedColor);
    });

    app.contactModalOverlay.classList.add('active');
    setTimeout(() => app.inputFirstName.focus(), 100);
  }

  function closeContactModal() {
    app.contactModalOverlay.classList.remove('active');
  }

  function handleContactFormSubmit() {
    const firstName = app.inputFirstName.value.trim();
    const lastName = app.inputLastName.value.trim();

    if (!firstName && !lastName) {
      Toast.error('Please enter at least a first or last name.');
      app.inputFirstName.focus();
      return;
    }

    const contactData = {
      firstName,
      lastName,
      email: app.inputEmail.value.trim(),
      phone: app.inputPhone.value.trim(),
      company: app.inputCompany.value.trim(),
      jobTitle: app.inputJobTitle.value.trim(),
      category: app.inputCategory.value,
      address: app.inputAddress.value.trim(),
      birthday: app.inputBirthday.value.trim(),
      notes: app.inputNotes.value.trim(),
      color: selectedColor
    };

    const id = app.contactIdInput.value;
    if (id) {
      Contacts.update(id, contactData);
      Toast.success('Contact updated successfully!');
      if (activeDrawerContactId === id) {
        updateDrawerDetails(Contacts.getById(id));
      }
    } else {
      Contacts.add(contactData);
      Toast.success('New contact created!');
    }

    closeContactModal();
    render();
  }

  function openDrawer(contact) {
    activeDrawerContactId = contact.id;
    updateDrawerDetails(contact);
    app.drawerBackdrop.classList.add('active');
    app.contactDrawer.classList.add('active');
  }

  function updateDrawerDetails(contact) {
    if (!contact) return;
    const initials = getInitials(contact.firstName, contact.lastName);

    app.drawerAvatar.style.backgroundColor = contact.color || '#6366f1';
    app.drawerAvatar.innerHTML = contact.avatarUrl ? `<img src="${contact.avatarUrl}" alt="${contact.firstName}">` : initials;
    app.drawerName.textContent = `${contact.firstName} ${contact.lastName}`.trim() || 'Unnamed Contact';
    app.drawerSubtitle.textContent = contact.jobTitle ? `${contact.jobTitle} ${contact.company ? '• ' + contact.company : ''}` : contact.company || 'Contact Details';

    app.drawerTag.textContent = contact.category || 'personal';
    app.drawerTag.className = `badge badge-${contact.category || 'personal'}`;

    app.drawerFavoriteBtn.classList.toggle('active', Boolean(contact.isFavorite));
    app.drawerFavoriteBtn.title = contact.isFavorite ? 'Remove Favorite' : 'Add Favorite';

    // Quick Call & Email links
    if (contact.phone) {
      app.drawerCallBtn.href = `tel:${contact.phone}`;
      app.drawerCallBtn.style.opacity = '1';
      app.drawerCallBtn.style.pointerEvents = 'auto';
    } else {
      app.drawerCallBtn.removeAttribute('href');
      app.drawerCallBtn.style.opacity = '0.35';
      app.drawerCallBtn.style.pointerEvents = 'none';
    }

    if (contact.email) {
      app.drawerEmailBtn.href = `mailto:${contact.email}`;
      app.drawerEmailBtn.style.opacity = '1';
      app.drawerEmailBtn.style.pointerEvents = 'auto';
    } else {
      app.drawerEmailBtn.removeAttribute('href');
      app.drawerEmailBtn.style.opacity = '0.35';
      app.drawerEmailBtn.style.pointerEvents = 'none';
    }

    // Detail Fields
    app.drawerEmailVal.textContent = contact.email || '—';
    app.drawerPhoneVal.textContent = contact.phone || '—';
    app.drawerCompanyVal.textContent = contact.company ? `${contact.company} ${contact.jobTitle ? `(${contact.jobTitle})` : ''}` : '—';
    app.drawerAddressVal.textContent = contact.address || '—';
    app.drawerBirthdayVal.textContent = contact.birthday ? formatDate(contact.birthday) : '—';
    app.drawerNotesVal.textContent = contact.notes || '—';
  }

  function closeDrawer() {
    app.drawerBackdrop.classList.remove('active');
    app.contactDrawer.classList.remove('active');
    activeDrawerContactId = null;
  }

  function showConfirmDialog(title, message, onOk) {
    app.confirmTitle.textContent = title;
    app.confirmMessage.textContent = message;
    confirmCallback = onOk;
    app.confirmModalOverlay.classList.add('active');
  }

  function closeConfirmDialog() {
    app.confirmModalOverlay.classList.remove('active');
    confirmCallback = null;
  }

  function openBatchCategoryModal() {
    app.batchCategoryModalOverlay.classList.add('active');
  }

  function closeBatchCategoryModal() {
    app.batchCategoryModalOverlay.classList.remove('active');
  }

  function openImpExpModal() {
    app.impExpModalOverlay.classList.add('active');
  }

  function closeImpExpModal() {
    app.impExpModalOverlay.classList.remove('active');
  }

  /* ==========================================================================
     Helper Functions
     ========================================================================== */

  function setViewMode(mode) {
    currentView = mode;
    Storage.setViewMode(mode);
    app.viewGridBtn.classList.toggle('active', mode === 'grid');
    app.viewListBtn.classList.toggle('active', mode === 'list');
    render();
  }

  function setActiveCategory(cat) {
    Contacts.activeCategory = cat;
    render();
  }

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      app.themeToggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      app.themeToggleBtn.title = 'Switch to Light Mode';
    } else {
      app.themeToggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      `;
      app.themeToggleBtn.title = 'Switch to Dark Mode';
    }
  }

  function getInitials(first, last) {
    const f = (first || '').trim().charAt(0).toUpperCase();
    const l = (last || '').trim().charAt(0).toUpperCase();
    return (f + l) || '?';
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatDate(dateString) {
    try {
      const [year, month, day] = dateString.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function isFormInput(el) {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  function isAnyModalOpen() {
    return app.contactModalOverlay.classList.contains('active') ||
           app.confirmModalOverlay.classList.contains('active') ||
           app.impExpModalOverlay.classList.contains('active') ||
           app.batchCategoryModalOverlay.classList.contains('active') ||
           app.contactDrawer.classList.contains('active');
  }
});
