// layouts/SidebarLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";

const SidebarLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-4 w-full">{children}</main>
    </div>
  );
};

export default SidebarLayout;
