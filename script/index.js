$(document).ready(function () {
  const foodDiv = document.querySelector("#main");
  const checkGlutenFree = document.querySelector("input[name=glutenFree]");
  const checkLactoseFree = document.querySelector("input[name=lactoseFree]");
  const checkVegetarian = document.querySelector("input[name=vegetarian]");
  const checkBeef = document.querySelector("input[name=groundBeef]");
  const checkPork = document.querySelector("input[name=pork]");
  const checkChicken = document.querySelector("input[name=chicken]");
  const checkFish = document.querySelector("input[name=fish]");
  const languageSelect = document.querySelectorAll("input[name=language]");
  const priceSort = document.querySelector("#priceSort");
  const orderList = document.querySelector("#orderList");
  const orderSummary = document.querySelector("#orderSummary");
  const order = document.querySelector("#order");

  // SVG for portion sizes
  const smallPortionSvg =
    '<svg class="portionIcon" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>';
  const largePortionSvg =
    '<svg class="portionIcon" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/></svg>';

  //Setting default values
  let language = localStorage.getItem("selectedLanguage") || "sv";
  let selectedSort = "standard";
  let menu = [];
  let basket = [];

  // This displays the foods by inserting HTML to the index.html
  const displayFoods = function (foods) {
    foodDiv.innerHTML = "";
    const orderLanguage = language === "sv" ? "Beställ" : "Order";

    const sortedFoods = sortFoodByPrice(foods);
    sortedFoods.forEach((food) => {
      let priceHtml = "";

      if (food.price.length > 1) {
        priceHtml = `<div class="food-price">${smallPortionSvg} ${food.price[0]} kr <button class="addToBasket addToBasketSmall" id="${food.id[0]}">${orderLanguage}</button></div><div>${largePortionSvg} ${food.price[1]} kr <button class="addToBasket addToBasketLarge" id="${food.id[1]}">${orderLanguage}</button></div>`;
      } else {
        priceHtml = `<div class="food-price">${largePortionSvg} ${food.price[0]} kr <button class="addToBasket" id="${food.id[0]}">${orderLanguage}</button></div>`;
      }
      const html = `<div class="food-cards"><img class="food-img" src="${food.img}" alt=""><p class="food-title">${food.name[language]}</p>
    ${priceHtml}<div><p class="food-description">${food.description[language]}</p></div></div>`;
      console.log(language);
      foodDiv.insertAdjacentHTML("beforeend", html);
    });
  };

  // Fetch the menu data from menu.json
  async function fetchMenuData() {
    try {
      const response = await fetch("./script/menu.json");
      if (!response.ok) {
        throw new Error("Failed to fetch menu data");
      }
      const menuData = await response.json();
      return menuData;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function getMenu() {
    menu = await fetchMenuData();
    displayFoods(menu); // Displays the menu when first loading page
  }
  getMenu();

  // Filters the food items based on checkboxes ticked
  const filterFoods = function () {
    let filteredMenu = [...menu]; // Reset the filteredMenu to the original menu data
    const filteredMeats = [];
    const checkBoxes = [checkBeef, checkPork, checkChicken, checkFish];

    if (checkVegetarian.checked) {
      filteredMenu = filteredMenu.filter((food) =>
        food.typeOfMeat.includes("Vegetarian")
      );
    }

    if (checkGlutenFree.checked) {
      filteredMenu = filteredMenu.filter((food) =>
        food.allergies.includes("glutenFree")
      );
    }

    if (checkLactoseFree.checked) {
      filteredMenu = filteredMenu.filter((food) =>
        food.allergies.includes("lactoseFree")
      );
    }

    checkBoxes.forEach((checkBox) => {
      checkBox.addEventListener("click", () => {
        checkVegetarian.checked = false;
      });
      if (checkBox.checked) {
        filteredMeats.push(checkBox.value);
      }
    });

    if (filteredMeats.length > 0) {
      filteredMenu = filteredMenu.filter((food) => {
        return filteredMeats.some((meat) => food.typeOfMeat.includes(meat));
      });
    }

    sortFoodByPrice(filteredMenu);
    labelBackgroundColour();
    displayFoods(filteredMenu);
  };

  checkVegetarian.addEventListener("click", () => {
    checkBeef.checked = false;
    checkPork.checked = false;
    checkChicken.checked = false;
    checkFish.checked = false;
  });

  const sortFoodByPrice = function (filteredMenu) {
    if (selectedSort === "standard") {
      return filteredMenu;
    } else if (selectedSort === "ascending") {
      return filteredMenu.sort((a, b) => a.price[0] - b.price[0]);
    } else if (selectedSort === "descending") {
      return filteredMenu.sort((a, b) => b.price[0] - a.price[0]);
    }
  };

  const addToBasket = function (event) {
    const target = event.target; // Gets the target you clicked

    if (target.classList.contains("addToBasket")) {
      let id = parseInt(target.id);
      const menuItem = menu.find((item) => item.id.includes(id));
      // If the menuItem is found, get the price depending on portion size
      if (menuItem) {
        let price = menuItem.price[0];
        let portion = "";
        if (target.classList.contains("addToBasketSmall")) {
          portion = smallPortionSvg; // Default for small portion
        } else if (target.classList.contains("addToBasketLarge")) {
          price = menuItem.price[1];
        }
        // Checks if item is already in the basket, if not adds the food item to the basket
        const existingItem = basket.find((item) => item.id === id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          basket.push({ id, price, portion, quantity: 1, menuItem });
        }
      }
    }
    updateOrderList();
    ShowOrder();
  };

  const increaseDecreaseBasket = function (event) {
    const target = event.target; // Gets the target you clicked
    // Checks if you clicked a buton
    if (target.classList.contains("basketQuantity")) {
      const id = parseInt(target.getAttribute("id")); // Converts the id to number
      if (!isNaN(id)) {
        // checks if id is a valid number
        const item = basket.find((item) => item.id === id); // Gets the menuitem with matching id
        if (item) {
          if (target.classList.contains("increaseQuantity")) {
            item.quantity += 1; // If increase button clicked, up quantity
          } else if (target.classList.contains("decreaseQuantity")) {
            if (item.quantity > 1) {
              item.quantity -= 1; // If decrease button clicked and quantity is greater than 1, lower quantity
            } else {
              // If quantity is 1 or less, remove the item from the basket
              const index = basket.findIndex((item) => item.id === id);
              basket.splice(index, 1);
            }
          }
          updateOrderList();
        }
      }
    }
  };

  function updateOrderList() {
    localStorage.setItem("basket", JSON.stringify(basket)); // Save basket so page can be reloaded
    orderList.innerHTML = "";
    // Create HTML for each item added to the basket
    basket
      .filter((item) => item.quantity > 0) // Quantity must be greater than 0
      .forEach((item, i) => {
        const name = item.menuItem.name[language];
        const html = `<li class="basketItem item${i}"> <span class="foodName">${name}</span>  <span class="foodPortion">${
          item.portion
        }</span></br> <button class="basketQuantity decreaseQuantity" id="${
          item.id
        }"><svg
        class="basketQuantitySvg decreaseQuantitySvg"
        
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg></button> ${
        item.quantity
      } <button class="basketQuantity increaseQuantity" id="${item.id}"><svg
  class="basketQuantitySvg increaseQuantitySvg"
  
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  stroke="currentColor"
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M4.5 15.75l7.5-7.5 7.5 7.5"
  />
</svg></button> <span class="foodPrice">${
          item.price * item.quantity
        }</span> kr</li>`;
        orderList.insertAdjacentHTML("beforeend", html);
      });
    updateOrderSummary();
  }

  function updateOrderSummary() {
    orderSummary.innerHTML = "";
    let sum = language === "sv" ? "Summa" : "Sum";
    // Calculae total by refucing basket to single value (price * quantity)
    const total = basket.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ); //Starts at 0 and accumulates the price
    const html = `${sum}: ${total} kr`;
    orderSummary.insertAdjacentHTML("beforeend", html);
  }

  if (localStorage.getItem("basket")) {
    basket = JSON.parse(localStorage.getItem("basket"));
    updateOrderList();
  }

  // jQuery code

  // Automatic year updating in the variable currentYear
  var currentYear = new Date().getFullYear();
  $("#currentYear").text(currentYear);

  // If filter and language isn't open, show orderContainer
  function toggleContainers() {
    const languageVisible = $("#mainLanguage").hasClass("show");
    const filterVisible = $("#filterContainer").hasClass("show");

    if (!languageVisible && !filterVisible) {
      $("#orderContainer").removeClass("hide");
    } else {
      $("#orderContainer").addClass("hide");
    }
  }

  // Toggle Language
  $("#languageButton").click(function () {
    $("#mainLanguage").toggleClass("show");

    $("#filterContainer").removeClass("show");

    toggleContainers();
  });

  // Toggle Filters
  $("#filterButton").click(function () {
    $("#mainLanguage").removeClass("show");

    $("#filterContainer").toggleClass("show");

    toggleContainers();
  });

  // Makes order visible
  $("#orderButton").click(ShowOrder);

  //Changes background of filer labels
  function labelBackgroundColour() {
    const checkboxes = $('input[type="checkbox"]:checked');
    const filterSelect = $(".filterSelect");

    filterSelect.css("background-color", "white");

    checkboxes.each(function () {
      const index = $(this).data("index");
      filterSelect.eq(index).css("background-color", "#ffa14a");
    });
  }

  function ShowOrder() {
    $("#mainLanguage").removeClass("show");

    $("#filterContainer").removeClass("show");

    $("#orderContainer").removeClass("hide");

    toggleContainers();
  }
  // jQuery code

  // Event listeners - calls filterFoods to update the list of foods -------------------------------------------
  $("#filterContainer").on("change", function (event) {
    if (event.target.type === "checkbox") filterFoods();
  });

  // Adding items to the basket
  foodDiv.addEventListener("click", addToBasket);
  // Increasing or decreasing basket quantity
  orderList.addEventListener("click", increaseDecreaseBasket);

  languageSelect.forEach((change) =>
    change.addEventListener("change", function () {
      language = language === "sv" ? "en" : "sv";
      updateOrderList();
      filterFoods();
    })
  );

  // Changes the value of sorting and calls the filter to update the list of foods
  priceSort.addEventListener("change", function () {
    selectedSort = priceSort.value;
    filterFoods();
  });
});

order.addEventListener("click", () => {
  alert("This was a school project following specific demands of a customer.");
});
