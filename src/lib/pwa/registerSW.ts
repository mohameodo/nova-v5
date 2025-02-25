import { Workbox } from 'workbox-window';

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        // New content is available, show refresh prompt
        if (confirm('New version available! Click OK to update.')) {
          window.location.reload();
        }
      }
    });

    try {
      await wb.register();
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
}
