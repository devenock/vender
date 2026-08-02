export interface Footer {
  title: string
  id: number
  link: string
}

// footer links
export const information: Footer[] = [
  {
    link: '/store/category/accessories',
    title: 'accessories',
    id: 1
  },
  {
    link: '/store/category/outdoor',
    title: 'outdoor',
    id: 2
  },
  {
    link: '/store/category/mens',
    title: 'mens',
    id: 3
  },
  {
    link: '/store/category/womans',
    title: 'womans',
    id: 4
  },
  {
    link: '/store/category/footware',
    title: 'footware',
    id: 5
  },
  {
    link: '/store/category/outware',
    title: 'outware',
    id: 6
  }
]

export const pages: Footer[] = [
  {
    link: '/',
    title: 'home',
    id: 1
  },
  {
    link: '/products',
    title: 'shop',
    id: 2
  },
  {
    link: '/blog',
    title: 'blog',
    id: 3
  },
  {
    link: '/contacts',
    title: 'contact',
    id: 4
  }
]
