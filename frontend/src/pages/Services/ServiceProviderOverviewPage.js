import React from 'react'
import Navbar from "../../components/SupportComponents/Navbar";
import Footer from "../../components/SupportComponents/Footer";
import ServiceProviderOverview from "../../components/Services/ServiceProviderOverview";


const Painting = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="receiver" />
        <main>
          <ServiceProviderOverview />
        </main>
        <Footer />
      </div>
    </>

  )
}

export default Painting
