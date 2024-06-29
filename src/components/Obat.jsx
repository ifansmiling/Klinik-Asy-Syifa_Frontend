import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Select } from "antd";
import { AiOutlinePlusCircle } from "react-icons/ai";

const { Option } = Select;

const Obat = () => {
  const [namaObat, setNamaObat] = useState("");
  const [jumlahObat, setJumlahObat] = useState("");
  const [namaResep, setNamaResep] = useState([]);
  const [stokResep, setStokResep] = useState([]);
  const [jumlahResep, setJumlahResep] = useState([]);
  const [bentukResep, setBentukResep] = useState([]);
  const [dosisResep, setDosisResep] = useState([]);
  const [caraPakaiResep, setCaraPakaiResep] = useState([]);
  const [stokResepList, setStokResepList] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [selectedPasienId, setSelectedPasienId] = useState(null);
  const [selectedResepId, setSelectedResepId] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const navigate = useNavigate();

  // Fetch pasien data
  const getPasien = async () => {
    try {
      const response = await api.get("/pasien");
      const today = new Date().toISOString().split("T")[0];
      const filteredPasien = response.data.filter(
        (pasien) => pasien.tanggal_berobat.split("T")[0] === today
      );
      setPasienList(filteredPasien);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch stok resep data
  const getStokResep = async () => {
    try {
      const response = await api.get("/stok_resep");
      setStokResepList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPasien();
    getStokResep();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!namaObat || !jumlahObat) {
      setError("Harap isi semua bidang yang diperlukan.");
      return;
    }

    setShowConfirmationPopup(true);
  };

  const handleConfirm = async () => {
    setShowConfirmationPopup(false);
    setLoading(true);

    try {
      const dataResep = {
        nama_resep: namaResep.length > 0 ? namaResep[0] : "",
        jumlah_resep: jumlahResep.length > 0 ? jumlahResep[0] : "",
        bentuk_resep: bentukResep.length > 0 ? bentukResep[0] : "",
        dosis: dosisResep.length > 0 ? dosisResep[0] : "",
        cara_pakai: caraPakaiResep.length > 0 ? caraPakaiResep[0] : "",
        stok_resep_id: selectedResepId,
        pasien_id: selectedPasienId, // Tambahkan pasien_id di sini
      };

      await Promise.all([
        api.post("/obat", {
          nama_obat: namaObat,
          jumlah_obat: jumlahObat,
          pasien_id: selectedPasienId,
        }),
        api.post("/resep_obat", dataResep), // Kirim dataResep yang sudah termasuk pasien_id
      ]);

      navigate("/pasien");
      setSuccess(true);
      setLoading(false);
      setError(null);
    } catch (error) {
      setLoading(false);
      console.error("Error response:", error.response);
      setError(error.response.data.message);
    }
  };

  const handleCancel = () => {
    setShowConfirmationPopup(false);
  };

  const onChange = (value) => {
    setSelectedPasienId(value);
  };

  const onSearch = (value) => {
    console.log("search:", value);
  };

  const addField = () => {
    setNamaResep((prev) => [...prev, ""]);
    setStokResep((prev) => [...prev, ""]);
    setJumlahResep((prev) => [...prev, ""]);
    setBentukResep((prev) => [...prev, ""]);
    setDosisResep((prev) => [...prev, ""]);
    setCaraPakaiResep((prev) => [...prev, ""]);
  };

  const filterOption = (input, option) =>
    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  const windowHeight = window.innerHeight;
  const dropdownMaxHeight = Math.min(
    windowHeight - 200,
    pasienList.length * 40
  );

  const removeField = (index) => {
    setNamaResep((prev) => prev.filter((_, i) => i !== index));
    setJumlahResep((prev) => prev.filter((_, i) => i !== index));
    setBentukResep((prev) => prev.filter((_, i) => i !== index));
    setDosisResep((prev) => prev.filter((_, i) => i !== index));
    setCaraPakaiResep((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex mt-5 justify-center font-sans">
      <div className="w-full p-5 rounded-lg font-inter bg-white border border-yellow-300">
        <div className="">
          <h1 className="text-lg font-semibold mb-6 mt-2 text-center">
            Form Resep Obat
          </h1>
          <div className="w-2/3 px-8 border-yellow-400">
            <Select
              showSearch
              placeholder="Cari Pasien"
              optionFilterProp="children"
              onChange={onChange}
              onSearch={onSearch}
              filterOption={filterOption}
              value={selectedPasienId}
              style={{ width: 150 }}
              dropdownStyle={{
                maxHeight: `${dropdownMaxHeight}px`,
                overflowY: "auto",
              }}
            >
              {pasienList
                .sort(
                  (a, b) =>
                    new Date(b.tanggal_berobat) - new Date(a.tanggal_berobat)
                )
                .map((pasien) => (
                  <Option
                    key={pasien.id}
                    value={pasien.id}
                    children={`${pasien.nama_pasien}`}
                  ></Option>
                ))}
            </Select>
          </div>
          <form onSubmit={handleSubmit} className="px-9 py-1">
            <div className="grid gap-4 gap-y-4 py-4 sm:grid-cols-1">
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col col-span-1">
                  <label
                    htmlFor="nama-obat"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nama Obat
                  </label>
                  <input
                    type="text"
                    id="nama-obat"
                    className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                    placeholder="Contoh: Decolsin"
                    value={namaObat}
                    onChange={(e) => setNamaObat(e.target.value)}
                  />
                </div>
                <div className="flex flex-col col-span-1">
                  <label
                    htmlFor="jumlah-obat"
                    className="text-sm font-medium text-gray-700"
                  >
                    Jumlah Obat
                  </label>
                  <input
                    type="text"
                    id="jumlah-obat"
                    className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                    placeholder="Contoh: 10"
                    value={jumlahObat}
                    onChange={(e) => setJumlahObat(e.target.value)}
                  />
                </div>
              </div>

              {[...Array(namaResep.length)].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-1 md:grid-cols-2 mt-4"
                >
                  <div className="flex flex-col col-span-2">
                    <label
                      htmlFor={`cari-resep-${index}`}
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Cari Resep
                    </label>
                    <Select
                      showSearch
                      placeholder="Pilih"
                      optionFilterProp="children"
                      onChange={(value) => {
                        const selectedResep = stokResepList.find(
                          (resep) => resep.id === value
                        );

                        if (selectedResep) {
                          setSelectedResepId(value);
                          const newNamaResep = [...namaResep];
                          newNamaResep[index] = selectedResep.nama_resep;
                          const newStokResep = [...stokResep];
                          newStokResep[index] = selectedResep.status_stok; // Perbarui status stok
                          setNamaResep(newNamaResep);
                          setStokResep(newStokResep); // Update state status stok
                        }
                      }}
                      onSearch={onSearch}
                      filterOption={filterOption}
                      value={selectedResepId} // Gunakan selectedResepId untuk nilai terpilih
                      style={{ width: 150 }}
                      dropdownStyle={{
                        maxHeight: `${dropdownMaxHeight}px`,
                        overflowY: "auto",
                      }}
                    >
                      {stokResepList.map((resep) => (
                        <Option key={resep.id} value={resep.id}>
                          {resep.nama_resep}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex flex-col col-span-1 md:col-span-1">
                    <label
                      htmlFor={`nama-resep-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Nama Resep
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Resep"
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      value={namaResep[index]}
                      disabled // tambahkan disabled di sini
                    />
                  </div>

                  <div className="flex flex-col col-span-1 md:col-span-1">
                    <label
                      htmlFor={`stok-resep-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Stok Resep
                    </label>
                    <input
                      type="text"
                      placeholder="Stok"
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      value={stokResep[index]}
                      disabled // tambahkan disabled di sini
                    />
                  </div>

                  <div className="flex flex-col col-span-1">
                    <label
                      htmlFor={`jumlah-resep-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Jumlah Resep
                    </label>
                    <input
                      type="text"
                      id={`jumlah-resep-${index}`}
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      placeholder="Contoh: 500mg"
                      value={jumlahResep[index]}
                      onChange={(e) => {
                        const newJumlahResep = [...jumlahResep];
                        newJumlahResep[index] = e.target.value;
                        setJumlahResep(newJumlahResep);
                      }}
                    />
                  </div>

                  <div className="flex flex-col col-span-1">
                    <label
                      htmlFor={`dosis-resep-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Dosis
                    </label>
                    <input
                      type="text"
                      id={`dosis-resep-${index}`}
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      placeholder="Dosis"
                      value={dosisResep[index]}
                      onChange={(e) => {
                        const newDosisResep = [...dosisResep];
                        newDosisResep[index] = e.target.value;
                        setDosisResep(newDosisResep);
                      }}
                    />
                  </div>
                  <div className="flex flex-col col-span-1 md:col-span-1">
                    <label
                      htmlFor={`bentuk-resep-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Bentuk Resep
                    </label>
                    <Select
                      id={`bentuk-resep-${index}`}
                      placeholder="Pilih Bentuk Resep"
                      className="mt-1"
                      value={bentukResep[index]}
                      onChange={(value) => {
                        const newBentukResep = [...bentukResep];
                        newBentukResep[index] = value;
                        setBentukResep(newBentukResep);
                      }}
                    >
                      <Option value="tablet">Tablet</Option>
                      <Option value="sirup">Sirup</Option>
                      <Option value="kapsul">Kapsul</Option>
                    </Select>
                  </div>
                  <div className="flex flex-col col-span-1">
                    <label
                      htmlFor={`cara-pakai-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Cara Pakai
                    </label>
                    <input
                      type="text"
                      id={`cara-pakai-${index}`}
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      placeholder="Cara Pakai"
                      value={caraPakaiResep[index]}
                      onChange={(e) => {
                        const newCaraPakaiResep = [...caraPakaiResep];
                        newCaraPakaiResep[index] = e.target.value;
                        setCaraPakaiResep(newCaraPakaiResep);
                      }}
                    />
                  </div>

                  <div className="flex justify-center col-span-2">
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                      onClick={() => removeField(index)}
                    >
                      Hapus Resep
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex">
                <button
                  type="button"
                  className="text-m text-blue-500 hover:text-blue-700 focus:outline-none"
                  onClick={addField}
                >
                  <AiOutlinePlusCircle className="w-6 h-6 inline-block align-text-bottom mr-1" />
                  Tambah Resep
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm mb-4">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="text-green-500 text-sm mb-4">
                <p>Resep berhasil disimpan.</p>
              </div>
            )}

            <div className="mt-4">
              <button
                type="submit"
                className="text-l w-full py-2 bg-blue-400 text-black rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
              >
                Simpan
              </button>
            </div>
          </form>

          {showConfirmationPopup && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-100 max-w-full border border-yellow-500">
                <p className="mb-4">Apakah Anda yakin ingin menyimpan resep?</p>

                <div className="flex justify-center space-x-4">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition"
                    onClick={handleCancel}
                  >
                    Belum
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition"
                    onClick={handleConfirm}
                  >
                    Sudah
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Obat;
