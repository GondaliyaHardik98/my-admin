import React from "react";

const Navbar = () => {
  //const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <li>
          <a
            to="/employee"
            href="/employee"
            className="text-white hover:text-gray-200"
          >
            Employee
          </a>
        </li>
        <li>
          <a href="/customerDetails" className="text-white hover:text-gray-200">
            CustomerDetails
          </a>
        </li>
        <li>
          <a href="/vendorMaster" className="text-white hover:text-gray-200">
            Vendor Master
          </a>
        </li>
        <li>
          <a href="/productMaster" className="text-white hover:text-gray-200">
            Product Master
          </a>
        </li>
        <li>
          <a href="/challanMaster" className="text-white hover:text-gray-200">
            Challan Master
          </a>
        </li>
        <li>
          <a href="/sellMaster" className="text-white hover:text-gray-200">
            Sell Master
          </a>
        </li>
        <li>
          <a href="/salaryMaster" className="text-white hover:text-gray-200">
            Salary Master
          </a>
        </li>
      </div>
    </nav>
  );
};

export default Navbar;
