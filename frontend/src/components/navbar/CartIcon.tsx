import {FaShoppingCart} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

const CartIcon = ({items}:any) =>{
    const navigate = useNavigate();
    return (
        <span
            className="flex relative bg-gray-200 p-3 rounded-full justify-center items-center"
            onClick={() => {
                navigate('/cart')
            }}>
                <i><FaShoppingCart fill="#023047"/></i>
                <p className="absolute left-6 -top-3 bg-cyan-950 rounded-full text-xs flex justify-center items-center p-3 h-2 w-2 text-white">{items.length}</p>
            </span>
    )
}

export default CartIcon;