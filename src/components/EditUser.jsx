import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  AiOutlineLoading3Quarters,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai"; // Import ikon mata sandi

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    kata_sandi: "",
    roleId: null,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [showPassword, setShowPassword] = useState(false); // Tambahkan state showPassword

  useEffect(() => {
    getUserData();
    getRole();
  }, []);

  const getUserData = async () => {
    try {
      const response = await api.get(`/user/${id}`);
      const userData = response.data;
      setFormData({
        nama: userData.nama,
        email: userData.email,
        kata_sandi: userData.kata_sandi,
        roleId: userData.role.id,
      });
    } catch (error) {
      setError("Gagal mengambil data pengguna");
    }
  };

  const getRole = async () => {
    try {
      const response = await api.get("/role");
      setRoleList(response.data);
    } catch (error) {
      setError("Gagal mengambil data role");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = { ...formData };
      await api.put(`/user/${id}`, userData);
      setSuccess(true);
      setLoading(false);
      setError(null);
      navigate("/user");
    } catch (error) {
      setLoading(false);
      setError("Gagal memperbarui pengguna");
    }
  };

  return (
    <div className="w-full p-5 rounded-lg font-inter bg-white border border-yellow-300 mt-10">
      <div className="">
        <div className="">
          <h2 className="text-xl font-semibold mb-6 mt-4 text-center">
            Edit User
          </h2>
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
                  value={formData.nama}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-yellow-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-700 focus:border-indigo-500 text-sm"
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
                  className="mt-1 block w-full px-3 py-2 border border-yellow-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-700 focus:border-indigo-500 text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="kata_sandi"
                  className="text-sm font-medium text-gray-700"
                >
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Tampilkan atau sembunyikan kata sandi sesuai state showPassword
                    id="kata_sandi"
                    name="kata_sandi"
                    value={formData.kata_sandi}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-yellow-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-700 focus:border-indigo-500 text-sm"
                  />
                  {/* Tambahkan ikon mata */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} // Toggle state showPassword saat ikon mata diklik
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
                  >
                    {showPassword ? (
                      <AiOutlineEye />
                    ) : (
                      <AiOutlineEyeInvisible />
                    )}
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
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-yellow-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-700 focus:border-indigo-500 text-sm"
                  required
                >
                  <option value={null} disabled selected>
                    Pilih Role
                  </option>
                  {roleList.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role}
                    </option>
                  ))}
                </select>
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
            <section className="text-sm grid w-full place-items-center pt-4">
              {error && <p className="text-red-400">{error}</p>}
              {success && (
                <p className="text-green-400">Pengguna berhasil diperbarui</p>
              )}
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
