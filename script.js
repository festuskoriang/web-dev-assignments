"use strict";

// ==========================================
// 1. APPLICATION DATA AND DOM ELEMENTS
// ==========================================

let monthlyBudget = 0;
let totalExpenses = 0;

const expenses = [];

const budgetForm = document.getElementById("budget-form");
const budgetInput = document.getElementById("monthly-budget");
const budgetTotalDisplay = document.getElementById("budget-total");
const expenseTotalDisplay = document.getElementById("expense-total");
const expenseCountDisplay = document.getElementById("expense-count");
const balanceDisplay = document.getElementById("current-balance");
const budgetMessage = document.getElementById("budget-message");
const expenseMessage = document.getElementById("expense-message");
const expenseForm = document.getElementById("expense-form");
const expenseNameInput = document.getElementById("expense-name");
const expenseAmountInput = document.getElementById("expense-amount");
const expenseCategoryInput = document.getElementById("expense-category");
const tableBody = document.getElementById("expense-table-body");
const emptyMessage = document.getElementById("empty-message");
const menuToggle = document.querySelector(".menu-toggle");
const mainNavigation = document.getElementById("main-navigation");

menuToggle.addEventListener("click", function () {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute(
        "aria-label",
        isExpanded ? "Open navigation menu" : "Close navigation menu"
    );
    mainNavigation.hidden = isExpanded;
});

mainNavigation.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
        mainNavigation.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !mainNavigation.hidden) {
        mainNavigation.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.focus();
    }
});

// Connect category names to their dashboard display elements.
const categoryDisplays = {
    Food: document.getElementById("category-food"),
    Transport: document.getElementById("category-transport"),
    Rent: document.getElementById("category-rent"),
    Entertainment: document.getElementById("category-entertainment"),
    Savings: document.getElementById("category-savings"),
    Utilities: document.getElementById("category-utilities"),
    Other: document.getElementById("category-other")
};

// ==========================================
// 2. HELPER FUNCTION FOR MONEY
// ==========================================

function formatMoney(amount) {
    return "$" + amount.toFixed(2);
}

// ==========================================
// 3. SET THE MONTHLY BUDGET
// ==========================================

budgetForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const inputValue = budgetInput.value.trim();
    const budget = Number(inputValue);

    // Validate the budget before saving it.
    if (
        inputValue === "" ||
        !Number.isFinite(budget) ||
        budget < 0
    ) {
        budgetMessage.textContent =
            "Please enter a valid budget of zero or more.";
        budgetMessage.className = "message error";
        return;
    }

    monthlyBudget = budget;

    budgetMessage.textContent = "Your monthly budget has been updated.";
    budgetMessage.className = "message success";

    updateDashboard();
});

// ==========================================
// 4. CALCULATE TOTAL EXPENSES USING A LOOP
// ==========================================

function calculateTotalExpenses() {
    let total = 0;

    for (const expense of expenses) {
        total += expense.amount;
    }

    totalExpenses = total;

    return total;
}

// ==========================================
// 5. CALCULATE REMAINING BALANCE
// ==========================================

function calculateRemainingBalance() {
    return monthlyBudget - calculateTotalExpenses();
}

// ==========================================
// 6. CALCULATE TOTALS BY CATEGORY
// ==========================================

function calculateCategoryTotals() {
    const totals = {
        Food: 0,
        Transport: 0,
        Rent: 0,
        Entertainment: 0,
        Savings: 0,
        Utilities: 0,
        Other: 0
    };

    // Process every stored expense.
    for (const expense of expenses) {
        if (Object.hasOwn(totals, expense.category)) {
            totals[expense.category] += expense.amount;
        }
    }

    return totals;
}

// ==========================================
// 7. DISPLAY EXPENSES IN THE TABLE
// ==========================================

function renderExpenses() {
    // Remove old rows so the table can be rebuilt from the array.
    tableBody.replaceChildren();

    // Use a loop to display every expense record.
    for (let index = 0; index < expenses.length; index++) {
        const expense = expenses[index];

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const categoryCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const actionCell = document.createElement("td");

        nameCell.textContent = expense.name;
        amountCell.textContent = formatMoney(expense.amount);
        categoryCell.textContent = expense.category;
        dateCell.textContent = expense.date;

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-expense";
        deleteButton.dataset.index = String(index);
        deleteButton.setAttribute(
            "aria-label",
            "Delete " + expense.name
        );

        actionCell.appendChild(deleteButton);

        row.append(
            nameCell,
            amountCell,
            categoryCell,
            dateCell,
            actionCell
        );

        tableBody.appendChild(row);
    }

    // Show an empty-state message when no records exist.
    emptyMessage.hidden = expenses.length > 0;
}

// ==========================================
// 8. UPDATE DASHBOARD CONTENT
// ==========================================

function updateDashboard() {
    const total = calculateTotalExpenses();
    const remaining = monthlyBudget - total;
    const categoryTotals = calculateCategoryTotals();

    // Update the summary cards and remaining balance.
    budgetTotalDisplay.textContent = formatMoney(monthlyBudget);
    expenseTotalDisplay.textContent = formatMoney(total);
    expenseCountDisplay.textContent = String(expenses.length);
    balanceDisplay.textContent = "Remaining Balance: " + formatMoney(remaining);

    // Make a decision about the budget status.
    if (remaining < 0) {
        balanceDisplay.style.color = "#fecaca";

        budgetMessage.textContent =
            "Warning: You have exceeded your budget by " +
            formatMoney(Math.abs(remaining)) + ".";

        budgetMessage.className = "message error";
    } else if (monthlyBudget === 0) {
        balanceDisplay.style.color = "";

        budgetMessage.textContent =
            "Set a monthly budget to track your spending.";

        budgetMessage.className = "message";
    } else if (remaining === 0) {
        balanceDisplay.style.color = "#fde68a";

        budgetMessage.textContent =
            "Your entire budget has been used.";

        budgetMessage.className = "message warning";
    } else {
        balanceDisplay.style.color = "#bbf7d0";

        budgetMessage.textContent =
            "You are within budget. You have " +
            formatMoney(remaining) + " remaining.";

        budgetMessage.className = "message success";
    }

    // Update every category card.
    for (const category in categoryDisplays) {
        categoryDisplays[category].textContent =
            formatMoney(categoryTotals[category]);
    }

    // Refresh the expense table.
    renderExpenses();
}

// ==========================================
// 9. ADD A NEW EXPENSE
// ==========================================

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = expenseNameInput.value.trim();
    const amountText = expenseAmountInput.value.trim();
    const amount = Number(amountText);
    const category = expenseCategoryInput.value;

    // Validate the expense name.
    if (name === "") {
        expenseMessage.textContent =
            "Please enter an expense name.";

        expenseMessage.className = "message error";
        expenseNameInput.focus();
        return;
    }

    // Validate the expense amount.
    if (
        amountText === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        expenseMessage.textContent =
            "Enter an expense amount greater than zero.";

        expenseMessage.className = "message error";
        expenseAmountInput.focus();
        return;
    }

    // Validate the selected category.
    if (!Object.hasOwn(categoryDisplays, category)) {
        expenseMessage.textContent =
            "Please select a valid category.";

        expenseMessage.className = "message error";
        expenseCategoryInput.focus();
        return;
    }

    // Create a new expense object.
    const expense = {
        id: Date.now() + Math.random(),
        name: name,
        amount: Math.round(amount * 100) / 100,
        category: category,
        date: new Date().toLocaleDateString("en-CA")
    };

    // Store the record in the array.
    expenses.push(expense);

    // Update the webpage after the data changes.
    updateDashboard();

    expenseMessage.textContent =
        "Expense added successfully.";

    expenseMessage.className = "message success";

    // Reset the form for the next entry.
    expenseForm.reset();
    expenseNameInput.focus();

    console.log("Expense added:", expense);
});

// ==========================================
// 10. DELETE AN EXPENSE
// ==========================================

// Event delegation: handle clicks on Delete buttons in the table.
tableBody.addEventListener("click", function (event) {
    const button = event.target.closest(".delete-expense");

    if (!button || !tableBody.contains(button)) {
        return;
    }

    const index = Number(button.dataset.index);

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= expenses.length
    ) {
        return;
    }

    const deletedExpense = expenses[index];

    // Remove one record from the array.
    expenses.splice(index, 1);

    // Recalculate and redraw the dashboard.
    updateDashboard();

    expenseMessage.textContent =
        deletedExpense.name + " was deleted.";

    expenseMessage.className = "message success";

    console.log("Expense deleted:", deletedExpense);
});

// ==========================================
// 11. INITIALIZE THE APPLICATION
// ==========================================

updateDashboard();

console.log("SpendWise JavaScript loaded successfully.");
