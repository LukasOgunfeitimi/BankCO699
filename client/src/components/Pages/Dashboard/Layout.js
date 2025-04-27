import { useEffect, useState } from "react";
import NavBar from "../../Tools/NavBar";
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(null); // null = not yet checked
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jwt = localStorage.getItem("token");

    if (!jwt) {
      navigate("/login");
    } else {
      setToken(jwt);
      if (location.pathname === "/") {
        navigate("/dashboard");
      }
    }

    setLoading(false); // Set loading to false after checking
  }, [navigate, location]);

  if (loading) {
    return <div className="text-center pt-20">Loading...</div>; // Or a spinner
  }

  return (
    <div className="w-full">
      <NavBar />
      <main className="pt-16">
        <Outlet context={{ token }} />
      </main>
    </div>
  );
}

export default Layout;