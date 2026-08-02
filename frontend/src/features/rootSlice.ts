import {combineReducers} from 'redux';
import authSlice from "./slices/authSlice";
import productSlice from "./slices/productSlice";
import cartSlice from "./slices/cartSlice";


const rootSlice = combineReducers({
    auth: authSlice,
    products: productSlice,
    cart: cartSlice
})

export default rootSlice;