import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPrescriptionBottleAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import api from "../services/api";

const Dashboard = () => {
  const [patientsToday, setPatientsToday] = useState(0);
  const [totalResepHariIni, setTotalResepHariIni] = useState(0);
  const [patientsSelesaiHariIni, setPatientsSelesaiHariIni] = useState([]);
  const [chartData, setChartData] = useState({
    categories: [],
    series: [
      {
        name: "Pasien",
        data: [],
      },
    ],
  });
  const [ setDailyChartData] = useState({
    categories: [],
    series: [
      {
        name: "Pasien",
        data: [],
      },
    ],
  });

  useEffect(() => {
    const fetchPatientsToday = async () => {
      try {
        const response = await api.get("/pasien/today/date");
        const pasienList = response.data;
        setPatientsToday(pasienList.length);
      } catch (error) {
        console.error("Error fetching patients today:", error);
      }
    };

    const fetchTotalResepHariIni = async () => {
      try {
        const response = await api.get("/resep_obat/today/date");
        const totalResep = response.data.totalResepObatHariIni;
        setTotalResepHariIni(totalResep);
      } catch (error) {
        console.error("Error fetching total resep hari ini:", error);
      }
    };

    const fetchPatientsSelesaiHariIni = async () => {
      try {
        const response = await api.get("/pasien/today/obat/selesai");
        const pasienList = response.data;
        setPatientsSelesaiHariIni(pasienList);
      } catch (error) {
        console.error(
          "Error fetching patients with finished prescriptions today:",
          error
        );
      }
    };
    fetchPatientsToday();
    fetchTotalResepHariIni();
    fetchPatientsSelesaiHariIni();
  }, []);

  const updateChartForClickedDate = async (minDate, maxDate) => {
    console.log(minDate);
    console.log(maxDate);
    try {
      // Kirim permintaan ke server untuk mendapatkan data untuk tanggal yang diklik
      const response = await api.get("/pasien/perhari-by-week/hari", {
        params: {
          startOfWeek: minDate,
          endOfWeek: maxDate,
        },
      });
      const newData = response.data;

      // Update state chartData dengan data baru
      setChartData({
        categories: Object.keys(newData),
        series: [
          {
            name: "Pasien",
            data: Object.values(newData).map((item) => item.pasien),
          },
        ],
      });
    } catch (error) {
      console.error("Error updating chart for clicked date:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/pasien/today/obat/week/date");
        const data = response.data;

        const weeks = Object.keys(data);
        const pasienData = [];
        const categories = [];

        // Ambil data untuk 7 minggu terakhir
        const last7Weeks = weeks.slice(-7);

        last7Weeks.forEach((week) => {
          categories.push(week); // Menggunakan label minggu sebagai kategori
          pasienData.push(data[week].pasien); // Ubah data[week].patients menjadi data[week].pasien
        });

        setChartData({
          categories: categories,
          series: [{ name: "Pasien", data: pasienData }],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="p-8 font-sans">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang!</h1>
        <p className="text-lg mb-8">
          Klinik Asy-Syifa merupakan tempat pelayanan kesehatan yang menyediakan
          layanan medis berkualitas tinggi dengan perawatan yang terbaik. Kami
          berkomitmen untuk memberikan pelayanan terbaik kepada setiap pasien
          dan keluarga mereka.
        </p>
        <p className="text-lg mb-5">
          Berikut Informasi tentang pasien dan juga resep yang sedang dibuat
          hari ini:
        </p>
        <div className="flex justify-center space-x-4 mb-8">
          <div className="flex flex-col bg-gradient-to-r from-white to-blue-200 p-6 rounded-lg text-center w-full md:w-1/3 shadow-md hover:shadow-lg border border-black text-black transform transition-transform ">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Jumlah Pasien Hari ini
            </h3>
            <p className="text-base md:text-xl">{patientsToday}</p>
            <div className="flex justify-center items-center mt-4 border-b-4 border-black pb-4">
              <FontAwesomeIcon
                icon={faUser}
                className="text-blue-700 text-3xl animate-bounce"
              />
            </div>
          </div>

          <div className="flex flex-col bg-gradient-to-r from-white to-yellow-400 p-6 rounded-lg text-center w-full md:w-1/3 shadow-md hover:shadow-lg border border-black text-black transform transition-transform ">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Total Resep Obat Hari ini
            </h3>
            <p className="text-base md:text-xl">{totalResepHariIni}</p>
            <div className="flex justify-center items-center mt-4 border-b-4 border-black pb-4">
              <FontAwesomeIcon
                icon={faPrescriptionBottleAlt}
                className="text-green-700 text-3xl animate-pulse"
              />
            </div>
          </div>

          <div className="flex flex-col bg-gradient-to-r from-white to-blue-400 p-6 rounded-lg text-center w-full md:w-1/3 shadow-md hover:shadow-lg border border-black text-black transform transition-transform">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Resep Selesai Hari ini
            </h3>
            <p className="text-base md:text-xl">
              {patientsSelesaiHariIni.length}
            </p>
            <div className="flex justify-center items-center mt-4 border-b-4 border-black pb-4">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-yellow-700 text-3xl animate-spin"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-200 p-6 rounded-lg mb-8 hover:bg-gray-300 transition-colors duration-300">
          <h3 className="text-xl font-semibold mb-4">Grafik Pasien</h3>
          <p className="text-base mb-4">
            Grafik di bawah ini menampilkan jumlah pasien yang datang setiap
            minggu dalam 7 minggu terakhir. Informasi ini membantu untuk melacak
            tren kunjungan pasien dari waktu ke waktu dan mengidentifikasi
            pola-pola tertentu yang mungkin muncul
          </p>
          <Chart
            options={{
              markers: {
                size: 5,
              },

              chart: {
                height: 350,
                type: "area",
                background: "#fff", // Set background color to white
                marginTop: 40,
                events: {
                  click(event, chartContext, config) {
                    const minDate =
                      chartContext.w.globals.categoryLabels[
                        config.dataPointIndex
                      ].split(" - ")[0];
                    const maxDate =
                      chartContext.w.globals.categoryLabels[
                        config.dataPointIndex
                      ].split(" - ")[1];
                    updateChartForClickedDate(minDate, maxDate);
                  },
                },
              },
              dataLabels: {
                enabled: false,
              },

              stroke: {
                curve: "smooth",
              },
              xaxis: {
                categories: chartData.categories,
              },
              
              tooltip: {
                shared: false,
                intersect: true,
                x: {
                  format: "dd/MM/yy HH:mm",
                },
              },
              colors: ["#008FFB"], // Warna untuk series pertama, kedua, dan ketiga
              title: {
                text: "Patient Chart",
                align: "center",
                margin: 10,
                offsetY: 20,
                style: {
                  fontSize: "22px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: "semi bold",
                  color: "#333",
                },
              },
            }}
            series={chartData.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
