const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Sample menu data
const menuData = {
    appetizers: [
        { id: 1, name: "Mozzarella Sticks", description: "Golden fried mozzarella with marinara sauce", price: 8.99, image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 2, name: "Buffalo Wings", description: "Spicy chicken wings with blue cheese dip", price: 12.99, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 3, name: "Loaded Nachos", description: "Tortilla chips with cheese, jalapeños, and sour cream", price: 10.99, image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
    ],
    pizzas: [
        { id: 4, name: "Margherita Pizza", description: "Fresh tomatoes, mozzarella, and basil", price: 16.99, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 5, name: "Pepperoni Pizza", description: "Classic pepperoni with mozzarella cheese", price: 18.99, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 6, name: "Supreme Pizza", description: "Pepperoni, sausage, peppers, onions, and mushrooms", price: 22.99, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
    ],
    burgers: [
        { id: 7, name: "Classic Cheeseburger", description: "Beef patty with cheese, lettuce, tomato, and pickles", price: 12.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 8, name: "BBQ Bacon Burger", description: "Beef patty with bacon, BBQ sauce, and onion rings", price: 15.99, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 9, name: "Veggie Burger", description: "Plant-based patty with avocado and sprouts", price: 11.99, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
    ],
    salads: [
        { id: 10, name: "Caesar Salad", description: "Romaine lettuce with parmesan and croutons", price: 9.99, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 11, name: "Greek Salad", description: "Mixed greens with feta, olives, and tomatoes", price: 11.99, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 12, name: "Chicken Cobb Salad", description: "Grilled chicken with bacon, eggs, and blue cheese", price: 14.99, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
    ],
    desserts: [
        { id: 13, name: "Chocolate Cake", description: "Rich chocolate cake with chocolate frosting", price: 6.99, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 14, name: "New York Cheesecake", description: "Creamy cheesecake with berry compote", price: 7.99, image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 15, name: "Ice Cream Sundae", description: "Vanilla ice cream with chocolate sauce and nuts", price: 5.99, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
    ],
    beverages: [
        { id: 16, name: "Fresh Lemonade", description: "Freshly squeezed lemon juice with mint", price: 3.99, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 17, name: "Iced Coffee", description: "Cold brew coffee with cream and sugar", price: 4.99, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 18, name: "Tropical Smoothie", description: "Mango, pineapple, and coconut blend", price: 6.99, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
    ]
};

// Store orders in memory (in production, use a database)
let orders = [];
let orderIdCounter = 1;

// API Routes

// Get all menu items or by category
app.get('/api/menu', (req, res) => {
    const { category } = req.query;
    
    // Simulate network delay
    setTimeout(() => {
        if (category && category !== 'all') {
            res.json(menuData[category] || []);
        } else {
            // Return all items
            const allItems = Object.values(menuData).flat();
            res.json(allItems);
        }
    }, 500); // 500ms delay to simulate real API
});

// Get menu items by category
app.get('/api/menu/:category', (req, res) => {
    const { category } = req.params;
    
    setTimeout(() => {
        res.json(menuData[category] || []);
    }, 300);
});

// Search menu items
app.get('/api/menu/search/:query', (req, res) => {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();
    
    setTimeout(() => {
        const allItems = Object.values(menuData).flat();
        const results = allItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.description.toLowerCase().includes(searchTerm)
        );
        res.json(results);
    }, 400);
});

// Submit order
app.post('/api/orders', (req, res) => {
    const { items, customerInfo, total } = req.body;
    
    // Validate order
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    // Create order
    const order = {
        id: orderIdCounter++,
        items,
        customerInfo: customerInfo || {},
        total,
        status: 'confirmed',
        estimatedTime: '30-45 minutes',
        timestamp: new Date().toISOString()
    };
    
    orders.push(order);
    
    // Simulate processing time
    setTimeout(() => {
        res.json({
            success: true,
            orderId: order.id,
            estimatedTime: order.estimatedTime,
            message: 'Order placed successfully!'
        });
    }, 1000);
});

// Get order status
app.get('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    const order = orders.find(o => o.id === parseInt(orderId));
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Simulate email sending
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you soon.'
        });
    }, 800);
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('API endpoints:');
    console.log('- GET /api/menu - Get all menu items');
    console.log('- GET /api/menu?category=pizzas - Get items by category');
    console.log('- GET /api/menu/search/:query - Search menu items');
    console.log('- POST /api/orders - Submit order');
    console.log('- POST /api/contact - Submit contact form');
});
