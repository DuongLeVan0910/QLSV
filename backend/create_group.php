<?php
require_once 'cors.php';
require_once 'config.php';

header('Content-Type: application/json');

// Bật hiển thị lỗi để debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    $conn = getDBConnection();

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['session_id']) || !isset($data['mode'])) {
        throw new Exception('Thiếu thông tin bắt buộc');
    }

    $session_id = $data['session_id'];
    $mode = $data['mode'];
    $min_members = isset($data['min_members']) ? (int) $data['min_members'] : 2;
    $max_members = isset($data['max_members']) ? (int) $data['max_members'] : 5;
    $students = isset($data['students']) ? $data['students'] : [];

    if ($min_members > $max_members) {
        throw new Exception('Số thành viên tối thiểu không thể lớn hơn tối đa');
    }

    // Log dữ liệu nhận được
    error_log("Received data: " . print_r($data, true));

    $sql_students = "SELECT s.mssv 
                     FROM students s 
                     INNER JOIN class_session_students css ON s.mssv = css.mssv 
                     WHERE css.session_id = ?";
    $stmt_students = $conn->prepare($sql_students);
    $stmt_students->bind_param("i", $session_id);
    $stmt_students->execute();
    $result_students = $stmt_students->get_result();

    $all_students = [];
    while ($row = $result_students->fetch_assoc()) {
        $all_students[] = $row['mssv'];
    }

    if (empty($all_students)) {
        throw new Exception('Không có sinh viên nào trong ca học này');
    }


    if ($mode === 'random') {
        // Lấy danh sách sinh viên đã được chia nhóm bởi giáo viên trong session này
        $sql_teacher_assigned = "SELECT gm.mssv 
                                 FROM group_members gm 
                                 INNER JOIN student_groups sg ON gm.group_id = sg.id 
                                 WHERE sg.session_id = ? AND sg.mode = 'teacher'";
        $stmt_teacher = $conn->prepare($sql_teacher_assigned);
        $stmt_teacher->bind_param("i", $session_id);
        $stmt_teacher->execute();
        $result_teacher = $stmt_teacher->get_result();
    
        $teacher_assigned_students = [];
        while ($row = $result_teacher->fetch_assoc()) {
            $teacher_assigned_students[] = $row['mssv'];
        }
    
        // Loại bỏ sinh viên đã được chia nhóm bởi giáo viên
        $available_students = array_diff($all_students, $teacher_assigned_students);
        $available_students = array_values($available_students); // Reset chỉ số mảng
    
        if (empty($available_students)) {
            throw new Exception('Tất cả sinh viên đã được chỉ định bởi giáo viên');
        }
    
        shuffle($available_students); // Xáo trộn danh sách sinh viên
        $total_students = count($available_students);
        $remaining_students = $available_students;
        $group_index = 1;
        $created_groups = [];
    
        $min_groups = ceil($total_students / $max_members);
        $max_possible_groups = floor($total_students / $min_members);
    
        $overLimitWarning = false;
    
        while (!empty($remaining_students) && count($created_groups) < $max_possible_groups) {
            $remaining_count = count($remaining_students);
            $remaining_groups = $max_possible_groups - count($created_groups);
    
            $min_for_this_group = $min_members;
            $max_for_this_group = min($max_members, $remaining_count);
    
            if ($remaining_groups > 1) {
                $max_for_this_group = min($max_members, $remaining_count - ($remaining_groups - 1) * $min_members);
            }
    
            $members_count = rand($min_for_this_group, $max_for_this_group);
    
            if ($remaining_count - $members_count < $min_members && $remaining_count > $members_count) {
                $members_count = $remaining_count - $min_members;
            }
            if ($members_count < $min_members) {
                $members_count = $remaining_count;
            }
    
            if ($members_count > $max_members) {
                $overLimitWarning = true;
            }
    
            $group_name = "Nhóm $group_index";
    
            $insert_group_sql = "INSERT INTO student_groups (name, mode, min_members, max_members, session_id) 
                                VALUES (?, ?, ?, ?, ?)";
            $insert_group_stmt = $conn->prepare($insert_group_sql);
            $insert_group_stmt->bind_param("ssiii", $group_name, $mode, $min_members, $max_members, $session_id);
            $insert_group_stmt->execute();
            $group_id = $conn->insert_id;
    
            $group_members = array_splice($remaining_students, 0, $members_count);
    
            $insert_member_sql = "INSERT INTO group_members (group_id, mssv) VALUES (?, ?)";
            $insert_member_stmt = $conn->prepare($insert_member_sql);
            foreach ($group_members as $mssv) {
                $insert_member_stmt->bind_param("is", $group_id, $mssv);
                $insert_member_stmt->execute();
            }
    
            $created_groups[] = [
                'id' => $group_id,
                'name' => $group_name,
                'mode' => $mode,
                'min_members' => $min_members,
                'max_members' => $max_members
            ];
    
            $group_index++;
        }
    
        $response_message = $overLimitWarning
            ? 'Một số nhóm đã vượt quá số thành viên tối đa nhưng vẫn được tạo.'
            : 'Tạo tất cả nhóm thành công';
    
        echo json_encode([
            'success' => true,
            'message' => $response_message,
            'groups' => $created_groups
        ]);
    }
    
    else if ($mode === 'teacher' || $mode === 'student') {
        if (empty($students)) {
            throw new Exception('Vui lòng cung cấp danh sách sinh viên cho chế độ này');
        }

        // Lấy số nhóm hiện có cho ca học để đặt tên nhóm mới
        $count_groups_sql = "SELECT COUNT(*) as group_count FROM student_groups WHERE session_id = ?";
        $count_groups_stmt = $conn->prepare($count_groups_sql);
        $count_groups_stmt->bind_param("i", $session_id);
        $count_groups_stmt->execute();
        $count_result = $count_groups_stmt->get_result();
        $group_count = $count_result->fetch_assoc()['group_count'];

        $group_name = "Nhóm " . ($group_count + 1);
        $insert_group_sql = "INSERT INTO student_groups (name, mode, min_members, max_members, session_id) 
                            VALUES (?, ?, ?, ?, ?)";
        $insert_group_stmt = $conn->prepare($insert_group_sql);
        $insert_group_stmt->bind_param("ssiii", $group_name, $mode, $min_members, $max_members, $session_id);
        $insert_group_stmt->execute();
        $group_id = $conn->insert_id;

        $insert_member_sql = "INSERT INTO group_members (group_id, mssv) VALUES (?, ?)";
        $insert_member_stmt = $conn->prepare($insert_member_sql);
        foreach ($students as $mssv) {
            $insert_member_stmt->bind_param("is", $group_id, $mssv);
            $insert_member_stmt->execute();
        }

        echo json_encode([
            'success' => true,
            'message' => 'Tạo nhóm thành công',
            'group' => [
                'id' => $group_id,
                'name' => $group_name,
                'mode' => $mode,
                'min_members' => $min_members,
                'max_members' => $max_members
            ]
        ]);
    } else {
        throw new Exception('Chế độ không hợp lệ');
    }

} catch (Exception $e) {
    error_log("Error in create_group.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        closeDBConnection($conn);
    }
}
?>