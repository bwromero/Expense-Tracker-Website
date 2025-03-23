import { ExpenseTracker } from './ExpenseTracker.js';

// Make app globally accessible
window.app = null;

document.addEventListener('DOMContentLoaded', function () {
    window.app = new ExpenseTracker();
    window.app.init();
}); 