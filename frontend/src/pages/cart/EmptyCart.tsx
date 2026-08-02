import emptyCartImg from '../../assets/img/cart.svg'
import {Link} from "react-router-dom";

const EmptyCart = () => {
    return (
        <div className="flex flex-col justify-center items-center w-full py-16 space-y-2">
            <img src={emptyCartImg} alt="cart-img" className="w-28 h-28" />
            <p className="text-xl font-semibold">Your cart is empty!</p>
            <p className="text-sm">Browse our categories and discover our best deals!</p>
            <Link to="/products" className="rounded-md bg-[#023047] text-white px-4 py-2">Start Shopping</Link>
        </div>
    )
}

export default EmptyCart;