const mealsEl = document.getElementById('meals');
const favMeals = document.getElementById('fav-meals');
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');
const popupContinaer = document.getElementById('popup-continaer');
const popupEl = document.getElementById('popup');
const closePopupBtn = document.getElementById('close-popup-btn');
const mealInfo = document.getElementById('meal-info');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const response  = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
    const respData = await response.json();
    const randomMeal = respData.meals[0];
    console.log(randomMeal);
    addMeal(randomMeal, true);
}

async function getMealsById(id) {
    const response  = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const respData = await response.json();
    const mealById = respData.meals[0];

    return mealById;
}

async function getMealBySearch(term) {
    const response  = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
    const respData = await response.json();
    const termMeals = respData.meals;

   return termMeals;
}

function addMeal(mealData, random = false) {
    let meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `<div class="meal-head">
        ${random === true ? '<h3>Recipe Of The Day</h3>' : ''}
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
            </button>
    </div>`;

    let favBtn = meal.querySelector(".meal-body .fav-btn");
    favBtn.addEventListener('click', event => {
        event.preventDefault();
        if (favBtn.classList.contains('active')) {
            removeMealsFromLs(mealData.idMeal);
            favBtn.classList.remove('active');
        } else {
            addMealsToLs(mealData.idMeal);
            favBtn.classList.add('active');
        }
        fetchFavMeals();
    });

    mealsEl.appendChild(meal);

    mealsEl.addEventListener('click', _ => {
        showMealInfo(mealData);
        popupContinaer.classList.remove('hidden');
    });
}

async function fetchFavMeals() {
    const mealsIds = getMealsFromLs();
    // clean the container:
    favMeals.innerHTML = '';
    for(let i = 0; i < mealsIds.length; i++) {
        const meal = await getMealsById(mealsIds[i]);
        addMealToFav(meal);
    }
}

function addMealToFav(mealData) {
    let li = document.createElement('li');
    li.innerHTML = `<button class="remove">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <span class="meal-name">${mealData.strMeal}</span>`;
    const removeBtn = li.querySelector('.remove');
    removeBtn.addEventListener('click', _ => {
        removeMealsFromLs(mealData.idMeal);
        fetchFavMeals();
        let favBtn = mealsEl.querySelector(".meal .meal-body .fav-btn");
        if (favBtn.classList.contains('active')) {
            favBtn.classList.remove('active');
        }
    });

    li.addEventListener('click', _ => {
        showMealInfo(mealData);
        popupContinaer.classList.remove('hidden');
    });

    favMeals.appendChild(li);
}

searchIcon.addEventListener('click', async function () {
    let term = searchInput.value;
    const meals = await getMealBySearch(term);
    if (meals) {
        // clear container:
        mealsEl.innerHTML = '';
        meals.forEach(meal => addMeal(meal));
    }
});

function showMealInfo(mealData) {
    // clean container:
    mealInfo.innerHTML = '';
    const infoDiv = document.createElement('div');
    // get Ingredients And Measures:
    let ingrMears = [];
    for (let i = 1; i <= 20; i++) {
        if (mealData[`strIngredient${i}`]) {
            ingrMears.push(`${mealData[`strIngredient${i}`]} / ${mealData[`strMeasure${i}`]}`)
        } else {
            break;
        }
    }
    const infoStrct = `<h2 class="meal-title">${mealData.strMeal}</h2>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <p class="meal-desc">${mealData.strInstructions}</p>
    <h3 class='ingrtsMears'>Ingredients / Measures</h3>
    <ul class='ingredients'>${ingrMears.map(ing => `<li>- ${ing}</li>`).join('')}</ul>`;
    infoDiv.innerHTML = infoStrct;
    mealInfo.appendChild(infoDiv);
}

function addMealsToLs(mealId) {
    const mealIds = getMealsFromLs();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealsFromLs(mealId) {
    const mealIds = getMealsFromLs();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealsFromLs() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return localStorage.getItem('mealIds') !== null ? mealIds : [];
}

closePopupBtn.addEventListener('click', _ => {
    popupContinaer.classList.add('hidden');
});
