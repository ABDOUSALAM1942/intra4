
/* INPUTS */
const input_budget = document.querySelector("#budget-input");
const input_expense = document.querySelector("#expense-input");
const input_expense_desc = document.querySelector("#expense-description");

/* BUTTONS */
const btn_calcultate = document.querySelector("#calculate");
const btn_add_expense = document.querySelector("#add-expense");

/* CALCULATE VALUES */
const budget_amount = document.querySelector("#budget-amount");
const expenses_amount = document.querySelector("#expenses-amount");
const balance_amount = document.querySelector("#balance-amount");

/* MESSAGES */
const expense_message = document.querySelector("#expense-message");
const budget_message = document.querySelector("#budget-message");
const notification = document.querySelector(".notif");
const his = document.getElementById('histo');

var budget;
const object_data = {
  budget_amount: 0,
  total_expenses: 0,
  balance: 0,
  expenses: []
};

/* INITIALIZE LOCAL-STORAGE */
if (localStorage.getItem("budget")) {
  budget = JSON.parse(localStorage.getItem("budget"));
  setValues();
} else {
  localStorage.setItem("budget", JSON.stringify(object_data));
  budget = object_data;
}

btn_calcultate.addEventListener("click", addBudget, false);
btn_add_expense.addEventListener("click", addExpense, false);
input_budget.addEventListener("keypress", onlyDecimals, false);
input_expense.addEventListener("keypress", onlyDecimals, false);
his.addEventListener("click", showExpenseHistory);


// // À l'intérieur de la fonction showExpenseHistory
// function showExpenseHistory() {
//   const history = JSON.parse(localStorage.getItem("budget")).expenses;
//   let historyMessage = "Historique des dépenses :\n";

//   for (const expense of history) {
//     historyMessage += `- ${expense.title}: ${expense.value} F\n`;
//   }

//   // Créer l'élément de notification
//   const historyNotification = document.createElement("div");
//   historyNotification.textContent = historyMessage;
//   historyNotification.classList.add("history-notification");

//   // Trouver l'élément parent où insérer la notification
//   const notifContainer = document.querySelector(".notif");

//   // Insérer la notification avant le lien avec l'id "histo" dans le conteneur de notifications
//   const histoLink = document.getElementById("histo");
//   notifContainer.insertBefore(historyNotification, histoLink);

//   // Disparition automatique après 10 secondes
//   setTimeout(() => {
//     historyNotification.remove();
//   }, 10000);
// }


// Lorsque le lien "History" est cliqué
const histoLink = document.getElementById("histo");
histoLink.addEventListener("click", function(event) {
  event.preventDefault(); // Empêcher le comportement par défaut du lien
  showExpenseHistory(); // Afficher la pop-up d'historique
});



/* VALIDATIONS FOR BUTTON TO ADD A BUDGET VALUE */
function addBudget() {
  if (input_budget.value === "") {
    budget_message.style.display = "block";
  } else {
    const budgetValue = parseFloat(input_budget.value);

    if (budgetValue < 0) {
      // Si la valeur est négative, définir la valeur de l'input sur 0
      input_budget.value = null;
      showNotification("Le budget ne peut pas être négatif. La valeur a été ajustée à 0.");
    } else {
      budget_message.style.display = "none";
      calculate(false);
      showNotification("Ajout du budget");
      showNotification("Votre budget a été ajouté avec succès");
    }
  }
}

// / Fonction pour afficher la notification comme une fenêtre modale
function showNotification(message) {
  const notificationModal = document.getElementById("notification-modal");
  const notificationMessage = document.getElementById("notification-message");
  notificationMessage.textContent = message;
  notificationModal.style.display = "block";
}

// Fonction pour fermer la fenêtre modale de notification
function closeNotificationModal() {
  const notificationModal = document.getElementById("notification-modal");
  notificationModal.style.display = "none";
}

// Écouteur d'événement pour le lien "History" (modification de la fonction showExpenseHistory)
his.addEventListener("click", function(event) {
  event.preventDefault(); // Empêche le lien de naviguer vers une autre page
  const historyMessage = "Historique des dépenses :\n";
  
  for (const expense of budget.expenses) {
    historyMessage += `- ${expense.title}: ${expense.value} F\n`;
  }
  
  showNotification(historyMessage);
});

function showHistoryNotification(message) {
  const notifDiv = document.querySelector(".notif");
  // Créer l'élément de notification
  const notificationText = document.createElement("p");
  notificationText.textContent = message;
  notificationText.classList.add("notification-message");
  // Appliquer le style de fond à notifDiv
  notifDiv.style.background = "linear-gradient(to bottom, blue 50%, white 50%)";
  notificationText.style.background = "none";
  notifDiv.appendChild(notificationText);
  // Disparition automatique après 5 secondes
  setTimeout(() => {
    notifDiv.removeChild(notificationText);
    // Réinitialiser le style de fond
    notifDiv.style.background = "none";
  }, 10000);
}



// fin notif

/* VALIDATIONS FOR BUTTON TO ADD AN EXPENSE VALUE */
function addExpense() {
  if (input_expense.value === "" || input_expense_desc.value === "") {
    expense_message.style.display = "block";
  } else {
    expense_message.style.display = "none";
    
    const expenseValue = parseFloat(input_expense.value);
    
    // Vérifier si la valeur est négative
    if (expenseValue < 0) {
      // Si la valeur est négative, définir la valeur de l'input sur 0
      input_expense.value = null;
      showNotification("La valeur des dépenses ne peut pas être négative. La valeur a été ajustée à 0.");
    } else {
      budget.expenses.push({
        title: input_expense_desc.value,
        value: expenseValue
      });
      calculate(true);
      // Mise à jour automatique du graphique
      updateExpenseChart();
      showNotification("Ajout des dépenses");
      showNotification("La dépense a été ajoutée avec succès");
    }
  }
}

  // Fonction pour mettre à jour le graphique des dépenses
function updateExpenseChart() {
    const expenseLabels = budget.expenses.map(item => item.title);
    const expenseValues = budget.expenses.map(item => parseFloat(item.value));
  
    expenseChart.data.labels = expenseLabels;
    expenseChart.data.datasets[0].data = expenseValues;
    expenseChart.update();
  }

function calculate(val) {
  if (!val) {
    budget.budget_amount = input_budget.value;
  }
  budget.total_expenses = calculateExpenses();
  budget.balance = budget.budget_amount - budget.total_expenses;
  localStorage.setItem("budget", JSON.stringify(budget));
  setValues();
}

/* SETTING THE VALUES FOR LOCAL-STORAGE */
function setValues() {
  budget_amount.innerHTML = ` ${budget.budget_amount} F`;
  expenses_amount.innerHTML = ` ${budget.total_expenses} F`;
  balance_amount.innerHTML = ` ${budget.balance} F`;
  input_budget.value = "";
  input_expense_desc.value = "";
  input_expense.value = "";
  if (budget.balance >= 0) {
    balance_amount.classList.remove("danger-color");
    balance_amount.classList.add("success-color");
  } else {
    balance_amount.classList.remove("success-color");
    balance_amount.classList.add("danger-color");
  }
  showListExpenses();
}

function calculateExpenses() {
  let total = 0;
  if (budget.expenses) {
    for (let item of budget.expenses) {
      total += parseFloat(item.value);
    }
  }
  return total;
}

/* FUNCTION TO CREATE A LIST OF ALL EXPENSES */
function showListExpenses() {
  let content = "";
  for (let [index, item] of budget.expenses.entries()) {
    let divs = `
      <div class="list-item">
        <div class="col">- ${item.title}</div>
        <div class="col"> ${item.value} F </div>
        <div class="col">
          <i id="${index}" class="edit-button fa fa-edit"></i>
          <i id="${index}" class="delete-button fa fa-trash"></i>
        </div>          
      </div>
    `;
    content += divs;
  }
  let el = document.querySelector("#expenses-list");
  el.innerHTML = content;

  setEvents();
}

function setEvents() {
  const editButtons = document.querySelectorAll(".edit-button");
  const deleteButtons = document.querySelectorAll(".delete-button");
  editButtons.forEach(item => {
    item.addEventListener("click", editExpense, false);
  });
  deleteButtons.forEach(item => {
    item.addEventListener("click", deleteExpense, false);
  });
}

function editExpense(e) {
  let id = e.target.id;
  let title = budget.expenses[id].title;
  let value = budget.expenses[id].value;
  budget.expenses.splice(id, 1);
  calculate(true);
  input_expense_desc.value = title;
  input_expense.value = value;
  showNotification("Edition des depenses");
  showNotification("La depense du a été ajouté avec succès");
}

function deleteExpense(e) {
  let id = e.target.id;
  budget.expenses.splice(id, 1);
  calculate(true);
  showNotification("suppression des depenses");
  showNotification("La depense a été supprimer avec succès");
}

function onlyDecimals(event) {
  if ((event.charCode >= 48 && event.charCode <= 57) || event.charCode === 46) {
    return true;
  } else {
    event.preventDefault();
  }
}

// Sélectionnez le bouton de réinitialisation du budget
const btn_reset_budget = document.querySelector("#bouton");

// Ajoutez un écouteur d'événement pour le bouton de réinitialisation du budget
btn_reset_budget.addEventListener("click", resetBudget);

// Fonction pour réinitialiser le budget
function resetBudget() {
  localStorage.removeItem("budget"); // Supprimez l'élément de budget du stockage local
  location.reload(); // Rechargez la page pour réinitialiser tous les éléments
  showNotification("Budget reinitialiser avec succès");
}



// Sélectionnez l'élément canvas
const expenseChartCanvas = document.querySelector("#expense-chart");

// Obtenez les valeurs nécessaires pour le graphique
const expenseLabels = budget.expenses.map(item => item.title);
const expenseValues = budget.expenses.map(item => parseFloat(item.value));

// Créez le graphique circulaire
const expenseChart = new Chart(expenseChartCanvas, {
  type: 'doughnut', // Utilisez le type "doughnut" pour un graphique circulaire
  data: { 
    labels: expenseLabels,
    datasets: [{
      data: expenseValues,
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#E91E63', '#3F51B5', '#8A2BE2', '#ADFF2F', '#00008B'
        // Vous pouvez ajouter plus de couleurs ici si nécessaire
      ],
    }],
  },
  options: {
    responsive: true, // Permet au graphique de s'adapter à la taille de son conteneur
  },
});
function showExpenseHistory() {
  const history = JSON.parse(localStorage.getItem("budget")).expenses;
  let historyMessage = "";

  for (let i = 0; i < history.length; i++) {
    const expense = history[i];
    historyMessage += `#${i + 1} - ${expense.title}: ${expense.value} F\n`;
    // Ajoutez d'autres éléments de la même manière

    historyMessage += "\n"; // Ligne vide entre chaque dépense
  }

  // Obtenir la pop-up et son contenu
  const popup = document.getElementById("historyPopup");
  const popupContent = document.getElementById("popupContent");
  const closePopupButton = document.getElementById("closePopupButton");

  // Afficher le contenu de l'historique dans la pop-up
  popupContent.textContent = historyMessage;

  // Afficher la pop-up
  popup.style.display = "block";

  // Afficher le bouton "Fermer"
  closePopupButton.style.display = "block";

  // Fermer la pop-up lorsque le bouton "Fermer" est cliqué
  closePopupButton.onclick = function() {
    popup.style.display = "none";
    closePopupButton.style.display = "none";
  };
}


