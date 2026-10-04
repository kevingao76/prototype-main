import React from 'react'
import BrowseServices from '../components/Services/BrowseServices';
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";


const BrowseServicesReceiver = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="receiver" />
        <main>
          <BrowseServices />
        </main>
        <Footer />
      </div>
    </>

  )
}

export default BrowseServicesReceiver
