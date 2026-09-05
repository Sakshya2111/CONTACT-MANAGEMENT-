/**
 * Pulse Contacts - Toast Notification Manager
 */

class ToastManager {
  constructor() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show({ message, type = 'info', duration = 3500, actionText = null, onAction = null }) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconSvg = this._getIcon(type);

    let actionBtnHtml = '';
    if (actionText && onAction) {
      actionBtnHtml = `<button class="toast-action-btn" type="button">${actionText}</button>`;
    }

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-message">${this._escapeHtml(message)}</span>
      </div>
      ${actionBtnHtml}
    `;

    if (actionText && onAction) {
      const btn = toast.querySelector('.toast-action-btn');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onAction();
        this._dismiss(toast);
      });
    }

    this.container.appendChild(toast);

    const timer = setTimeout(() => {
      this._dismiss(toast);
    }, duration);

    toast.addEventListener('click', () => {
      clearTimeout(timer);
      this._dismiss(toast);
    });

    return toast;
  }

  success(message, duration = 3000) {
    return this.show({ message, type: 'success', duration });
  }

  error(message, duration = 4000) {
    return this.show({ message, type: 'error', duration });
  }

  info(message, duration = 3000) {
    return this.show({ message, type: 'info', duration });
  }

  warning(message, duration = 3500) {
    return this.show({ message, type: 'warning', duration });
  }

  _dismiss(toast) {
    if (!toast || toast.classList.contains('toast-exit')) return;
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _getIcon(type) {
    switch (type) {
      case 'success':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      case 'error':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      case 'warning':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
  }
}

const Toast = new ToastManager();
