import { modalConfigs } from "./modals/modals.js";
import { Modal } from "./modals/Modal.js";

document.addEventListener('DOMContentLoaded', function () {
    const app = new ExpenseTracker();
    app.init();
});

class ExpenseTracker {
    constructor() {
        this.transactions = this.loadTransactions();
        this.dateInput = document.querySelector('#day-selector-date-input');
        this.dateDisplay = document.querySelector('#day-selector-date-display');
        this.transactionList = document.querySelector('.exp-tracker-list-items');
        this.emptyListParagraph = document.querySelector('.exp-tracker-list-empty');
        this.addIncomeButton = document.getElementById('add-income-button');
        this.addExpenseButton = document.getElementById('add-expense-button');
        this.modalOverlay = document.querySelector('.exp-tracker-modal-overlay');
        this.prevButton = document.querySelector('.exp-tracker-day-selector-nav-button:first-of-type');
        this.nextButton = document.querySelector('.exp-tracker-day-selector-nav-button:last-of-type');
        this.todayButton = document.querySelector('#day-selector-today-button');
        
        // Initialize modals
        this.initializeModals();
        
        // Bind methods that need 'this' context
        this.handleTransactionAction = this.handleTransactionAction.bind(this);
    }

    initializeModals() {
        // Clear existing modals
        this.modalOverlay.innerHTML = '';
        
        // Create modals with their respective handlers
        modalConfigs.forEach(config => {
            const modal = new Modal(config, (formData) => {
                if (formData.editIndex !== undefined) {
                    // Update existing transaction
                    const index = parseInt(formData.editIndex);
                    this.transactions[index] = formData;
                } else {
                    // Add new transaction
                    this.transactions.push(formData);
                }
                this.saveTransactions();
                this.renderTransactions();
            });
            
            // Store modal reference
            this[`${config.id}Modal`] = modal;
        });
    }

    init() {
        this.addIncomeButton.addEventListener('click', () => this.openModal('add-income-modal'));
        this.addExpenseButton.addEventListener('click', () => this.openModal('add-expense-modal'));
        
        // Add event delegation for transaction actions
        this.transactionList.addEventListener('click', this.handleTransactionAction);
        
        this.prevButton.addEventListener('click', () => this.updateDate(-1));
        this.nextButton.addEventListener('click', () => this.updateDate(1));
        this.todayButton.addEventListener('click', () => this.setTodayDate());
        this.dateInput.addEventListener('change', () => this.updateDateDisplay());

        this.setTodayDate();
        this.renderTransactions();
    }

    openModal(modalId) {
        this[`${modalId}Modal`].open();
    }

    editTransaction(description) {
        // Find the transaction to edit
        const index = this.transactions.findIndex(t => t.description === description);
        if (index === -1) return;
        
        const transaction = this.transactions[index];
        const modalId = 'edit-transaction-modal';
        
        // Get the modal and set up edit mode
        const modal = this[`${modalId}Modal`];
        modal.setFormData(transaction);
        modal.setEditMode(index);
        modal.open();
    }

    deleteTransaction(description) {
        this.transactions = this.transactions.filter(transaction => transaction.description !== description);
        this.saveTransactions();
        this.renderTransactions();
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    loadTransactions() {
        return JSON.parse(localStorage.getItem('transactions')) || [];
    }

    setTodayDate() {
        this.dateInput.value = new Date().toISOString().split('T')[0];
        this.updateDateDisplay();
    }

    updateDate(days) {
        this.dateInput.value = this.addDays(this.dateInput.value, days);
        this.updateDateDisplay();
    }

    updateDateDisplay() {
        this.dateDisplay.textContent = this.formatDateInItalian(this.dateInput.value);
    }

    formatDateInItalian(dateString, short = false) {
        const date = new Date(); // Use current date & time
        const formattedDate = new Date(dateString); // Use provided date for correct day/month
    
        const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    
        return short 
            ? `${formattedDate.getDate()} ${formattedDate.toLocaleString('it', { month: 'short' })} ${formattedDate.getFullYear()} ${time}`
            : formattedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    

    addDays(dateString, days) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    handleTransactionAction(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const li = button.closest('li');
        if (!li) return;

        const description = li.dataset.description;
        
        if (button.classList.contains('edit-btn')) {
            this.editTransaction(description);
        } else if (button.classList.contains('delete-btn')) {
            this.deleteTransaction(description);
        }
    }

    renderTransactions() {
        this.transactionList.innerHTML = this.transactions
            .map(transaction => this.createTransactionHTML(transaction))
            .join('');
        this.emptyListParagraph.style.display = this.transactions.length ? 'none' : 'block';
    }

    createTransactionHTML(transaction) {
        return `
            <li data-description="${transaction.description}">
                <div>
                    <div class='exp-tracker-list-description'>${transaction.description}</div>
                    <div class='exp-tracker-list-metadata'>
                        <span>${this.formatDateInItalian(this.dateInput.value, true)}</span>
                        <span>${transaction.category || 'Income'}</span>
                    </div>
                </div>
                <div class='exp-tracker-list-right-section'>
                    <div class='exp-tracker-list-amount ${transaction.category ? 'expense' : 'income'}'>
                        ${transaction.category ? '-' : '+'} $${transaction.amount}
                    </div>
                    <div class='exp-tracker-list-buttons'>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                </div>
            </li>`;
    }
}
