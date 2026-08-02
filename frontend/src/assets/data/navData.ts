import { v4 as uuidv4 } from 'uuid'
import { type NavLinks } from '../../types/nav'

export const navData: NavLinks[] = [
  {
    id: uuidv4(),
    name: 'Home',
    url: '/'
  },
  {
    id: uuidv4(),
    name: 'Shop',
    url: '/products'
  },
  {
    id: uuidv4(),
    name: 'Blog',
    url: '/blog'
  },
  {
    id: uuidv4(),
    name: 'Contact',
    url: '/contacts'
  }
]
