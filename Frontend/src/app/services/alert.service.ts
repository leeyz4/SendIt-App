import { Injectable } from '@angular/core';

export interface AlertOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  
  showAlert(options: AlertOptions): Promise<boolean> {
    return new Promise((resolve) => {
      // Create alert container
      const alertContainer = document.createElement('div');
      alertContainer.className = 'custom-alert-overlay';
      
      // Create alert box
      const alertBox = document.createElement('div');
      alertBox.className = `custom-alert custom-alert-${options.type || 'info'}`;
      
      // Create header
      const header = document.createElement('div');
      header.className = 'custom-alert-header';
      
      const icon = document.createElement('i');
      icon.className = this.getIconClass(options.type || 'info');
      
      const title = document.createElement('h3');
      title.textContent = options.title || this.getDefaultTitle(options.type || 'info');
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'custom-alert-close';
      closeBtn.innerHTML = '<i class="fas fa-times"></i>';
      closeBtn.onclick = () => {
        document.body.removeChild(alertContainer);
        resolve(false);
      };
      
      header.appendChild(icon);
      header.appendChild(title);
      header.appendChild(closeBtn);
      
      // Create message
      const message = document.createElement('div');
      message.className = 'custom-alert-message';
      message.innerHTML = options.message;
      
      // Create buttons
      const buttons = document.createElement('div');
      buttons.className = 'custom-alert-buttons';
      
      if (options.showCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'custom-alert-btn custom-alert-btn-cancel';
        cancelBtn.textContent = options.cancelText || 'Cancel';
        cancelBtn.onclick = () => {
          document.body.removeChild(alertContainer);
          resolve(false);
        };
        buttons.appendChild(cancelBtn);
      }
      
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'custom-alert-btn custom-alert-btn-confirm';
      confirmBtn.textContent = options.confirmText || 'OK';
      confirmBtn.onclick = () => {
        document.body.removeChild(alertContainer);
        resolve(true);
      };
      buttons.appendChild(confirmBtn);
      
      // Assemble alert
      alertBox.appendChild(header);
      alertBox.appendChild(message);
      alertBox.appendChild(buttons);
      alertContainer.appendChild(alertBox);
      
      // Add to DOM
      document.body.appendChild(alertContainer);
      
      // Focus on confirm button
      setTimeout(() => confirmBtn.focus(), 100);
    });
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
  
  private getDefaultTitle(type: string): string {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Information';
    }
  }
  
  // Convenience methods
  success(message: string, title?: string): Promise<boolean> {
    return this.showAlert({ message, title, type: 'success' });
  }
  
  error(message: string, title?: string): Promise<boolean> {
    return this.showAlert({ message, title, type: 'error' });
  }
  
  warning(message: string, title?: string): Promise<boolean> {
    return this.showAlert({ message, title, type: 'warning' });
  }
  
  info(message: string, title?: string): Promise<boolean> {
    return this.showAlert({ message, title, type: 'info' });
  }
  
  confirm(message: string, title?: string): Promise<boolean> {
    return this.showAlert({ 
      message, 
      title, 
      type: 'warning', 
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'No'
    });
  }
} 