import OwlCarousel from 'react-owl-carousel'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
import 'react-animated-slider/build/horizontal.css'
import ckImg from '../../assets/img/ck.png'
import dgImg from '../../assets/img/prada.png'
import pradaImg from '../../assets/img/prada.png'
import gucciImg from '../../assets/img/gucci.png'
import vImg from '../../assets/img/v.png'
import versacheImg from '../../assets/img/prada.png'

export interface Brand {
  imgUrl: string
  id: number
  name: string
}

export interface Options {
  margin: number
  responsiveClass: boolean
  autoWidth: boolean
  loop: boolean
  pullDrag: boolean
  autoplay: boolean
  autoplayHoverPause: boolean
  autoHeight: boolean
  smartSpeed: number
  responsive: any
}

const brandImgs: Brand[] = [
  {
    imgUrl: dgImg,
    id: 1,
    name: 'dg'
  },
  {
    imgUrl: ckImg,
    id: 2,
    name: 'ck'
  },
  {
    imgUrl: pradaImg,
    id: 3,
    name: 'prada'
  },
  {
    imgUrl: gucciImg,
    id: 4,
    name: 'gucci'
  },
  {
    imgUrl: vImg,
    id: 5,
    name: 'v'
  },
  {
    imgUrl: versacheImg,
    id: 6,
    name: 'versache'
  }
]
const Brands = (): JSX.Element => {
  const options: Options = {
    margin: 38,
    responsiveClass: true,
    autoWidth: true,
    loop: true,
    pullDrag: true,
    autoplay: true,
    autoplayHoverPause: true,
    autoHeight: false,
    smartSpeed: 800,
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      600: {
        items: 2
      },
      700: {
        items: 3
      },
      1000: {
        items: 5
      }
    }
  }

  return (
        <div className='brands'>
            <OwlCarousel className='owl-carousel' {...options}>
                {brandImgs.map((brand: Brand) => {
                  return (
                        <div key={brand.id} className='brand'>
                            <img src={brand.imgUrl} alt={brand.name} />
                        </div>
                  )
                })}
            </OwlCarousel>
        </div>
  )
}

export default Brands
