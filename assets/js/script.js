import { modalConfigs } from "./modals/modals.js";


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
        
        // Create modals dynamically
        this.createModals();
    }

    createModals() {
        // Clear existing modals
        this.modalOverlay.innerHTML = '';
        
        // Create each modal from config
        modalConfigs.forEach(config => {
            const modalContent = document.createElement('div');
            modalContent.className = 'exp-tracker-modal-content';
            modalContent.id = config.id;
            
            // Add title
            const title = document.createElement('h2');
            title.textContent = config.title;
            modalContent.appendChild(title);
            
            // Create form
            const form = document.createElement('form');
            form.className = 'exp-tracker-modal-form';
            form.action = 'submit';
            
            // Add form fields
            config.fields.forEach(field => {
                const formGroup = document.createElement('div');
                formGroup.className = 'exp-tracker-modal-form-group';
                
                const label = document.createElement('label');
                label.setAttribute('for', field.name);
                label.textContent = field.label;
                formGroup.appendChild(label);

                if (field.isCustom && field.type === 'select') {
                    // Create select element
                    const select = document.createElement('select');
                    select.name = field.name;
                    select.id = `${field.name}-select`;

                    // Add options
                    field.options.forEach(optionText => {
                        const option = document.createElement('option');
                        option.value = optionText;
                        option.textContent = optionText;
                        select.appendChild(option);
                    });
                    formGroup.appendChild(select);

                    // Add "Add Category" button
                    const addButton = document.createElement('button');
                    addButton.textContent = '+ Add Category';
                    addButton.type = 'button'; // Prevent form submission
                    addButton.addEventListener('click', (e) => this.showCategoryInput(e, select));
                    formGroup.appendChild(addButton);
                } else {
                    const input = document.createElement('input');
                    input.type = field.type;
                    input.name = field.name;
                    formGroup.appendChild(input);
                }
                
                form.appendChild(formGroup);
            });
            
            // Add action buttons
            const actions = document.createElement('div');
            actions.className = 'exp-tracker-modal-actions';
            
            const submitButton = document.createElement('button');
            submitButton.textContent = config.submitText;
            
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            
            actions.appendChild(submitButton);
            actions.appendChild(cancelButton);
            form.appendChild(actions);
            
            modalContent.appendChild(form);
            this.modalOverlay.appendChild(modalContent);
            
            // Store references to the modal elements
            this[`${config.id}`] = modalContent;
            this[`${config.id}Form`] = form;
        });
    }

    showCategoryInput(event, select) {
        event.preventDefault();
        const formGroup = event.target.closest('.exp-tracker-modal-form-group');
        const oldContent = formGroup.innerHTML;
        
        formGroup.innerHTML = '';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'new-category';
        input.placeholder = 'Enter new category';
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.classList.add('primary');
        saveButton.type = 'button';
        saveButton.addEventListener('click', () => this.saveCategory(input.value, select, formGroup, oldContent));
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.type = 'button';
        cancelButton.addEventListener('click', () => {
            formGroup.innerHTML = oldContent;
        });
        
        formGroup.appendChild(input);
        formGroup.appendChild(saveButton);
        formGroup.appendChild(cancelButton);
    }

    saveCategory(category, select, formGroup, oldContent) {
        if (category.trim()) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
            select.value = category;
        }
        formGroup.innerHTML = oldContent;
    }

    init() {
        this.addIncomeButton.addEventListener('click', () => this.openModal('add-income-modal'));
        this.addExpenseButton.addEventListener('click', () => this.openModal('add-expense-modal'));
        
        // Add event listeners to all modal buttons
        document.querySelectorAll('.exp-tracker-modal-actions button').forEach(button => {
            button.addEventListener('click', (e) => this.handleModalActions(e, button));
        });
        
        this.prevButton.addEventListener('click', () => this.updateDate(-1));
        this.nextButton.addEventListener('click', () => this.updateDate(1));
        this.todayButton.addEventListener('click', () => this.setTodayDate());
        this.dateInput.addEventListener('change', () => this.updateDateDisplay());

        this.setTodayDate();
        this.renderTransactions();
    }

    openModal(modalId) {
        this.modalOverlay.style.display = 'flex';
        this[modalId].style.display = 'flex';
    }

    closeModal() {
        this.modalOverlay.style.display = 'none';
        document.querySelectorAll('.exp-tracker-modal-content').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    handleModalActions(event, button) {
        event.preventDefault();
        if (button.textContent === 'Cancel') {
            this.closeModal();
            return;
        }
        
        const form = button.closest('form');
        const transaction = this.getFormData(form);
        this.addTransaction(transaction);
        this.closeModal();
    }

    getFormData(form) {
        return Object.fromEntries(new FormData(form).entries());
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.saveTransactions();
        this.renderTransactions();
    }

    renderTransactions() {
        this.transactionList.innerHTML = this.transactions
            .map(transaction => this.createTransactionHTML(transaction))
            .join('');
        this.emptyListParagraph.style.display = this.transactions.length ? 'none' : 'block';
    }

    createTransactionHTML(transaction) {
        return `
            <li>
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
                        <button onclick='app.editTransaction("${transaction.description}")'>Edit</button>
                        <button onclick='app.deleteTransaction("${transaction.description}")'>Delete</button>
                    </div>
                </div>
            </li>`;
    }

    editTransaction(description) {
        console.log(`Editing transaction: ${description}`);
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
}
