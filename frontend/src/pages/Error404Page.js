import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from '../components/SupportComponents/Navbar';
import Error404 from '../components/Error404Page/Error404';


const Imprint = () => {
  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar />
      <main>
        <Error404 />
      </main>
      <Footer />
    </div>
    </>

  )
}

export default Imprint
