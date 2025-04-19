import React, { useState, useEffect } from 'react';
import './StudentGroup.css';
import { toast } from 'react-toastify';
const StudentGroup = () => {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [availableGroups, setAvailableGroups] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && user.student && user.student.mssv) {
            fetchStudentGroup();
        } else {
            toast.error('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.');
        }
    }, []);

    const fetchStudentGroup = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost/doanne/backend/get_student_group.php?mssv=${user.student.mssv}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('API response:', data);

            if (data.success && data.group) {
                setGroup(data.group);
            } else {
                setGroup(null);
                toast.info(data.message || 'Sinh viên chưa thuộc nhóm nào.');
                console.log('User object:', user); // Thêm log để kiểm tra user
                if (user && user.student && user.student.session_id) {
                    console.log('Gọi fetchAvailableGroups với session_id:', user.student.session_id); // Thêm log
                    fetchAvailableGroups();
                } else {
                    console.error('Không tìm thấy session_id trong user.student:', user?.student);
                    toast.error('Không tìm thấy session_id. Vui lòng đăng nhập lại.');
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin nhóm:', error);
            setGroup(null);
            toast.error('Không thể tải thông tin nhóm');
        }
        setLoading(false);
    };

    const fetchAvailableGroups = async () => {
        try {
            const res = await fetch(`http://localhost/doanne/backend/get_available_group.php?session_id=${user.student.session_id}`);
            const data = await res.json();
            console.log('Dữ liệu nhóm khả dụng:', data);
            if (data.success && data.groups) {
                setAvailableGroups(data.groups);
            } else {
                setAvailableGroups([]);
                toast.info(data.message || 'Không có nhóm khả dụng để tham gia.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy nhóm khả dụng:', error);
            setAvailableGroups([]);
            toast.error('Không thể tải danh sách nhóm khả dụng.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') {
            return 'Chưa xác định';
        }
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Ngày không hợp lệ' : date.toLocaleString();
    };

const joinGroup = async (groupId) => {
    try {
        const response = await fetch("http://localhost/doanne/backend/student_join_group.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mssv: user.student.mssv,    // phải chắc chắn là string, ví dụ "B21DCCN001"
                group_id: groupId           // là số (id nhóm)
            }),
        });

        const data = await response.json();
        console.log("Join group response:", data);

        if (data.success) {
            toast.success("Tham gia nhóm thành công!");
            fetchStudentGroup(); // cập nhật lại nhóm
        } else {
            toast.error(data.message || "Không thể tham gia nhóm");
        }
    } catch (error) {
        console.error("Lỗi khi tham gia nhóm:", error);
        toast.error("Lỗi khi gửi yêu cầu tham gia nhóm");
    }
};
return (
    <div className="student-group-container">
      <h2>Nhóm Của Tôi</h2>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : group ? (
        <div className="group-details">
          <div className="group-header">
            <h3>{group.name}</h3>
            <div className="group-info">
              <p>Chế độ: {group.mode === 'random' ? 'Ngẫu Nhiên' : group.mode === 'teacher' ? 'Giáo Viên Chỉ Định' : 'Sinh Viên Tự Chọn'}</p>
              <p>Ca học: {group.session.date}</p>
              <p>Giờ: {group.session.time_slot}</p>
              <p>Phòng: {group.session.room}</p>
              <p>Số thành viên: {group.member_count}</p>
              <p>Ngày tạo: {formatDate(group.created_at)}</p>
            </div>
          </div>
          <div className="group-members">
            <h4>Danh Sách Thành Viên</h4>
            {group.members.length > 0 ? (
              <ul>
                {group.members.map((member, index) => (
                  <li key={index}>
                    {member.hoten} ({member.mssv})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-members">Chưa có thành viên trong nhóm</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="no-group">Bạn chưa thuộc nhóm nào.</p>
          {availableGroups.length > 0 ? (
            <div className="available-groups">
              <h4>Nhóm Khả Dụng Để Tham Gia</h4>
              <div className="group-grid">
                {availableGroups.map((g) => (
                  <div key={g.id} className="group-card">
                    <h5>{g.name}</h5>
                    <p>({g.current_members}/{g.max_members}) thành viên</p>
                    {g.description && <p className="group-desc">Mô tả: {g.description}</p>}
                    <button className="join-button" onClick={() => joinGroup(g.id)}>
                      Tham gia
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-available">Không có nhóm khả dụng để tham gia. Vui lòng liên hệ giáo viên để biết thêm chi tiết.</p>
          )}
        </>
      )}
    </div>
  );

    // return (
    //     <div className="student-group-container">
    //         <h2>Nhóm Của Tôi</h2>
    //         {loading ? (
    //             <p>Đang tải dữ liệu...</p>
    //         ) : group ? (
    //             <div className="group-details">
    //                 <div className="group-header">
    //                     <h3>{group.name}</h3>
    //                     <p>Chế độ: {group.mode === 'random' ? 'Ngẫu Nhiên' :
    //                         group.mode === 'teacher' ? 'Giáo Viên Chỉ Định' :
    //                         'Sinh Viên Tự Chọn'}</p>
    //                     <p>Ca học: {group.session.date} - {group.session.time_slot} - {group.session.room}</p>
    //                     <p>Số thành viên: {group.member_count}</p>
    //                     <p>Ngày tạo: {formatDate(group.created_at)}</p>
    //                 </div>
    //                 <div className="group-members">
    //                     <h4>Danh Sách Thành Viên:</h4>
    //                     {group.members.length > 0 ? (
    //                         <ul>
    //                             {group.members.map((member, index) => (
    //                                 <li key={index}>
    //                                     {member.hoten} ({member.mssv})
    //                                 </li>
    //                             ))}
    //                         </ul>
    //                     ) : (
    //                         <p>Chưa có thành viên trong nhóm</p>
    //                     )}
    //                 </div>
    //             </div>
    //         ) : (
    //             <>
    //                 <p>Bạn chưa thuộc nhóm nào.</p>
    //                 {availableGroups.length > 0 ? (
    //                     <div className="available-groups">
    //                         <h4>Nhóm khả dụng để tham gia:</h4>
    //                         <ul>
    //                             {availableGroups.map((g) => (
    //                                 <li key={g.id}>
    //                                     <strong>{g.name}</strong> ({g.current_members}/{g.max_members})<br />
    //                                     {g.description && <p>Mô tả: {g.description}</p>}
    //                                     <button onClick={() => joinGroup(g.id)}>Tham gia</button>
    //                                 </li>
    //                             ))}
    //                         </ul>
    //                     </div>
    //                 ) : (
    //                     <p>Không có nhóm khả dụng để tham gia. Vui lòng liên hệ giáo viên để biết thêm chi tiết.</p>
    //                 )}
    //             </>
    //         )}
    //     </div>
    // );
};

export default StudentGroup;