import {FC} from "react";
// import { popularProducts } from '../../assets/data/popular'
import SingleProduct from "../products/SingleProduct";
import {Product} from "../../types/product";
import {useDispatch, useSelector} from "react-redux";
import {addItemToCart, removeItemFromCart} from "../../features/slices/cartSlice";

const PopularProducts:FC = () => {
    const { products} = useSelector((store:any)  => store.products);
    const popularProducts = products.slice(0, 3)
    const dispatch = useDispatch();
    const handleAddToCart = (product:any) => {
        dispatch(addItemToCart(product));
    };

    const handleRemoveFromCart = (product:any) => {
        dispatch(removeItemFromCart(product));
    };
  return (
        <div className='popular-products'>
            <h1>Popular Products</h1>
            <div className="product-items">
                {
                    popularProducts.map((product: Product) => {
                      return (
                            <SingleProduct key={product.id} product={product} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart}/>
                      )
                    })
                }
            </div>
        </div>
  )
}

export default PopularProducts
