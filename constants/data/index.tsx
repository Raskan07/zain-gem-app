export interface Stone {
  id?: string;
  customId: string;
  customIdNum: number;
  name: string;
  weight: number;
  weightInRough: number;
  stoneCost: number;
  cuttingCost: number;
  polishCost: number;
  treatmentCost: number;
  otherCost: number;
  totalCost: number;
  priceToSell: number;
  soldPrice: number;
  profitLoss: number;
  status: string;
  treatment: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export const stones: Stone[] = [
  {
    customId: "001",
    customIdNum: 1,
    name: "Sapphire",
    weight: 0.85,
    weightInRough: 1.9,
    stoneCost: 4000,
    cuttingCost: 500,
    polishCost: 500,
    treatmentCost: 0,
    otherCost: 750,
    totalCost: 5750,
    priceToSell: 20000,
    soldPrice: 4680,
    profitLoss: -1070,
    status: "Sold",
    treatment: "Natural",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/rr-gems.firebasestorage.app/o/stones%2F1756480338065_WhatsApp%20Image%202025-08-29%20at%2008.08.45_793ba3e3.jpg?alt=media&token=d25aa780-63e5-4fb4-a976-5c541ea39d5c"
    ],
    createdAt: "2025-08-29T08:12:01-07:00",
    updatedAt: "2025-08-29T08:12:23-07:00"
  },
  {
    customId: "002",
    customIdNum: 2,
    name: "Blue Sapphire",
    weight: 1.1,
    weightInRough: 2.3,
    stoneCost: 5000,
    cuttingCost: 600,
    polishCost: 550,
    treatmentCost: 200,
    otherCost: 800,
    totalCost: 7150,
    priceToSell: 25000,
    soldPrice: 0,
    profitLoss: 0,
    status: "In Stock",
    treatment: "Heated",
    images: [],
    createdAt: "2025-08-29T09:00:00-07:00",
    updatedAt: "2025-08-29T09:00:00-07:00"
  },
  {
    customId: "003",
    customIdNum: 3,
    name: "Ruby",
    weight: 0.95,
    weightInRough: 2.1,
    stoneCost: 6000,
    cuttingCost: 700,
    polishCost: 600,
    treatmentCost: 300,
    otherCost: 900,
    totalCost: 8500,
    priceToSell: 30000,
    soldPrice: 0,
    profitLoss: 0,
    status: "In Process",
    treatment: "Heated",
    images: [],
    createdAt: "2025-08-29T10:00:00-07:00",
    updatedAt: "2025-08-29T10:00:00-07:00"
  }
];

// Helper function to format date
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch (error) {
    console.warn('Invalid date:', dateString);
    return '';
  }
};

// Helper function to format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount);
};