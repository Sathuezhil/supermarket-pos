# Lanka Supermarket POS System

Sri Lankan supermarket Point of Sale (POS) system built with **React + TypeScript**.

Frontend-only web application with mock data for demonstration.

## Features

### POS / Billing
- Barcode scanning (manual entry / scanner compatible)
- Product search and quick add
- Bill creation with VAT (8%)
- Payment: Cash, Card, LankaQR, Credit
- Receipt preview

### Products
- Add / Edit products
- Inline price update
- Category management

### Inventory / Stock
- Stock quantity overview
- Low stock alerts
- Stock in / out / adjustment
- Movement history

### Reports
- Daily sales charts
- Profit analysis
- Stock reports by category
- Payment method breakdown

### Users & Staff
- Cashier account management
- Role-based permissions
- Shift start / end management

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Reports charts
- **Lucide React** - Icons

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (opens at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Demo Data

- 15 sample products (rice, coconut oil, tea, etc.)
- 5 staff members with roles
- 7 days of sales history
- Low stock alerts on select items

## Currency

All amounts in **Sri Lankan Rupees (LKR / Rs.)**
