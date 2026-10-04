import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from '../components/SupportComponents/Navbar';
import SignUpForm from "../components/SignUpPage/signUpForm";


const SignUpProvider = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar userType="" />
      <main>
        <SignUpForm isServiceProvider={true} />
      </main>
      <Footer />
      </div>
    </>

  )
}

export default SignUpProvider
