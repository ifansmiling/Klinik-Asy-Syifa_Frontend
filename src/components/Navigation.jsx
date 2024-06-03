import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeModernIcon,
  ChartPieIcon,
  ClipboardDocumentIcon,
  UsersIcon,
  UserIcon,
  PowerIcon,
} from "@heroicons/react/20/solid";
import Logo from "../Logo Klinik.png";

function Navbar() {
  const [userData, setUserData] = useState({
    nama: "",
    role: "",
  });

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    console.log(storedUserData); // Memeriksa nilai storedUserData
    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  useEffect(() => {
    const storedPhoto = localStorage.getItem(
      `selectedPhoto_${userData.role}_${userData.nama}`
    );
    setSelectedPhoto(storedPhoto || "src/assets/Default Foto.jpg");
  }, [userData]);

  const [selectedPhoto, setSelectedPhoto] = useState(
    "/src/assets/Foto Profil.jpg"
  );

  const handleProfileClick = () => {
    document.getElementById("file-input").click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const selectedPhotoDataUrl = e.target.result;
        setSelectedPhoto(selectedPhotoDataUrl);
        localStorage.setItem(
          `selectedPhoto_${userData.role}_${userData.nama}`,
          selectedPhotoDataUrl
        );
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <nav className="border-gray-200 dark:bg-gray-900 fixed top-0 w-full z-10  border border-yellow-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 bg-white ">
        <NavLink to="/dashboard">
          <img src={Logo} className="h-12" alt="Klinik Logo" />
        </NavLink>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <div className="flex items-center">
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-900">
                {userData.nama}
              </p>
              <p className="text-xs text-gray-500">{userData.role}</p>
            </div>
          </div>
          <div className="relative">
            <button
              type="button"
              className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              id="user-menu-button"
              aria-expanded="false"
              data-dropdown-toggle="user-dropdown"
              data-dropdown-placement="bottom"
              onClick={handleProfileClick}
            >
              <img
                className="w-8 h-8 rounded-full"
                src={selectedPhoto}
                alt="photo"
              />
            </button>
            <input
              type="file"
              id="file-input"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-user"
        ></div>
      </div>
    </nav>
  );
}

function Sidebar() {
  const [activeMenu, setActiveMenu] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUserData) {
      setRole(storedUserData.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setActiveMenu("Keluar");
    window.location.href = "/";
  };

  const menu1 = [
    {
      name: "Dashboard",
      icon: <HomeModernIcon width={18} className="text-blue-500" />,
      isActive: activeMenu === "Dashboard",
      route: "/dashboard",
    },
    role === "Dokter" && {
      name: "Resep Obat",
      isActive: activeMenu === "Resep Obat",
      icon: <ChartPieIcon width={18} className="text-gray-600" />,
      route: "/pasien",
    },
  ].filter(Boolean);

  const menu2 =
    role === "Apoteker"
      ? [
          {
            name: "Riwayat Resep",
            isActive: activeMenu === "Riwayat Resep",
            icon: (
              <ClipboardDocumentIcon width={18} className="text-gray-600" />
            ),
            route: "/history",
          },
        ]
      : [
          {
            name: "Pasien",
            isActive: activeMenu === "Pasien",
            icon: <UserIcon width={18} className="text-gray-600" />,
            route: "/pasienlist",
          },
          role === "Admin" && {
            name: "Users",
            isActive: activeMenu === "Users",
            icon: <UsersIcon width={18} className="text-gray-600" />,
            route: "/user",
          },
        ].filter(Boolean);

  const menu3 = [
    {
      name: "Keluar",
      icon: <PowerIcon width={18} className="text-gray-600" />,
      isActive: activeMenu === "Keluar",
      onClick: handleLogout,
    },
  ];

  const handleSetActiveMenu = (menuName) => {
    setActiveMenu(menuName);
  };

  return (
    <div className="flex sticky top-2 border border-yellow-100 mt-3">
      <section className="w-20 sm:w-64 h-screen bg-white overflow-y-hidden border-r border-yellow-100 sticky top-2">
        <div className=" border-b-2 border-yellow-100 text-sm">
          <Menus
            menu={menu1}
            title={{ sm: "GENERAL", xs: "General" }}
            setActiveMenu={handleSetActiveMenu}
          />
        </div>
        {role !== "Dokter" && (
          <div className="border-b-2 border-yellow-100 text-sm">
            <Menus
              menu={menu2}
              title={{ sm: "APPLICATION", xs: "APP" }}
              setActiveMenu={handleSetActiveMenu}
            />
          </div>
        )}
        <div className="border-b-2 border-yellow-100 text-sm">
          <Menus
            menu={menu3}
            title={{ sm: "AUTHENTICATION", xs: "AUTH" }}
            setActiveMenu={handleSetActiveMenu}
          />
        </div>
      </section>
    </div>
  );
}

function Menus({ menu, title, setActiveMenu }) {
  return (
    <div className="py-5">
      <h6 className="mb-4 text-[10px] sm:text-sm text-center sm:text-left sm:px-5 ">
        <span className="sm:hidden">{title.xs}</span>
        <span className="hidden sm:block">{title.sm}</span>
      </h6>
      <ul>
        {menu.map((val, index) => {
          const menuActive = val.isActive
            ? "bg-blue-300 bg-opacity-50 px-3 border border-blue-100 py-2 rounded-md text-blue-600 flex"
            : "px-3 py-2 flex";

          const textActive = val.isActive ? "text-blue-600" : "text-gray-700";

          return (
            <li
              key={index}
              className={`${menuActive} cursor-pointer mx-5 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-300`}
              onClick={() => {
                if (val.onClick) {
                  val.onClick();
                }
                setActiveMenu(val.name);
              }}
            >
              <NavLink
                to={val.route}
                className={`flex items-center`}
                activeClassName="text-blue-600"
              >
                {val.icon}
                <div className={`ml-2 ${textActive} hidden sm:block`}>
                  {val.name}
                </div>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="bg-gray-200 text-black-800 py-3 border border-yellow-500">
      <div className="text-sm md:justify-between">
        <p className="text-center font-semi bold">
          &copy; {new Date().getFullYear()} <span>Asy-Syifa</span> - Solusi
          Kesehatan Terpercaya untuk Anda
        </p>
      </div>
    </footer>
  );
};

export { Navbar, Sidebar, Footer };
