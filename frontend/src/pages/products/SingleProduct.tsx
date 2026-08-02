import {FC} from "react";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import AddToCart from "../../components/common/AddToCart";
import RemoveFromCart from "../../components/common/RemoveFromCart";


interface SingleProductProps {
    product: any
    addToCart: (product: any) => void
    removeFromCart: (product: any) => void
}

const SingleProduct:FC<SingleProductProps> = ({product,addToCart, removeFromCart}) =>{
    const {items} = useSelector((store:any) => store.cart)
    const isInCart = items.find((item:any) => item.id === product.id);
    return (
        <div className="flex flex-col justify-start space-y-2">
            <Link to={`/product/${product.id}`} className='product-item' key={product.id}>
                <img src={product.img} alt={product.description}/>
                <p>{product.description}</p>
                <h6><strong>${product.price}</strong></h6>
            </Link>
            {
                !isInCart ? <AddToCart clickHandler={() => addToCart(product)} />
                    :
                    <RemoveFromCart clickHandler={() => removeFromCart(product)}/>
            }
        </div>
    )
}

export default SingleProduct;