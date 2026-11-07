const STORAGE_KEY = "transactions";
let transactions = loadTransactions();

const form = document.getElementById("transactionForm");
const typeEl = document.getElementById("type");
const descEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const categoryEl = document.getElementById("category");
const dateEl = document.getElementById("date");
const errorEl = document.getElementById("error");
const filterEl = document.getElementById("filter");
const searchEl = document.getElementById("search");
const tbody = document.getElementById("tableBody");


function loadTransactions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}


const fmt = n => "LKR " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split("T")[0];


function resetForm() {
  form.reset();
  dateEl.value = today();
  errorEl.textContent = "";
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const description = descEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const category = categoryEl.value;
  const date = dateEl.value;

  if (!description || !category || !date || isNaN(amount)) {
    errorEl.textContent = "Please fill in all fields.";
    return;
  }
  if (amount <= 0) {
    errorEl.textContent = "Amount must be greater than zero.";
    return;
  }

  transactions.push({ id: Date.now(), type: typeEl.value, description, amount, category, date });
  saveTransactions();
  render();
  resetForm();
  alert("Transaction added successfully!");
});

document.getElementById("clearBtn").addEventListener("click", resetForm);


function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  render();
}


function updateSummary() {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  document.getElementById("totalIncome").textContent = fmt(income);
  document.getElementById("totalExpenses").textContent = fmt(expenses);
  document.getElementById("balance").textContent = fmt(income - expenses);
}

function renderTable() {
  const type = filterEl.value;
  const q = searchEl.value.trim().toLowerCase();
  const list = transactions.filter(t =>
    (type === "all" || t.type === type) &&
    (t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  );

  tbody.innerHTML = "";
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">No transactions found.</td></tr>';
    return;
  }

  list.forEach(t => {
    const sign = t.type === "income" ? "+" : "\u2212";
    const tr = document.createElement("tr");
    // textContent is used for user-entered values to avoid HTML injection
    const cells = [t.date, t.description];
    cells.forEach(text => { const td = document.createElement("td"); td.textContent = text; tr.appendChild(td); });

    const typeTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge " + t.type;
    badge.textContent = t.type === "income" ? "Income" : "Expense";
    typeTd.appendChild(badge);
    tr.appendChild(typeTd);

    const catTd = document.createElement("td");
    catTd.textContent = t.category;
    tr.appendChild(catTd);

    const amtTd = document.createElement("td");
    amtTd.className = "amount " + (t.type === "income" ? "income-amt" : "expense-amt");
    amtTd.textContent = `${sign} ${fmt(t.amount)}`;
    tr.appendChild(amtTd);

    const actTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "btn delete";
    btn.textContent = "Delete";
    btn.addEventListener("click", () => deleteTransaction(t.id));
    actTd.appendChild(btn);
    tr.appendChild(actTd);

    tbody.appendChild(tr);
  });
}

function render() { updateSummary(); renderTable(); }

filterEl.addEventListener("change", renderTable);
searchEl.addEventListener("input", renderTable);


dateEl.value = today();
render();