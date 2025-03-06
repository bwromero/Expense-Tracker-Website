// Global variables for date handling
const dateInput = document.querySelector('#day-selector-date-input');
const dateDisplay = document.querySelector('#day-selector-date-display');

document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.exp-tracker-category-manager-dropdown');
    const prevButton = document.querySelector('.exp-tracker-day-selector-nav-button:first-of-type');
    const nextButton = document.querySelector('.exp-tracker-day-selector-nav-button:last-of-type');
    const todayButton = document.querySelector('#day-selector-today-button');

    dateInput.setAttribute('value', new Date().toISOString().split('T')[0]);
    dateDisplay.textContent = formatDateInItalian(dateInput.value);

    // Date input change handler
    dateInput.addEventListener('change', function() {
        dateDisplay.textContent = formatDateInItalian(this.value);
    });

    // Today button click handler
    todayButton.addEventListener('click', function() {
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
        dropdown.addEventListener('click', function() {
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
