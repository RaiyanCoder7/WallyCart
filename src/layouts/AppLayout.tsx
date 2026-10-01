import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const AppLayout = () => {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        © 2026 WallyCart. All rights reserved.
      </footer>
    </div>
  );
};

export default AppLayout;