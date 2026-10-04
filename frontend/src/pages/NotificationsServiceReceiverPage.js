import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";
import NotificationsServiceReceiver from "../components/NotificationsPage/NotificationsServiceReceiver";

const NotificationsPage = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="receiver" />
        <main>
         <NotificationsServiceReceiver/>
        </main>
        <Footer />
      </div>
    </>

  )
}

export default NotificationsPage
