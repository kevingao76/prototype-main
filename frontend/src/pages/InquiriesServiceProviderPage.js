import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";
import InquiriesServiceProvider from "../components/InquiriesPage/InquiriesProvider";

const PendingInquiriesPage = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="provider" />
        <main>
          <InquiriesServiceProvider/>
        </main>
        <Footer />
      </div>
    </>

  )
}

export default PendingInquiriesPage
