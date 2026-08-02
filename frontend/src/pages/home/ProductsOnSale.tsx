import {FC} from "react";
import {Product} from "../../types/product";
import SingleProduct from "../products/SingleProduct";
import {addItemToCart, removeItemFromCart} from "../../features/slices/cartSlice";
import {useDispatch, useSelector} from "react-redux";

const ProductsOnSale:FC = () => {
    const { products} = useSelector((store:any)  => store.products);
    const onsaleProducts = products.slice(4, 7)
    const dispatch = useDispatch();
    const handleAddToCart = (product:any) => {
        dispatch(addItemToCart(product));
    };

    const handleRemoveFromCart = (product:any) => {
        dispatch(removeItemFromCart(product));
    };
  return (
        <div className='onsale-products'>
            <h1>On Sale Products</h1>
            <div className="product-items">
                {
                    onsaleProducts.map((item: Product) => {
                      return (
                            <SingleProduct key={item.id} product={item} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart}/>
                      )
                    })
                }
            </div>
        </div>
  )
}

export default ProductsOnSale
