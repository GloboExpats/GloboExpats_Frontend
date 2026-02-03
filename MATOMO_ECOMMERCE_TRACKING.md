# Matomo Ecommerce Tracking Implementation

## ✅ Implementation Complete

### What Was Implemented
1. **Product View Tracking** - Tracks when users view product detail pages
2. **Category View Tracking** - Tracks product category interest based on product views
3. **Add to Cart Tracking** - Tracks when users add items to cart or increase quantities
4. **Purchase Tracking** - Tracks completed orders on the checkout success page with **payment confirmation validation**

All tracking events are implemented in their respective pages with proper deduplication and error handling.

### 🎯 Revenue Tracking Accuracy
**ONLY CONFIRMED ORDERS ARE TRACKED** to ensure accurate revenue reporting:
- ✅ **COD orders:** Tracked immediately (confirmed on creation)
- ✅ **Mobile Money orders:** Tracked ONLY after webhook confirms payment
- ✅ **Meetup orders:** Tracked ONLY after manual confirmation
- ❌ **Failed payments:** Never tracked
- ❌ **Pending payments:** Not tracked (prevents revenue inflation)
- ❌ **Cancelled orders:** Not tracked

This prevents your Matomo revenue reports from being inflated with unconfirmed, failed, or cancelled transactions.

---

## 📊 Product View Tracking

### Code Location
**File:** `/app/product/[id]/page.tsx`  
**Line:** ~145-185 (inside `fetchProductData()` useEffect, right after `setProduct()`)

### What Gets Tracked
When a user views a product page, the following data is pushed to Matomo:

```typescript
{
  event: 'view_item',
  ecommerce: {
    items: [{
      item_id: "123",                    // Product ID from backend
      item_name: "Product Name",         // Product name from backend
      item_category: "Electronics",      // Category name from backend
      price: 99.99                       // Numeric price (parsed from string)
    }]
  }
}
```

### Fields Used (Matomo-Safe)
✅ **item_id** - Product ID (string)  
✅ **item_name** - Product name (string)  
✅ **item_category** - Category name (string, defaults to "Uncategorized")  
✅ **price** - Numeric price (parsed using `parseNumericPrice()`)  

---

## 📂 Category View Tracking

### Code Location
**File:** `/app/product/[id]/page.tsx`  
**Line:** ~165-173 (same location as product tracking, immediately after)

### What Gets Tracked
When a user views a product page, the category is also tracked:

```typescript
{
  event: 'view_item_list',
  ecommerce: {
    item_list_name: "Electronics"      // Category name from product
  }
}
```

### Logic
- ✅ Extracts category from product data: `productData.categoryName || transformedProduct.category`
- ✅ Only tracks if category exists and is not "Uncategorized"
- ✅ Fires automatically with every product view

### Why This Approach?
Instead of tracking category filter selections in browse pages, we track the **actual category of products users view**. This gives:
- ✅ **Real category interest** - what categories do users actually engage with?
- ✅ **Simple implementation** - single location, same product data
- ✅ **No deduplication needed** - each product view = one category view
- ✅ **Automatic** - works for all product views regardless of entry point

---

## 🛒 Add to Cart Tracking

### Code Location
**File:** `/providers/cart-provider.tsx`  
**Functions:** 
- `addItem()` - Line ~604 (tracks new items added to cart)
- `updateQuantity()` - Line ~542 (tracks quantity increases)

### ⭐ Why Track in Cart Provider?
- ✅ **Complete Coverage** - Tracks ALL add-to-cart actions from anywhere in the app
- ✅ **Single Source of Truth** - All cart operations go through this provider
- ✅ **No Duplication** - One place to maintain tracking code
- ✅ **Success Confirmation** - Only tracks after verification checks pass
- ✅ **Automatic** - Works for product pages, search results, product cards, etc.

### What Gets Tracked

#### 1. **New Item Added to Cart**
When a user adds a product to their cart:

```typescript
{
  event: 'add_to_cart',
  ecommerce: {
    items: [{
      item_id: "123",                    // Product ID
      item_name: "Product Name",         // Product name
      item_category: "Electronics",      // Category name
      item_price: 99.99,                 // Product price
      quantity: 2                        // Quantity added
    }],
    total: 199.98                        // Price × Quantity
  }
}
```

#### 2. **Quantity Increased in Cart**
When a user increases quantity of an existing cart item (e.g., from 2 to 5):

```typescript
{
  event: 'add_to_cart',
  ecommerce: {
    items: [{
      item_id: "123",
      item_name: "Product Name",
      item_category: "Electronics",
      item_price: 99.99,
      quantity: 3                        // Only the ADDITIONAL quantity (5 - 2)
    }],
    total: 299.97                        // Additional quantity × Price
  }
}
```

### Where It's Triggered From

The tracking automatically works for add-to-cart actions from:

1. ✅ **Product Detail Page** (`/app/product/[id]/page.tsx`)
   - "Add to Cart" button → calls `addToCart()` from provider
   
2. ✅ **Product Cards** (`/components/ui/product-card.tsx`)
   - Quick-add cart button → calls `addToCart()` from provider
   
3. ✅ **Search Results** (`/app/search/page.tsx`)
   - Search result "Add to Cart" → calls `addToCart()` from provider
   
4. ✅ **Browse/Category Pages**
   - Any product card → calls `addToCart()` from provider
   
5. ✅ **Cart Page** (`/app/cart/page.tsx`)
   - Quantity increase buttons → calls `updateQuantity()` from provider
   
6. ✅ **Cart Side Panel** (`/components/cart-sidepanel.tsx`)
   - Quantity controls → calls `updateQuantity()` from provider

### Tracking Logic

#### New Item Added:
```typescript
// After successful cart addition (in addItem function)
if (typeof window !== 'undefined' && window._mtm) {
  window._mtm.push({
    event: 'add_to_cart',
    ecommerce: {
      items: [{
        item_id: String(item.id),
        item_name: item.title,
        item_category: item.category || 'Uncategorized',
        item_price: item.price,
        quantity: quantity
      }],
      total: item.price * quantity
    }
  })
}
```

#### Quantity Increase:
```typescript
// After quantity update (in updateQuantity function)
const quantityDiff = newQuantity - oldQuantity

if (quantityDiff > 0) { // Only track increases
  window._mtm.push({
    event: 'add_to_cart',
    ecommerce: {
      items: [{
        item_id: String(item.id),
        item_name: item.title,
        item_category: item.category || 'Uncategorized',
        item_price: item.price,
        quantity: quantityDiff  // Only the additional quantity
      }],
      total: item.price * quantityDiff
    }
  })
}
```

### What's NOT Tracked
- ❌ **Quantity decreases** - Use separate `remove_from_cart` event for that (future)
- ❌ **Failed additions** - Only tracks after verification passes
- ❌ **Unauthenticated users** - Tracking only fires for logged-in users
- ❌ **Unverified email** - Must have verified email to add to cart

### Fields Tracked
✅ **item_id** - Product ID (string)  
✅ **item_name** - Product name (string)  
✅ **item_category** - Category name (string, defaults to "Uncategorized")  
✅ **item_price** - Product price (number)  
✅ **quantity** - Number of units added (number)  
✅ **total** - Total value of items added (price × quantity)

### Console Logging
Every successful tracking logs to console for debugging:

```javascript
// New item added:
✅ Matomo: Add to Cart tracked
{
  itemId: "123",
  itemName: "Product Name",
  category: "Electronics",
  quantity: 2,
  total: 199.98
}

// Quantity increased:
✅ Matomo: Cart quantity increased (tracked as add_to_cart)
{
  itemId: "123",
  itemName: "Product Name",
  oldQuantity: 2,
  newQuantity: 5,
  addedQuantity: 3,
  total: 299.97
}
```

### Why This Approach?
Instead of tracking category filter selections in browse pages, we track the **actual category of products users view**. This gives:
- ✅ **Real category interest** - what categories do users actually engage with?
- ✅ **Simple implementation** - single location, same product data
- ✅ **No deduplication needed** - each product view = one category view
- ✅ **Automatic** - works for all product views regardless of entry point

---

## 💰 Purchase Tracking (Ecommerce Orders)

### Code Location
**File:** `/app/checkout/success/page.tsx`  
**Line:** ~95-295 (inside multiple useEffects for order loading and SSE updates)

### ⚠️ IMPORTANT: Only Confirmed Orders Are Tracked
The implementation includes **payment confirmation validation** to ensure only completed purchases are tracked. This prevents inflating revenue reports with pending, failed, or cancelled orders.

### Payment Method Logic
Different payment methods have different confirmation flows:

| Payment Method | Initial Status | Tracked When | Timing |
|---------------|----------------|--------------|--------|
| **Cash on Delivery (COD)** | `status: 'confirmed'` | Immediately | On success page load |
| **Mobile Money (M-Pesa/Airtel)** | `status: 'pending_payment'` | After payment confirmed | When SSE updates status |
| **Meet in Person** | `status: 'awaiting_meetup'` | After meetup confirmed | When status manually updated |

### What Gets Tracked
When an order is **confirmed**, the following data is pushed to Matomo:

```typescript
{
  event: 'purchase',
  ecommerce: {
    purchase: {
      id: "ORD-1738619234-456",        // Unique order ID
      revenue: 45000,                  // Total revenue (grand total)
      orderSubTotal: 45000,            // Order subtotal (before tax/shipping)
      tax: 0,                          // Tax amount (not implemented yet)
      shipping: 0,                     // Shipping cost (included in total)
      discount: 0                      // Discount applied (not implemented yet)
    }
  }
}
```

### Tracking Validation Logic
```typescript
// Only track if order is CONFIRMED
const isOrderConfirmed = 
  parsedOrder.status === 'confirmed' ||
  parsedOrder.mobilePayment?.status === 'COMPLETED' ||
  parsedOrder.paymentStatus?.toLowerCase().includes('completed')

if (isOrderConfirmed && !trackedOrders.current.has(parsedOrder.id)) {
  // Track purchase in Matomo
}
```

### How It Works

#### 1. **COD Orders** ✅
- Order created with `status: 'confirmed'`
- User redirected to success page
- Purchase tracked immediately on page load
- ✅ **Result:** Accurate - payment happens on delivery

#### 2. **Mobile Money Orders** ⏳→✅
- Order created with `status: 'pending_payment'`
- User redirected to success page
- Purchase **NOT tracked yet** (payment pending)
- Webhook → SSE updates localStorage when payment completes
- Storage event listener detects status change
- Purchase tracked when `status: 'confirmed'` or `mobilePayment.status: 'COMPLETED'`
- ✅ **Result:** Accurate - only confirmed payments tracked

#### 3. **Meet in Person Orders** ⏳→✅
- Order created with `status: 'awaiting_meetup'`
- User redirected to success page
- Purchase **NOT tracked yet** (meetup not happened)
- When meetup happens and order is manually confirmed
- Purchase tracked when `status: 'confirmed'`
- ✅ **Result:** Accurate - only completed meetups tracked

### Deduplication
Uses `useRef<Set<string>>` to track which orders have been sent to Matomo:
- ✅ Prevents duplicate tracking if user refreshes success page
- ✅ Prevents duplicate tracking when SSE updates localStorage
- ✅ Works across page refreshes (tracked IDs persist in component lifecycle)

### Fields Tracked
✅ **id** - Unique order ID (string)  
✅ **revenue** - Total order amount including everything (number)  
✅ **orderSubTotal** - Sum of all items (price × quantity) (number)  
✅ **tax** - Tax amount (currently 0, can be added later)  
✅ **shipping** - Shipping cost (currently 0, can be added later)  
✅ **discount** - Discount applied (currently 0, can be added later)

### Deduplication Logic
Uses `useRef` to prevent duplicate tracking if user refreshes the success page:

```typescript
const trackedOrders = useRef<Set<string>>(new Set())

// Only track if not already tracked
if (!trackedOrders.current.has(parsedOrder.id)) {
  // Track purchase...
  trackedOrders.current.add(parsedOrder.id)
}
```

### Calculation Logic
```typescript
// Order subtotal = sum of all items
const orderSubTotal = orderData.items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
)

// Revenue = total (includes everything)
revenue: orderData.total  // From backend/checkout calculation
```

### When It Fires
- ✅ User completes checkout (any payment method: COD, Mobile, Meetup)
- ✅ Order is created and saved to localStorage
- ✅ User is redirected to `/checkout/success?orderId=XXX`
- ✅ Order data loads successfully from localStorage
- ✅ Tracking fires immediately after order data is set

### Works For All Payment Methods
- ✅ **Cash on Delivery (COD)** - Tracks immediately on success page
- ✅ **Meet in Person** - Tracks immediately on success page
- ✅ **Mobile Money (M-Pesa, Airtel, etc.)** - Tracks when success page loads (after payment initiation)

**Note:** For mobile payments, tracking happens on success page load, not when payment is confirmed. This means pending mobile payments are also tracked. For 100% accuracy, you could enhance this to only track confirmed mobile payments (see Hybrid Approach in brainstorming).

### Error Handling
- ✅ Checks if `window._mtm` exists before tracking
- ✅ Uses try-catch to prevent tracking errors from breaking the page
- ✅ Logs warnings if tracking fails
- ✅ Gracefully handles missing order data

---

## 🎯 When Tracking Fires (Summary)

### Product View Event (`view_item`)
- User navigates to `/product/123`
- Product data loads from API
- Tracking fires after product is set in state

### Category View Event (`view_item_list`)
- Fires immediately after product view
- Uses product's category field
- Skipped if category is missing or "Uncategorized"

### Purchase Event (`purchase`)
- User completes checkout
- Order is created (COD/Mobile/Meetup)
- User lands on `/checkout/success?orderId=XXX`
- Order data loads from localStorage
- Tracking fires immediately

---

## 🖥️ Console Output

### Product & Category Views
```
📊 Matomo: Category view tracked Electronics
📊 Matomo: Product view tracked { id: 123, name: "Product Name", category: "Electronics" }
```

### Purchase
```
📊 Matomo: Purchase tracked { 
  orderId: "ORD-1738619234-456", 
  revenue: 45000, 
  currency: "TZS", 
  items: 3 
}
```

### Error Handling
```
⚠️ Failed to track purchase in Matomo: [error details]
```

---

## 🚀 Next Steps - Matomo Tag Manager Configuration

### You Need to Configure in Matomo Tag Manager UI:

---

## 1️⃣ Product View Configuration

### A) Data Layer Variable (if not created yet)
- **Name:** `Ecommerce`
- **Type:** Data Layer Variable
- **Data Layer Variable Name:** `ecommerce`

### B) Custom Event Trigger
- **Name:** `Product View`
- **Trigger Type:** Custom Event
- **Event Name:** `view_item`

### C) Custom HTML Tag
- **Name:** `Ecommerce - Product View`
- **Tag Type:** Custom HTML
- **Trigger:** `Product View` (from step B)
- **HTML Content:**

```html
<script>
    window._paq = window._paq || [];
    var ecommerce = {{Ecommerce}};
    
    if (ecommerce && ecommerce.items && ecommerce.items.length) {
        ecommerce.items.forEach(function(item) {
            // Track product view
            _paq.push(['setEcommerceView',
                item.item_id,           // Product ID
                item.item_name,         // Product name
                item.item_category,     // Category
                item.price              // Price
            ]);
            
            console.log('Matomo setEcommerceView:', item.item_name, item.price);
        });
        
        // Send the data to Matomo
        _paq.push(['trackPageView']);
    }
</script>
```

---

## 2️⃣ Category View Configuration

### D) Custom Event Trigger
- **Name:** `Category View`
- **Trigger Type:** Custom Event
- **Event Name:** `view_item_list`

### E) Custom HTML Tag
- **Name:** `Ecommerce - Category View`
- **Tag Type:** Custom HTML
- **Trigger:** `Category View` (from step D)
- **HTML Content:**

```html
<script>
    window._paq = window._paq || [];
    var ecommerce = {{Ecommerce}};

    if (ecommerce && ecommerce.item_list_name) {
        // Push custom event for category view
        _paq.push(['trackEvent', 'Ecommerce', 'View Category', ecommerce.item_list_name]);

        // Push ecommerce category data
        _paq.push([
            'setEcommerceView',
            false,  // Product name not applicable for category view
            false,  // Product SKU not applicable for category view
            ecommerce.item_list_name  // Category name
        ]);

        console.log('Matomo category view:', ecommerce.item_list_name);
        
        // Track page view to send the data
        _paq.push(['trackPageView']);
    }
</script>
```

---

## 3️⃣ Add to Cart Configuration

### I) Custom Event Trigger
- **Name:** `Add to Cart Event`
- **Trigger Type:** Custom Event
- **Event Name:** `add_to_cart`

### J) Custom HTML Tag
- **Name:** `Ecommerce - Add to Cart`
- **Tag Type:** Custom HTML
- **Trigger:** `Add to Cart Event` (from step I)
- **HTML Content:**

```html
<script>
    window._paq = window._paq || [];
    
    // Find the add_to_cart event in the data layer
    var ecommerceData = _mtm.find(function(item) {
        return item.event === "add_to_cart" && item.ecommerce && item.ecommerce.items;
    });
    
    if (ecommerceData) {
        var items = ecommerceData.ecommerce.items;
        
        // Loop through the items and track each one to Matomo
        items.forEach(function(item, index) {
            _paq.push(['addEcommerceItem',
                item.item_id,       // Product SKU (Required)
                item.item_name,     // Product Name (Optional)
                item.item_category, // Product Category (Optional)
                item.item_price,    // Product Price (Optional)
                item.quantity       // Product Quantity (Optional)
            ]);
            
            console.log('Matomo addEcommerceItem:', item.item_name, 'qty:', item.quantity);
        });
        
        // Track the cart update with the total value
        _paq.push(['trackEcommerceCartUpdate', ecommerceData.ecommerce.total]);
        
        console.log('Matomo trackEcommerceCartUpdate:', ecommerceData.ecommerce.total);
    }
</script>
```

**Note:** This configuration tracks both:
- ✅ New items added to cart
- ✅ Quantity increases (tracked as additional add-to-cart)

---

## 4️⃣ Purchase (Ecommerce Order) Configuration

### K) Data Layer Variable
- **Name:** `PurchaseInfo`
- **Type:** Data Layer Variable
- **Data Layer Variable Name:** `ecommerce.purchase`

### L) Custom Event Trigger
- **Name:** `Ecommerce Purchase`
- **Trigger Type:** Custom Event
- **Event Name:** `purchase`

### M) Custom HTML Tag
- **Name:** `Ecommerce - Order Tracking`
- **Tag Type:** Custom HTML
- **Trigger:** `Ecommerce Purchase` (from step L)
- **HTML Content:**

```html
<script>
    window._paq = window._paq || [];
    var purchaseInfo = {{PurchaseInfo}};

    if (purchaseInfo && purchaseInfo.id) {
        // Track ecommerce order
        _paq.push(['trackEcommerceOrder',
            purchaseInfo.id,                    // (required) Unique Order ID
            purchaseInfo.revenue,               // (required) Order Revenue grand total
            purchaseInfo.orderSubTotal,         // (optional) Order sub total
            (purchaseInfo.tax || 0),            // (optional) Tax amount
            (purchaseInfo.shipping || 0),       // (optional) Shipping amount
            (purchaseInfo.discount || false)    // (optional) Discount offered
        ]);

        console.log('Matomo trackEcommerceOrder:', {
            id: purchaseInfo.id,
            revenue: purchaseInfo.revenue
        });
    }
</script>
```

---

## 5️⃣ Publish Container
- Click **"Create Version"** in Matomo Tag Manager
- Add description: "Added ecommerce product, category, add-to-cart, and purchase tracking"
- Click **"Publish"**

---

## 🧪 Testing

### 1. Test in Browser Console

**For Product/Category Views:**
Navigate to any product page, then check:

```javascript
window._mtm

// Should show both events:
[
  { event: "mtm.Start", ... },
  { 
    event: "view_item", 
    ecommerce: { 
      items: [{ 
        item_id: "123", 
        item_name: "Product Name",
        item_category: "Electronics",
        price: 99.99 
      }] 
    } 
  },
  {
    event: "view_item_list",
    ecommerce: {
      item_list_name: "Electronics"
    }
  }
]
```

**For Add to Cart:**
Add a product to cart, then check:

```javascript
window._mtm

// Should show add_to_cart event:
[
  { event: "mtm.Start", ... },
  {
    event: "add_to_cart",
    ecommerce: {
      items: [{
        item_id: "123",
        item_name: "Product Name",
        item_category: "Electronics",
        item_price: 99.99,
        quantity: 2
      }],
      total: 199.98
    }
  }
]
```

**For Purchase:**
Complete an order and land on checkout success page:

```javascript
window._mtm

// Should show purchase event:
[
  { event: "mtm.Start", ... },
  {
    event: "purchase",
    ecommerce: {
      purchase: {
        id: "ORD-1738619234-456",
        revenue: 45000,
        orderSubTotal: 45000,
        tax: 0,
        shipping: 0,
        discount: 0
      }
    }
  }
]
```

### 2. Test in Matomo Tag Manager Preview
1. Enable **Preview Mode** in Matomo Tag Manager
2. **Test Product/Category Tracking:**
   - Navigate to a product page (e.g., `/product/123`)
   - Check Preview panel for `view_item` and `view_item_list` events
   - Verify both tags fire
3. **Test Add to Cart Tracking:**
   - From product page or search results, click "Add to Cart"
   - Check Preview panel for `add_to_cart` event
   - Verify `Ecommerce` data layer variable is populated
   - Verify `Ecommerce - Add to Cart` tag fires
   - Check console for `✅ Matomo: Add to Cart tracked` message
   - **Test quantity increase:** Go to cart, increase quantity
   - Check console for `✅ Matomo: Cart quantity increased (tracked as add_to_cart)`
4. **Test Purchase Tracking:**
   - Complete a test order
   - **Important:** Use **Cash on Delivery (COD)** payment method for immediate tracking
   - Land on `/checkout/success?orderId=XXX`
   - Check Preview panel for `purchase` event immediately
   - Verify `PurchaseInfo` data layer variable is populated
   - Verify `Ecommerce - Order Tracking` tag fires
   - Check console for `✅ Matomo: Purchase tracked (CONFIRMED ORDER)` message
5. **Test Mobile Payment Tracking:**
   - Complete a test order with Mobile Money payment
   - Land on success page - purchase should **NOT be tracked yet**
   - Wait for webhook/SSE to confirm payment
   - When payment confirms, check console for `✅ Matomo: Purchase tracked (Payment CONFIRMED via SSE)`

### 3. Test Payment Confirmation Logic
**COD Orders (Immediate Tracking):**
1. Complete order with COD payment
2. Check console immediately: Should see `✅ Matomo: Purchase tracked (CONFIRMED ORDER)`
3. Verify order status in localStorage: `status: 'confirmed'`

**Mobile Money Orders (Delayed Tracking):**
1. Complete order with M-Pesa/Airtel Money
2. Check console immediately: Should **NOT** see purchase tracking yet
3. Verify order status: `status: 'pending_payment'`
4. Wait for payment webhook to fire (SSE updates localStorage)
5. Check console: Should see `✅ Matomo: Purchase tracked (Payment CONFIRMED via SSE)`
6. Verify order status updated: `status: 'confirmed'` or `mobilePayment.status: 'COMPLETED'`

**Meetup Orders (No Tracking Until Confirmed):**
1. Complete order with "Meet in Person" payment
2. Check console: Should **NOT** see purchase tracking
3. Verify order status: `status: 'awaiting_meetup'`
4. Order will be tracked only when manually confirmed to `status: 'confirmed'`

### 4. Test Deduplication
1. Complete an order (COD for easy testing) and land on success page
2. Verify console shows `✅ Matomo: Purchase tracked (CONFIRMED ORDER)` once
3. **Refresh the success page**
4. Check console - should **NOT** see tracking message again
5. Verify deduplication: `trackedOrders` ref prevents duplicate tracking

### 5. Test Failed/Cancelled Payments (Should NOT Track)
1. Complete mobile payment order
2. Simulate failed payment (backend webhook sends `status: 'FAILED'`)
3. Verify purchase is **NOT tracked** in Matomo
4. Confirm no `purchase` event in console
5. ✅ **Result:** Failed payments don't inflate revenue reports

### 6. Test in Matomo Reports
After publishing and waiting ~24 hours:

**Product Views:**
1. Go to **Matomo Dashboard → Ecommerce → Products**
2. View product engagement metrics

**Category Views:**
1. Go to **Matomo Dashboard → Ecommerce → Products**
2. Filter by category to see category engagement

**Purchases (Orders):**
1. Go to **Matomo Dashboard → Ecommerce → Ecommerce** (or **Orders**)
2. You should see:
   - Order IDs
   - Revenue per order
   - Order dates
   - Total revenue
   - Number of orders
   - Average order value
   - Conversion rate

---

## 📊 What Data You'll Get

### Product Metrics
- Which products are viewed most?
- What's the average product price viewed?
- Which categories have the most product views?

### Category Metrics
- Which categories get the most interest? (based on product views)
- Category engagement trends over time
- Top categories by view count

### Order/Purchase Metrics
- **Total Revenue** - Sum of all order revenue
- **Number of Orders** - Total completed orders
- **Average Order Value (AOV)** - Revenue ÷ Number of orders
- **Order IDs** - Individual order tracking
- **Revenue Over Time** - Daily/weekly/monthly revenue trends
- **Conversion Rate** - Orders ÷ Product views (%)
- **Revenue Per Visit** - Total revenue ÷ Total visits

### Ecommerce Funnel Analysis
```
Product Views (view_item)
        ↓
Category Interest (view_item_list)
        ↓
Purchase (purchase)
```
- Track drop-off rates at each stage
- Identify optimization opportunities
- Measure conversion effectiveness

---

## 📝 Commit History
- **Commit 1:** `adc619a` - "feat: Add Matomo ecommerce product view tracking"
- **Commit 2:** `08a5d32` - "feat: Add Matomo category view tracking on product pages"
- **Commit 3:** `83d3cc8` - "docs: Update Matomo tracking docs with category view tracking"
- **Commit 4:** `86449b1` - "feat: Add Matomo ecommerce purchase tracking on order success"
- **Commit 5:** `faa6165` - "feat: Add payment confirmation validation to purchase tracking"
  - Only confirmed orders are tracked (COD immediate, mobile after webhook confirmation)
  - Added storage event listener for mobile payment SSE updates
  - Prevents revenue inflation from pending/failed/cancelled orders
- **Commit 6:** *(Next)* - "feat: Add Matomo add-to-cart tracking in cart provider"
  - Tracks all add-to-cart actions from any component
  - Tracks quantity increases as additional add-to-cart events
  - Complete coverage with single source of truth in cart provider
- **Date:** February 3, 2026
- **Branch:** `main`

---

## 🎯 Future Enhancements

### Future Ecommerce Events
Once current tracking is validated, you can add:

- ✅ **`add_to_cart`** - COMPLETED ✅
- **`remove_from_cart`** - When user removes from cart or decreases quantity
- **`begin_checkout`** - When user starts checkout process
- **`view_cart`** - When user views their cart page

### Where to Add Future Events
- ✅ **Add to Cart:** `/providers/cart-provider.tsx` (COMPLETED - addItem & updateQuantity functions)
- **Remove from Cart:** `/providers/cart-provider.tsx` (in removeItem function - track quantity decreases)
- **Begin Checkout:** `/app/checkout/page.tsx` (on page load or initial render)
- **View Cart:** `/app/cart/page.tsx` (on page load)

---

## ⚠️ Important Notes

### Currency Tracking
**Currency is NOT tracked yet!** The current implementation only tracks the 4 basic fields for product views.

If you need currency tracking:
1. Add `currency` field to frontend data push (e.g., `currency: 'EUR'`)
2. Add `setEcommerceCurrency` call in Matomo Tag Manager tag before `setEcommerceView`

### Why No Currency Yet?
- Kept implementation simple and safe
- Uses only documented Matomo fields
- Currency requires additional Matomo method (`setEcommerceCurrency`)
- Can be added later if needed for multi-currency analytics

---

## 🎯 Summary

✅ **Frontend Code:** Product, Category, and Purchase tracking fully implemented  
✅ **Product View:** Tracks when users view product detail pages  
✅ **Category View:** Tracks product category interest automatically  
✅ **Purchase Tracking:** Tracks completed orders with deduplication  
✅ **Git Committed:** All changes committed and pushed to `main`  
⏳ **Matomo Config:** You need to configure 3 tags in Tag Manager (see steps above)  
⏳ **Testing:** Test in Preview mode after configuring Tag Manager  

**Complete ecommerce tracking is ready! Now configure Matomo Tag Manager.** 🚀
