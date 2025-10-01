import { Product, Order, User } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      // Return a fallback placeholder image on error
      return 'https://placehold.co/250x250/F7F4EF/2C2C2C?text=No+Image';
    }
  },

  sendVerificationCode: (name: string, email: string): Promise<{ success: boolean }> => {
    console.log(`Simulating sending verification code to ${email} for user ${name}`);
    // In a real app, this would trigger a service like SendGrid.
    return delay({ success: true }, 1000);
  },

  verifyCodeAndPlaceOrder: (
    name: string,
    email: string,
    code: string,
    cart: { [key: string]: number },
    total: number
  ): Promise<{ success: boolean; order?: Order }> => {
    console.log(`Verifying code ${code} for ${email} and placing order for ${name}`);
    if (code === '123456') { // Mock success code
      const newOrder: Order = {
        id: `ord${Date.now()}`,
        userName: name,
        total,
        status: 'confirmed'
      };
      // This allows the function to be used for login verification without creating an empty order.
      if (total > 0) {
        confirmedOrders.unshift(newOrder); // Add to the top of the list
      }
      return delay({ success: true, order: newOrder }, 1500);
    }
    return delay({ success: false });
  },
};
