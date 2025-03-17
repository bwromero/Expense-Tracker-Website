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
        this.initExpenseCategoryComponents();

        this.addIncomeButton.addEventListener('click', () => this.openModal(this.addIncomeModal));
        this.addExpenseButton.addEventListener('click', () => this.openModal(this.addExpenseModal));
        this.modalButtons.forEach(button => button.addEventListener('click', (e) => this.handleModalActions(e, button)));
        this.prevButton.addEventListener('click', () => this.updateDate(-1));
        this.nextButton.addEventListener('click', () => this.updateDate(1));
        this.todayButton.addEventListener('click', () => this.setTodayDate());
        this.dateInput.addEventListener('change', () => this.updateDateDisplay());

        this.setTodayDate();
        this.renderTransactions();
    }

    showCategoryInput(event) {
        event.preventDefault();
        this.categoryFormGroup.innerHTML = '';
        
        const input = document.createElement("input");
        input.type = "text";
        input.id = "new-category";
        input.placeholder = "Enter new category";

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("primary");
        saveButton.id = "save-category";
        saveButton.addEventListener("click", () => this.saveCategory());

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.id = "cancel-category";
        cancelButton.addEventListener("click", (e) => this.hideCategoryInput(e));

        this.categoryFormGroup.appendChild(input);
        this.categoryFormGroup.appendChild(saveButton);
        this.categoryFormGroup.appendChild(cancelButton);
    }

    hideCategoryInput(event) {
        event.preventDefault();
        this.categoryFormGroup.innerHTML = '';

        this.initExpenseCategoryComponents();
    }

    initExpenseCategoryComponents() {
        this.categoryFormGroup.appendChild(this.createCategoryLabel());
        this.categoryFormGroup.appendChild(this.createCategorySelect());
        this.categoryFormGroup.appendChild(this.createAddCategoryButton());
    }

    createCategoryLabel(){
        const categoryLabel = document.createElement("label");
        categoryLabel.for = "category";
        categoryLabel.textContent = "Category";

        return categoryLabel;
    }

    createCategorySelect(){
        const addCategorySelect = document.createElement("select");
        addCategorySelect.name = "category";
        addCategorySelect.id = "category-select";
        addCategorySelect.option = "option 1";

        const option = document.createElement("option");
        option.value = "option 1"; 
        option.textContent = "option 1"; 
        addCategorySelect.appendChild(option); 

        return addCategorySelect;
    }

    createAddCategoryButton() {
        const addCategoryButton = document.createElement("button");
        addCategoryButton.textContent = "+ Add Category";
        addCategoryButton.id = "add-category-button";
        addCategoryButton.addEventListener("click", (e) => this.showCategoryInput(e));

        return addCategoryButton;
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
