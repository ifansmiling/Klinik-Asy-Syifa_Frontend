import React, { useEffect, useState } from "react";
import api from "../services/api";
import { AiOutlineLoading3Quarters, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheckCircle } from "react-icons/ai"; // Import ikon mata sandi
import { useNavigate } from "react-router-dom";

const AddUser = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    kata_sandi: "",
    roleId: null,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State untuk menunjukkan atau menyembunyikan kata sandi

  const [roleList, setRoleList] = useState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    getRole();
  }, []);

  const getRole = async () => {
    try {
      const response = await api.get("/role");
      setRoleList(response.data);
    } catch (error) {}
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/user", {
        nama: formData.nama,
        email: formData.email,
        kata_sandi: formData.kata_sandi,
        roleId: formData.roleId,
      });
      setSuccess(true);
      setLoading(false);
      setError(null);
      navigate("/user");
    } catch (error) {
      setLoading(false);
      setError(error.response.data.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8">
        <div className="p-8 rounded-lg shadow-lg font-poppins">
          <h2 className="text-xl font-bold mb-6 mt-4 text-center">Add User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nama"
                  className="text-sm font-medium text-gray-700"
                  
                >
                  Nama
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  placeholder="Contoh: Admin"
                  value={formData.nama}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                  
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  required
                  placeholder="Contoh: admin@gmail.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="kata_sandi"
                  className="text-sm font-medium text-gray-700"
                 
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Tampilkan atau sembunyikan kata sandi sesuai state showPassword
                    id="kata_sandi"
                    name="kata_sandi"
                    value={formData.kata_sandi}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    required
                    placeholder="*******"
                  />
                  {/* Tambahkan ikon mata */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} // Toggle state showPassword saat ikon mata diklik
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
                  >
                    {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="roleId"
                  className="text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                {roleList ? (
                  <select
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    required
                  >
                    <option value={null} selected disabled>
                      Pilih Role
                    </option>
                    {roleList.map((role, index) => (
                      <option key={index} value={role.id}>
                        {role.role}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2 px-4 min-w-[150px] grid place-items-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
            <section className="text-sm  grid w-full place-items-center pt-4">
              {error ? (
                <p className="text-red-400 ">{error}</p>
              ) : success ? (
                <p className="text-green-400 flex items-center"><AiOutlineCheckCircle className="mr-2" />User berhasil ditambahkan</p>
              ) : null}
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
