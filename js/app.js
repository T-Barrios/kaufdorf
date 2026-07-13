async function getProducts() {
    try {
        const response = await fetch('./data/products.json');

        if (!response.ok) {
            throw new Error("No se pudo cargar products.json");
        }

        return await response.json();

    } catch (error) {
        console.error(error);

        document.getElementById("products-container").innerHTML = `
            <div class="empty-state">
                Error al cargar los productos.
            </div>
        `;

        return [];
    }
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
        "1": "Nuevo",
        "2": "Como nuevo",
        "3": "Buen estado",
        "4": "Aceptable",
    };

    return conditions[condition] || condition;
}

function createWhatsappLink(product) {
    const phone = 56978479894;
    const message = `Hola, me interesa comprar el artículo [${product.id}] ${product.title} ${formatPrice(product.price)}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
}

function createProductCard(product) {

    const images =
        product.images && product.images.length
            ? product.images
            : [product.image];
    const total = images.length;

    return `
        <div class="card" data-images='${JSON.stringify(images)}' data-index="0">

            <div class="card-image-container">
                <img 
                    src="${images[0]}" 
                    class="card-image" 
                    loading="lazy"
                    style="opacity:0;"
                />
            </div>

            <div class="image-controls">
                <button class="nav-btn prev">❮</button>

                <div class="dots">
                    ${createDots(total)}
                </div>

                <button class="nav-btn next">❯</button>
            </div>

            <h3 class="title">${product.title}</h3>
            <span class="badge badge-${product.condition}">${formatCondition(product.condition)}</span>
            <p class="card-description">${product.description}</p>
            <p class="card-price">${formatPrice(product.price)}</p>

            <a href="${createWhatsappLink(product)}" target="_blank" class="buy-button">
                Comprar
            </a>
        </div>
    `;
}

function createDots(total) {
    let dots = '';

    for (let i = 0; i < total; i++) {
        dots += `<span class="dot ${i === 0 ? 'active' : ''}"></span>`;
    }

    return dots;
}

const categoryNames = {
    todos: "Todos los productos",
    cc: "Cocina",
    hg: "Hogar",
    dp: "Deporte",
    ms: "Música",
    tc: "Tech",
    dv: "Diversión",
    rp: "Ropa",
    lk: "Look"
};

function updateCategoryTitle(category) {
    const title = categoryNames[category] || category;

    const count = category === "todos"
        ? products.length
        : products.filter(p => p.category === category).length;

    document.getElementById('category-title').textContent = `${title} (${count})`;
}

function filterProducts(category) {

    const container = document.getElementById('products-container');

    container.classList.add('fade-out');

    setTimeout(() => {

        const filtered = category === "todos"
            ? products
            : products.filter(p => p.category === category);

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No hay productos en esta categoría.</p>
                </div>
            `;
        } else {
            const html = filtered.map(product => createProductCard(product)).join('');
            container.innerHTML = html;
        }

        container.classList.remove('fade-out');
        container.classList.add('fade-in');

        requestAnimationFrame(() => {
            window.scrollTo({
                top: 0,
                behavior: "instant"
            });
        });

        setTimeout(() => {
            container.classList.remove('fade-in');
        }, 250);

        setTimeout(initImageControls, 0);

    }, 200);
}

function initImageControls() {

    document.querySelectorAll('.card').forEach(card => {

        const images = JSON.parse(card.dataset.images);
        let index = 0;

        const img = card.querySelector('.card-image');

        img.onload = () => {
            img.style.opacity = "1";
        };

        img.onerror = () => {
            img.onerror = null; // evita loop
            img.src = "assets/img/placeholder.webp";
        };

        const prev = card.querySelector('.prev');
        const next = card.querySelector('.next');
        const dots = card.querySelectorAll('.dot');

        let startX = 0;

        function update() {
            img.style.opacity = "0";

            img.classList.add('fade-out');

            setTimeout(() => {
                img.src = images[index];

                img.classList.remove('fade-out');
                img.classList.add('fade-in');

                setTimeout(() => {
                    img.classList.remove('fade-in');
                }, 250);

            }, 150);

            dots.forEach(d => d.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');

            prev.disabled = index === 0;
            next.disabled = index === images.length - 1;
        }

        prev.addEventListener('click', () => {
            if (index > 0) {
                index--;
                update();
            }
        });

        next.addEventListener('click', () => {
            if (index < images.length - 1) {
                index++;
                update();
            }
        });

        img.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        img.addEventListener('touchend', (e) => {
            let endX = e.changedTouches[0].clientX;

            if (startX - endX > 50 && index < images.length - 1) {
                index++;
                update();
            }

            if (endX - startX > 50 && index > 0) {
                index--;
                update();
            }
        });

        update();
    });
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