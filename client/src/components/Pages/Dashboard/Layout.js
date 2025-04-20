// Layout.jsx
import { useEffect } from "react";
import NavBar from "../../Tools/NavBar";
import { Outlet, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate])

  return (
    <div className="w-full">
      <NavBar/>
      <main className="pt-16"> {/* Increased padding-top, try different values */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;