import { useState } from 'react'
import { type NavigateFunction, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import Search from '../search/Search'

export interface Categories {
  name: string
  categoryLink: string
  id: any
}

const categories: Categories[] = [
  {
    name: 'accessories',
    categoryLink: '/store/category/accessories',
    id: uuidv4()
  },
  {
    name: 'outdoor',
    categoryLink: '/store/category/outdoor',
    id: uuidv4()
  },
  {
    name: 'mens',
    categoryLink: '/store/category/mens',
    id: uuidv4()
  },
  {
    name: 'footware',
    categoryLink: '/store/category/footware',
    id: uuidv4()
  },
  {
    name: 'womans',
    categoryLink: '/store/category/womans',
    id: uuidv4()
  },
  {
    name: 'outware',
    categoryLink: '/store/category/outware',
    id: uuidv4()
  },
  {
    name: 'jewelry',
    categoryLink: '/store/category/jewelry',
    id: uuidv4()
  },
  {
    name: 'sportsware',
    categoryLink: '/store/category/sportsware',
    id: uuidv4()
  }

]
const Category = (): JSX.Element => {
  const navigate: NavigateFunction = useNavigate()
  return (
        <div className='category bg-[#023047]'>
            <div className="category-links">
                {
                    categories.map((category: Categories) => {
                      return (
                            <p key={category.id} onClick={() => { navigate(category.categoryLink) }}>{category.name}</p>
                      )
                    })
                }
            </div>
            <Search />
        </div>
  )
}

export default Category
