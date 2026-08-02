import React from 'react'
import { Link } from 'react-router-dom'
import { information, pages } from '../../assets/data/footer'
import { FaPhone, FaTwitter, FaYoutube, FaInstagram, FaPinterest } from 'react-icons/fa'
import { HiMail } from 'react-icons/hi'
import { TiLocation } from 'react-icons/ti'
import { BiLogoFacebookSquare } from 'react-icons/bi'

const Footer = (): JSX.Element => {
  return (
    <div className='footer'>
      <div className="information">
          <h3>INFORMATION</h3>
          {
              information.map((info) => {
                return (
                      <Link key={info.id} to={info.link} className='footer-link'>{info.title}</Link>
                )
              })
          }
      </div>
        <div className='pages'>
            <h3>PAGES</h3>
            {
                pages.map((page, index) => {
                  return (
                        <Link to={page.link} className='footer-link' key={index}>{page.title}</Link>
                  )
                })
            }
        </div>
        <div className='contact'>
            <h3>CONTACT US</h3>
            <div className="contact-info">
                <p><i><TiLocation size={12} /></i> 4578 Marmora Road, Glasgow</p>
                <p><i><FaPhone size={12} /></i> 123-456-7890</p>
                <p><i><HiMail size={12} /></i> info@demolink.org</p>
            </div>
        </div>
        <div className='follow'>
            <h3>FOLLOW US</h3>
            <div className="subscribe">
                <form>
                    <input type="email" placeholder='Enter your email'/>
                    <button>subscribe</button>
                </form>
            </div>
            <div className="social-icons">
                <i><BiLogoFacebookSquare size={15} color={'#999999'} /></i>
                <i><FaTwitter size={15} color={'#999999'}/></i>
                <i><FaYoutube size={15} color={'#999999'}/></i>
                <i><FaInstagram size={15} color={'#999999'}/></i>
                <i><FaPinterest size={15} color={'#999999'}/></i>
            </div>
        </div>
    </div>
  )
}

export default Footer
