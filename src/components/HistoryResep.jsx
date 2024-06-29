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
    const storedStatus = localStorage.getItem("resepProcessed");
    return storedStatus === "true";
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
            const dateComparison =
              new Date(b.createdAt) - new Date(a.createdAt);
            if (dateComparison !== 0) {
              return dateComparison;
            } else {
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
            api.get(`/resep_obat/pasien/${obatId}`)
          );
          const resepObatResponses = await Promise.all(resepObatPromises);
          const allResepObatData = resepObatResponses.map(
            (response) => response.data
          );
          const selectedResepObatMapped = {};
          selectedObatData.forEach((obat, index) => {
            selectedResepObatMapped[obat.id] = allResepObatData[index];
          });
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
      setSelectedPasienId(record.id);

      const response = await api.get(`/pasien/${record.id}`);
      const pasienData = response.data;

      const obatResponse = await api.get(`/obat/pasien/${record.id}`); // Mengambil obat berdasarkan ID pasien
      const obatData = obatResponse.data;

      const obatIds = obatData.map((obat) => obat.id);

      const resepObatPromises = obatIds.map((obatId) =>
        api.get(`/resep_obat/pasien/${record.id}`)
      );
      const resepObatResponses = await Promise.all(resepObatPromises);
      const allResepObatData = resepObatResponses.map(
        (response) => response.data
      );

      const mergedResepObatData = allResepObatData.flat();
      setSelectedPasienData(pasienData);
      setSelectedObatData(obatData);
      setSelectedResepObatData(mergedResepObatData);

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

      await api.put(`/pasien/${record.id}`, { proses_resep: "Proses" });

      setResepProcessed(true);
      const updatedPasienList = pasienList.map((pasien) =>
        pasien.id === record.id ? { ...pasien, proses_resep: "Proses" } : pasien
      );
      setPasienList(updatedPasienList);

      message.success("Status resep berhasil diperbarui");
    } catch (error) {
      console.error("Error fetching patient data:", error);
      message.error("Gagal memperbarui status resep");
    }
  };
  const handlePrint = async (record) => {
    try {
      setModalVisible(true);
      setSelectedPasienId(record.id);

      const response = await api.get(`/pasien/${record.id}`);
      const pasienData = response.data;

      const obatResponse = await api.get(`/obat/pasien/${record.id}`); // Mengambil obat berdasarkan ID pasien
      const obatData = obatResponse.data;

      const obatIds = obatData.map((obat) => obat.id);

      const resepObatPromises = obatIds.map((obatId) =>
        api.get(`/resep_obat/pasien/${record.id}`)
      );
      const resepObatResponses = await Promise.all(resepObatPromises);
      const allResepObatData = resepObatResponses.map(
        (response) => response.data
      );

      const mergedResepObatData = allResepObatData.flat();
      setSelectedPasienData(pasienData);
      setSelectedObatData(obatData);
      setSelectedResepObatData(mergedResepObatData);

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
      setResepProcessed(true);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      message.error("Gagal memperbarui status resep");
    }
  };

  const handleCloseModal = async () => {
    try {
      if (!resepProcessed) {
        await api.put(`/pasien/${selectedPasienId}`, {
          proses_resep: "Proses",
        });

        setResepProcessed(true);

        const updatedPasienList = pasienList.map((pasien) =>
          pasien.id === selectedPasienId
            ? { ...pasien, proses_resep: "Proses" }
            : pasien
        );
        setPasienList(updatedPasienList);
      }

      setModalVisible(false);
      setSelectedPasienId(null);
      setSelectedPasienData(null);
      setSelectedResepObatData(null);
      message.success("Status resep berhasil diperbarui");
      window.location.reload();
    } catch (error) {
      console.error("Error handling modal close:", error);
      message.error("Gagal menutup modal");
    }
  };
  const handleProcessCompleted = () => {
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
      className: "border border-yellow-200 text-white-900 font-medium",
      filteredValue: filteredInfo.nama_pasien
        ? [filteredInfo.nama_pasien]
        : null,
      onFilter: (value, record) => {
        const namaPasien = record?.nama_pasien || "";
        const lowercaseValue =
          typeof value === "string" ? value.toLowerCase() : "";
        return namaPasien.toLowerCase().includes(lowercaseValue);
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div className="p-4 border border-yellow-500">
          <Input
            placeholder="Search nama pasien"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(selectedKeys, confirm, "nama_pasien")
            }
            className="w-48 mb-2 block border-yellow-500"
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, "nama_pasien")}
              className="w-24 bg-yellow-400 border-yellow-500"
            >
              Search
            </Button>
            <Button
              onClick={() => handleReset(clearFilters)}
              className="w-24 bg-yellow-400 border-yellow-400"
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      render: (text) => <a style={{ textAlign: "center" }}>{text}</a>,
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Tanggal Berobat",
      dataIndex: "tanggal_berobat",
      key: "tanggal_berobat",
      sorter: (a, b) =>
        new Date(b.tanggal_berobat) - new Date(a.tanggal_berobat),
      className: "border border-yellow-200",
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Dokter",
      dataIndex: "dokter",
      key: "dokter",
      ellipsis: true,
      className: "border border-yellow-200 ",
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Proses Resep",
      dataIndex: "proses",
      key: "proses",
      render: (text, record) => {
        const isResepSelesai = record.proses === "Selesai";

        if (isResepSelesai) {
          return <span>Selesai</span>;
        } else if (resepProcessed && record.id === selectedPasienId) {
          return <span>Proses</span>;
        } else {
          return <span>{text}</span>;
        }
      },
      className: "border border-yellow-200",
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: <div style={{ textAlign: "center" }}>Aksi</div>,
      key: "action",
      render: (record) => (
        <>
          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              onClick={() => handleAction(record)}
              style={{ backgroundColor: "#32CD32", borderColor: "#32CD32" }}
              disabled={record.proses === "Selesai"}
            >
              Buat Resep
            </Button>
            <Button
              type="default"
              onClick={() => handlePrint(record)}
              style={{ marginLeft: 8 }}
            >
              Cetak Resep
            </Button>
          </div>
        </>
      ),
      className: "border border-yellow-200",
      responsive: ["xs", "sm", "md", "lg"],
    },
  ];

  return (
    <>
      <div className="text-center mr-10 mb-8 mt-8">
        <div className="flex justify-center mx-auto max-w-screen-sm p-4">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-semibold text-center">
            Resep Obat & Obat
          </h1>
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
        onChange={(filters) => {
          setFilteredInfo(filters);
        }}
        scroll={{ x: true }}
      />
      <Modal
        title={<div className="text-center text-xl">Resep Obat Pasien</div>}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={800}
        closable={true}
        style={{ height: "90vh", overflowY: "auto" }}
      >
        <div className="p-4 text-xs max-h-[1000px] overflow-y-auto">
          {selectedPasienData && (
            <div className="mb-7">
              <p className="text-xs">
                <span className="font-semibold">Nama:</span>{" "}
                {selectedPasienData.nama_pasien}
              </p>
              <p className="text-xs">
                <span className="font-semibold">Alamat:</span>{" "}
                {selectedPasienData.alamat_pasien}
              </p>
              <p className="text-xs">
                <span className="font-semibold">Dokter:</span>{" "}
                {selectedPasienData.dokter}
              </p>
              <p className="text-xs">
                <span className="font-semibold">Tanggal Berobat:</span>{" "}
                {selectedPasienData.tanggal_berobat}
              </p>
            </div>
          )}
          {selectedObatData &&
            selectedObatData.map((obat, index) => (
              <div key={obat.id} className="overflow-x-auto">
                <h2 className="mb-1 text-l font-semibold text-left">
                  Data Obat
                </h2>
                <table className="min-w-full table-auto border border-collapse border-black mb-4">
                  <thead>
                    <tr>
                      <th className="border border-black font-semibold p-2">
                        No
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Nama Obat
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Jumlah Obat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {index + 1}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {obat.nama_obat}
                      </td>
                      <td className="border border-black p-2 text-xs text-center">
                        {obat.jumlah_obat}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          {selectedResepObatData &&
            selectedResepObatData.map((resep_obat, index) => (
              <div key={resep_obat.id} className="mb-9 overflow-x-auto">
                <h2 className="mb-1 text-l font-semibold text-left">
                  Data Resep Obat
                </h2>
                <table className="min-w-full table-auto border border-collapse border-black mb-4">
                  <thead>
                    <tr>
                      <th className="border border-black font-semibold p-2">
                        No
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Nama Resep
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Jumlah Resep
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Bentuk Resep
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Dosis
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Cara Pakai
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {index + 1}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.nama_resep}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.jumlah_resep}mg
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.bentuk_resep}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.dosis}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.cara_pakai}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          <DetailResep
            pasienId={selectedPasienId}
            selectedPasienData={selectedPasienData}
            selectedObatData={selectedObatData}
            selectedResepObatData={selectedResepObatData}
            onClose={handleCloseModal}
            onProcessCompleted={handleProcessCompleted}
          />
          <div className="flex justify-center mt-9">
            <img src={Logo} className="h-8" alt="Klinik Logo" />
          </div>
          <div
            className="mt-4 text-center text-gray-600"
            style={{ fontSize: "0.7rem" }}
          >
            <span>
              Klinik Asy-Syifa &copy; {new Date().getFullYear()} Lokasi: Desa
              Randudongkal, Pemalang, Jawa Tengah, Indonesia
            </span>
          </div>
        </div>
      </Modal>
      <Modal
        title={<div className="text-center text-xl">Resep Obat Pasien</div>}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={800}
        closable={true}
        style={{ height: "90vh", overflowY: "auto" }}
      >
        <div className="p-4 text-xs max-h-[1000px] overflow-y-auto">
          {selectedPasienData && (
            <div className="mb-7">
              <p className="text-xs">
                <span className="font-semibold">Nama:</span>{" "}
                {selectedPasienData.nama_pasien}
              </p>
              <p className="text-xs">
                <span className="font-semibold">Alamat:</span>{" "}
                {selectedPasienData.alamat_pasien}
              </p>
              <p className="text-xs">
                <span className="font-semibold">Dokter:</span>{" "}
                {selectedPasienData.dokter}
              </p>
              <p className="text-xs">
                <span className="font-semibold">Tanggal Berobat:</span>{" "}
                {selectedPasienData.tanggal_berobat}
              </p>
            </div>
          )}
          {selectedObatData &&
            selectedObatData.map((obat, index) => (
              <div key={obat.id} className="overflow-x-auto">
                <h2 className="mb-1 text-l font-semibold text-left">
                  Data Obat
                </h2>
                <table className="min-w-full table-auto border border-collapse border-black mb-4">
                  <thead>
                    <tr>
                      <th className="border border-black font-semibold p-2">
                        No
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Nama Obat
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Jumlah Obat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {index + 1}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {obat.nama_obat}
                      </td>
                      <td className="border border-black p-2 text-xs text-center">
                        {obat.jumlah_obat}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          {selectedResepObatData &&
            selectedResepObatData.map((resep_obat, index) => (
              <div key={resep_obat.id} className="mb-9 overflow-x-auto">
                <h2 className="mb-1 text-l font-semibold text-left">
                  Data Resep Obat
                </h2>
                <table className="min-w-full table-auto border border-collapse border-black mb-4">
                  <thead>
                    <tr>
                      <th className="border border-black font-semibold p-2">
                        No
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Nama Resep
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Jumlah Resep
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Bentuk Resep
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Dosis
                      </th>
                      <th className="border border-black font-semibold p-2">
                        Cara Pakai
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {index + 1}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.nama_resep}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.jumlah_resep}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.bentuk_resep}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.dosis}
                      </td>
                      <td className="border border-black p-2 text-xs text-center whitespace-nowrap overflow-hidden">
                        {resep_obat.cara_pakai}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          <DetailResep
            pasienId={selectedPasienId}
            selectedPasienData={selectedPasienData}
            selectedObatData={selectedObatData}
            selectedResepObatData={selectedResepObatData}
            onClose={handleCloseModal}
            onProcessCompleted={handleProcessCompleted}
          />
          <div className="flex justify-center mt-9">
            <img src={Logo} className="h-8" alt="Klinik Logo" />
          </div>
          <div
            className="mt-4 text-center text-gray-600"
            style={{ fontSize: "0.7rem" }}
          >
            <span>
              Klinik Asy-Syifa &copy; {new Date().getFullYear()} Lokasi: Desa
              Randudongkal, Pemalang, Jawa Tengah, Indonesia
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default HistoryResep;
