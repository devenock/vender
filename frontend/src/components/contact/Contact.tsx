import SocialConnect from '../connect/SocialConnect'
import GoogleMap from '../map/GoogleMap'

const Contact = (): JSX.Element => {
  return (
        <div className="contact">
            <GoogleMap />
            <SocialConnect />
        </div>
  )
}

export default Contact
