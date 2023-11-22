
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
his.addEventListener("click", showExpenseHistory,false);

// Lorsque le lien "History" est cliqué
const histoLink = document.getElementById("histo");
histoLink.addEventListener("click", function (event) {
  event.preventDefault(); // Empêcher le comportement par défaut du lien
  showExpenseHistory(); // Afficher la pop-up d'historique
});


// Fonction pour ajouter un budget
function addBudget() {
  // Vérifie si le champ de saisie du budget est vide
  if (input_budget.value === "") {
      budget_message.style.display = "block"; // Affiche un message d'erreur
  } else {
      const budgetValue = parseFloat(input_budget.value); // Convertit la valeur du budget en nombre à virgule flottante
      // Vérifie si le budget est négatif
      if (budgetValue < 0) {
          input_budget.value = null; // Réinitialise la valeur du champ de saisie à zéro
          showNotification("Le budget ne peut pas être négatif. La valeur a été ajustée à 0."); // Affiche une notification d'erreur
      } else {
          budget_message.style.display = "none"; // Cache le message d'erreur du budget
          const old = JSON.parse(localStorage.getItem("budget"));
          console.log('valeur dans le localstorage: ' + parseFloat(old.budget_amount));
          // Ajoute le nouveau budget à l'ancien budget
          let newbudget = parseFloat(old.budget_amount) + budgetValue;
          console.log('somme du budget: ' + newbudget);
          budget.budget_amount = newbudget;
          // Met à jour les calculs et les valeurs affichées
          calculate(false, newbudget);
          showHistoryNotification("Ajout du budget");
          showHistoryNotification("Votre budget a été ajouté avec succès");
          localStorage.setItem("budget", JSON.stringify(budget));
      }
  }
}

// Fonction pour effectuer les calculs du budget
function calculate(val, newbudget) {
  // Vérifie si la valeur val est fausse (false)
  if (!val) {
      budget.budget_amount = newbudget; // Met à jour le montant du budget avec la nouvelle valeur
  }
  budget.total_expenses = calculateExpenses(); // Calcule le total des dépenses
  budget.balance = budget.budget_amount - budget.total_expenses; // Calcule le solde du budget
  localStorage.setItem("budget", JSON.stringify(budget)); // Met à jour le budget dans le stockage local
  setValues(); // Met à jour les valeurs affichées
}

function showHistoryNotification(message) {
  const notifDiv = document.querySelector(".notif");
  const his = document.getElementById("histo");
  // Créer un fragment de document pour stocker le contenu de #histo
  const histoFragment = document.createDocumentFragment();
  while (his.firstChild) {
    histoFragment.appendChild(his.firstChild);
  }
  // Masquer le contenu de #histo
  his.innerHTML = "";
  // Créer l'élément de notification
  const notificationText = document.createElement("p");
  notificationText.textContent = message;
  notificationText.classList.add("notification-message");
  // Ajouter le texte de notification à notifDiv
  notifDiv.appendChild(notificationText);
  // Appliquer le style de fond à notifDiv
  notifDiv.style.background = "linear-gradient(to bottom, green 50%, white 50%)";
  // Disparition automatique de la notification après 5 secondes
  setTimeout(() => {
    // Retirer l'élément de notification
    notifDiv.removeChild(notificationText);
    // Réinitialiser le style de fond
    notifDiv.style.background = "rgb(166, 160, 160)";
    // Réafficher le contenu de #histo depuis le fragment
    his.appendChild(histoFragment);
  }, 5000); // 5000 millisecondes (5 secondes)
}



// Utilisation de la fonction pour afficher un message de notification






// fin notif

/* VALIDATIONS FOR BUTTON TO ADD AN EXPENSE VALUE */
function addExpense() {
  if (input_expense.value === "" || input_expense_desc.value === "") {
    expense_message.style.display = "block";
  } else {
    expense_message.style.display = "none";
    const expenseValue = parseFloat(input_expense.value);
    if (expenseValue < 0) {
      input_expense.value = "0";
      showHistoryNotification("La valeur des dépenses ne peut pas être négative. La valeur a été ajustée à 0.");
    } else {
      if (editingIndex !== null) {
        // Si un index d'édition existe, vérifiez si le titre est modifié
        if (budget.expenses[editingIndex].title !== input_expense_desc.value) {
          // Si le titre est modifié, vérifiez s'il existe déjà une dépense avec le nouveau titre
          const existingExpenseIndex = budget.expenses.findIndex(item => item.title === input_expense_desc.value);
          if (existingExpenseIndex !== -1) {
            // Si une dépense avec le même titre existe, fusionnez les deux dépenses
            budget.expenses[existingExpenseIndex].value += expenseValue;
          } else {
            // Sinon, modifiez simplement le titre de la dépense
            budget.expenses[editingIndex].title = input_expense_desc.value;
            budget.expenses[editingIndex].value = expenseValue;
          }
        } else {
          // Si le titre n'est pas modifié, mettez à jour simplement la valeur
          budget.expenses[editingIndex].value = expenseValue;
        }
        // Réinitialisez l'index d'édition après l'utilisation
        editingIndex = null;
      } else {
        // Sinon, ajoutez normalement une nouvelle dépense
        const existingExpenseIndex = budget.expenses.findIndex(item => item.title === input_expense_desc.value);
        if (existingExpenseIndex !== -1) {
          // Si une dépense avec le même titre existe, fusionnez les deux dépenses
          budget.expenses[existingExpenseIndex].value += expenseValue;
        } else {
          // Sinon, ajoutez une nouvelle dépense
          budget.expenses.push({
            title: input_expense_desc.value,
            value: expenseValue
          });
        }
      }
      calculate(true);
      updateExpenseChart();
      showHistoryNotification("Ajout des dépenses");
      showHistoryNotification("La dépense a été ajoutée avec succès");
      // Réinitialisez l'index d'édition après l'ajout d'une nouvelle dépense
      editingIndex = null;
    }
  }
}






// Fonction pour mettre à jour le graphique des dépenses
function updateExpenseChart() {
  // Obtient les titres des dépenses
  const expenseLabels = budget.expenses.map(item => item.title);
  // Obtient les valeurs des dépenses converties en nombres à virgule flottante
  const expenseValues = budget.expenses.map(item => parseFloat(item.value));
  // Met à jour les labels et les données du graphique des dépenses
  expenseChart.data.labels = expenseLabels;
  expenseChart.data.datasets[0].data = expenseValues;
  // Actualise le graphique
  expenseChart.update();
  // Affiche des notifications d'historique
  showHistoryNotification.textContent = "Mise à jour";
  showHistoryNotification.textContent = "La dépense a été mise à jour";
}




/* SETTING THE VALUES FOR LOCAL-STORAGE */
// Fonction pour définir les valeurs affichées dans l'interface utilisateur
function setValues() {
  // Met à jour les éléments HTML avec les valeurs actuelles du budget
  budget_amount.innerHTML = ` ${budget.budget_amount} F`;
  expenses_amount.innerHTML = ` ${budget.total_expenses} F`;
  balance_amount.innerHTML = ` ${budget.balance} F`;
  // Réinitialise les champs de saisie à des valeurs vides
  input_budget.value = "";
  input_expense_desc.value = "";
  input_expense.value = "";
  // Vérifie si le solde du budget est positif ou nul
  if (budget.balance >= 0) {
      // Si positif ou nul, applique une classe de couleur pour indiquer le succès
      balance_amount.classList.remove("danger-color");
      balance_amount.classList.add("success-color");
  } else {
      // Sinon, applique une classe de couleur pour indiquer une alerte/danger
      balance_amount.classList.remove("success-color");
      balance_amount.classList.add("danger-color");
  }
  // Met à jour la liste des dépenses affichée dans l'interface utilisateur
  showListExpenses();
}


function setEditingIndex(index) {
  localStorage.setItem("editingIndex", index);
}

function getEditingIndex() {
  return localStorage.getItem("editingIndex");
}

// calcule le total des dépenses à partir des données stockées dans l'objet
function calculateExpenses() {
  budget.total_expenses = calculateTotalExpenses();
  budget.balance = budget.budget_amount - budget.total_expenses;
  localStorage.setItem("budget", JSON.stringify(budget));
  setValues();
  return budget.total_expenses; // Retournez le total pour une utilisation ultérieure si nécessaire
}


function showListExpenses() {
  let content = "";
  let totalExpenses = 0;
  for (let [index, item] of budget.expenses.entries()) {
    totalExpenses += parseFloat(item.value);
    let divs = `
      <div class="list-item">
        <div class="col">${item.title}</div>
        <div class="col">${item.value} F </div>
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
function calculateTotalExpenses() {
  let total = 0;
  if (budget.expenses) {
    for (let item of budget.expenses) {
      total += parseFloat(item.value);
    }
  }
  return total;
}




// Fonction pour définir les événements de clic pour les boutons d'édition et de suppression
function setEvents() {
  const editButtons = document.querySelectorAll(".edit-button");
  const deleteButtons = document.querySelectorAll(".delete-button");
  // Ajoute un écouteur d'événement de clic à chaque bouton d'édition
  editButtons.forEach(item => {
      item.addEventListener("click", editExpense, false);
  });
  // Ajoute un écouteur d'événement de clic à chaque bouton de suppression
  deleteButtons.forEach(item => {
      item.addEventListener("click", deleteExpense, false);
  });
}


// Fonction pour éditer une dépense existante
let editingIndex = null; // Ajoutez cette variable en dehors de vos fonctions



function editExpense(e) {
  let id = e.target.id;
  let title = budget.expenses[id].title;
  let value = budget.expenses[id].value;
  editingIndex = id; // Stocke l'index en cours d'édition dans la variable editingIndex

  // Ne supprime pas la dépense immédiatement
  // Remarque : vous pourriez également cacher la dépense au lieu de la supprimer pour éviter des problèmes d'affichage
  // budget.expenses.splice(id, 1);

  // Recalcule le budget après la suppression de la dépense
  calculate(true);

  // Met à jour les champs d'entrée avec les valeurs de la dépense existante
  input_expense_desc.value = title;
  input_expense.value = value;

  // Affiche une notification indiquant que la dépense est en cours d'édition
  showHistoryNotification("Edition des dépenses");
}


function deleteExpense(e) {
  let id = e.target.id;
  budget.expenses.splice(id, 1);
  calculate(true);
  showHistoryNotification("suppression des depenses");
  showHistoryNotification("La depense a été supprimer avec succès");
  window.location.reload();
}

// Fonction pour valider que seule la saisie de chiffres et d'un point décimal est autorisée
function onlyDecimals(event) {
  // Vérifie si le code de la touche est compris entre 0 et 9 (chiffres) ou est égal à 46 (code pour le point décimal)
  if ((event.charCode >= 48 && event.charCode <= 57) || event.charCode === 46) {
      return true; // Autorise la saisie si la touche est un chiffre ou un point décimal
  } else {
      event.preventDefault(); // Empêche la saisie si la touche n'est pas un chiffre ou un point décimal
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
  showHistoryNotification("reset");
  showHistoryNotification("La reset  avec succès");
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
    layout: {
      padding: 40,
    },
  },
});

function showExpenseHistory() {
  const history = JSON.parse(localStorage.getItem("budget")).expenses;
  let historyListItems = "";

  // Ajoutez d'abord les en-têtes de colonnes avec des espaces
  historyListItems += `<li class="history-item">#&nbsp&nbsp&nbsp&nbsp&nbsp<b>Expense</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Value</b></li>`;

  for (let i = 0; i < history.length; i++) {
    const expense = history[i];
    historyListItems += `<li class="history-item">${i + 1} ${expense.title} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${expense.value} F</li>`;
  }

  // Créez un élément de liste ordonnée (<ol>) pour afficher les éléments de l'historique
  const historyList = document.createElement("ol");
  historyList.innerHTML = historyListItems;
  // Obtenir la pop-up et son contenu
  const popup = document.getElementById("historyPopup");
  const popupContent = document.getElementById("popupContent");
  const closePopupButton = document.getElementById("closePopupButton");

  // Remplacez le contenu de la pop-up par la liste d'éléments de l'historique
  popupContent.innerHTML = "";
  popupContent.appendChild(historyList);

  // Afficher la pop-up
  popup.style.display = "block";

  // Afficher le bouton "Fermer"
  closePopupButton.style.display = "block";

  // Fermer la pop-up lorsque le bouton "Fermer" est cliqué
  closePopupButton.onclick = function () {
    popup.style.display = "none";
    closePopupButton.style.display = "none";
  };
}


