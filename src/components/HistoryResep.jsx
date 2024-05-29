import React, { useState, useEffect } from "react";
import { Button, Input, Space, Table, Modal, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import api from "../services/api";
import DetailResep from "./DetailResep";
import Logo from "../Logo Klinik.png";

const HistoryResep = () => {
  const [pasienList, setPasienList] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPasienId, setSelectedPasienId] = useState(null);
  const [selectedPasienData, setSelectedPasienData] = useState(null);
  const [selectedObatData, setSelectedObatData] = useState(null);
  const [selectedResepObatData, setSelectedResepObatData] = useState(null);
  const [selectedResepObatByObatId, setSelectedResepObatByObatId] = useState(
    {}
  );
  

  const [resepProcessed, setResepProcessed] = useState(() => {
    // Set status resep awal berdasarkan local storage
    const storedStatus = localStorage.getItem("resepProcessed");
    return storedStatus === "true"; // Kembalikan nilai boolean berdasarkan status yang tersimpan di local storage
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/pasien");
        const sortedPasienList = response.data
          .map((pasien) => ({
            id: pasien.id,
            nama_pasien: pasien.nama_pasien,
            tanggal_berobat: pasien.tanggal_berobat,
            dokter: pasien.dokter,
            proses: pasien.proses_resep,
            createdAt: pasien.createdAt,
          }))
          .sort((a, b) => {
            // Urutkan berdasarkan createdAt secara descending
            const dateComparison =
              new Date(b.createdAt) - new Date(a.createdAt);
            if (dateComparison !== 0) {
              return dateComparison;
            } else {
              // Jika tanggal pembuatan sama, bandingkan ID pasien
              return b.id - a.id;
            }
          });

        setPasienList(sortedPasienList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedObatData && selectedObatData.length > 0) {
      const fetchData = async () => {
        try {
          const obatIds = selectedObatData.map((obat) => obat.id);
          const resepObatPromises = obatIds.map((obatId) =>
            api.get(`/resep_obat/obat/${obatId}`)
          );
          const resepObatResponses = await Promise.all(resepObatPromises);
          const allResepObatData = resepObatResponses.map(
            (response) => response.data
          );

          // Membuat objek untuk memetakan setiap obat_id dengan data resep obat yang sesuai
          const selectedResepObatMapped = {};
          selectedObatData.forEach((obat, index) => {
            selectedResepObatMapped[obat.id] = allResepObatData[index];
          });

          // Mengupdate state dengan objek yang memetakan data resep obat berdasarkan obat_id
          setSelectedResepObatByObatId(selectedResepObatMapped);
        } catch (error) {
          console.error("Error fetching resep obat data:", error);
        }
      };
      fetchData();
    }
  }, [selectedObatData]);

  const handleAction = async (record) => {
    try {
      setModalVisible(true);
      setSelectedPasienId(record.id); // Simpan ID pasien yang dipilih

      // Panggil API untuk mendapatkan data pasien berdasarkan ID
      const response = await api.get(`/pasien/${record.id}`);
      const pasienData = response.data;

      // Panggil API untuk mendapatkan data obat berdasarkan ID pasien
      const obatResponse = await api.get(`/obat/${record.id}`);
      const obatData = obatResponse.data;

      // Ambil semua obat_id dari data obat
      const obatIds = obatData.map((obat) => obat.id);

      // Panggil API untuk mendapatkan semua resep obat berdasarkan semua obat_id
      const resepObatPromises = obatIds.map((obatId) =>
        api.get(`/resep_obat/obat/${obatId}`)
      );
      const resepObatResponses = await Promise.all(resepObatPromises);
      const allResepObatData = resepObatResponses.map(
        (response) => response.data
      );

      // Gabungkan semua data resep obat menjadi satu array
      const mergedResepObatData = allResepObatData.flat();

      // Simpan data pasien, obat, dan resep obat yang dipilih ke state
      setSelectedPasienData(pasienData);
      setSelectedObatData(obatData);
      setSelectedResepObatData(mergedResepObatData);

      // Simpan data resep obat berdasarkan obat_id ke dalam state
      const selectedResepObatGroupedByObatId = mergedResepObatData.reduce(
        (acc, resep_obat) => {
          if (!acc[resep_obat.id_obat]) {
            acc[resep_obat.id_obat] = [];
          }
          acc[resep_obat.id_obat].push(resep_obat);
          return acc;
        },
        {}
      );
      setSelectedResepObatByObatId(selectedResepObatGroupedByObatId);

      // Panggil API untuk memperbarui status resep pasien menjadi diproses
      await api.put(`/pasien/${record.id}`, { proses_resep: "Proses" });

      // Set state resepProcessed menjadi true
      setResepProcessed(true);

      // Update state pasienList dengan status resep yang sudah diproses
      const updatedPasienList = pasienList.map((pasien) =>
        pasien.id === record.id ? { ...pasien, proses_resep: "Proses" } : pasien
      );
      setPasienList(updatedPasienList);

      // Tampilkan pesan sukses
      message.success("Status resep berhasil diperbarui");
    } catch (error) {
      console.error("Error fetching patient data:", error);
      // Tampilkan pesan error
      message.error("Gagal memperbarui status resep");
    }
  };

  const handleCloseModal = async () => {
    try {
      if (!resepProcessed) {
        // Jika proses belum selesai, update status resep ke "Proses"
        // Panggil API untuk memperbarui status resep pasien menjadi diproses
        await api.put(`/pasien/${selectedPasienId}`, {
          proses_resep: "Proses",
        });

        // Set state resepProcessed menjadi true
        setResepProcessed(true);

        // Update state pasienList dengan status resep yang sudah diproses
        const updatedPasienList = pasienList.map((pasien) =>
          pasien.id === selectedPasienId
            ? { ...pasien, proses_resep: "Proses" }
            : pasien
        );
        setPasienList(updatedPasienList);
      }

      // Tutup modal
      setModalVisible(false);
      setSelectedPasienId(null);
      setSelectedPasienData(null);
      setSelectedResepObatData(null);

      // Tampilkan pesan sukses
      message.success("Status resep berhasil diperbarui");
      window.location.reload();
    } catch (error) {
      console.error("Error handling modal close:", error);
      // Tampilkan pesan error jika terjadi kesalahan
      message.error("Gagal menutup modal");
    }
  };

  const handleProcessCompleted = () => {
    // Lakukan tindakan yang diperlukan saat proses selesai, jika ada
    console.log("Proses telah selesai");
  };

  const handleSearch = (selectedKeys, confirm) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const columns = [
    {
      title: "Nama Pasien",
      dataIndex: "nama_pasien",
      key: "nama_pasien",
      filteredValue: filteredInfo.nama_pasien
        ? [filteredInfo.nama_pasien]
        : null,
      onFilter: (value, record) => {
        const namaPasien = record?.nama_pasien || ""; // Jika nama_pasien tidak terdefinisi, gunakan string kosong
        const lowercaseValue =
          typeof value === "string" ? value.toLowerCase() : ""; // Pastikan value adalah string sebelum memanggil toLowerCase
        return namaPasien.toLowerCase().includes(lowercaseValue);
      },

      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search nama pasien"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(selectedKeys, confirm, "nama_pasien")
            }
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, "nama_pasien")}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),

      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      render: (text) => <a>{text}</a>,
      ellipsis: true,
    },

    {
      title: "Tanggal Berobat",
      dataIndex: "tanggal_berobat",
      key: "tanggal_berobat",
      sorter: (a, b) =>
        new Date(b.tanggal_berobat) - new Date(a.tanggal_berobat),
    },
    {
      title: "Dokter",
      dataIndex: "dokter",
      key: "dokter",
      ellipsis: true,
    },
    {
      title: "Proses Resep",
      dataIndex: "proses",
      key: "proses",
      render: (text, record) => {
        // Periksa apakah status resep pasien ini sudah selesai
        const isResepSelesai = record.proses === "Selesai";

        // Jika proses resep selesai, tampilkan status "Selesai"
        if (isResepSelesai) {
          return <span>Selesai</span>;
        } else if (resepProcessed && record.id === selectedPasienId) {
          // Jika proses resep masih berjalan untuk pasien yang dipilih
          return <span>Proses</span>;
        } else {
          return <span>{text}</span>;
        }
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (record) => (
        <Button
          type="primary"
          onClick={() => handleAction(record)}
          style={{ backgroundColor: "green", borderColor: "green" }}
          disabled={record.proses === "Selesai"} // Menonaktifkan tombol jika status resep sudah selesai
        >
          Buat Resep
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="text-center mb-8 mt-10">
        <div className="mx-auto max-w-max">
          <h1 className="text-xl font-semibold">List Resep Obat</h1>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={pasienList.filter(
          (item) =>
            item.nama_pasien &&
            typeof item.nama_pasien === "string" &&
            typeof searchText === "string" &&
            item.nama_pasien.toLowerCase().includes(searchText.toLowerCase())
        )}
        pagination={{ pageSize: 4 }}
        onChange={(pagination, filters, sorter) => {
          setFilteredInfo(filters);
        }}
      />

      <Modal
        title={<div className="text-center text-2xl">Resep Obat Pasien</div>}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={700}
      >
        <div className="p-4 text-sm">
          {selectedPasienData && (
            <div className="mb-7">
              <p className="text-sm">
                <span className="font-semibold">Nama:</span>{" "}
                {selectedPasienData.nama_pasien}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Alamat:</span>{" "}
                {selectedPasienData.alamat_pasien}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Dokter:</span>{" "}
                {selectedPasienData.dokter}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Tanggal Berobat:</span>{" "}
                {selectedPasienData.tanggal_berobat}
              </p>
            </div>
          )}
          {selectedObatData &&
            selectedObatData.map((obat, index) => (
              <div key={obat.id}>
                <h2 className="mb-1 text-lg font-semibold text-left">
                  Data Obat {index + 1}
                </h2>
                <table className="w-full border border-collapse border-gray-300 mb-4">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 font-semibold p-2">
                        No
                      </th>
                      <th className="border border-gray-300 font-semibold p-2">
                        Nama Obat
                      </th>
                      <th className="border border-gray-300 font-semibold p-2">
                        Jumlah
                      </th>
                      <th className="border border-gray-300 font-semibold p-2">
                        Dosis
                      </th>
                      <th className="border border-gray-300 font-semibold p-2">
                        Cara Pakai
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 text-sm text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm text-center">
                        {obat.nama_obat}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm text-center">
                        {obat.jumlah_obat}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm text-center">
                        {obat.dosis_obat}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm text-center">
                        {obat.cara_pakai}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <h2 className="mb-1 text-lg font-semibold text-left">
                  Data Resep Obat {index + 1}
                </h2>
                <table className="w-full border border-collapse border-gray-300 mb-4">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 font-semibold p-2">
                        No
                      </th>
                      <th className="border border-gray-300 font-semibold p-2">
                        Nama Resep
                      </th>
                      <th className="border border-gray-300 font-semibold p-2">
                        Jumlah Resep
                      </th>
                      <th className="border border-gray-300 font-semibold p-2">
                        Bentuk Resep
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Lakukan pemetaan terhadap resep obat yang sesuai dengan obat saat ini */}
                    {selectedResepObatByObatId[obat.id]?.map(
                      (resep_obat, index) => (
                        <tr key={resep_obat.id}>
                          <td className="border border-gray-300 p-2 text-sm text-center">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm text-center">
                            {resep_obat.nama_resep}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm text-center">
                            {resep_obat.jumlah_resep}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm text-center">
                            {resep_obat.bentuk_resep}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ))}

          <DetailResep
            pasienId={selectedPasienId} // Contoh penerusan data pasienId
            selectedPasienData={selectedPasienData} // Meneruskan data pasien
            selectedObatData={selectedObatData} // Meneruskan data obat
            selectedResepObatData={selectedResepObatData} // Meneruskan data resep obat
            onClose={handleCloseModal}
            onProcessCompleted={handleProcessCompleted}
          />

          <div className="flex justify-center mt-6">
            <img src={Logo} className="h-8" alt="Klinik Logo" />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default HistoryResep;
