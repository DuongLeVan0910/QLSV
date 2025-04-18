import React, { useState } from "react";
import "./AddStudent.css"; // Import file CSS

function AddStudent() {
  const [student, setStudent] = useState({
    mssv: "",
    hoTen: "",
    khoa: "",
    lop: "",
    ngaySinh: "",
  });

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !student.mssv ||
      !student.hoTen ||
      !student.khoa ||
      !student.lop ||
      !student.ngaySinh
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Home_React_thaihung(dang sua)/backend/addstudent.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(`Thêm sinh viên thành công! ID: ${data.id}`); // Hiển thị ID mới
        setStudent({ mssv: "", hoTen: "", khoa: "", lop: "", ngaySinh: "" });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Lỗi khi gửi dữ liệu!");
    }
  };

  return (
    <div className="add-student-container">
      <h2>Thêm Sinh Viên</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="mssv"
          placeholder="MSSV"
          onChange={handleChange}
        />
        <input
          type="text"
          name="hoTen"
          placeholder="Họ Tên"
          onChange={handleChange}
        />
        <input
          type="text"
          name="khoa"
          placeholder="Khoa"
          onChange={handleChange}
        />
        <input
          type="text"
          name="lop"
          placeholder="Lớp"
          onChange={handleChange}
        />
        <input type="date" name="ngaySinh" onChange={handleChange} />
        <button type="submit">Thêm</button>
      </form>
    </div>
  );
}

export default AddStudent;
