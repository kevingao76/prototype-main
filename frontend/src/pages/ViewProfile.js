import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from '../components/SupportComponents/Navbar';
import PublicProfileView from '../components/PublicProfilePage/PublicProfileView';

const ProfileView = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="receiver" />
        <main>
          <PublicProfileView/>
        </main>
        <Footer />
      </div>
    </>

  )
}

export default ProfileView
