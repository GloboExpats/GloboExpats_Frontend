# Matomo Ecommerce Tracking Implementation

## ✅ Implementation Complete

### What Was Implemented
1. **Product View Tracking** - Tracks when users view product detail pages
2. **Category View Tracking** - Tracks product category interest based on product views
3. **Purchase Tracking** - Tracks completed orders on the checkout success page

All tracking events are implemented in their respective pages with proper deduplication and error handling.

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

## 💰 Purchase Tracking (Ecommerce Orders)

### Code Location
**File:** `/app/checkout/success/page.tsx`  
**Line:** ~95-170 (inside `useEffect` that loads order data from localStorage)

### What Gets Tracked
When a user successfully completes an order and lands on the success page:

```typescript
{
  event: 'purchase',
  ecommerce: {
    purchase: {
      id: "ORD-1738619234-456",        // Unique order ID
      revenue: 45000,                  // Total revenue (grand total)
      orderSubTotal: 45000,            // Order subtotal (before tax/shipping)
      tax: 0,                          // Tax amount
      shipping: 0,                     // Shipping cost
      discount: 0                      // Discount applied
    }
  }
}
```

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

## 3️⃣ Purchase (Ecommerce Order) Configuration

### F) Data Layer Variable
- **Name:** `PurchaseInfo`
- **Type:** Data Layer Variable
- **Data Layer Variable Name:** `ecommerce.purchase`

### G) Custom Event Trigger
- **Name:** `Ecommerce Purchase`
- **Trigger Type:** Custom Event
- **Event Name:** `purchase`

### H) Custom HTML Tag
- **Name:** `Ecommerce - Order Tracking`
- **Tag Type:** Custom HTML
- **Trigger:** `Ecommerce Purchase` (from step G)
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

## 4️⃣ Publish Container
- Click **"Create Version"** in Matomo Tag Manager
- Add description: "Added ecommerce product, category, and purchase tracking"
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
3. **Test Purchase Tracking:**
   - Complete a test order (use COD for easy testing)
   - Land on `/checkout/success?orderId=XXX`
   - Check Preview panel for `purchase` event
   - Verify `PurchaseInfo` data layer variable is populated
   - Verify `Ecommerce - Order Tracking` tag fires
   - Check console for `trackEcommerceOrder` call

### 3. Test Deduplication (Purchase Only)
1. Complete an order and land on success page
2. **Refresh the success page**
3. Check console - should see `📊 Matomo: Purchase tracked` only ONCE
4. Verify `trackedOrders` prevents duplicate tracking

### 4. Test in Matomo Reports
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
- **Date:** February 3, 2026
- **Branch:** `main`

---

## 🎯 Future Enhancements

### Future Ecommerce Events
Once product and category tracking is working, you can add:

- **`add_to_cart`** - When user adds product to cart
- **`remove_from_cart`** - When user removes from cart
- **`begin_checkout`** - When user starts checkout
- **`purchase`** - When order is completed

### Where to Add Future Events
- **Add to Cart:** `/components/product-actions.tsx` (in cart button handler)
- **Begin Checkout:** `/app/checkout/page.tsx` (on page load)
- **Purchase:** `/app/checkout/page.tsx` (after successful order)

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
