async function getProducts() {
    const response = await fetch('data/products.json');
    const data = await response.json();
    return data;
}

const menuToggle = document.querySelector('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const overlay = document.querySelector('.overlay');
const closeMenu = document.querySelector('.close-menu');

function openMenu() {
    sideMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
}

function closeMenuFn() {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', openMenu);
closeMenu.addEventListener('click', closeMenuFn);
overlay.addEventListener('click', closeMenuFn);

function formatPrice(price) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(price);
}

const categoryItems = document.querySelectorAll('[data-category]');
let currentCategory = "todos";

categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        const category = item.dataset.category;
        currentCategory = category;

        setActiveCategory(category);
        filterProducts(category);
        updateCategoryTitle(category); 
        closeMenuFn();
    });
});

function setActiveCategory(category) {
    localStorage.setItem("category", category);
    categoryItems.forEach(item => {
        item.classList.remove('active-category');

        if (item.dataset.category === category) {
            item.classList.add('active-category');
        }
    });
}

function formatCondition(condition) {
    const conditions = {
        "nuevo": "Nuevo",
        "como_nuevo": "Como nuevo",
        "semi_usado": "Semi usado",
        "usado": "Usado",
        "muy_usado": "Muy usado",
        "para_reparar": "Para reparar",
    };

    return conditions[condition] || condition;
}

function createWhatsappLink(product) {
    const phone = 56978479894;
    const message = `Hola, me interesa comprar el artículo ${product.title} ${formatPrice(product.price)}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
}

function createProductCard(product) {
    return `
        <div class="card">
            <img src="${product.image}" alt="${product.title}" class="card-image"/>
            <h3 class="title">${product.title}</h3>
            <span class="badge">${formatCondition(product.condition)}</span>
            <p class="card-description">${product.description}</p>
            <p class="card-price">${formatPrice(product.price)}</p>
            <a href="${createWhatsappLink(product)}" target="_blank" class="buy-button">
                Comprar
            </a>
        </div>
    `
}

const categoryNames = {
    todos: "Todos los productos",
    cocina: "Cocina",
    hogar: "Hogar",
    deporte: "Deporte",
    musica: "Música",
    tech: "Tech",
    diversion: "Diversión",
    ropa: "Ropa",
    look: "Look"
};

function updateCategoryTitle(category) {
    const title = categoryNames[category] || category;
    document.getElementById('category-title').textContent = title;
}

function filterProducts(category) {
    const filtered = category === "todos"
        ? products
        : products.filter(p => p.category === category);

    const container = document.getElementById('products-container');

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No hay productos en esta categoría.</p>
            </div>
        `;
        return;
    }

    const html = filtered.map(product => createProductCard(product)).join('');
    container.innerHTML = html;
}

let products = [];

async function renderProducts() {
    products = await getProducts();

    const savedCategory = localStorage.getItem("category") || "todos";

    setActiveCategory(savedCategory);
    updateCategoryTitle(savedCategory);
    filterProducts(savedCategory);
}

renderProducts();