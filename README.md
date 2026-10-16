# SpendWise

SpendWise is a lightweight, browser-based budget tracker. Set a monthly budget, record expenses, and see how your spending affects your remaining balance.

## Features

- Set and update a monthly budget.
- Add expenses with a name, amount, and category.
- Track totals for Food, Transport, Rent, Entertainment, Savings, Utilities, and Other.
- View the total budget, total expenses, expense count, and remaining balance.
- Get a status message when you are within or over budget.
- Review and delete expenses from the expense table.
- Use the responsive dashboard and collapsible top navigation on desktop or mobile.

## Run locally

No package installation or build step is required.

1. Download or clone this project.
2. Open `index.html` in a modern web browser.
3. Set your monthly budget, then use **Add Expense** to record spending.

You can also serve the project directory with any static web server and open the local URL it provides.

## Project files

- `index.html` — Dashboard structure, forms, category cards, and expense table.
- `style.css` — Responsive layout, visual styling, and light/dark color themes.
- `script.js` — Budget calculations, form validation, navigation menu, and expense management.

## Data and privacy

Expense and budget data are stored in the page's JavaScript memory only. Reloading or closing the page clears the current entries; the app does not send data to a server or save it between visits.
