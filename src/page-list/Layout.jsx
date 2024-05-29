import React from "react";
import { Navbar, Sidebar, Footer } from "../components/Navigation";

const Layout = ({ children }) => {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow mt-16">
        <Sidebar className="z-70" />
        <main className="flex-grow overflow-y-hidden p-4">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
