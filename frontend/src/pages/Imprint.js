import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from '../components/SupportComponents/Navbar';
import ImprintContent from '../components/SupportComponents/ImprintContent';


const Imprint = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="" />
        <main>
          <ImprintContent />
        </main>
        <Footer />
      </div>
    </>

  )
}

export default Imprint
