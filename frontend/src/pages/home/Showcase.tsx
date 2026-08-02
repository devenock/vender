import searchImgOne from '../../assets/img/search1.jpg'
import searchImgTwo from '../../assets/img/search2.jpg'
import searchImgThree from '../../assets/img/search3.jpg'
import searchImgFour from '../../assets/img/search4.jpg'
import searchImgFive from '../../assets/img/search5.jpg'
import searchImgSix from '../../assets/img/search6.jpg'
import {FC} from "react";

interface Img {
  imgUrl: string
  id: number
  alt: string
}
const images: Img[] = [
  {
    imgUrl: searchImgOne,
    id: 1,
    alt: 'search one'
  },
  {
    imgUrl: searchImgTwo,
    id: 2,
    alt: 'search two'
  },
  {
    imgUrl: searchImgThree,
    id: 3,
    alt: 'search three'
  },
  {
    imgUrl: searchImgFour,
    id: 4,
    alt: 'search four'
  },
  {
    imgUrl: searchImgFive,
    id: 5,
    alt: 'search five'
  },
  {
    imgUrl: searchImgSix,
    id: 6,
    alt: 'search six'
  }
]
const Showcase:FC = () => {
  return (
        <div className='showcase'>
            {
                images.map((img: Img) => {
                  return (
                        <div key={img.id} className="img cursor-pointer">
                            <img src={img.imgUrl} alt={img.alt}/>
                        </div>
                  )
                })
            }
        </div>
  )
}

export default Showcase
