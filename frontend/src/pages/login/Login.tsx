import React, { type Dispatch, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { addUser, updateLoginStatus } from '../../features/slices/authSlice'
import Swal from 'sweetalert2'

const Login = (): JSX.Element => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const dispatch: Dispatch<any> = useDispatch()
  const { users } = useSelector((store: any) => store.auth)
  //   user login
  const handleUserLogin = (e: { preventDefault: () => void }): void => {
    e.preventDefault()
    const newUser = {
      email,
      password
    }
    if (users.length < 1) {
      dispatch(addUser(newUser))
      dispatch(updateLoginStatus(true))
      setEmail('')
      setPassword('')
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'User already logged in!'
      })
    }
  }
  return (
    <div className='login'>
      <form onSubmit={handleUserLogin}>
        <div className="input-field">
          <input type="email" placeholder='email' required value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value) }}/>
        </div>
        <div className="input-field">
          <input type="password" placeholder='password' required value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value) }}/>
        </div>
          <div className="login-actions" style={{ marginTop: '18px' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>Forgot Password?</Link>
              <Link to='/register' style={{ marginLeft: '15px', textDecoration: 'none' }}>Don't have an account yet?</Link>
          </div>
        <button>Login</button>
      </form>
    </div>
  )
}

export default Login
