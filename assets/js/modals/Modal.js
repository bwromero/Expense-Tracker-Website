export class Modal {
    constructor(config, onSubmit) {
        this.config = config;
        this.onSubmit = onSubmit;
        this.modalContent = null;
        this.form = null;
        this.modalOverlay = document.querySelector('.exp-tracker-modal-overlay');
        
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'exp-tracker-modal-content';
        this.modalContent.id = this.config.id;
        
        this.addTitle();
        this.createForm();
        
        this.modalOverlay.appendChild(this.modalContent);
    }

    addTitle() {
        const title = document.createElement('h2');
        title.textContent = this.config.title;
        this.modalContent.appendChild(title);
    }

    createForm() {
        this.form = document.createElement('form');
        this.form.className = 'exp-tracker-modal-form';
        this.form.action = 'submit';
        
        this.addFormFields();
        this.addActionButtons();
        
        this.modalContent.appendChild(this.form);
    }

    addFormFields() {
        this.config.fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'exp-tracker-modal-form-group';
            
            const label = document.createElement('label');
            label.setAttribute('for', field.name);
            label.textContent = field.label;
            formGroup.appendChild(label);

            if (field.isCustom && field.type === 'select') {
                this.createCustomSelect(field, formGroup);
            } else {
                this.createInput(field, formGroup);
            }
            
            this.form.appendChild(formGroup);
        });
    }

    createCustomSelect(field, formGroup) {
        const select = document.createElement('select');
        select.name = field.name;
        select.id = `${field.name}-select`;

        field.options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            select.appendChild(option);
        });
        formGroup.appendChild(select);

        const addButton = document.createElement('button');
        addButton.textContent = '+ Add Category';
        addButton.type = 'button';
        addButton.addEventListener('click', (e) => this.showCategoryInput(e, select));
        formGroup.appendChild(addButton);
    }

    createInput(field, formGroup) {
        const input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        formGroup.appendChild(input);
    }

    addActionButtons() {
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
        this.form.appendChild(actions);
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(this.form).entries());
            this.onSubmit(formData);
            this.close();
        });

        this.form.querySelector('button[type="button"]').addEventListener('click', () => {
            this.close();
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

    open() {
        this.modalOverlay.style.display = 'flex';
        this.modalContent.style.display = 'flex';
    }

    close() {
        this.modalOverlay.style.display = 'none';
        this.modalContent.style.display = 'none';
    }

    setFormData(data) {
        Object.entries(data).forEach(([name, value]) => {
            const field = this.form.querySelector(`[name="${name}"]`);
            if (field) {
                field.value = value;
                
                // Handle category field visibility
                if (name === 'category') {
                    const formGroup = field.closest('.exp-tracker-modal-form-group');
                    formGroup.style.display = value ? 'flex' : 'none';
                }
            }
        });
    }

    setEditMode(index) {
        this.form.dataset.editIndex = index;
    }

    clearEditMode() {
        this.form.removeAttribute('data-edit-index');
    }
} 