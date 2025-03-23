// FormField.js - represents a single form field
class FormField {
    constructor(fieldConfig) {
        this.config = fieldConfig;
    }

    createField() {
        const formGroup = document.createElement('div');
        formGroup.className = 'exp-tracker-modal-form-group';
        
        const label = this.createLabel();
        formGroup.appendChild(label);

        const input = this.config.isCustom && this.config.type === 'select' 
            ? this.createSelect()
            : this.createInput();
            
        formGroup.appendChild(input);
        
        return formGroup;
    }

    createLabel() {
        const label = document.createElement('label');
        label.setAttribute('for', this.config.name);
        label.textContent = this.config.label;
        return label;
    }

    createInput() {
        const input = document.createElement('input');
        input.type = this.config.type;
        input.name = this.config.name;
        return input;
    }

    createSelect() {
        const select = document.createElement('select');
        select.name = this.config.name;
        select.id = `${this.config.name}-select`;

        this.config.options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            select.appendChild(option);
        });

        return select;
    }
}

// ModalForm.js - represents the form inside a modal
class ModalForm {
    constructor(config, callbacks = {}) {
        this.config = config;
        this.callbacks = callbacks;
        this.form = this.createForm();
    }

    createForm() {
        const form = document.createElement('form');
        form.className = 'exp-tracker-modal-form';
        form.action = 'submit';

        // Add form fields
        this.config.fields.forEach(fieldConfig => {
            const field = new FormField(fieldConfig);
            const formGroup = field.createField();
            
            // Add "Add Category" button if needed
            if (fieldConfig.isCustom && fieldConfig.type === 'select' && this.callbacks.onAddCategory) {
                const addButton = this.createAddCategoryButton(formGroup.querySelector('select'));
                formGroup.appendChild(addButton);
            }
            
            form.appendChild(formGroup);
        });

        // Add action buttons
        const actions = this.createActionButtons();
        form.appendChild(actions);

        // Add form event listeners
        this.addFormEventListeners(form);

        return form;
    }

    createAddCategoryButton(select) {
        const addButton = document.createElement('button');
        addButton.textContent = '+ Add Category';
        addButton.type = 'button';
        addButton.addEventListener('click', (e) => {
            if (this.callbacks.onAddCategory) {
                this.showCategoryInput(e, select, this.callbacks.onAddCategory);
            }
        });
        return addButton;
    }

    createActionButtons() {
        const actions = document.createElement('div');
        actions.className = 'exp-tracker-modal-actions';
        
        const submitButton = document.createElement('button');
        submitButton.textContent = this.config.submitText;
        submitButton.type = 'submit';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.type = 'button';
        
        actions.appendChild(submitButton);
        actions.appendChild(cancelButton);

        return actions;
    }

    addFormEventListeners(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.callbacks.onSubmit) {
                this.callbacks.onSubmit(this.getFormData(), this.config.id);
            }
        });

        const cancelButton = form.querySelector('button[type="button"]');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                if (this.callbacks.onCancel) {
                    this.callbacks.onCancel();
                }
            });
        }
    }

    getFormData() {
        return Object.fromEntries(new FormData(this.form).entries());
    }

    setFormData(data) {
        Object.entries(data).forEach(([key, value]) => {
            const input = this.form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
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
}

// Modal.js - main modal class
export class Modal {
    constructor(modalOverlay) {
        this.modalOverlay = modalOverlay;
        this.modals = new Map();
        this.forms = new Map();
        // Bind the close method to preserve context
        this.close = this.close.bind(this);
    }

    createModals(configs, callbacks = {}) {
        // Clear existing modals
        this.modalOverlay.innerHTML = '';
        
        configs.forEach(config => {
            const modalContent = this.createModalContent(config);
            const form = new ModalForm(config, {
                onSubmit: callbacks.onSubmit,
                onAddCategory: callbacks.onAddCategory,
                onCancel: this.close  // Pass the bound method directly
            });

            modalContent.appendChild(form.form);
            this.modalOverlay.appendChild(modalContent);
            
            // Store references
            this.modals.set(config.id, modalContent);
            this.forms.set(config.id, form);
        });
    }

    createModalContent(config) {
        const modalContent = document.createElement('div');
        modalContent.className = 'exp-tracker-modal-content';
        modalContent.id = config.id;
        
        const title = document.createElement('h2');
        title.textContent = config.title;
        modalContent.appendChild(title);

        return modalContent;
    }

    open(modalId) {
        this.modalOverlay.style.display = 'flex';
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    close() {
        this.modalOverlay.style.display = 'none';
        this.modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    setFormData(modalId, data) {
        const form = this.forms.get(modalId);
        if (form) {
            form.setFormData(data);
        }
    }

    getForm(modalId) {
        return this.forms.get(modalId)?.form;
    }
} 