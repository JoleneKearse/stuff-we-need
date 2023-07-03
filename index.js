import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://stuff-we-need-default-rtdb.firebaseio.com/",
};
const app = initializeApp(appSettings);
const database = getDatabase(app);
const groceriesInDB = ref(database, "groceries");

const newItem = document.getElementById("groceryItem");
const groceryList = document.getElementById("list");
let draggedItem = null;

document.getElementById("inputForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let inputValue = newItem.value;
  if (inputValue) {
    push(groceriesInDB, inputValue);
    clearInputField();
  } else {
    return;
  }
});

document
  .getElementById("groceryItem")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      let inputValue = newItem.value;
      if (inputValue) {
        push(groceriesInDB, inputValue);
        clearInputField();
      } else {
        return;
      }
    }
  });

onValue(groceriesInDB, function (snapshot) {
  if (snapshot.exists()) {
    groceryList.innerHTML = "";
    let groceriesArr = Object.entries(snapshot.val());
    clearInputField();
    groceriesArr.map((item) => {
      let currentItem = item;
      addNewItems(currentItem);
    });
  } else {
    groceryList.innerHTML = `<img src="assets/shopping-pig.png" alt="purple fantasy pig walking down the produce aisel" class="emptyListImg">`;
  }
});

function addNewItems(item) {
  let itemID = item[0];
  let itemValue = item[1];
  let newGroceryItem = document.createElement("li");
  newGroceryItem.textContent = itemValue;
  newGroceryItem.classList.add("list-item");
  newGroceryItem.setAttribute("draggable", "true");
  groceryList.append(newGroceryItem);
  // remove items
  newGroceryItem.addEventListener("dblclick", function () {
    let idOfItemInDB = ref(database, `groceries/${itemID}`);
    remove(idOfItemInDB);
  });
}

function clearInputField() {
  newItem.value = "";
}

// groceryList.addEventListener("dragstart", (e) => {
//   if (e.target.classList.contains("list-item")) {
//     e.target.classList.add("dragging");
//   }
// });

// groceryList.addEventListener("dragend", (e) => {
//   if (e.target.classList.contains("list-item")) {
//     e.target.classList.remove("dragging");
//   }
// });

// groceryList.addEventListener("dragover", (e) => {
//   e.preventDefault();
//   const afterElement = getDragAfterElement(groceryList, e.clientY);
//   const draggable = document.querySelector(".dragging");

//   if (afterElement == null) {
//     groceryList.appendChild(draggable);
//   } else {
//     groceryList.insertBefore(draggable, afterElement);
//   }
// });

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".list-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function handleDragStart(e) {
  if (e.type === "touchstart" || e.button === 0) {
    const target = e.targetTouches ? e.targetTouches[0].target : e.target;
    if (target.classList.contains("list-item")) {
      target.classList.add("dragging");
      draggedItem = target;
      console.log(draggedItem);
    }
  }
}

function handleDragEnd(e) {
  if (e.type === "touchend" || e.button === 0) {
    const target = e.targetTouches ? e.targetTouches[0].target : e.target;
    if (target.classList.contains("list-item")) {
      target.classList.remove("dragging");
      draggedItem = null;
    }
  }
}

groceryList.addEventListener("mousedown", handleDragStart);
groceryList.addEventListener("touchstart", handleDragStart);
groceryList.addEventListener("mouseup", handleDragEnd);
groceryList.addEventListener("touchend", handleDragEnd);
groceryList.addEventListener("mousemove", (e) => {
  e.preventDefault();
  handleDragMove(e);
});
groceryList.addEventListener("touchmove", (e) => {
  e.preventDefault();
  handleDragMove(e);
});

function handleDragMove(e) {
  if (draggedItem) {
    const clientY = e.targetTouches ? e.targetTouches[0].clientY : e.clientY;
    const afterElement = getDragAfterElement(groceryList, clientY);
    const draggable = document.querySelector(".dragging");

    if (afterElement == null) {
      groceryList.appendChild(draggable);
    } else {
      groceryList.insertBefore(draggable, afterElement);
    }
  }
}
