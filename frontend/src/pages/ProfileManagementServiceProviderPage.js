import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";
import ProfileManagementServiceProviderComponent from "../components/ProfileManagementPage/ProfileManagementServiceProviderComponent";



const ProfileManagementServiceProviderPage = () => {
  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="provider" />
        <main>
          <ProfileManagementServiceProviderComponent/>
        </main>
        <Footer />
      </div>
    </>

  )
}

export default ProfileManagementServiceProviderPage
