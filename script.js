window.onload = () => {
  const itemList = document.getElementById("item-list");
  const form = document.getElementById("item-form");
  const clearButton = document.getElementById("clear");
  const filterInput = document.getElementById("filter");
  const itemInput = document.getElementById("item-input");
  const submitButton = document.querySelector('button[type="submit"]');
  let editMode = false;
  loadFromLocalStorage();

  function getItemsFromLocalStorage() {
    return JSON.parse(window.localStorage.getItem("items")) ?? [];
  }
  function checkUI() {
    const items = getItemsFromLocalStorage();
    if (!items.length) {
      filterInput.style.display = "none";
      clearButton.style.display = "none";
    } else {
      filterInput.style.display = "block";
      clearButton.style.display = "block";
    }
    if (editMode) {
      const activeItem = document.querySelector("[data-state='editing']");
      itemInput.value = activeItem.innerText;
      submitButton.innerHTML = null;
      submitButton.appendChild(createIcon());
      submitButton.append(" Update");
      submitButton.style.backgroundColor = "green";
    } else {
      submitButton.innerHTML = null;
      submitButton.appendChild(createIcon());
      submitButton.append(" Add Item");
      submitButton.style.backgroundColor = null;
      itemInput.value = "";
    }
  }

  function loadFromLocalStorage() {
    const items = getItemsFromLocalStorage();
    itemList.innerHTML = null;
    if (items.length > 0) {
      items.forEach((item) => {
        addItemToList(item);
      });
    }
    checkUI();
  }

  function removeFromLocalStorage(itemToRemove) {
    if (itemToRemove) {
      const items = getItemsFromLocalStorage();
      const newItems = items.filter((item) => itemToRemove !== item);
      window.localStorage.setItem("items", JSON.stringify(newItems));
    } else {
      window.localStorage.setItem("items", JSON.stringify([]));
    }
    loadFromLocalStorage();
  }

  function clearList() {
    itemList.innerHTML = null;
    removeFromLocalStorage();
  }

  function addToLocalStorage(item) {
    const items = getItemsFromLocalStorage();
    items.push(item);
    window.localStorage.setItem("items", JSON.stringify(items));
    checkUI();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const items = getItemsFromLocalStorage();
    const formElement = new FormData(event.currentTarget);
    const value = formElement.get("item").trim();
    if (!value) {
      window.alert("Please add an item");
      return;
    }
    if (editMode) {
      editListItem(value);
      return;
    }
    if (items.some((item) => item === value)) {
      window.alert("Item already exist!");
      return;
    }
    addItemToList(value);
    addToLocalStorage(value);
    itemInput.value = "";
  });

  function addItemToList(value) {
    const listItem = createItem(value);
    itemList.append(listItem);
  }

  function removeItemFromList(listItem) {
    editMode = false;
    const response = window.confirm("Are you sure");
    if (response) {
      listItem.remove();
      removeFromLocalStorage(listItem.innerText);
    }
  }

  function createIcon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid");
    if (editMode) {
      icon.classList.add("fa-pen");
    } else {
      icon.classList.add("fa-plus");
    }
    return icon;
  }

  function editListItem(newValue) {
    editMode = false;
    const activeItem = document.querySelector("[data-state='editing']");
    removeFromLocalStorage(activeItem.innerText);
    addItemToList(newValue);
    addToLocalStorage(newValue);
  }

  function createItem(value) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    const icon = document.createElement("i");
    button.classList.add(...["remove-item", "btn-link", "text-red"]);
    icon.classList.add(...["fa-solid", "fa-xmark"]);
    listItem.append(value);
    button.append(icon);
    listItem.append(button);
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      removeItemFromList(listItem);
    });
    listItem.addEventListener("click", () => {
      const activeListItem = document.querySelector("[data-state='editing']");
      if (activeListItem === listItem) return;
      if (activeListItem && activeListItem !== listItem) {
        activeListItem.removeAttribute("data-state");
      }
      editMode = true;
      listItem.setAttribute("data-state", "editing");
      checkUI();
    });
    return listItem;
  }

  clearButton.addEventListener("click", clearList);

  filterInput.addEventListener("input", (e) => {
    const input = e.target.value.toLowerCase();
    const listItems = Array.from(itemList.children);
    listItems.forEach((item) => {
      const itemText = item.innerText.toLowerCase();
      if (itemText.indexOf(input) !== -1) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });
};
