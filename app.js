// ==========================================
// 1. INVENTORY & DATABASE STATE
// ==========================================
// Online placeholder images are used so it works immediately. 
// Replace the URLs with "images/yourphoto.jpg" when you have your own photos.
const inventory = [
    { id: 'Z01', name: "Zenzy Graphic T-Shirt", price: 599, image: "https://assets.myntassets.com/w_412,q_50,,dpr_3,fl_progressive,f_webp/assets/images/22194038/2024/9/28/7159f452-c0b6-4cf6-98f7-f0bcff82f3021727530844469-VEIRDO-Graphic-Printed-Oversized-Fit-Cotton-T-shirt-42172753-1.jpg" },
    { id: 'Z02', name: "Classic Polo Shirt", price: 899, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80" },
    { id: 'Z03', name: "Slim Fit Denim Jeans", price: 1299, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80" },
    { id: 'Z04', name: "Cotton Chinos", price: 1150, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80" },
    { id: 'Z05', name: "Winter Hoodie", price: 1499, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80" },
    { id: 'Z06', name: "Formal White Shirt", price: 999, image: "https://www.myntra.com/shirts/hancock/hancock-men-white-slim-fit-solid-formal-shirt/11103910/buy" }
];

let cart = [];
let orderDatabase = []; // Stores all generated bills

// ==========================================
// 2. PAGE NAVIGATION LOGIC
// ==========================================
function switchPage(pageId) {
    // Hide all pages & remove active styling from nav
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show target page & highlight nav button
    document.getElementById(pageId).classList.add('active-page');
    const navBtn = document.getElementById(`nav-${pageId}`);
    if(navBtn) navBtn.classList.add('active');

    // Render content dynamically based on which page is opened
    if(pageId === 'products-page') renderProducts('full-catalog-grid', false);
    if(pageId === 'order-page') renderProducts('order-catalog-grid', true);
    if(pageId === 'database-page') renderDatabase();
}

// ==========================================
// 3. PRODUCTS CATALOG RENDERER
// ==========================================
function renderProducts(containerId, isClickable) {
    const container = document.getElementById(containerId);
    container.innerHTML = inventory.map(product => `
        <div class="product-card" ${isClickable ? `onclick='addToCart("${product.id}")'` : ''}>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h4>${product.name}</h4>
            <span class="price">₹${product.price}</span>
            ${isClickable ? '<p style="font-size:0.85rem; color:#10b981; margin-top:8px; font-weight:bold;">+ Click to Add to Bill</p>' : ''}
        </div>
    `).join('');
}

// ==========================================
// 4. CART (BILLING) LOGIC
// ==========================================
function addToCart(productId) {
    const product = inventory.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId); // Remove item if quantity drops to 0
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart">No clothes added to the order.</div>';
        document.getElementById('grand-total').textContent = '₹0.00';
        return;
    }

    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong><br>
                <span style="font-size:0.9rem; color:#64748b;">₹${item.price} each</span>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span style="font-weight:bold; width:20px; text-align:center;">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                <strong style="margin-left:15px; color:var(--primary);">₹${item.price * item.quantity}</strong>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('grand-total').textContent = `₹${total.toFixed(2)}`;
}

// ==========================================
// 5. DATABASE & CHECKOUT LOGIC
// ==========================================
function generateBill() {
    const customerName = document.getElementById('customer-name').value.trim();
    const customerPhone = document.getElementById('customer-phone').value.trim();
    
    // Validation
    if (!customerName || !customerPhone) {
        return alert("Please enter Customer Name and Phone Number.");
    }
    if (cart.length === 0) {
        return alert("Please add at least one item to the cart before generating a bill.");
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create new order record
    const newOrder = {
        orderId: 'ZENZY-' + Math.floor(10000 + Math.random() * 90000),
        name: customerName,
        phone: customerPhone,
        itemsSummary: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
        total: totalAmount
    };

    // Save to Database array
    orderDatabase.push(newOrder);

    // Reset Form & Cart for next customer
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    cart = [];
    updateCartUI();
    
    alert(`Bill Generated Successfully for ${customerName}!\nTotal Amount: ₹${totalAmount}`);
    
    // Automatically switch to database page to see the saved record
    switchPage('database-page');
}

function renderDatabase() {
    const tbody = document.getElementById('db-table-body');
    const totalOrdersEl = document.getElementById('total-orders-count');
    const totalSalesEl = document.getElementById('total-sales-amount');

    if (orderDatabase.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #64748b;">No past orders found in the database. Start billing to see records here.</td></tr>';
        totalOrdersEl.textContent = "0";
        totalSalesEl.textContent = "₹0.00";
        return;
    }

    // Populate Table with Orders
    tbody.innerHTML = orderDatabase.map(order => `
        <tr>
            <td><strong>${order.orderId}</strong></td>
            <td>${order.name}</td>
            <td>${order.phone}</td>
            <td style="font-size:0.95rem; color:#334155;">${order.itemsSummary}</td>
            <td style="color:#10b981; font-weight:bold;">₹${order.total.toFixed(2)}</td>
        </tr>
    `).join('');

    // Update Top Dashboard Stats
    const totalSales = orderDatabase.reduce((sum, order) => sum + order.total, 0);
    totalOrdersEl.textContent = orderDatabase.length;
    totalSalesEl.textContent = `₹${totalSales.toFixed(2)}`;
}

// Initialize the Home Page on initial load
window.onload = () => {
    switchPage('home-page');
};