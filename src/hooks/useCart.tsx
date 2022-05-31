import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const response = await api.get<Stock>(`/stock/${productId}`);
      if (response.data.amount < 1) {
        toast.warning('Produto fora de estoque');
        return;
      }
      const index = cart.findIndex((items) => {
        return items.id === productId;
      });

      if (index >= 0) {
        const newAmount = cart[index].amount + 1;

        if (newAmount > response.data.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }
        const newCartItems = cart;
        newCartItems[index].amount += 1;
        setCart([...newCartItems]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartItems));
      } else {
        const productResponse = await api.get(`/products/${productId}`);
        if (productResponse.data.lenght >= 0) {
          toast.error('Erro na adição do produto');
          return;
        }
        const responseData: Product = productResponse.data;
        if (responseData.id === productId) {
          responseData.amount = 1;
          const newAddItems = [...cart, responseData];
          setCart(newAddItems);
          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify(newAddItems),
          );
          toast.success('Produto adicionado ao carrinho!');
        }
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = cart.filter((item) => item.id !== productId);

      if (newCart.length === cart.length) {
        toast.error('Erro na remoção do produto');
        return;
      }
      setCart([...newCart]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }
      const response = await api.get<Stock>(`/stock/${productId}`);
      if (response.data.amount >= amount) {
        const index = cart.findIndex((items) => {
          return items.id === productId;
        });

        cart[index].amount = amount;
        const newCart = [...cart];

        setCart([...newCart]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        toast.error('Quantidade solicitada fora de estoque');
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
