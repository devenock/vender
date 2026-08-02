import {useDispatch, useSelector} from "react-redux";
import React, {FC} from "react";
import {Product} from "../../../types/product";
import SingleProduct from "../../../pages/products/SingleProduct";
import {addItemToCart, removeItemFromCart} from "../../../features/slices/cartSlice";

const Accessories:FC = () => {
  const {products} = useSelector((store:any) => store.products);
  const accessories = products.filter((product:any) => product.category === "Accessories");
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
            accessories.map((product: Product) => (
                <SingleProduct key={product.id} product={product} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart}/>
            ))
          }
        </div>
      </div>
  )
}

export default Accessories
