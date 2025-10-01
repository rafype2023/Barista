import { Product, Order, User } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// In-memory store for verification codes for this simulation
const verificationCodes: { [email: string]: string } = {};

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
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = code;
    console.log(`Verification code for ${email}: ${code}`); // For debugging

    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendgridApiKey) {
      console.error("SendGrid API key is not configured.");
      // In a real app, you might want to return success: false here,
      // but for this demo, we'll allow it to proceed to show the code in the console.
      return { success: true };
    }

    const emailBody = {
      personalizations: [{ to: [{ email }] }],
      from: { email: "no-reply@baristacoffee.app", name: "Barista Coffee" },
      subject: "Tu código de verificación",
      content: [{ type: "text/plain", value: `Hola ${name},\n\nTu código de verificación es: ${code}\n\nGracias,\nEl equipo de Barista Coffee` }],
    };
    
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailBody)
      });
      if (response.ok) {
        return { success: true };
      } else {
        console.error("Failed to send email via SendGrid:", await response.text());
        return { success: false };
      }
    } catch(error) {
      console.error("Error calling SendGrid API:", error);
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
    if (verificationCodes[email] && verificationCodes[email] === code) {
      delete verificationCodes[email]; // Code is single-use

      const newOrder: Order = {
        id: `ord${Date.now()}`,
        userName: name,
        total,
        status: 'confirmed'
      };
      
      if (total > 0) {
        confirmedOrders.unshift(newOrder);
      }
      return delay({ success: true, order: newOrder }, 1500);
    }
    return delay({ success: false });
  },
};