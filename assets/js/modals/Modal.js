export class Modal {
    constructor(modalOverlay) {
        this.modalOverlay = modalOverlay;
        this.modals = {};
        this.forms = {};
    }

    createModals(configs, callbacks = {}) {
        // Clear existing modals
        this.modalOverlay.innerHTML = '';
        
        // Create each modal from config
        configs.forEach(config => {
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

                    // Add "Add Category" button if callback exists
                    if (callbacks.onAddCategory) {
                        const addButton = document.createElement('button');
                        addButton.textContent = '+ Add Category';
                        addButton.type = 'button'; // Prevent form submission
                        addButton.addEventListener('click', (e) => this.showCategoryInput(e, select, callbacks.onAddCategory));
                        formGroup.appendChild(addButton);
                    }
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
            submitButton.type = 'submit';
            
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.type = 'button';
            
            actions.appendChild(submitButton);
            actions.appendChild(cancelButton);
            form.appendChild(actions);
            
            modalContent.appendChild(form);
            this.modalOverlay.appendChild(modalContent);
            
            // Store references to the modal elements
            this.modals[config.id] = modalContent;
            this.forms[config.id] = form;

            // Add event listeners
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (callbacks.onSubmit) {
                    callbacks.onSubmit(this.getFormData(form), config.id);
                }
                this.close();
            });

            cancelButton.addEventListener('click', () => this.close());
        });
    }

    showCategoryInput(event, select, onAddCategory) {
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
        saveButton.addEventListener('click', () => {
            if (onAddCategory(input.value, select)) {
                formGroup.innerHTML = oldContent;
            }
        });
        
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

    open(modalId) {
        this.modalOverlay.style.display = 'flex';
        this.modals[modalId].style.display = 'flex';
    }

    close() {
        this.modalOverlay.style.display = 'none';
        Object.values(this.modals).forEach(modal => {
            modal.style.display = 'none';
        });
    }

    getFormData(form) {
        return Object.fromEntries(new FormData(form).entries());
    }

    setFormData(modalId, data) {
        const form = this.forms[modalId];
        if (!form) return;

        Object.entries(data).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        });
    }

    getForm(modalId) {
        return this.forms[modalId];
    }
} 