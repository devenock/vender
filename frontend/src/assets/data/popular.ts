import popularOne from '../../../public/img/popular1.jpg'
import popularTwo from '../../../public/img/popular2.jpg'
import popularThree from '../../../public/img/popular3.jpg'
import onsaleOne from '../../../public/img/onsale1.jpg'
import onsaleTwo from '../../../public/img/onsale2.jpg'
import {Product} from "../../types/product";

// popular
export const popularProducts: Product[] = [
  {
    img: popularOne,
    description: 'Women’s Crew Neck Short Sleeve T-Shirt',
    price: '41.00',
    id: 1
  },
  {
    img: popularTwo,
    description: 'Ripped Jeans Denim Jeggings Trousers Skinny',
    price: '80.00',
    id: 2
  },
  {
    img: popularThree,
    description: 'Jeans Free Suspenders Light Blue Denim Pants',
    price: '99.00',
    id: 3
  }
]

// on sale
export const onsaleProducts: Product[] = [
  {
    img: popularTwo,
    description: 'Ripped Jeans Denim Jeggings Trousers Skinny',
    price: '80.00',
    id: 1
  },
  {
    img: onsaleOne,
    description: 'Women’s Vicki Straight Jeans Blue',
    price: '90.00',
    id: 2
  },
  {
    img: onsaleTwo,
    description: 'Women’s Sleeveless Faux Wrap Dress',
    price: '82.00',
    id: 3
  }
]
