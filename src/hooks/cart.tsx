import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const loadProduct = await AsyncStorage.getItem('@GoMarket:products');

      if (loadProduct) setProducts(JSON.parse(loadProduct));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART

      let findProduct = products.find(itemProd => itemProd.id === product.id);

      if (findProduct) {
        const updatedProducts = products;

        const index = products.findIndex(
          itemProd => itemProd.id === product.id,
        );

        findProduct = {
          ...findProduct,
          quantity: findProduct.quantity + 1,
        };

        updatedProducts[index] = findProduct;
        setProducts([...updatedProducts]);
      } else {
        const prod = {
          ...product,
          quantity: 1,
        };
        setProducts([...products, prod]);
      }

      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = products;

      const index = products.findIndex(product => product.id === id);

      const findProduct = products[index];

      const incrementedProduct = {
        ...findProduct,
        quantity: findProduct.quantity + 1,
      };

      updatedProducts[index] = incrementedProduct;

      setProducts([...updatedProducts]);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART

      const updatedProducts = products;

      const index = products.findIndex(product => product.id === id);

      const findProduct = products[index];

      if (findProduct.quantity > 0) {
        const decrementedProduct = {
          ...findProduct,
          quantity: findProduct.quantity - 1,
        };
        updatedProducts[index] = decrementedProduct;
      } else return;

      setProducts([...updatedProducts]);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(updatedProducts),
      );
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
