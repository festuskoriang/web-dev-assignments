
"use strict";

// =====================================
// 1. STORE BUDGET DATA
// =====================================

let monthlyBudget = 0;
let totalExpenses = 0;

const expenses = [];

// =====================================
// 2. COLLECT USER INPUT
// =====================================

function getPositiveNumber(message) {
    while (true) {
        const input = prompt(message);

        // Stop if the user clicks Cancel
        if (input === null) {
            return null;
        }

        const number = Number(input);

        if (input.trim() !== "" && Number.isFinite(number) && number > 0) {
            return number;
        }

        alert("Please enter a valid number greater than zero.");
    }
}

function getExpenseName() {
    while (true) {
        const name = prompt("Enter the expense name:");

        if (name === null) {
            return null;
        }

        if (name.trim() !== "") {
            return name.trim();
        }

        alert("Expense name cannot be empty.");
    }
}

// =====================================
// 3. CALCULATE TOTAL EXPENSES
// =====================================

function calculateTotalExpenses(expenseList) {
    let total = 0;

    for (const expense of expenseList) {
        total += expense.amount;
    }

    return total;
}

// =====================================
// 4. CALCULATE REMAINING BALANCE
// =====================================

function calculateRemainingBalance(budget, expensesTotal) {
    return budget - expensesTotal;
}

// =====================================
// 5. RUN THE BUDGET APPLICATION
// =====================================

function runSpendWise() {
    console.log("===== SPENDWISE BUDGET REPORT =====");

    const budgetInput = getPositiveNumber(
        "Enter your monthly budget:"
    );

    if (budgetInput === null) {
        console.log("Budget setup cancelled.");
        return;
    }

    monthlyBudget = budgetInput;

    while (true) {
        const expenseName = getExpenseName();

        if (expenseName === null) {
            break;
        }

        const expenseAmount = getPositiveNumber(
            "Enter the amount for " + expenseName + ":"
        );

        if (expenseAmount === null) {
            break;
        }

        // Store each expense as an object
        expenses.push({
            name: expenseName,
            amount: expenseAmount
        });

        const addAnother = confirm("Would you like to add another expense?");

        if (!addAnother) {
            break;
        }
    }

    totalExpenses = calculateTotalExpenses(expenses);

    const remainingBalance = calculateRemainingBalance(
        monthlyBudget,
        totalExpenses
    );

    // =====================================
    // 6. DISPLAY RESULTS IN THE CONSOLE
    // =====================================

    console.log("Monthly Budget: $" + monthlyBudget.toFixed(2));
    console.log("Number of Expenses: " + expenses.length);

    console.log("--- Expense Details ---");

    if (expenses.length === 0) {
        console.log("No expenses were entered.");
    }

    for (const expense of expenses) {
        console.log(
            expense.name + ": $" + expense.amount.toFixed(2)
        );
    }

    console.log("Total Expenses: $" + totalExpenses.toFixed(2));
    console.log("Remaining Balance: $" + remainingBalance.toFixed(2));

    if (remainingBalance < 0) {
        console.log("Warning: You have exceeded your budget.");
    } else {
        console.log("You are within your budget.");
    }

    console.log("===== END OF REPORT =====");
}

// Start the application
runSpendWise();
