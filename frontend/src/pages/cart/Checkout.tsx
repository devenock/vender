import {useNavigate} from "react-router-dom";

const Checkout = () =>{
    const navigate = useNavigate();
    return (
        <div className="flex justify-end">
            <button
                onClick={() => navigate('/cart/checkout')}
                className="block rounded bg-gray-700 px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600"
            >
                Checkout
            </button>
        </div>
    )
}

export default Checkout;