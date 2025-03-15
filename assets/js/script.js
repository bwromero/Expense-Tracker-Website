// Global variables for date handling
const dateInput = document.querySelector('#day-selector-date-input');
const dateDisplay = document.querySelector('#day-selector-date-display');

document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.exp-tracker-category-manager-dropdown');
    const prevButton = document.querySelector('.exp-tracker-day-selector-nav-button:first-of-type');
    const nextButton = document.querySelector('.exp-tracker-day-selector-nav-button:last-of-type');
    const todayButton = document.querySelector('#day-selector-today-button');
    const addIncomeButton = document.getElementById('add-income-button');
    const addExpenseButton = document.getElementById('add-expense-button');
    const addIncomeModal = document.getElementById('add-income-modal');
    const addExpenseModal = document.getElementById('add-expense-modal');
    const modalButtons = document.querySelectorAll(".exp-tracker-modal-actions button");
    const addIncomeModalParent = addIncomeModal.parentElement;
    const categoryFormGroup = document.getElementById("category-form-group");
    const addCategoryButton = categoryFormGroup.children[2];
    const categorySelect = categoryFormGroup.children[1];
    const addButtons = [addIncomeButton, addExpenseButton];

    // Init category input
    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter new category name";

    // Create Save category button
    const saveCategoryButton = document.createElement("button");
    saveCategoryButton.textContent = "Save";
    saveCategoryButton.classList.add("primary");

    // Create Cancel category button
    const cancelCategoryBtn = document.createElement("button");
    cancelCategoryBtn.textContent = "Cancel";

    addButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            addIncomeModalParent.style.display = 'flex';

            if (button.innerText === 'Add Income') {
                addIncomeModal.style.display = 'flex';
            }

            if (button.innerText === 'Add Expense') {
                addExpenseModal.style.display = 'flex';
            }
        })
    })

    modalButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            if (button.textContent.trim() === 'Add income') {
                // we add income so call post api ecc
            }

            if (button.textContent.trim() === 'Cancel') {
                addIncomeModalParent.style.display = 'none';
                addIncomeModal.style.display = 'none';
                addExpenseModal.style.display = 'none';
                toggleCategoryElements();
            }
        })
    })

    addCategoryButton.addEventListener("click", (event) => {
        event.preventDefault();
        categorySelect.style.display = 'none';
        addCategoryButton.style.display = 'none';
        categoryFormGroup.appendChild(categoryInput);
        categoryFormGroup.appendChild(saveCategoryButton);
        categoryFormGroup.appendChild(cancelCategoryBtn);
    })

    // Prevent "Enter" from creating more inputs
    categoryInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            saveCategoryButton.click(); // Simulate clicking the save button
        }
    });

    cancelCategoryBtn.addEventListener("click", (event) => {
        event.preventDefault();
        toggleCategoryElements();
    })

    toggleCategoryElements = () => {
        categorySelect.style.display = 'block';
        addCategoryButton.style.display = 'block';
        categoryInput.remove();
        saveCategoryButton.remove();
        cancelCategoryBtn.remove();
    }

    dateInput.setAttribute('value', new Date().toISOString().split('T')[0]);
    dateDisplay.textContent = formatDateInItalian(dateInput.value);

    // Date input change handler
    dateInput.addEventListener('change', function () {
        dateDisplay.textContent = formatDateInItalian(this.value);
    });

    // Today button click handler
    todayButton.addEventListener('click', function () {
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];

        dateDisplay.textContent = formatDateInItalian(date);
        dateInput.value = formattedDate;
    });

    // Previous button click handler
    prevButton.addEventListener('click', () => updateDate(-1));

    // Next button click handler
    nextButton.addEventListener('click', () => updateDate(1));

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function () {
            // Find the next sibling which is the content
            const content = this.nextElementSibling;
            const arrow = this.querySelector('.exp-tracker-category-manager-dropdown-header span');

            // Toggle visibility
            if (content.style.display === 'none' || !content.style.display) {
                content.style.display = 'block';
                arrow.textContent = '▲';
            } else {
                content.style.display = 'none';
                arrow.textContent = '▼';
            }
        });
    });
});

function formatDateInItalian(dateString) {
    const date = new Date(dateString);
    const weekdays = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

    const dayOfWeek = weekdays[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayOfWeek} ${dayOfMonth} ${month} ${year}`;
}

function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Function to update date by specified number of days
function updateDate(days) {
    if (!dateInput || !dateDisplay) {
        console.error('Date elements not found');
        return;
    }
    const formattedDate = addDays(dateInput.value, days);
    dateDisplay.textContent = formatDateInItalian(formattedDate);
    dateInput.value = formattedDate;
}
