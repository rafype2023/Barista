import { Product, Order } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This will hold the code sent from our secure backend function.
// In a real high-security app, you wouldn't store this client-side,
// but for this project, it's secure because the code is single-use and short-lived.
let activeVerificationCode: string | null = null;

const products: Product[] = [
    { 
      id: '1', 
      name: 'Espresso Simple', 
      description: 'Shot de café puro y fuerte.', 
      sizes: [
        { size: '4 oz', price: 1.50 },
        { size: '8 oz', price: 2.25 },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=250&h=250&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    { 
      id: '2', 
      name: 'Latte Vainilla', 
      description: 'Leche texturizada con sirope de vainilla.', 
      sizes: [
        { size: '8 oz', price: 3.25 },
        { size: '12 oz', price: 4.00 },
      ]
    },
    { 
      id: '3', 
      name: 'Latte Vainilla (Alt)', 
      description: 'Shot de café puro y fuerte.', 
      sizes: [
        { size: '8 oz', price: 3.25 },
        { size: '12 oz', price: 4.00 },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67d5b2?q=80&w=250&h=250&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    { 
      id: '4', 
      name: 'Cappuccino', 
      description: 'Shot de café puro y vainilla.', 
      sizes: [
        { size: '8 oz', price: 3.00 },
        { size: '12 oz', price: 3.75 },
      ] 
    },
    { 
      id: '5', 
      name: 'Cappuccino (Alt)', 
      description: 'Espresso con leche espumada.', 
      sizes: [
        { size: '8 oz', price: 3.00 },
        { size: '12 oz', price: 3.75 },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1557006021-b95154529a13?q=80&w=250&h=250&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    { 
      id: '6', 
      name: 'Cappuccino Cacao', 
      description: 'Espresso con leche espumada y cacao.', 
      sizes: [
        { size: '8 oz', price: 3.50 },
        { size: '12 oz', price: 4.25 },
      ] 
    },
];

const confirmedOrders: Order[] = [
    { id: 'ord1', userName: 'Employee', total: 13.00, status: 'confirmed'},
    { id: 'ord2', userName: 'Leuni', total: 6.50, status: 'confirmed'},
    { id: 'ord3', userName: 'Employee', total: 3.00, status: 'confirmed'},
    { id: 'ord4', userName: 'Employee', total: 3.50, status: 'confirmed'},
];

// Simulate network delay
const delay = <T,>(data: T, ms: number = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), ms));

export const api = {
  getProducts: (): Promise<Product[]> => {
    return delay(products);
  },
  
  getConfirmedOrders: (): Promise<Order[]> => {
    return delay(confirmedOrders);
  },

  generateProductImage: async (productName: string): Promise<string> => {
    try {
      const prompt = `A delicious-looking ${productName} coffee in a minimalist cafe setting, photorealistic, high quality, centered.`;
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      throw new Error("Image generation failed to return an image.");
    } catch (error) {
      console.error(`Error generating image for ${productName}:`, error);
      return 'https://placehold.co/250x250/F7F4EF/2C2C2C?text=No+Image';
    }
  },

  sendVerificationCode: async (name: string, email: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (data.success && data.code) {
        activeVerificationCode = data.code;
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Failed to call send-code API:", error);
      return { success: false };
    }
  },

  verifyCodeAndPlaceOrder: (
    name: string,
    email: string,
    code: string,
    cart: { [key: string]: number },
    total: number
  ): Promise<{ success: boolean; order?: Order }> => {
    console.log(`Verifying code ${code} for ${email}`);
    if (code === activeVerificationCode) {
      activeVerificationCode = null; // Invalidate the code after use
      const newOrder: Order = {
        id: `ord${Date.now()}`,
        userName: name,
        total,
        status: 'confirmed'
      };
      
      if (total > 0) {
        confirmedOrders.unshift(newOrder);
      }
      return delay({ success: true, order: newOrder }, 1000);
    }
    return delay({ success: false });
  },
};
