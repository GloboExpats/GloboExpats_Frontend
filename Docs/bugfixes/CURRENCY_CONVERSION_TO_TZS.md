# Currency Conversion to TZS Base Currency

**Date**: 2025-10-16  
**Feature**: Automatic conversion of all product prices to TZS before storage  
**Status**: ✅ IMPLEMENTED

---

## 🎯 Overview

All product prices are now **automatically converted to TZS** (Tanzanian Shilling) before being saved to the database, regardless of which currency the user selects when creating or editing a listing. This ensures a consistent base currency across the platform while allowing users the flexibility to list in their preferred currency.

---

## 🔍 Problem Statement

**Before:**
- Products were stored in the database with their entered currency (USD, KES, UGX, or TZS)
- This created inconsistency in the database
- Price comparisons and sorting were complex
- Exchange rate changes affected historical prices

**After:**
- All products stored in TZS (base currency)
- Users can still list in any supported currency
- Prices automatically convert to TZS before storage
- Display layer converts back to user's preferred currency

---

## 💱 Conversion Logic

### Exchange Rates (from `/lib/currency-converter.ts`)

| Currency | Exchange Rate | Conversion to TZS |
|----------|---------------|-------------------|
| **TZS** 🇹🇿 | 1.0 | No conversion (base) |
| **USD** 🇺🇸 | 0.0004 | Price ÷ 0.0004 = TZS |
| **KES** 🇰🇪 | 0.0525 | Price ÷ 0.0525 = TZS |
| **UGX** 🇺🇬 | 1.48 | Price ÷ 1.48 = TZS |

### Conversion Formula

```typescript
// To convert any currency to TZS:
const priceInTZS = enteredPrice / exchangeRate

// Examples:
// $1,000 USD → 1000 ÷ 0.0004 = 2,500,000 TZS
// 131,250 KES → 131250 ÷ 0.0525 = 2,500,000 TZS
// 3,700,000 UGX → 3700000 ÷ 1.48 = 2,500,000 TZS
// 2,500,000 TZS → 2500000 ÷ 1.0 = 2,500,000 TZS (no change)
```

---

## 🛠️ Implementation

### 1. Sell Page (`/app/sell/page.tsx`)

**Import Currency Configuration:**
```typescript
import { CURRENCIES as CURRENCY_CONFIG } from '@/lib/currency-converter'
```

**Conversion Logic (Lines 285-316):**
```typescript
// Convert prices from selected currency to TZS (base currency)
const enteredCurrency = formData.currency as 'TZS' | 'USD' | 'KES' | 'UGX'
const conversionRate = CURRENCY_CONFIG[enteredCurrency].exchangeRate

// If user entered in USD/KES/UGX, divide by exchange rate to get TZS
// If already in TZS, no conversion needed (rate = 1)
const askingPriceInTZS = parseFloat(formData.price) / conversionRate
const originalPriceInTZS = formData.originalPrice 
  ? parseFloat(formData.originalPrice) / conversionRate 
  : 0

console.log('💱 Currency Conversion:', {
  enteredCurrency,
  conversionRate,
  enteredAskingPrice: formData.price,
  convertedAskingPrice: askingPriceInTZS,
  enteredOriginalPrice: formData.originalPrice,
  convertedOriginalPrice: originalPriceInTZS,
})

// Transform form data to match backend expectations
// Always store in TZS (base currency)
const productData = {
  productName: formData.title.trim(),
  categoryId: categoryId,
  condition: formData.condition,
  location: formData.location,
  productDescription: formData.description.trim(),
  currency: 'TZS', // Always store as TZS in backend
  askingPrice: Math.round(askingPriceInTZS), // Round to nearest shilling
  originalPrice: Math.round(originalPriceInTZS),
  productWarranty: '1 year manufacturer warranty',
}
```

### 2. Edit Listing Page (`/app/edit-listing/[id]/page.tsx`)

**Import Currency Configuration:**
```typescript
import { CURRENCIES as CURRENCY_CONFIG } from '@/lib/currency-converter'
```

**Conversion Logic (Lines 138-168):**
```typescript
// Convert prices from selected currency to TZS (base currency)
const enteredCurrency = formData.currency as 'TZS' | 'USD' | 'KES' | 'UGX'
const conversionRate = CURRENCY_CONFIG[enteredCurrency].exchangeRate

// If user entered in USD/KES/UGX, divide by exchange rate to get TZS
// If already in TZS, no conversion needed (rate = 1)
const askingPriceInTZS = parseFloat(formData.askingPrice) / conversionRate
const originalPriceInTZS = formData.originalPrice 
  ? parseFloat(formData.originalPrice) / conversionRate 
  : 0

console.log('💱 Currency Conversion:', {
  enteredCurrency,
  conversionRate,
  enteredAskingPrice: formData.askingPrice,
  convertedAskingPrice: askingPriceInTZS,
  enteredOriginalPrice: formData.originalPrice,
  convertedOriginalPrice: originalPriceInTZS,
})

const updateData = {
  productName: formData.productName.trim(),
  categoryId: formData.categoryId,
  condition: formData.condition,
  location: formData.location,
  productDescription: formData.productDescription.trim(),
  currency: 'TZS', // Always store as TZS in backend
  askingPrice: Math.round(askingPriceInTZS), // Round to nearest shilling
  originalPrice: Math.round(originalPriceInTZS),
  productWarranty: formData.productWarranty,
}
```

---

## 📊 Conversion Examples

### Example 1: Listing in USD

**User Input:**
```
Currency: USD
Asking Price: $1,000
Original Price: $1,200
```

**Conversion:**
```
Asking Price: 1000 ÷ 0.0004 = 2,500,000 TZS
Original Price: 1200 ÷ 0.0004 = 3,000,000 TZS
```

**Stored in Database:**
```json
{
  "productAskingPrice": 2500000,
  "productOriginalPrice": 3000000,
  "productCurrency": "TZS"
}
```

### Example 2: Listing in KES

**User Input:**
```
Currency: KES
Asking Price: KSh 131,250
Original Price: KSh 157,500
```

**Conversion:**
```
Asking Price: 131250 ÷ 0.0525 = 2,500,000 TZS
Original Price: 157500 ÷ 0.0525 = 3,000,000 TZS
```

**Stored in Database:**
```json
{
  "productAskingPrice": 2500000,
  "productOriginalPrice": 3000000,
  "productCurrency": "TZS"
}
```

### Example 3: Listing in UGX

**User Input:**
```
Currency: UGX
Asking Price: USh 3,700,000
Original Price: USh 4,440,000
```

**Conversion:**
```
Asking Price: 3700000 ÷ 1.48 = 2,500,000 TZS
Original Price: 4440000 ÷ 1.48 = 3,000,000 TZS
```

**Stored in Database:**
```json
{
  "productAskingPrice": 2500000,
  "productOriginalPrice": 3000000,
  "productCurrency": "TZS"
}
```

### Example 4: Listing in TZS (No Conversion)

**User Input:**
```
Currency: TZS
Asking Price: TSh 2,500,000
Original Price: TSh 3,000,000
```

**Conversion:**
```
Asking Price: 2500000 ÷ 1.0 = 2,500,000 TZS (no change)
Original Price: 3000000 ÷ 1.0 = 3,000,000 TZS (no change)
```

**Stored in Database:**
```json
{
  "productAskingPrice": 2500000,
  "productOriginalPrice": 3000000,
  "productCurrency": "TZS"
}
```

---

## 🔄 Complete User Flow

### Creating a Product

```mermaid
User enters price in USD ($1,000)
         ↓
Frontend converts to TZS (2,500,000)
         ↓
Backend stores in TZS
         ↓
Database: { price: 2500000, currency: "TZS" }
         ↓
User A views (prefers USD) → Shows $1,000
User B views (prefers KES) → Shows KSh 131,250
User C views (prefers TZS) → Shows TSh 2,500,000
```

### Key Points:
1. ✅ User can list in **any supported currency**
2. ✅ Price **automatically converts** to TZS
3. ✅ Database stores **only TZS**
4. ✅ Display layer converts to **user's preferred currency**
5. ✅ All users see **accurate prices** in their chosen currency

---

## 🧪 Testing Scenarios

### Scenario 1: List Product in USD
**Steps:**
1. Select currency: USD
2. Enter asking price: 1000
3. Enter original price: 1200
4. Submit form

**Expected:**
- Console shows conversion: 1000 ÷ 0.0004 = 2,500,000 TZS
- Backend receives: `{ askingPrice: 2500000, currency: "TZS" }`
- Product displays correctly in all currencies

### Scenario 2: List Product in KES
**Steps:**
1. Select currency: KES
2. Enter asking price: 131250
3. Enter original price: 157500
4. Submit form

**Expected:**
- Console shows conversion: 131250 ÷ 0.0525 = 2,500,000 TZS
- Backend receives: `{ askingPrice: 2500000, currency: "TZS" }`
- Product displays correctly in all currencies

### Scenario 3: Edit Product - Change Currency
**Steps:**
1. Edit existing TZS product (2,500,000 TZS)
2. Change currency to USD
3. Update price to 1000 USD
4. Save

**Expected:**
- Console shows conversion: 1000 ÷ 0.0004 = 2,500,000 TZS
- Backend receives: `{ askingPrice: 2500000, currency: "TZS" }`
- Product still displays correctly

### Scenario 4: Verify Console Logging
**Steps:**
1. Create/edit product in any currency
2. Check browser console

**Expected Console Output:**
```
💱 Currency Conversion: {
  enteredCurrency: "USD",
  conversionRate: 0.0004,
  enteredAskingPrice: "1000",
  convertedAskingPrice: 2500000,
  enteredOriginalPrice: "1200",
  convertedOriginalPrice: 3000000
}
```

---

## ✅ Benefits

### Database Consistency
- ✅ All prices in single currency (TZS)
- ✅ Easy price comparisons and sorting
- ✅ Simplified queries and aggregations
- ✅ No currency mismatch issues

### User Flexibility
- ✅ List in preferred currency (USD, KES, UGX, TZS)
- ✅ View in preferred currency
- ✅ Transparent conversion
- ✅ Accurate cross-currency comparison

### Maintenance
- ✅ Single source of truth (TZS)
- ✅ Exchange rates updated in one place
- ✅ Historical prices remain consistent
- ✅ Simpler backend logic

### Scalability
- ✅ Easy to add new currencies
- ✅ Conversion logic centralized
- ✅ Database schema stays simple
- ✅ Performance optimized

---

## 🔗 Related Components

### Currency System
- `/lib/currency-converter.ts` - Currency conversion logic and rates
- `/lib/constants.ts` - Currency definitions (UI)
- `/components/price-display.tsx` - Price display component

### Forms
- `/app/sell/page.tsx` - Product creation with conversion
- `/app/edit-listing/[id]/page.tsx` - Product editing with conversion

### Backend Integration
- `/lib/api.ts` - API client for product operations
- Backend stores all prices in TZS

---

## 📝 Important Notes

### Rounding
Prices are rounded to the nearest shilling using `Math.round()`:
```typescript
askingPrice: Math.round(askingPriceInTZS)
```

This prevents fractional shillings which aren't practical in East African currencies.

### Original Price Optional
If no original price is provided, it's stored as `0`:
```typescript
const originalPriceInTZS = formData.originalPrice 
  ? parseFloat(formData.originalPrice) / conversionRate 
  : 0
```

### Exchange Rate Accuracy
Current rates are indicative. For production, consider:
- Real-time exchange rate API
- Periodic rate updates
- Historical rate tracking
- User notifications on rate changes

### Console Logging
Detailed conversion logging helps with:
- Debugging conversion issues
- Verifying correct calculations
- User support inquiries
- Rate validation

---

## 🎉 Summary

Implemented automatic currency conversion to TZS (base currency) for all product listings. Users can now list products in USD, KES, UGX, or TZS, and prices are automatically converted to TZS before storage. The display layer then converts back to each user's preferred currency, ensuring consistency in the database while maintaining flexibility for users.

**Key Achievement:**
- ✅ Single base currency (TZS) in database
- ✅ Multi-currency input support
- ✅ Automatic conversion on save
- ✅ Transparent to end users
- ✅ Consistent pricing across platform

**Result**: A robust, scalable currency system that supports multiple currencies while maintaining database integrity! 💱✨
