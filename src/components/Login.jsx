import React, { useState, useEffect } from "react";
import api from "../services/api";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Logo from "../Logo Klinik.png";
import { useAuth } from "../context/authContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    email: "",
    kata_sandi: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSuccess = (accessToken) => {
    authLogin(accessToken);
    navigate("/dashboard");
  };

  const loginUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/login", {
        email: data.email,
        kata_sandi: data.kata_sandi,
      });
      if (
        response.data &&
        response.data.accessToken &&
        response.data.nama &&
        response.data.role
      ) {
        const { accessToken, nama, role } = response.data;
        localStorage.setItem("accessToken", accessToken);
        const userData = { nama, role };
        localStorage.setItem("userData", JSON.stringify(userData));

        setLoading(false);
        handleLoginSuccess(accessToken); 
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.message || "Login failed, please try again."
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      handleLoginSuccess(token);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      <div className="max-w-4xl mx-auto p-4 border border-black-600 rounded-lg shadow-lg hover:shadow-xl transition duration-300 flex flex-col md:flex-row bg-white">
        <div className="md:w-1/2 pr-4 border-r border-gray-400">
          <div className="flex items-center mt-5 mb-4 border-b-2 border-indigo-200 pb-4">
            <img src={Logo} alt="Klinik Logo" className="h-20 mx-auto" />
          </div>
          <div className="ml-3 mb-2 text-center">
            <p className="text-lg text-gray-500">
              Silahkan login ke Klinik Asy-Syifa untuk akses penuh ke layanan
              kami.
            </p>
          </div>
        </div>
        <div className="md:w-1/2 pl-4">
          <div className="p-4">
            <h2 className="text-2xl font-bold text-center mb-3">Login</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginUser();
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  value={data.email}
                  onChange={(e) => {
                    setData((prev) => ({ ...prev, email: e.target.value }));
                  }}
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 border-b-2 border-gray-300 rounded-t-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs transition duration-300 ease-in-out hover:border-yellow-500"
                  required
                  placeholder="contoh@gmail.com"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    value={data.kata_sandi}
                    onChange={(e) => {
                      setData((prev) => ({
                        ...prev,
                        kata_sandi: e.target.value,
                      }));
                    }}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="mt-1 block w-full px-3 py-2 border-b-2 border-gray-300 rounded-b-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs transition duration-300 ease-in-out hover:border-yellow-500"
                    required
                    placeholder="******"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-500 focus:outline-none focus:text-gray-700"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <span className="text-xl">&#128065;</span>
                      ) : (
                        <span className="text-xl">&#128064;</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 grid place-items-center"
              >
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  "Login"
                )}
              </button>
              <section className="text-sm text-red-400 mt-2 text-center">
                {error ? <p>{error}</p> : null}
              </section>
            </form>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-gray-600 text-sm">
        <div>
          <span>
            Klinik Asy-Syifa &copy; {new Date().getFullYear()} Lokasi: Desa
            Randudongkal, Pemalang, Jawa Tengah, Indonesia
          </span>
        </div>
        <div>
          <span>
            Layanan: Konsultasi Dokter Umum, Tes Darah, Cek Kesehatan, dll.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
