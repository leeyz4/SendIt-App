import { Injectable } from '@angular/core';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  showToast(options: ToastOptions): void {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${this.getBackgroundColor(options.type || 'info')};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      min-width: 300px;
      max-width: 400px;
      word-wrap: break-word;
      animation: slideInRight 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    // Add icon
    const icon = document.createElement('i');
    icon.className = this.getIconClass(options.type || 'info');
    icon.style.cssText = 'font-size: 16px; flex-shrink: 0;';
    toast.appendChild(icon);

    // Add message
    const message = document.createElement('span');
    message.textContent = options.message;
    message.style.cssText = 'flex-grow: 1;';
    toast.appendChild(message);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.7';
    closeBtn.onclick = () => this.removeToast(toast, toastContainer);
    toast.appendChild(closeBtn);

    // Add to container
    toastContainer.appendChild(toast);

    // Auto remove after duration
    const duration = options.duration || 5000;
    setTimeout(() => {
      this.removeToast(toast, toastContainer);
    }, duration);
  }

  private removeToast(toast: HTMLElement, container: HTMLElement): void {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      // Remove container if empty
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }

  private getBackgroundColor(type: string): string {
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#17a2b8';
    }
  }

  private getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-info-circle';
    }
  }

  // Convenience methods
  success(message: string, duration?: number): void {
    this.showToast({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.showToast({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number): void {
    this.showToast({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number): void {
    this.showToast({ message, type: 'info', duration });
  }
} 