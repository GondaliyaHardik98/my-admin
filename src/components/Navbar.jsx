import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to control mobile menu visibility
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <div className="text-white text-lg font-bold">MyApp</div>

        {/* Hamburger Menu for Mobile */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            {/* Icon for the Hamburger Menu */}
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Menu Items */}
        <ul
          className={`flex-col lg:flex-row lg:flex lg:space-x-4 absolute lg:static bg-blue-600 lg:bg-transparent w-full lg:w-auto top-16 left-0 lg:top-auto lg:left-auto z-50 lg:z-auto ${
            isOpen ? "flex" : "hidden"
          }`}
        >
          <li>
            <a
              href="/employee"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              Employee
            </a>
          </li>
          <li>
            <a
              href="/customerDetails"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              CustomerDetails
            </a>
          </li>
          <li>
            <a
              href="/vendorMaster"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              Vendor Master
            </a>
          </li>
          <li>
            <a
              href="/productMaster"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              Product Master
            </a>
          </li>
          <li>
            <a
              href="/challanMaster"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              Challan Master
            </a>
          </li>
          <li>
            <a
              href="/sellMaster"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              Sell Master
            </a>
          </li>
          <li>
            <a
              href="/amcMaster"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              AMC Data
            </a>
          </li>
          <li>
            <a
              href="/salaryMaster"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              Salary Master
            </a>
          </li>
          <li>
            <a
              onClick={handleLogout}
              href="/"
              className="block px-4 py-2 text-white hover:text-gray-200"
            >
              Logout
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
