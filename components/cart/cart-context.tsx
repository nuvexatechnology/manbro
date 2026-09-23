"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product, ClothingSize, ColorOption } from "@/types/store";

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, selectedSize: ClothingSize, selectedColor: ColorOption, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("aura_clothing_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          // Hydrate browser-only storage after the server's empty-cart render.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCart(parsedCart);
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("aura_clothing_cart", JSON.stringify(cart));
      } catch (error) {
        console.error("Failed to save cart to localStorage", error);
      }
    }
  }, [cart, isInitialized]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (product: Product, selectedSize: ClothingSize, selectedColor: ColorOption, quantity: number = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) return;
    // Check variant stock
    const variant = product.variants.find(
      v => v.size === selectedSize && v.color.name === selectedColor.name
    );
    
    if (!variant || variant.stock < quantity) {
      const availableStock = variant ? variant.stock : 0;
      alert(`Only ${availableStock} items available in this size and color.`);
      return;
    }

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor.name.toLowerCase()}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === cartItemId);

      if (existingIndex > -1) {
        const newQuantity = prevCart[existingIndex].quantity + quantity;
        
        // Check if total quantity would exceed stock
        if (variant.stock < newQuantity) {
          alert(`Only ${variant.stock} items available in this size and color.`);
          return prevCart;
        }
        
        return prevCart.map((item, index) => index === existingIndex
          ? { ...item, product, quantity: newQuantity }
          : item);
      } else {
        return [
          ...prevCart,
          {
            id: cartItemId,
            product,
            selectedSize,
            selectedColor,
            quantity,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (!Number.isSafeInteger(newQuantity)) return;
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCart((prev) => {
      const item = prev.find((i) => i.id === cartItemId);
      if (!item) return prev;
      
      // Check variant stock
      const variant = item.product.variants.find(
        v => v.size === item.selectedSize && v.color.name === item.selectedColor.name
      );
      
      if (!variant || variant.stock < newQuantity) {
        alert(`Only ${variant?.stock ?? 0} items available in this size and color.`);
        return prev;
      }
      
      return prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQuantity } : i));
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((acc, item) => {
    const variant = item.product.variants.find(
      v => v.size === item.selectedSize && v.color.name === item.selectedColor.name
    );
    const price = variant?.price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
