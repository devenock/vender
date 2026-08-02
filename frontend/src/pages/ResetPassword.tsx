import { useState, useEffect } from 'react'

const ResetPassword = (): JSX.Element => {
  const [email, setEmail] = useState('')
  return (
    <div className='login'>
      <form>
        <div className="input-field">
          <input type="email" placeholder='email' required/>
        </div>
        <button>Reset</button>
      </form>
    </div>
  )
}

export default ResetPassword
