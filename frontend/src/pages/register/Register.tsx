import React, { type ChangeEvent, type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

const Register = (): JSX.Element => {
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [registerEmail, setRegisterEmail] = useState<string>('')
  const [registerPassword, setRegisterPassword] = useState<string>('')
  const [repeatPassword, setRepeatPassword] = useState<string>('')

  // handle register
  const registerUser = (e: FormEvent): void => {
    e.preventDefault()
    const newUserDetails = {
      firstName,
      lastName,
      registerEmail,
      registerPassword,
      repeatPassword
    }
    console.log(newUserDetails)
  }
  return (
    <div className='register'>
      {/* <h1>Register</h1> */}
      <form onSubmit={registerUser}>
        <div className="input-field">
          <input type="text" placeholder='First Name' value={firstName} onChange={(e: ChangeEvent<HTMLInputElement>) => { setFirstName(e.target.value) }}/>
        </div>
        <div className="input-field">
          <input type="text" placeholder='Last Name' value={lastName} onChange={(e: ChangeEvent<HTMLInputElement>) => { setLastName(e.target.value) }}/>
        </div>
        <div className="input-field">
          <input type="email" placeholder='Email' value={registerEmail} onChange={(e: ChangeEvent<HTMLInputElement>) => { setRegisterEmail(e.target.value) }}/>
        </div>
        <div className="input-field">
          <input type="password" placeholder='Password' value={registerPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => { setRegisterPassword(e.target.value) }}/>
        </div>
        <div className="input-field">
          <input type="password" placeholder='Repeat Password' value={repeatPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => { setRepeatPassword(e.target.value) }}/>
        </div>
        <div className="register-actions">
          <p>Already registered?  <Link to='/login' style={{ textDecoration: 'none' }}>Login</Link></p>
        </div>
        <button>Register</button>
      </form>
    </div>
  )
}

export default Register
