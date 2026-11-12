// SpendWise dashboard functionality
const STORAGE_KEYS = { budget: "spendwise_budget", expenses: "spendwise_expenses", theme: "spendwise_theme" };
const categories = ["Food", "Transport", "Rent", "Entertainment", "Utilities", "Health", "Other"];
const categoryColors = {
  Food: "#2878f0", Transport: "#10a879", Rent: "#f5a623",
  Entertainment: "#8b45e9", Utilities: "#e45b91", Health: "#16a6b8", Other: "#aab6ce"
};

let budget = Number(localStorage.getItem(STORAGE_KEYS.budget)) || 0;
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.expenses) || "[]");
let categoryChart = null;
let trendChart = null;

const $ = (id) => document.getElementById(id);
const money = (amount) => "$" + Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const safeDate = (value) => {
  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime()) ? new Date() : date;
};
const formatDate = (value) => safeDate(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

function saveData() {
  localStorage.setItem(STORAGE_KEYS.budget, String(budget));
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
}

function totalExpenses() {
  return expenses.reduce((sum, item) => sum + Number(item.amount), 0);
}

function updateDashboard() {
  const total = totalExpenses();
  const remaining = budget - total;
  const percentage = budget > 0 ? (total / budget) * 100 : 0;

  $("budgetValue").textContent = money(budget);
  $("expenseValue").textContent = money(total);
  $("countValue").textContent = expenses.length;
  $("savingsValue").textContent = money(remaining);
  $("heroBalance").textContent = money(remaining);
  $("donutTotal").textContent = money(total);

  $("budgetProgress").style.width = `${Math.min(percentage, 100)}%`;
  $("budgetProgressText").textContent = budget > 0
    ? `${Math.round(percentage)}% of your budget used`
    : "Set your monthly budget";
  $("expenseNote").textContent = budget > 0 && percentage > 100
    ? "You are over your budget"
    : "Your spending so far";
  $("expenseNote").classList.toggle("negative", budget > 0 && percentage > 100);

  if (budget <= 0) {
    $("balanceCaption").textContent = "Set a budget to get started";
  } else if (remaining < 0) {
    $("balanceCaption").textContent = "You are over budget";
  } else {
    $("balanceCaption").textContent = `${Math.round((remaining / budget) * 100)}% of budget remaining`;
  }

  if (budget > 0 && total > budget) {
    $("encouragementTitle").textContent = "Let's get back on track";
    $("encouragementText").textContent = "Your expenses are above your budget. Review your recent spending and adjust where you can.";
  } else if (budget > 0 && percentage >= 80) {
    $("encouragementTitle").textContent = "Almost at your limit";
    $("encouragementText").textContent = "You have used most of your budget. Keep an eye on non-essential spending.";
  } else if (budget > 0) {
    $("encouragementTitle").textContent = "Great progress!";
    $("encouragementText").textContent = "You are within your budget. Keep making thoughtful spending decisions.";
  } else {
    $("encouragementTitle").textContent = "Small steps add up!";
    $("encouragementText").textContent = "Record your expenses and set a monthly budget to keep your spending on track.";
  }

  renderTransactions($("searchInput").value);
  renderCharts();
}

function renderTransactions(searchTerm = "") {
  const body = $("transactionBody");
  const query = searchTerm.trim().toLowerCase();
  const filtered = [...expenses]
    .filter(item => `${item.name} ${item.category} ${item.date}`.toLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  if (!filtered.length) {
    body.innerHTML = `<tr class="empty-row"><td colspan="5">${expenses.length ? "No transactions match your search." : "No expenses yet. Add your first expense to get started."}</td></tr>`;
    return;
  }

  body.innerHTML = filtered.map(item => {
    const color = categoryColors[item.category] || categoryColors.Other;
    return `<tr>
      <td>${formatDate(item.date)}</td>
      <td>${escapeHTML(item.name)}</td>
      <td><span class="category-tag" style="background:${color}18;color:${color}">${escapeHTML(item.category)}</span></td>
      <td class="amount">-${money(item.amount)}</td>
      <td><button class="delete-button" data-delete="${item.id}" aria-label="Delete ${escapeHTML(item.name)}" title="Delete expense">×</button></td>
    </tr>`;
  }).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderCharts() {
  if (typeof Chart === "undefined") return;
  const totals = categories.map(category =>
    expenses.filter(item => item.category === category).reduce((sum, item) => sum + Number(item.amount), 0)
  );
  const hasData = totals.some(value => value > 0);
  const chartValues = hasData ? totals : [1];
  const chartColors = hasData ? categories.map(category => categoryColors[category]) : ["#e9eef7"];

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart($("categoryChart"), {
    type: "doughnut",
    data: { labels: hasData ? categories : ["No expenses"], datasets: [{ data: chartValues, backgroundColor: chartColors, borderWidth: 0, hoverOffset: 5 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: "72%", plugins: { legend: { display: false }, tooltip: { enabled: hasData } } }
  });

  const legend = $("categoryLegend");
  if (!hasData) {
    legend.innerHTML = '<p class="empty-chart">Add expenses to see your categories.</p>';
  } else {
    legend.innerHTML = categories.map((category, index) => {
      const amount = totals[index];
      if (!amount) return "";
      const percent = totalExpenses() ? Math.round((amount / totalExpenses()) * 100) : 0;
      return `<div class="legend-row"><span class="legend-dot" style="background:${categoryColors[category]}"></span><span class="legend-name">${category}</span><span class="legend-amount">${money(amount)}</span><span class="legend-percent">${percent}%</span></div>`;
    }).join("");
  }

  const today = new Date();
  const days = [];
  const values = [];
  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    days.push(day.toLocaleDateString("en-US", { weekday: "short" }));
    values.push(expenses.filter(item => item.date === dateKey).reduce((sum, item) => sum + Number(item.amount), 0));
  }
  if (trendChart) trendChart.destroy();
  trendChart = new Chart($("trendChart"), {
    type: "line",
    data: { labels: days, datasets: [{ data: values, borderColor: "#2878f0", backgroundColor: "rgba(40,120,240,.10)", fill: true, tension: .38, borderWidth: 2.5, pointRadius: 3.5, pointBackgroundColor: "#ffffff", pointBorderColor: "#2878f0", pointBorderWidth: 2 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => money(context.parsed.y) } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#8491aa", font: { size: 10 } } },
        y: { beginAtZero: true, grid: { color: "rgba(130,150,185,.13)" }, ticks: { color: "#8491aa", font: { size: 10 }, callback: value => "$" + value } }
      }
    }
  });
}

$("expenseForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("expenseName").value.trim();
  const amount = Number($("expenseAmount").value);
  const category = $("expenseCategory").value;
  const date = $("expenseDate").value;

  if (!name || !Number.isFinite(amount) || amount <= 0 || !category || !date) {
    $("expenseMessage").textContent = "Please complete every field with a valid amount.";
    return;
  }

  expenses.push({ id: Date.now(), name, amount: Math.round(amount * 100) / 100, category, date });
  saveData();
  updateDashboard();
  $("expenseForm").reset();
  $("expenseDate").value = getLocalDateString();
  $("expenseMessage").textContent = "Expense saved successfully.";
});

$("budgetForm").addEventListener("submit", event => {
  event.preventDefault();
  const amount = Number($("budgetAmount").value);
  if (!Number.isFinite(amount) || amount <= 0) {
    $("budgetMessage").textContent = "Enter a budget greater than zero.";
    return;
  }
  budget = Math.round(amount * 100) / 100;
  saveData();
  updateDashboard();
  $("budgetAmount").value = "";
  $("budgetMessage").textContent = "Your monthly budget has been updated.";
});

$("transactionBody").addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const id = Number(button.dataset.delete);
  expenses = expenses.filter(item => item.id !== id);
  saveData();
  updateDashboard();
});

$("searchInput").addEventListener("input", event => renderTransactions(event.target.value));
$("clearSearch").addEventListener("click", () => {
  $("searchInput").value = "";
  renderTransactions();
});
$("quickAdd").addEventListener("click", () => {
  $("expenseName").focus();
  $("expenseForm").scrollIntoView({ behavior: "smooth", block: "center" });
});
$("quickBudget").addEventListener("click", () => {
  $("budgetAmount").focus();
  $("budgetForm").scrollIntoView({ behavior: "smooth", block: "center" });
});
$("menuToggle").addEventListener("click", () => $("sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    $("sidebar").classList.remove("open");
  });
});
$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(STORAGE_KEYS.theme, document.body.classList.contains("dark-mode") ? "dark" : "light");
});

function getLocalDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function initialise() {
  $("todayLabel").textContent = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  $("year").textContent = new Date().getFullYear();
  $("expenseDate").value = getLocalDateString();
  if (localStorage.getItem(STORAGE_KEYS.theme) === "dark") document.body.classList.add("dark-mode");
  updateDashboard();
}
initialise();
