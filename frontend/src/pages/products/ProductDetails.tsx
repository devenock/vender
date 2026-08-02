import {FC, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import AddToCart from "../../components/common/AddToCart";
import {useDispatch, useSelector} from "react-redux";
import {addItemToCart, removeItemFromCart} from "../../features/slices/cartSlice";
import RemoveFromCart from "../../components/common/RemoveFromCart";

const ProductDetails:FC = () => {
    const { id } = useParams();
    const[product, setProduct] = useState<null | any>(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | any>(null);
    const dispatch = useDispatch()

    const {items} = useSelector((store:any) => store.cart)
    const isInCart = items.find((item:any) => item.id === product.id);

    // get each product based on ID
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get('/products.json');
                if (response.statusText !== 'OK') {
                    setLoading(false);
                }
                const data = await response.data;
                const foundProduct = data.products.find((item: any) => item.id === parseInt(id as string));
                setProduct(foundProduct);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!product) return <p>Product not found</p>;

    return(
        <div className="flex">
            <div>
                <img src={product.img} alt={product.name}/>
            </div>
            <div className="flex flex-col px-4 py-2">
                <h1 className="font-bold py-2">{product.name}</h1>
                <p className="font-bold mt-2">${product.price}</p>
                <hr className="mt-2"/>
                <p className="text-lg py-3">{product.description}</p>
                <p>Category: {product.category}</p>
                <p>Stock Status: {product.stock_status}</p>
                <p>Cart Status: {product.cart_status}</p>
                <p>Quantity: {product.quantity}</p>
                <h3>Reviews:</h3>
                <ul>
                    {product.reviews.map((review: any, index: any) => (
                        <li key={index}>
                            <p>User: {review.user}</p>
                            <p>Rating: {review.rating}</p>
                            <p>Comment: {review.comment}</p>
                        </li>
                    ))}
                </ul>
                {
                    !isInCart ? <AddToCart clickHandler={() => dispatch(addItemToCart(product))} />
                        :
                        <RemoveFromCart clickHandler={() => dispatch(removeItemFromCart(product))}/>
                }
            </div>
        </div>
    )
}

export default ProductDetails;