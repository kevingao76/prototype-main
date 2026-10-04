import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";
import NotificationsServiceProvider from "../components/NotificationsPage/NotificationsServiceProvider";

const NotificationsPage = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="provider" />
        <main>
          <NotificationsServiceProvider/>
        </main>
        <Footer />
      </div>
    </>

  )
}

export default NotificationsPage
