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
      } else {
        const productResponse = await api.get(`/products/${productId}`);
        const responseData: Product = productResponse.data;
        const index = cart.findIndex((items) => {
          return items.id === productId;
        });

        if (index === -1) {
          console.log(responseData);
          if (responseData.id === productId) {
            responseData.amount = 1;
          }
          setCart([...cart, responseData]);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
          console.log('teste');
        } else {
          var amount = cart[index].amount;
          updateProductAmount({
            productId: productId,
            amount: (amount += 1),
          });
        }
      }
    } catch {
      toast.error('Erro na inserção dos dados ao carrinho!', {});
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = cart.filter((item) => item.id !== productId);
      setCart([...newCart]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    } catch {
      toast.error('Erro ao excluir a quantidade dos produtos!', {});
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const response = await api.get<Stock>(`/stock/${productId}`);
      if (response.data.amount >= amount) {
        const index = cart.findIndex((items) => {
          return items.id === productId;
        });

        cart[index].amount = amount;
        const newCart = [...cart];

        setCart([...newCart]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      } else {
        toast.warning('Produto sem a quantidade desejada');
      }
    } catch {
      toast.error('Erro ao alterar a quantidade de produtos!');
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
