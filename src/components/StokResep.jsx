import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  Table,
  Popconfirm,
  message,
  Pagination,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import api from "../services/api";
import moment from "moment";

const { Option } = Select;

const StokResep = () => {
  const [data, setData] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stok_resep");
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      tanggal_pembaruan: moment(record.tanggal_pembaruan),
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    console.log("Delete stok resep:", record);
    try {
      await api.delete(`/stok_resep/${record.id}`);
      fetchData();
      message.success("Data resep berhasil dihapus");
    } catch (error) {
      console.error("Error deleting stok resep:", error);
      message.error("Gagal menghapus stok resep");
    }
  };

  const handleAddNew = () => {
    form.resetFields();
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        tanggal_pembaruan: values.tanggal_pembaruan.format("YYYY-MM-DD"),
      };

      if (isEditing) {
        await api.put(`/stok_resep/${currentRecord.id}`, payload);
        message.success("Stok resep berhasil diperbarui");
      } else {
        await api.post("/stok_resep", payload);
        message.success("Stok resep berhasil ditambahkan");
      }

      fetchData();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Gagal menyimpan stok resep");
    }
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      className: "border border-yellow-100",
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Nama Resep",
      dataIndex: "nama_resep",
      key: "nama_resep",
      className: "border border-yellow-100",
      sorter: (a, b) => a.nama_resep.localeCompare(b.nama_resep),
      sortOrder:
        sortedInfo.columnKey === "nama_resep" ? sortedInfo.order : null,
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Stok",
      dataIndex: "jumlah_resep",
      key: "jumlah_resep",
      className: "border border-yellow-100",
      render: (text, record) => `${record.jumlah_resep} ${record.satuan}`,
      sorter: (a, b) => a.jumlah_resep - b.jumlah_resep,
      sortOrder:
        sortedInfo.columnKey === "jumlah_resep" ? sortedInfo.order : null,
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Status Stok",
      dataIndex: "status_stok",
      key: "status_stok",
      className: "border border-yellow-100",
      filters: [
        { text: "Tersedia", value: "Tersedia" },
        { text: "Hampir Habis", value: "Hampir Habis" },
        { text: "Kosong", value: "Kosong" },
      ],
      filteredValue: filteredInfo.status_stok || null,
      onFilter: (value, record) => record.status_stok === value,
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Tanggal Pembaruan",
      dataIndex: "tanggal_pembaruan",
      key: "tanggal_pembaruan",
      className: "border border-yellow-100",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.tanggal_pembaruan) - new Date(b.tanggal_pembaruan),
      sortOrder:
        sortedInfo.columnKey === "tanggal_pembaruan" ? sortedInfo.order : null,
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Aksi",
      key: "action",
      className: "border border-yellow-100",
      render: (record) => (
        <Space size="middle">
          <button
            className="text-blue-500 hover:text-blue-600 hover:underline"
            onClick={() => handleEdit(record)}
          >
            Edit
          </button>
          <Popconfirm
            title="Apakah mau menghapus stok resep ini?"
            onConfirm={() => handleDelete(record)}
            okText="Ya"
            cancelText="Tidak"
          >
            <button className="text-red-500 hover:text-red-600 hover:underline">
              Hapus
            </button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="mt-7 text-center">
        <h1 className="mb-4 font-semibold text-lg md:text-xl lg:text-2xl">
          Stok Resep
        </h1>
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 items-center mb-4">
          <Button
            onClick={clearFilters}
            className="mt-1 flex items-center justify-center"
          >
            Bersihkan Filter
          </Button>
          <Button
            onClick={clearAll}
            className="mt-1 flex items-center justify-center"
          >
            Bersihkan filter dan sortir
          </Button>
        </div>
      </div>
      <div className="mt-2 mb-2 text-left">
        <Button
          type="primary"
          onClick={handleAddNew}
          className="inline-block text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 focus:bg-green-600 focus:outline-none focus:ring-5 focus:ring-white focus:ring-opacity-100"
        >
          Tambah Resep
        </Button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <AiOutlineLoading3Quarters className="animate-spin text-4xl" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={paginatedData}
              onChange={handleChange}
              pagination={false}
              scroll={{ x: true }}
            />
            <div className="flex flex-wrap justify-center md:justify-end mt-4 px-4">
              <Pagination
                current={currentPage}
                total={data.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        title={
          <div className="w-full text-center">
            {isEditing ? "Edit Resep" : "Tambah Resep"}
          </div>
        }
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nama_resep"
            label="Nama Resep"
            rules={[{ required: true, message: "Nama resep harus diisi" }]}
          >
            <Input placeholder="Masukkan nama resep" />
          </Form.Item>
          <Form.Item
            name="jumlah_resep"
            label="Stok"
            rules={[{ required: true, message: "Jumlah resep harus diisi" }]}
          >
            <Input placeholder="Masukkan jumlah resep" />
          </Form.Item>
          <Form.Item
            name="satuan"
            label="Satuan"
            rules={[{ required: true, message: "Satuan harus diisi" }]}
          >
            <Select placeholder="Pilih satuan">
              <Option value="mg">mg</Option>
              <Option value="g">g</Option>
              <Option value="g">ml</Option>
              <Option value="g">g</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="tanggal_pembaruan"
            label="Tanggal Pembaruan"
            rules={[
              { required: true, message: "Tanggal pembaruan harus diisi" },
            ]}
          >
            <DatePicker placeholder="Pilih tanggal pembaruan" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StokResep;
