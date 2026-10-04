import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";
import ProfileManagementServiceReceiverComponent from "../components/ProfileManagementPage/ProfileManagementServiceReceiverComponent";



const ProfileManagementPage = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="receiver" />
        <main>
          <ProfileManagementServiceReceiverComponent/>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default ProfileManagementPage
