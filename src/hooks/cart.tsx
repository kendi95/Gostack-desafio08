import AsyncStorage from '@react-native-community/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const items = await AsyncStorage.getItem('@cart/products');
      if (items) {
        setProducts(JSON.parse(items));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const index = products.findIndex(p => p.id === product.id);
      if (index > -1) {
        products[index].quantity += 1;
        setProducts([...products]);
        await AsyncStorage.setItem('@cart/products', JSON.stringify(products));
        return;
      }

      product.quantity = 1;
      setProducts([...products, product]);

      await AsyncStorage.setItem('@cart/products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);
      if (index > -1) {
        products[index].quantity += 1;
        setProducts([...products]);
      }
      await AsyncStorage.setItem('@cart/products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);
      if (index > -1) {
        if (products[index].quantity === 1) {
          products.splice(index, 1);
          setProducts([...products]);
          return;
        }
        products[index].quantity -= 1;
        setProducts([...products]);
      }
      await AsyncStorage.setItem('@cart/products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
