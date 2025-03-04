document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.exp-tracker-category-manager-dropdown');
    
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