<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "web-new";

// Kết nối cơ sở dữ liệu
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]));
}

// Tạo dữ liệu sinh viên giả
for ($i = 1; $i <= 100; $i++) {
    // Sinh dữ liệu cho sinh viên
    $email = "student" . $i . "@example.com";
    $password = "password" . $i; // Bạn có thể mã hóa password sau nếu cần
    $role = "student";
    $mssv = "2023" . str_pad($i, 4, "0", STR_PAD_LEFT);
    $hoten = "Sinh viên " . $i;
    $khoa = "Khoa " . ($i % 3 + 1);  // Chia ra các khoa khác nhau
    $lop = "Lop " . ($i % 5 + 1);    // Chia các sinh viên vào các lớp khác nhau
    $ngaysinh = "2000-01-" . str_pad($i % 31 + 1, 2, "0", STR_PAD_LEFT);

    // Kiểm tra email đã tồn tại trong users
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        continue; // Nếu email đã tồn tại, bỏ qua sinh viên này
    }

    // Mã hóa mật khẩu
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Thêm tài khoản vào users
    $stmt = $conn->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $hashed_password, $role);
    if ($stmt->execute()) {
        $user_id = $conn->insert_id; // Lấy ID của user vừa tạo

        // Thêm thông tin sinh viên vào bảng students
        $stmt = $conn->prepare("INSERT INTO students (mssv, hoten, khoa, lop, ngaysinh, user_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssi", $mssv, $hoten, $khoa, $lop, $ngaysinh, $user_id);
        if (!$stmt->execute()) {
            error_log("Error inserting into students: " . $stmt->error);
            $conn->query("DELETE FROM users WHERE id = $user_id"); // Xóa tài khoản đã tạo nếu có lỗi
        }
    }
}

echo json_encode(["success" => true, "message" => "Thêm 100 sinh viên thành công"]);
$stmt->close();
$conn->close();
?>
