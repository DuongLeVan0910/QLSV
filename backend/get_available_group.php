<?php
header('Content-Type: application/json');
include_once 'config.php';

// Khởi tạo kết nối từ hàm trong config.php
$conn = getDBConnection();

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Không thể kết nối đến cơ sở dữ liệu"]);
    exit;
}

$session_id = $_GET['session_id'] ?? null;

if (!$session_id) {
    echo json_encode(["success" => false, "message" => "Missing session_id"]);
    exit;
}

// Log session_id để debug
error_log("Session ID: " . $session_id);

// Truy vấn lấy các nhóm khả dụng
$sql = "
    SELECT 
        g.id,
        g.name,
        g.mode,
        g.min_members,
        g.max_members,
        g.description,
        g.session_id,
        g.created_at,
        COUNT(m.id) as current_members
    FROM student_groups g
    LEFT JOIN group_members m ON g.id = m.group_id
    WHERE g.session_id = ?
    GROUP BY g.id
    HAVING current_members < g.max_members
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log("Lỗi chuẩn bị truy vấn: " . $conn->error);
    echo json_encode(["success" => false, "message" => "Lỗi chuẩn bị truy vấn"]);
    exit;
}

$stmt->bind_param("i", $session_id);
if (!$stmt->execute()) {
    error_log("Lỗi thực thi truy vấn: " . $stmt->error);
    echo json_encode(["success" => false, "message" => "Lỗi thực thi truy vấn"]);
    exit;
}

$result = $stmt->get_result();

$groups = [];
while ($row = $result->fetch_assoc()) {
    $groups[] = $row;
}

// Log số lượng nhóm trả về
error_log("Số nhóm khả dụng: " . count($groups));

// Đóng kết nối
closeDBConnection($conn);

// Trả về danh sách nhóm khả dụng
echo json_encode([
    "success" => true,
    "groups" => $groups
]);
?>