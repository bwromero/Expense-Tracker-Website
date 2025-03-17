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
        this.addIncomeModal = document.getElementById('add-income-modal');
        this.addExpenseModal = document.getElementById('add-expense-modal');
        this.addIncomeModalParent = this.addIncomeModal.parentElement;
        this.addIncomeForm = this.addIncomeModal.querySelector('form');
        this.addExpenseForm = this.addExpenseModal.querySelector('form');
        this.modalButtons = document.querySelectorAll('.exp-tracker-modal-actions button');
        this.prevButton = document.querySelector('.exp-tracker-day-selector-nav-button:first-of-type');
        this.nextButton = document.querySelector('.exp-tracker-day-selector-nav-button:last-of-type');
        this.todayButton = document.querySelector('#day-selector-today-button');
        this.addCategoryButton = document.getElementById('new-category-button');
        this.categoryFormGroup = document.getElementById('category-form-group');
    }

    init() {
        this.addIncomeButton.addEventListener('click', () => this.openModal(this.addIncomeModal));
        this.addExpenseButton.addEventListener('click', () => this.openModal(this.addExpenseModal));
        this.modalButtons.forEach(button => button.addEventListener('click', (e) => this.handleModalActions(e, button)));
        this.prevButton.addEventListener('click', () => this.updateDate(-1));
        this.nextButton.addEventListener('click', () => this.updateDate(1));
        this.todayButton.addEventListener('click', () => this.setTodayDate());
        this.dateInput.addEventListener('change', () => this.updateDateDisplay());
        this.addCategoryButton.addEventListener('click', () => this.showCategoryInput());

        this.setTodayDate();
        this.renderTransactions();
    }

    showCategoryInput() {
        this.categoryFormGroup.innerHTML = `
            <input type="text" id="new-category" placeholder="Enter new category">
            <button id="save-category">Save</button>
            <button id="cancel-category">Cancel</button>
        `;
        document.getElementById('save-category').addEventListener('click', () => this.saveCategory());
        document.getElementById('cancel-category').addEventListener('click', () => this.hideCategoryInput());
    }

    hideCategoryInput() {
        this.categoryFormGroup.innerHTML = '';
    }

    saveCategory() {
        const newCategory = document.getElementById('new-category').value.trim();
        if (newCategory) {
            console.log(`New category added: ${newCategory}`);
        }
        this.hideCategoryInput();
    }

    openModal(modal) {
        this.addIncomeModalParent.style.display = 'flex';
        modal.style.display = 'flex';
    }

    closeModal() {
        this.addIncomeModalParent.style.display = 'none';
        this.addIncomeModal.style.display = 'none';
        this.addExpenseModal.style.display = 'none';
    }

    handleModalActions(event, button) {
        event.preventDefault();
        const transaction = this.getFormData(button.textContent.includes('income') ? this.addIncomeForm : this.addExpenseForm);
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
                    <div>${transaction.description}</div>
                    <div>
                        <span>${this.formatDateInItalian(this.dateInput.value, true)}</span>
                        <span>${transaction.category || 'Income'}</span>
                    </div>
                </div>
                <div>
                    <div class='${transaction.category ? 'expense' : 'income'}'>
                        ${transaction.category ? '-' : '+'} $${transaction.amount}
                    </div>
                    <div>
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
        const date = new Date(dateString);
        return short ? `${date.getDate()} ${date.toLocaleString('it', { month: 'short' })} ${date.getFullYear()}` : date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    addDays(dateString, days) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
}
