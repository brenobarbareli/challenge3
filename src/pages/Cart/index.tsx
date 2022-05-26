import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product) => ({
    ...cart,
    priceFormated: formatPrice(product.price),
  }));
  console.log(cartFormatted);

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      return sumTotal + product.price * product.amount;
    }, 0),
  );
  console.log(total);

  function handleProductIncrement(product: Product) {
    // TODO
  }

  function handleProductDecrement(product: Product) {
    // TODO
  }

  function handleRemoveProduct(productId: number) {
    // TODO
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label='product image' />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label='delete icon' />
          </tr>
        </thead>
        <tbody>
          {cart.map((cartItems) => (
            <tr data-testid='product' key={cartItems.id}>
              <td>
                <img src={cartItems.image} alt={cartItems.title} />
              </td>
              <td>
                <strong>{cartItems.title}</strong>
                <span>{cartItems.price}</span>
              </td>
              <td>
                <div>
                  <button
                    type='button'
                    data-testid='decrement-product'
                    // disabled={product.amount <= 1}
                    // onClick={() => handleProductDecrement()}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type='text'
                    data-testid='product-amount'
                    readOnly
                    value={2}
                  />
                  <button
                    type='button'
                    data-testid='increment-product'
                    // onClick={() => handleProductIncrement()}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>999</strong>
              </td>
              <td>
                <button
                  type='button'
                  data-testid='remove-product'
                  // onClick={() => handleRemoveProduct(product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type='button'>Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>R$ 359,80</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
