// Menu page specific functionality
class MenuManager {
    constructor() {
        this.currentFilter = 'all';
        this.ajaxService = new AjaxService();
        this.init();
    }

    init() {
        this.bindFilterEvents();
        this.addSearchFunctionality();
        this.loadMenuItems('all'); // Load all items initially
    }

    bindFilterEvents() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.filterItems(category);
                this.updateActiveFilter(e.target);
            });
        });
    }

    async filterItems(category) {
        this.currentFilter = category;
        await this.loadMenuItems(category);
    }

    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    animateItemsIn(section) {
        const items = section.querySelectorAll('.menu-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
    }

    addSearchFunctionality() {
        // Add search bar to menu categories section
        const categoriesSection = document.querySelector('.menu-categories .container');
        const searchHTML = `
            <div class="menu-search">
                <div class="search-container">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" class="search-input" placeholder="Search for dishes..." id="menuSearch">
                </div>
            </div>
        `;
        
        categoriesSection.insertAdjacentHTML('afterbegin', searchHTML);

        // Search functionality
        const searchInput = document.getElementById('menuSearch');
        searchInput.addEventListener('input', (e) => {
            this.searchItems(e.target.value.toLowerCase());
        });
    }

    async searchItems(searchTerm) {
        if (searchTerm === '') {
            await this.loadMenuItems(this.currentFilter);
            return;
        }

        this.ajaxService.showLoading('menuItemsContainer');
        
        const result = await this.ajaxService.searchMenuItems(searchTerm);
        
        if (result.success) {
            this.renderMenuItems(result.data, 'search');
        } else {
            this.showError('Failed to search menu items. Please try again.');
        }
    }

    // Load menu items via AJAX
    async loadMenuItems(category) {
        const container = document.querySelector('.menu-items .container');
        if (!container) return;

        // Add container ID for loading spinner
        container.id = 'menuItemsContainer';
        
        this.ajaxService.showLoading('menuItemsContainer');
        
        const result = await this.ajaxService.getMenuItems(category);
        
        if (result.success) {
            this.renderMenuItems(result.data, category);
        } else {
            this.showError('Failed to load menu items. Please try again.');
        }
    }

    // Render menu items dynamically
    renderMenuItems(items, category) {
        const container = document.querySelector('.menu-items .container');
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div style="text-align: center; padding: 3rem; color: #666;">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
                        <h3>No dishes found</h3>
                        <p>Try searching for something else or browse our categories above.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Group items by category for display
        const groupedItems = this.groupItemsByCategory(items);
        
        let html = '';
        for (const [cat, categoryItems] of Object.entries(groupedItems)) {
            html += this.renderCategorySection(cat, categoryItems);
        }
        
        container.innerHTML = html;
        this.initializeAnimations();
    }

    // Group items by category
    groupItemsByCategory(items) {
        const categories = {
            appetizers: { name: 'Appetizers', icon: 'fas fa-seedling' },
            pizzas: { name: 'Pizzas', icon: 'fas fa-pizza-slice' },
            burgers: { name: 'Burgers', icon: 'fas fa-hamburger' },
            salads: { name: 'Salads', icon: 'fas fa-leaf' },
            desserts: { name: 'Desserts', icon: 'fas fa-ice-cream' },
            beverages: { name: 'Beverages', icon: 'fas fa-coffee' }
        };

        const grouped = {};
        
        items.forEach(item => {
            // Determine category based on item ID ranges
            let category;
            if (item.id <= 3) category = 'appetizers';
            else if (item.id <= 6) category = 'pizzas';
            else if (item.id <= 9) category = 'burgers';
            else if (item.id <= 12) category = 'salads';
            else if (item.id <= 15) category = 'desserts';
            else category = 'beverages';
            
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });

        return grouped;
    }

    // Render a category section
    renderCategorySection(category, items) {
        const categoryInfo = {
            appetizers: { name: 'Appetizers', icon: 'fas fa-seedling' },
            pizzas: { name: 'Pizzas', icon: 'fas fa-pizza-slice' },
            burgers: { name: 'Burgers', icon: 'fas fa-hamburger' },
            salads: { name: 'Salads', icon: 'fas fa-leaf' },
            desserts: { name: 'Desserts', icon: 'fas fa-ice-cream' },
            beverages: { name: 'Beverages', icon: 'fas fa-coffee' }
        };

        const info = categoryInfo[category] || { name: category, icon: 'fas fa-utensils' };
        
        return `
            <div class="menu-section" data-category="${category}">
                <h2><i class="${info.icon}"></i> ${info.name}</h2>
                <div class="items-grid">
                    ${items.map(item => this.renderMenuItem(item)).join('')}
                </div>
            </div>
        `;
    }

    // Render individual menu item
    renderMenuItem(item) {
        return `
            <div class="menu-item" data-item-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="item-footer">
                        <span class="price">$${item.price.toFixed(2)}</span>
                        <button class="add-to-cart" data-item="${item.name}" data-price="${item.price}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Show error message
    showError(message) {
        const container = document.querySelector('.menu-items .container');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-secondary">Retry</button>
            </div>
        `;
    }

    toggleNoResults(show) {
        let noResultsMsg = document.querySelector('.no-results');
        
        if (show && !noResultsMsg) {
            const menuItems = document.querySelector('.menu-items');
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
                    <h3>No dishes found</h3>
                    <p>Try searching for something else or browse our categories above.</p>
                </div>
            `;
            menuItems.appendChild(noResultsMsg);
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

// Add special effects for menu items
document.addEventListener('DOMContentLoaded', () => {
    new MenuManager();
    
    // Add special badges to certain items
    const specialItems = [
        'Margherita Pizza',
        'Caesar Salad',
        'Chocolate Cake'
    ];
    
    const vegetarianItems = [
        'Veggie Burger',
        'Caesar Salad',
        'Greek Salad',
        'Fresh Lemonade',
        'Tropical Smoothie'
    ];
    
    document.querySelectorAll('.menu-item').forEach(item => {
        const itemName = item.querySelector('h3').textContent;
        
        if (specialItems.includes(itemName)) {
            item.classList.add('special');
        }
        
        if (vegetarianItems.includes(itemName)) {
            item.classList.add('vegetarian');
        }
    });
    
    // Add loading effect when adding to cart
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const menuItem = e.target.closest('.menu-item');
            menuItem.classList.add('loading');
            
            setTimeout(() => {
                menuItem.classList.remove('loading');
            }, 1000);
        }
    });
    
    // Smooth scroll to menu sections when filter is clicked
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const menuItems = document.querySelector('.menu-items');
            menuItems.scrollIntoView({ behavior: 'smooth' });
        });
    });
});

// Add parallax effect to menu hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const menuHero = document.querySelector('.menu-hero');
    
    if (menuHero) {
        menuHero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add hover effects for better interactivity
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});
