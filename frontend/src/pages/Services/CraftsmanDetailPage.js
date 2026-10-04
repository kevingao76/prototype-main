import React from 'react'
import Navbar from "../../components/SupportComponents/Navbar";
import Footer from "../../components/SupportComponents/Footer";
import CraftsmanDetailComponent from "../../components/Services/CraftsmanDetailComponent";


const Painting = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="receiver" />
        <main>
          <CraftsmanDetailComponent />
        </main>
        <Footer />
      </div>
    </>

  )
}

export default Painting
