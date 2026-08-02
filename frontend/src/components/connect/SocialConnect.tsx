import { FaPhone } from 'react-icons/fa'
import { FiSend } from 'react-icons/fi'
import { MdEmail } from 'react-icons/md'
import { type Connect } from '../../types/connect'

const connectData: Connect[] = [
  {
    icon: <FaPhone />,
    title: 'Phone',
    value: '123-456-7890; 123-456-7891'
  },
  {
    icon: <FiSend />,
    title: 'Address',
    value: '4578 Marmora Road, Glasgow'
  },
  {
    icon: <MdEmail />,
    title: 'E-mail',
    value: 'info@demolink.org'
  }
]

const SocialConnect = (): JSX.Element => {
  return (
    <div className='connect'>
        {
          connectData.map((chan) => (
            <div className="channel">
              <i>
              {chan.icon}
              </i>
              <p>{chan.title}: <br /> <strong>{chan.value}</strong></p>
            </div>
          ))
        }
    </div>
  )
}

export default SocialConnect
