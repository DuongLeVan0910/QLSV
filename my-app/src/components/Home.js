// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Home.css";

// function Home() {
//   const [students, setStudents] = useState([
//     {
//       stt: 1,
//       mssv: "DH521019999",
//       hoTen: "Nguyễn Văn A",
//       khoa: "CNTT",
//       lop: "D21_TH11",
//       ngaySinh: "1/1/2003",
//     },
//     // Thêm dữ liệu sinh viên khác nếu cần
//   ]);

//   const [search, setSearch] = useState({
//     mssv: "",
//     lop: "",
//     ngaySinh: "",
//     hoTen: "",
//     khoa: "",
//   });

//   const handleInputChange = (e) => {
//     setSearch({ ...search, [e.target.name]: e.target.value });
//   };

//   const handleSearch = () => {
//     // Logic tìm kiếm
//     const filteredStudents = students.filter(
//       (student) =>
//         student.mssv.toLowerCase().includes(search.mssv.toLowerCase()) &&
//         student.lop.toLowerCase().includes(search.lop.toLowerCase()) &&
//         student.ngaySinh
//           .toLowerCase()
//           .includes(search.ngaySinh.toLowerCase()) &&
//         student.hoTen.toLowerCase().includes(search.hoTen.toLowerCase()) &&
//         student.khoa.toLowerCase().includes(search.khoa.toLowerCase())
//     );
//     setStudents(filteredStudents);
//   };

//   // const handleAddStudent = () => {
//   //   console.log("Chức năng thêm sinh viên");
//   // };

//   const handleDeleteStudent = (mssv) => {
//     const updatedStudents = students.filter((student) => student.mssv !== mssv);
//     setStudents(updatedStudents);
//     console.log("Xóa sinh viên có MSSV:", mssv);
//   };

//   const handleEditStudent = (mssv) => {
//     console.log("Sửa sinh viên có MSSV:", mssv);
//   };
//   const navigate = useNavigate();
//   return (
//     <div className="main-content">
//       <div className="header">
//         <div className="admin-icon">👤</div>
//         <div className="admin-text">ADMIN</div>
//       </div>
//       <h2>Danh sách sinh viên</h2>

//       <div className="search-area">
//         <input
//           type="text"
//           name="mssv"
//           placeholder="MSSV"
//           value={search.mssv}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="lop"
//           placeholder="Lớp"
//           value={search.lop}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="ngaySinh"
//           placeholder="Ngày Sinh"
//           value={search.ngaySinh}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="hoTen"
//           placeholder="Họ Tên"
//           value={search.hoTen}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="khoa"
//           placeholder="Khoa"
//           value={search.khoa}
//           onChange={handleInputChange}
//         />
//         <button className="search-button" onClick={handleSearch}>
//           Tìm kiếm
//         </button>
//         <button onClick={() => navigate("/addstudent")}>Thêm Sinh Viên</button>
//       </div>

//       <table className="student-table">
//         <thead>
//           <tr>
//             <th>STT</th>
//             <th>MSSV</th>
//             <th>Họ Tên</th>
//             <th>Khoa</th>
//             <th>Lớp</th>
//             <th>Ngày Sinh</th>
//             <th>Quản Lý</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.map((student, index) => (
//             <tr key={index}>
//               <td>{student.stt}</td>
//               <td>{student.mssv}</td>
//               <td>{student.hoTen}</td>
//               <td>{student.khoa}</td>
//               <td>{student.lop}</td>
//               <td>{student.ngaySinh}</td>
//               <td className="action-buttons">
//                 <button
//                   className="delete-button"
//                   onClick={() => handleDeleteStudent(student.mssv)}
//                 >
//                   Xóa
//                 </button>
//                 <button
//                   className="edit-button"
//                   onClick={() => handleEditStudent(student.mssv)}
//                 >
//                   Sửa
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default Home;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState({
    mssv: "",
    lop: "",
    ngaySinh: "",
    hoTen: "",
    khoa: "",
  });

  const navigate = useNavigate();

  // 📌 HÀM LẤY DANH SÁCH SINH VIÊN
  const fetchStudents = async () => {
    try {
      const response = await fetch(
        "http://localhost/Home_React_thaihung(dang sua)/backend/get_students.php"
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        console.error("Lỗi khi lấy dữ liệu:", data.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối đến backend:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 📌 HÀM XÓA SINH VIÊN
  const handleDeleteStudent = async (mssv) => {
    if (window.confirm(`Bạn có chắc muốn xóa sinh viên có MSSV: ${mssv}?`)) {
      try {
        const response = await fetch(
          "http://localhost/Home_React_thaihung(dang sua)/backend/delete_students.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mssv }), // Gửi MSSV thay vì ID
          }
        );

        const result = await response.json();
        if (result.success) {
          alert("Xóa sinh viên thành công");
          fetchStudents(); // Cập nhật lại danh sách
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Lỗi khi xóa sinh viên:", error);
      }
    }
  };

  // 📌 HÀM TÌM KIẾM SINH VIÊN
  const handleSearch = () => {
    const filteredStudents = students.filter(
      (student) =>
        student.mssv.toLowerCase().includes(search.mssv.toLowerCase()) &&
        student.lop.toLowerCase().includes(search.lop.toLowerCase()) &&
        student.ngaysinh
          .toLowerCase()
          .includes(search.ngaySinh.toLowerCase()) &&
        student.hoten.toLowerCase().includes(search.hoTen.toLowerCase()) &&
        student.khoa.toLowerCase().includes(search.khoa.toLowerCase())
    );
    setStudents(filteredStudents);
  };

  return (
    <div className="main-content">
      <h2>Danh sách sinh viên</h2>

      <div className="search-area">
        <input
          type="text"
          name="mssv"
          placeholder="MSSV"
          value={search.mssv}
          onChange={(e) => setSearch({ ...search, mssv: e.target.value })}
        />
        <input
          type="text"
          name="lop"
          placeholder="Lớp"
          value={search.lop}
          onChange={(e) => setSearch({ ...search, lop: e.target.value })}
        />
        <input
          type="text"
          name="ngaySinh"
          placeholder="Ngày Sinh"
          value={search.ngaySinh}
          onChange={(e) => setSearch({ ...search, ngaySinh: e.target.value })}
        />
        <input
          type="text"
          name="hoTen"
          placeholder="Họ Tên"
          value={search.hoTen}
          onChange={(e) => setSearch({ ...search, hoTen: e.target.value })}
        />
        <input
          type="text"
          name="khoa"
          placeholder="Khoa"
          value={search.khoa}
          onChange={(e) => setSearch({ ...search, khoa: e.target.value })}
        />
        <button className="search-button" onClick={handleSearch}>
          Tìm kiếm
        </button>
        <button onClick={() => navigate("/addstudent")}>Thêm Sinh Viên</button>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>MSSV</th>
            <th>Họ Tên</th>
            <th>Khoa</th>
            <th>Lớp</th>
            <th>Ngày Sinh</th>
            <th>Quản Lý</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{student.mssv}</td>
              <td>{student.hoten}</td>
              <td>{student.khoa}</td>
              <td>{student.lop}</td>
              <td>{student.ngaysinh}</td>
              <td className="action-buttons">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteStudent(student.mssv)}
                >
                  Xóa
                </button>
                <button
                  className="edit-button"
                  onClick={() => console.log("Sửa sinh viên", student.mssv)}
                >
                  Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Home;
