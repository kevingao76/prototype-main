import React from 'react'
import Header from '../components/LandingPage/Header';
import Team from '../components/LandingPage/AboutUs';
import FAQ from '../components/LandingPage/FAQ';
import Testimonials from '../components/LandingPage/Testimonials';
import Achievements from '../components/LandingPage/Achievements';
import Services from '../components/LandingPage/Services';
import Footer from '../components/SupportComponents/Footer';
import Navbar from '../components/SupportComponents/Navbar';


const Home = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="home" />
        <main>
          <Header />
          <Services />
          <Achievements />
          <Team />
          <Testimonials />
          <FAQ />
        </main>
        <Footer />
      </div>
    </>

  )
}

export default Home
