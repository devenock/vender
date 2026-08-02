import {useDispatch, useSelector} from "react-redux";
import {Product} from "../../../types/product";
import SingleProduct from "../../../pages/products/SingleProduct";
import React from "react";
import {addItemToCart, removeItemFromCart} from "../../../features/slices/cartSlice";

const Footware = () => {
  const {products} = useSelector((store:any) => store.products);
  const footwares = products.filter((product:any) => product.category.includes('Footware'));
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
            footwares.map((product: Product) => (
                <SingleProduct key={product.id} product={product} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart}/>
            ))
          }
        </div>
      </div>
  )
}

export default Footware
