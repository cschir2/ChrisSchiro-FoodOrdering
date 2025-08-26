// Shopping Cart functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.ajaxService = new AjaxService();
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.bindEvents();
    }

    bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const item = e.target.getAttribute('data-item');
                const price = parseFloat(e.target.getAttribute('data-price'));
                this.addItem(item, price);
            }

            if (e.target.classList.contains('remove-item')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.removeItem(index);
            }
        });

        // Cart sidebar controls
        document.getElementById('cartBtn').addEventListener('click', () => {
            this.toggleCart();
        });

        document.getElementById('closeCart').addEventListener('click', () => {
            this.closeCart();
        });

        document.getElementById('overlay').addEventListener('click', () => {
            this.closeCart();
        });

        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });

        // Mobile navigation
        document.getElementById('hamburger').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Contact form submission
        document.querySelector('.contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactForm(e);
        });
    }

    addItem(name, price) {
        const existingItem = this.items.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showAddedToCartMessage(name);
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items
        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = this.items.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <button class="remove-item" data-index="${index}">Remove</button>
                </div>
            `).join('');
        }

        // Update total
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        
        cartSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.getElementById('hamburger');
        
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    showAddedToCartMessage(itemName) {
        // Create and show a temporary message
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.innerHTML = `
            <div class="cart-message-content">
                <i class="fas fa-check-circle"></i>
                <span>${itemName} added to cart!</span>
            </div>
        `;
        
        // Add styles
        message.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1002;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(message);

        // Animate in
        setTimeout(() => {
            message.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            message.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 3000);
    }

    async checkout() {
        if (this.items.length === 0) {
            this.showMessage('Your cart is empty!', 'error');
            return;
        }

        // Show checkout modal instead of alert
        this.showCheckoutModal();
    }

    async processOrder(customerInfo = {}) {
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const orderData = {
            items: this.items,
            customerInfo,
            total: total
        };

        // Show loading state
        this.showOrderProcessing();
        
        const result = await this.ajaxService.submitOrder(orderData);
        
        if (result.success) {
            this.showOrderSuccess(result.data);
            // Clear cart
            this.items = [];
            this.saveCart();
            this.updateCartDisplay();
            this.closeCart();
        } else {
            this.showOrderError(result.error);
        }
    }

    async handleContactForm(e) {
        const name = e.target.querySelector('input[type="text"]').value;
        const email = e.target.querySelector('input[type="email"]').value;
        const message = e.target.querySelector('textarea').value;

        if (!name || !email || !message) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = { name, email, message };
        const result = await this.ajaxService.submitContactForm(formData);
        
        if (result.success) {
            this.showMessage(result.data.message, 'success');
            e.target.reset();
        } else {
            this.showMessage('Failed to send message. Please try again.', 'error');
        }

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }

    // Show checkout modal
    showCheckoutModal() {
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderSummary = this.items.map(item => 
            `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('<br>');

        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Checkout</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="order-summary">
                            <h4>Order Summary</h4>
                            <div class="order-items">${orderSummary}</div>
                            <div class="order-total"><strong>Total: $${total.toFixed(2)}</strong></div>
                        </div>
                        <form class="checkout-form">
                            <div class="form-group">
                                <label>Name *</label>
                                <input type="text" name="name" required>
                            </div>
                            <div class="form-group">
                                <label>Phone *</label>
                                <input type="tel" name="phone" required>
                            </div>
                            <div class="form-group">
                                <label>Address *</label>
                                <textarea name="address" required></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary cancel-order">Cancel</button>
                                <button type="submit" class="btn btn-primary place-order">Place Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
        `;

        document.body.appendChild(modal);

        // Bind events
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.cancel-order').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const customerInfo = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                address: formData.get('address')
            };
            document.body.removeChild(modal);
            this.processOrder(customerInfo);
        });

        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
    }

    // Show order processing state
    showOrderProcessing() {
        const modal = document.createElement('div');
        modal.className = 'processing-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="processing-content">
                        <div class="spinner"></div>
                        <h3>Processing your order...</h3>
                        <p>Please wait while we confirm your order.</p>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2001;
        `;

        document.body.appendChild(modal);
        this.processingModal = modal;
    }

    // Show order success
    showOrderSuccess(orderData) {
        if (this.processingModal) {
            document.body.removeChild(this.processingModal);
        }

        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="success-content">
                        <i class="fas fa-check-circle success-icon"></i>
                        <h3>Order Placed Successfully!</h3>
                        <p><strong>Order #${orderData.orderId}</strong></p>
                        <p>Estimated delivery time: ${orderData.estimatedTime}</p>
                        <p>Thank you for your order!</p>
                        <button class="btn btn-primary close-success">Continue Shopping</button>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2001;
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-success').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
    }

    // Show order error
    showOrderError(error) {
        if (this.processingModal) {
            document.body.removeChild(this.processingModal);
        }

        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle error-icon"></i>
                        <h3>Order Failed</h3>
                        <p>${error}</p>
                        <div class="error-actions">
                            <button class="btn btn-secondary close-error">Close</button>
                            <button class="btn btn-primary retry-order">Try Again</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2001;
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-error').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.retry-order').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showCheckoutModal();
        });

        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
    }

    // Show general messages
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message-toast ${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        messageEl.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1002;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(messageEl)) {
                    document.body.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ShoppingCart();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Intersection Observer for animations
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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.featured-item, .feature, .contact-item');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    });

    // Add hover effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});
