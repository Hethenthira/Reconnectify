import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbar />
      <main style={{ marginTop: "70px" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
