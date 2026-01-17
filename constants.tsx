
import React from 'react';
import { Product, Offer } from './types';

export const COLORS = {
  primary: '#4a5d4e',
  secondary: '#8b5e3c',
  accent: '#e6dfd1',
  background: '#fcfbf7',
  text: '#2d3a3a',
};

export const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", 
  "Germany", "France", "Japan", "Singapore", "United Arab Emirates"
];

export const PRODUCTS: Product[] = [
  {
    id: 'VP-101',
    name: 'Mountain Green Apple Jam',
    description: 'Handcrafted using crisp, high-altitude green apples. A perfect balance of tart and sweet, cooked in small batches over wood fires.',
    price: 499,
    weight: '450g',
    discountPercentage: 15,
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511497584788-8767fe771d85?auto=format&fit=crop&q=80&w=800'
    ],
    categories: ['Jams', 'Organic'],
    ingredients: ['Organic Green Apples', 'Cane Sugar', 'Lemon Juice', 'Pectin'],
    nutrition: {
      calories: '45 kcal per 20g',
      fat: '0g',
      sugar: '11g',
      protein: '0.1g'
    },
    tags: ['Organic', 'Tart', 'Mountain Fresh'],
    isBestSeller: true,
    stock: 45,
    status: 'in-stock'
  },
  {
    id: 'VP-102',
    name: 'Hillside Apricot Preserve',
    description: 'Sun-ripened apricots from the lower mountain ridges. We preserve the fruit chunks for an authentic homemade texture.',
    price: 550,
    weight: '500g',
    discountPercentage: 10,
    image: 'https://images.unsplash.com/photo-1548813776-49957262010c?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1548813776-49957262010c?auto=format&fit=crop&q=80&w=800'],
    categories: ['Preserves', 'Seasonal'],
    ingredients: ['Fresh Apricots', 'Raw Honey', 'Citric Acid'],
    nutrition: {
      calories: '50 kcal per 20g',
      fat: '0g',
      sugar: '10g',
      protein: '0.2g'
    },
    tags: ['No Added Sugar', 'Velvety'],
    isNew: true,
    stock: 12,
    status: 'in-stock'
  },
  {
    id: 'VP-103',
    name: 'Wild Mountain Berry Jam',
    description: 'A blend of rare berries hand-picked from the forest floor. Rich in antioxidants and intense forest flavors.',
    price: 699,
    weight: '350g',
    image: 'https://images.unsplash.com/photo-1534432014811-9257e842417e?auto=format&fit=crop&q=80&w=800',
    categories: ['Jams'],
    ingredients: ['Wild Blueberries', 'Mountain Raspberries', 'Organic Cane Sugar'],
    nutrition: {
      calories: '48 kcal per 20g',
      fat: '0g',
      sugar: '12g',
      protein: '0.3g'
    },
    tags: ['Antioxidant Rich', 'Exotic'],
    isBestSeller: true,
    stock: 0,
    status: 'out-of-stock'
  },
  {
    id: 'VP-104',
    name: 'Spiced Plum Chutney',
    description: 'A savory-sweet delight made from mountain plums and traditional hill spices. Ideal for pairing with cheese.',
    price: 399,
    weight: '400g',
    discountPercentage: 20,
    image: 'https://images.unsplash.com/photo-1582236479702-82bc726b6f3c?auto=format&fit=crop&q=80&w=800',
    categories: ['Chutneys'],
    ingredients: ['Plums', 'Ginger', 'Cinnamon', 'Black Salt', 'Vinegar'],
    nutrition: {
      calories: '40 kcal per 20g',
      fat: '0.1g',
      sugar: '8g',
      protein: '0.4g'
    },
    tags: ['Savory', 'Spiced'],
    stock: 89,
    status: 'in-stock'
  }
];

export const OFFERS: Offer[] = [
  {
    id: 'OFFER-1',
    title: 'Himalayan Spring Sale',
    description: 'Get 25% OFF on all Green Apple Preserves this month.',
    code: 'SPRING25',
    discount: 25,
    isActive: true,
    bannerImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200'
  }
];

export const ICONS = {
  Cart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  ),
  Ticket: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  ),
  Copy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
};
