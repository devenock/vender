import { createSlice } from '@reduxjs/toolkit'

// define types
interface CartItem {
  total: 0
  isEmpty: boolean
}

interface InitialState {
  items: CartItem[];
  isEmpty: boolean;
  subTotal: number | string | any;
}

const initialState: InitialState = {
  items: [],
  isEmpty: true,
  subTotal:0
}

const calculateSubtotal = (items:any[]) => {
  return Math.ceil(items.reduce((total:number, item: any) => total + item.price, 0));
};


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state: InitialState, action: { payload: any, type: string }): void => {
      state.items.push(action.payload);
      state.isEmpty = false;
      state.subTotal = calculateSubtotal(state.items);
    },
    removeItemFromCart: (state, action) => {
      state.items = state.items.filter((item:any) => item.id !== action.payload.id);
    }
  }
})

export const {addItemToCart, removeItemFromCart} = cartSlice.actions
export default cartSlice.reducer
