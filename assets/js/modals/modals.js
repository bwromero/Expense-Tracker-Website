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
            { name: "category", label: "Category", type: "text" }
        ],
        submitText: "Add Expense"
    }
];