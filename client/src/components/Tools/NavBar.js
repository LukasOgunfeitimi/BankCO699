import { Navigate, useNavigate } from "react-router-dom";


function NavBar () {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-white shadow-md">
      {/* Left: Logo */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-blue-600">LuFunds</h1>
      </div>

      {/* Center: Nav Links */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-6">
        <button
          onClick={() => { navigate("/dashboard")}}
          className="text-gray-600 hover:text-blue-600 transition">
          Dashboard</button>
        <button
          onClick={() => { navigate("transfer")}}
          className="text-gray-600 hover:text-blue-600 transition">
          Transfer
        </button>
      </div>

      {/* Optional Right: Logout button */}
      <div className=" flex gap-6">
      <button
          onClick={() => { navigate("settings")}}
          className="text-blue-600 hover:text-blue-800 font-medium transition">
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-800 font-medium transition"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default NavBar;