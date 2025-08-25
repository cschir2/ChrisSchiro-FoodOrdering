// Menu page specific functionality
class MenuManager {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindFilterEvents();
        this.initializeAnimations();
        this.addSearchFunctionality();
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

    filterItems(category) {
        const menuSections = document.querySelectorAll('.menu-section');
        
        menuSections.forEach(section => {
            const sectionCategory = section.getAttribute('data-category');
            
            if (category === 'all' || sectionCategory === category) {
                section.classList.remove('hidden');
                this.animateItemsIn(section);
            } else {
                section.classList.add('hidden');
            }
        });
        
        this.currentFilter = category;
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

    searchItems(searchTerm) {
        const menuItems = document.querySelectorAll('.menu-item');
        const menuSections = document.querySelectorAll('.menu-section');
        
        if (searchTerm === '') {
            // Show all items based on current filter
            this.filterItems(this.currentFilter);
            return;
        }

        // Hide all sections first
        menuSections.forEach(section => {
            section.classList.add('hidden');
        });

        let hasResults = false;

        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDescription = item.querySelector('p').textContent.toLowerCase();
            
            if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                const section = item.closest('.menu-section');
                section.classList.remove('hidden');
                item.style.display = 'block';
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });

        // Show "no results" message if needed
        this.toggleNoResults(!hasResults);
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
