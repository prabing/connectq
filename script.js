const bar = document.querySelector('.bar');
const close = document.querySelector('.close');
const navbarElement = document.querySelector('.navbar');
const categoriesListFilter = document.querySelector('.categories-list');
const proContainer = document.querySelector('.product-container');
const dropdownSorting = document.querySelector('.sort-dropdown');
const searchProducts = document.querySelector('.search-products');
const noProducts = document.querySelector(".no-products");
const searchButton = document.querySelector('.search-button');
const showMoreElement = document.querySelector(".show-more");
const loader = document.querySelector(".loading");
const errorElement = document.querySelector(".error");

const message = {
  apiError: "Error in feching data! Kindly do contact administrator!",
  noData: "No data is available! Kindly validate your conditions!",
  showMoreText: "Show More"
};
const API_URL = 'https://fakestoreapi.com/';
const features = { sortedValue: "id", categoriesFilter: [], searchedValue: "" };

/* events declaration and inititalization */
if (bar) {
  bar.addEventListener('click', () => {
    navbarElement.classList.add('active')
  })

  if (close) {
    close.addEventListener('click', () => {
      navbarElement.classList.remove('active')
    })
  }
}

dropdownSorting.addEventListener("change", (event) => {
  const sortValue = event.target.value || "id";
  features.sortedValue = sortValue;
  const data = utilitize();
  displayData(data);
});

categoriesListFilter.addEventListener("change", (event) => {
  const { id } = event.target;
  if (!id) {
    return;
  }
  displayLoading();
  features.categoriesFilter = [];
  event.currentTarget?.firstChild?.childNodes.forEach((child) => {
    if (child.firstChild.checked) {
      features.categoriesFilter.push(child.firstChild.id);
    }
  })

  const data = utilitize();
  displayData(data);
  hideLoading();
});

const onInput = ({ target }) => {
  features.searchedValue = target.value || searchProducts.value;
  const data = utilitize();
  displayData(data);
};

const debounce = (func, wait = 0) => {
  let timeoutID = null;

  return (...args) => {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

const debouncedOnInput = debounce(onInput, 1000);
searchProducts.addEventListener('input', debouncedOnInput);
searchButton.addEventListener('click', debouncedOnInput);

showMoreElement.addEventListener("click", async () => {
  const responseData = await fetchAPI("products");
  setStorageData(responseData);
  const data = utilitize();
  displayData(data);
  showMoreElement.remove()
});

/* set the storage data */
const setStorageData = (data) => {
  localStorage.setItem("storageData", JSON.stringify(data));
}

/* get the storage data */
const getStorageData = () => {
  return JSON.parse(localStorage.getItem("storageData"));
}

/* load event */
const pageLoad = async () => {
  const responseData = await fetchAPI("products?limit=10");
  setStorageData(responseData);
  const data = utilitize();
  
  if (data.length > 0) {
    showMoreElement.innerHTML = message.showMoreText;
    displayData(data);
  } else {
    noProducts.innerHTML = message.noData;
  }
}

pageLoad();

/* load and display categories list */
const loadCategories = async () => {
  const categories = await fetchAPI("products/categories");
  const bindCategoryElements = document.createElement("div");
  bindCategoryElements.setAttribute("class", "category");
  bindCategoryElements.innerHTML = "";
  categories.forEach((category) => {
    bindCategoryElements.innerHTML += `<div class="category"><input type="checkbox" id="${category}" /><label for="${category}">${category}</label></div>`;
  });
  categoriesListFilter.appendChild(bindCategoryElements);
}

loadCategories();

/* display the product data */
const displayData = (data) => {
  proContainer.innerHTML = "";
  const productElements = document.createElement("div");
  productElements.setAttribute("class", "pro-container");
  productElements.innerHTML = "";
  data.forEach(element => {
    productElements.innerHTML += `<div class="pro">
      <img src="${element.image}" alt=""/>
      <div class="des">
        <h5>${element.title}</h5>
        <h4>$${element.price}</h4>
        <a href=""><i class="fal fa-shopping-cart"></i></a>
      </div>
    </div>`;
  });

  proContainer.appendChild(productElements);

  if (data.length === 0) {
    noProducts.innerHTML = message.noData;
  }
}

/* show error message */
const errorHandling = (error, message) => {
  errorElement.append(message);
  throw new Error(error);
}

/* showing loading */
function displayLoading() {
  loader.classList.add("display");
}

/* hiding loading */ 
function hideLoading() {
  loader.classList.remove("display");
}

/* **************************** */

/* fetch api call */
async function fetchAPI(urlName) {
  displayLoading();
  let response = null;
  try {
    response = await fetch(API_URL + urlName);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    errorHandling(error, message.apiError);
  }

  hideLoading();
  return await response?.json();
}

/* **************************** */

/* utilitize for featues functionality */
const utilitize = () => {
  let data = getStorageData();
  if (features.sortedValue) {
    data = data.sort((row1, row2) => row1[features.sortedValue] - row2[features.sortedValue]);
  }

  if (features.categoriesFilter.length > 0) {
    data = data.filter(item =>
      features.categoriesFilter.find(key => item["category"] === key));
  }

  if (features.searchedValue) {
    data = data.filter((dataum) => dataum?.title.toLowerCase().indexOf(features.searchedValue?.toLowerCase()) >= 0)
  }

  return data;
}