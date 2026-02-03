# Matomo Ecommerce Tracking Implementation

## ✅ Implementation Complete

### What Was Implemented
1. **Product View Tracking** - Tracks when users view product detail pages
2. **Category View Tracking** - Tracks product category interest based on product views

Both tracking events are implemented in `/app/product/[id]/page.tsx` in a single location.

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

## 🎯 When Tracking Fires

### Product View Event (`view_item`)
- ✅ User navigates to `/product/123`
- ✅ Product data successfully loads from API
- ✅ Product is set in state via `setProduct(transformedProduct)`
- ✅ Tracking fires immediately after product is loaded

### Category View Event (`view_item_list`)
- ✅ Fires immediately after product view event
- ✅ Uses the same product category data
- ✅ Skipped if category is missing or "Uncategorized"

---

## 🖥️ Console Output

When tracking fires, you'll see:
```
📊 Matomo: Category view tracked Electronics
📊 Matomo: Product view tracked { id: 123, name: "Product Name", category: "Electronics" }
```

### Error Handling
- ✅ Checks if `window._mtm` exists before pushing
- ✅ Uses try-catch to prevent tracking errors from breaking page
- ✅ Logs warnings if tracking fails: `⚠️ Failed to track in Matomo`

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

## 3️⃣ Publish Container
- Click **"Create Version"** in Matomo Tag Manager
- Add description: "Added ecommerce product and category view tracking"
- Click **"Publish"**

---

## 🧪 Testing

### 1. Test in Browser Console
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

### 2. Test in Matomo Tag Manager Preview
1. Enable **Preview Mode** in Matomo Tag Manager
2. Navigate to a product page (e.g., `/product/123`)
3. Check Preview panel:
   - ✅ Event `view_item` should appear
   - ✅ Event `view_item_list` should appear
   - ✅ Data Layer should show both `ecommerce.items` and `ecommerce.item_list_name`
   - ✅ Both tags should fire
   - ✅ Console should show both `setEcommerceView` calls

### 3. Test in Matomo Reports
After publishing and waiting ~24 hours:

**Product Views:**
1. Go to **Matomo Dashboard → Ecommerce → Products**
2. You should see product views with:
   - Product names
   - View counts
   - Categories
   - Prices

**Category Views:**
1. Go to **Matomo Dashboard → Ecommerce → Products**
2. Filter or sort by category
3. You should see category engagement metrics

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

---

## 📝 Commit History
- **Commit 1:** `adc619a` - "feat: Add Matomo ecommerce product view tracking"
- **Commit 2:** `08a5d32` - "feat: Add Matomo category view tracking on product pages"
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

✅ **Frontend Code:** Product + Category view tracking added to product detail page  
✅ **Single Location:** Both events in same file, same function  
✅ **Git Committed:** Changes committed and pushed to `main`  
⏳ **Matomo Config:** You need to configure Tag Manager (see steps above)  
⏳ **Testing:** Test in Preview mode after configuring Tag Manager  

**You're ready to configure Matomo Tag Manager for both events!** 🚀
