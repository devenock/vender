import {useDispatch, useSelector} from "react-redux";
import {Product} from "../../../types/product";
import SingleProduct from "../../../pages/products/SingleProduct";
import React from "react";
import {addItemToCart, removeItemFromCart} from "../../../features/slices/cartSlice";

const Womans = () => {
  const {products} = useSelector((store:any) => store.products);
  console.log(products);
  const womens = products.filter((product:any) => product.category.includes('Women'));
    const dispatch = useDispatch();
    const handleAddToCart = (product:any) => {
        dispatch(addItemToCart(product));
    };

    const handleRemoveFromCart = (product:any) => {
        dispatch(removeItemFromCart(product));
    };

  return (
      <div className='products'>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {
            womens.map((product: Product) => (
                <SingleProduct key={product.id} product={product} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart}/>
            ))
          }
        </div>
      </div>
  )
}

export default Womans
