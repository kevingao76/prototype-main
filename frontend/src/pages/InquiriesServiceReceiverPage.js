import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";
import InquiriesServiceReceiver from "../components/InquiriesPage/InquiriesReceiver";



const PendingInquiriesPage = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar userType="receiver" />
      <main>
        <InquiriesServiceReceiver/>
      </main>
      <Footer />
      </div>
    </>

  )
}

export default PendingInquiriesPage
