<?php
header('Content-Type: application/json');
include_once 'config.php';

// Khởi tạo kết nối từ hàm trong config.php
$conn = getDBConnection();
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['mssv']) || !isset($data['group_id'])) {
    echo json_encode(["success" => false, "message" => "Thiếu dữ liệu mssv hoặc group_id"]);
    exit;
}

$mssv = $data['mssv'];
$group_id = $data['group_id'];

// 1. Lấy session_id của nhóm cần tham gia
$stmt1 = $conn->prepare("SELECT session_id, max_members FROM student_groups WHERE id = ?");
$stmt1->bind_param("i", $group_id);
$stmt1->execute();
$groupInfo = $stmt1->get_result()->fetch_assoc();

if (!$groupInfo) {
    echo json_encode(["success" => false, "message" => "Nhóm không tồn tại"]);
    exit;
}

$session_id = $groupInfo['session_id'];
$max_members = $groupInfo['max_members'];

// 2. Kiểm tra sinh viên đã thuộc nhóm nào trong session này chưa
$sql2 = "
    SELECT gm.*
    FROM group_members gm
    JOIN student_groups sg ON gm.group_id = sg.id
    WHERE gm.mssv = ? AND sg.session_id = ?
";
$stmt2 = $conn->prepare($sql2);
$stmt2->bind_param("si", $mssv, $session_id);
$stmt2->execute();
$existing = $stmt2->get_result();

if ($existing->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Bạn đã thuộc nhóm khác trong ca học này"]);
    exit;
}

// 3. Đếm số lượng thành viên hiện tại trong nhóm
$stmt3 = $conn->prepare("SELECT COUNT(*) as member_count FROM group_members WHERE group_id = ?");
$stmt3->bind_param("i", $group_id);
$stmt3->execute();
$count = $stmt3->get_result()->fetch_assoc()['member_count'];

if ($count >= $max_members) {
    echo json_encode(["success" => false, "message" => "Nhóm đã đầy"]);
    exit;
}

// 4. Thêm vào bảng group_member
$stmt4 = $conn->prepare("INSERT INTO group_members (group_id, mssv, created_at) VALUES (?, ?, NOW())");
$stmt4->bind_param("is", $group_id, $mssv);

if ($stmt4->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Không thể thêm vào nhóm"]);
}
?>
