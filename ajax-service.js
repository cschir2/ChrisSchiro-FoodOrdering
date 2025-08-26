// AJAX Service Module for Food Ordering App
class AjaxService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.cache = new Map();
    }

    // Generic AJAX request method
    async request(url, options = {}) {
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('AJAX Request failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Show loading indicator
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    }

    // Hide loading indicator
    hideLoading(containerId) {
        const loadingElement = document.querySelector(`#${containerId} .loading-spinner`);
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // Get all menu items
    async getMenuItems(category = 'all') {
        const cacheKey = `menu_${category}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return { success: true, data: this.cache.get(cacheKey) };
        }

        const url = category === 'all' 
            ? `${this.baseURL}/menu`
            : `${this.baseURL}/menu/${category}`;
            
        const result = await this.request(url);
        
        if (result.success) {
            this.cache.set(cacheKey, result.data);
        }
        
        return result;
    }

    // Search menu items
    async searchMenuItems(query) {
        if (!query.trim()) {
            return { success: true, data: [] };
        }
        
        const url = `${this.baseURL}/menu/search/${encodeURIComponent(query)}`;
        return await this.request(url);
    }

    // Submit order
    async submitOrder(orderData) {
        const url = `${this.baseURL}/orders`;
        return await this.request(url, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    // Get order status
    async getOrderStatus(orderId) {
        const url = `${this.baseURL}/orders/${orderId}`;
        return await this.request(url);
    }

    // Submit contact form
    async submitContactForm(formData) {
        const url = `${this.baseURL}/contact`;
        return await this.request(url, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}

// Loading spinner CSS (injected dynamically)
const loadingCSS = `
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: #666;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #e74c3c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error-message {
        background: #ff6b6b;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        text-align: center;
    }

    .success-message {
        background: #51cf66;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        text-align: center;
    }

    .menu-item.loading {
        opacity: 0.6;
        pointer-events: none;
        position: relative;
    }

    .menu-item.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #e74c3c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        transform: translate(-50%, -50%);
    }
`;

// Inject loading CSS
const style = document.createElement('style');
style.textContent = loadingCSS;
document.head.appendChild(style);

// Export for use in other modules
window.AjaxService = AjaxService;
