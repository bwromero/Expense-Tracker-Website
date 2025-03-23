export const modalConfigs = [
    {
        id: "add-income-modal",
        title: "Add Income",
        fields: [
            { name: "description", label: "Description", type: "text" },
            { name: "amount", label: "Amount", type: "number" }
        ],
        submitText: "Add Income"
    },
    {
        id: "add-expense-modal",
        title: "Add Expense",
        fields: [
            { name: "description", label: "Description", type: "text" },
            { name: "amount", label: "Amount", type: "number" },
            { 
                name: "category", 
                label: "Category", 
                type: "select",
                isCustom: true,
                options: ["Food", "Transportation", "Entertainment", "Bills", "Other"]
            }
        ],
        submitText: "Add Expense"
    }
];