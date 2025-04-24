
// import React, { useState, useEffect, useRef } from 'react';
// import './StudentGroup.css';
// import { toast } from 'react-toastify';

// const StudentGroup = () => {
//     const [group, setGroup] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [notifications, setNotifications] = useState([]);
//     const [showNotifications, setShowNotifications] = useState(false);
//     const bellRef = useRef(null); // Ref cho chuông
//     const dropdownRef = useRef(null); // Ref cho dropdown
//     const [availableGroups, setAvailableGroups] = useState([]);
//     const user = JSON.parse(localStorage.getItem('user'));
//     useEffect(() => {
//         const userData = localStorage.getItem('user');
//         if (!userData) {
//             toast.error('Vui lòng đăng nhập để xem thông tin nhóm.');
//             return;
//         }

//         try {
//             const user = JSON.parse(userData);
//             if (!user?.student?.mssv) {
//                 toast.error('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.');
//                 return;
//             }
//             console.log('User MSSV:', user.student.mssv);
//             fetchStudentGroup(user.student.mssv);
//         } catch (error) {
//             console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
//             toast.error('Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.');
//         }
//     }, []);
//     useEffect(() => {
//         if (user && user.student && user.student.mssv) {
//             fetchStudentJoinGroup();
//         } else {
//             toast.error('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.');
//         }
//     }, []);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 bellRef.current &&
//                 !bellRef.current.contains(event.target) &&
//                 dropdownRef.current &&
//                 !dropdownRef.current.contains(event.target)
//             ) {
//                 setShowNotifications(false); // Đóng dropdown nếu nhấp ngoài
//             }
//         };

//         // Thêm sự kiện click vào document
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             // Dọn dẹp sự kiện khi component unmount
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     const fetchStudentGroup = async (mssv) => {
//         setLoading(true);
//         try {
//             const response = await fetch(
//                 `http://localhost/Home_React_baoanh/backend/get_student_group.php?mssv=${mssv}`,
//                 {
//                     method: 'GET',
//                     headers: { Accept: 'application/json' },
//                 }
//             );
//             if (!response.ok) throw new Error('Network response was not ok');
//             const data = await response.json();
//             console.log('API get_student_group response:', data);
//             if (data.success && data.group) {
//                 console.log('Group session ID:', data.group.session_id);
//                 setGroup(data.group);
//                 fetchNotifications(data.group.session_id, mssv);
//             } else {
//                 setGroup(null);
//                 toast.info('Bạn chưa thuộc nhóm nào.');
//             }
//         } catch (error) {
//             console.error('Lỗi khi lấy thông tin nhóm:', error);
//             setGroup(null);
//             toast.error('Không thể tải thông tin nhóm');
//         }
//         setLoading(false);
//     };

//     const fetchNotifications = async (sessionId, studentMssv) => {
//         try {
//             const response = await fetch(
//                 `http://localhost/Home_React_baoanh/backend/get_notifications.php?session_id=${sessionId}&student_mssv=${studentMssv}`
//             );
//             const data = await response.json();
//             console.log('Notifications API response:', data);
//             if (data.success) {
//                 setNotifications(data.data);
//                 data.data.forEach(notification => {
//                     if (!notification.is_read) {
//                         toast.info(`Thông báo mới: ${notification.message}`);
//                     }
//                 });
//             } else {
//                 toast.error(data.message || 'Không thể tải thông báo');
//             }
//         } catch (error) {
//             console.error('Error fetching notifications:', error);
//             toast.error('Không thể tải thông báo');
//         }
//     };

//     const markAsRead = async (notificationId) => {
//         const user = JSON.parse(localStorage.getItem('user'));
//         try {
//             const response = await fetch('http://localhost/Home_React_baoanh/backend/mark_notification_read.php', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     notification_id: notificationId,
//                     student_mssv: user.student.mssv,
//                 }),
//             });
//             const data = await response.json();
//             if (data.success) {
//                 setNotifications(prev =>
//                     prev.map(notif =>
//                         notif.id === notificationId ? { ...notif, is_read: true } : notif
//                     )
//                 );
//             } else {
//                 toast.error(data.message || 'Không thể đánh dấu đã đọc');
//             }
//         } catch (error) {
//             console.error('Error marking notification as read:', error);
//             toast.error('Không thể đánh dấu đã đọc');
//         }
//     };

//     const formatDate = (dateString) => {
//         if (!dateString || dateString === '0000-00-00 00:00:00') {
//             return 'Chưa xác định';
//         }
//         const date = new Date(dateString);
//         return isNaN(date.getTime()) ? 'Ngày không hợp lệ' : date.toLocaleString();
//     };

//     const toggleNotifications = () => {
//         setShowNotifications(!showNotifications);
//     };
//         const fetchAvailableGroups = async () => {
//             try {
//                 const res = await fetch(`http://localhost/doanne/backend/get_available_group.php?session_id=${user.student.session_id}`);
//                 const data = await res.json();
//                 console.log('Dữ liệu nhóm khả dụng:', data);
//                 if (data.success && data.groups) {
//                     setAvailableGroups(data.groups);
//                 } else {
//                     setAvailableGroups([]);
//                     toast.info(data.message || 'Không có nhóm khả dụng để tham gia.');
//                 }
//             } catch (error) {
//                 console.error('Lỗi khi lấy nhóm khả dụng:', error);
//                 setAvailableGroups([]);
//                 toast.error('Không thể tải danh sách nhóm khả dụng.');
//             }
//         };

//     const handleJoinGroup = async (groupId) => {
//         const user = JSON.parse(localStorage.getItem('user'));
//         setLoading(true);
//         try {
//             const response = await fetch(
//                 'http://localhost/Home_React_baoanh/backend/join_group.php',
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         group_id: groupId,
//                         mssv: user.student.mssv,
//                     }),
//                 }
//             );
//             const data = await response.json();
//             if (data.success) {
//                 toast.success('Tham gia nhóm thành công');
//                 fetchStudentGroup(user.student.mssv);
//             } else {
//                 toast.error(data.message || 'Không thể tham gia nhóm');
//             }
//         } catch (error) {
//             console.error('Lỗi khi tham gia nhóm:', error);
//             toast.error('Không thể tham gia nhóm');
//         }
//         setLoading(false);
//     };
//     const joinGroup = async (groupId) => {
//         try {
//             const response = await fetch("http://localhost/doanne/backend/student_join_group.php", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     mssv: user.student.mssv,    // phải chắc chắn là string, ví dụ "B21DCCN001"
//                     group_id: groupId           // là số (id nhóm)
//                 }),
//             });
    
//             const data = await response.json();
//             console.log("Join group response:", data);
    
//             if (data.success) {
//                 toast.success("Tham gia nhóm thành công!");
//                 fetchStudentJoinGroup(); // cập nhật lại nhóm
//             } else {
//                 toast.error(data.message || "Không thể tham gia nhóm");
//             }
//         } catch (error) {
//             console.error("Lỗi khi tham gia nhóm:", error);
//             toast.error("Lỗi khi gửi yêu cầu tham gia nhóm");
//         }
//     };
//         const fetchStudentJoinGroup = async () => {
//             setLoading(true);
//             try {
//                 const response = await fetch(`http://localhost/doanne/backend/get_student_group.php?mssv=${user.student.mssv}`, {
//                     method: 'GET',
//                     headers: { 'Accept': 'application/json' }
//                 });
//                 if (!response.ok) throw new Error('Network response was not ok');
//                 const data = await response.json();
//                 console.log('API response:', data);
    
//                 if (data.success && data.group) {
//                     setGroup(data.group);
//                 } else {
//                     setGroup(null);
//                     toast.info(data.message || 'Sinh viên chưa thuộc nhóm nào.');
//                     console.log('User object:', user); // Thêm log để kiểm tra user
//                     if (user && user.student && user.student.session_id) {
//                         console.log('Gọi fetchAvailableGroups với session_id:', user.student.session_id); // Thêm log
//                         fetchAvailableGroups();
//                     } else {
//                         console.error('Không tìm thấy session_id trong user.student:', user?.student);
//                         toast.error('Không tìm thấy session_id. Vui lòng đăng nhập lại.');
//                     }
//                 }
//             } catch (error) {
//                 console.error('Lỗi khi lấy thông tin nhóm:', error);
//                 setGroup(null);
//                 toast.error('Không thể tải thông tin nhóm');
//             }
//             setLoading(false);
//         };

//     return (
//         <div className="student-group-container">
//             <h2>Nhóm Của Tôi</h2>

//             {/* Biểu tượng chuông */}
//             <div className="notification-bell" ref={bellRef} onClick={toggleNotifications}>
//                 🔔
//                 {notifications.some(n => !n.is_read) && (
//                     <span className="notification-count">1</span>
//                 )}
//             </div>

//             {/* Dropdown thông báo */}
//             {showNotifications && (
//                 <div className="notification-dropdown" ref={dropdownRef}>
//                     <h3>Thông Báo</h3>
//                     {notifications.length === 0 ? (
//                         <p>Không có thông báo nào</p>
//                     ) : (
//                         <ul className="notification-list">
//                             {notifications.map(notification => (
//                                 <li
//                                     key={notification.id}
//                                     className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
//                                     onClick={() => !notification.is_read && markAsRead(notification.id)}
//                                 >
//                                     <p>{notification.message}</p>
//                                     <span className="timestamp">
//                                         {new Date(notification.created_at).toLocaleString()}
//                                     </span>
//                                     <span className="status">
//                                         {notification.is_read ? 'Đã đọc' : 'Chưa đọc'}
//                                     </span>
//                                 </li>
//                             ))}
//                         </ul>
//                     )}
//                 </div>
//             )}

                  
//       {loading ? (
//         <div className="loading-spinner">
//           <div className="spinner"></div>
//           <p>Đang tải dữ liệu...</p>
//         </div>
//       ) : group ? (
//         <div className="group-details">
//           <div className="group-header">
//             <h3>{group.name}</h3>
//             <div className="group-info">
//               <p>Chế độ: {group.mode === 'random' ? 'Ngẫu Nhiên' : group.mode === 'teacher' ? 'Giáo Viên Chỉ Định' : 'Sinh Viên Tự Chọn'}</p>
//               <p>Ca học: {group.session.date}</p>
//               <p>Giờ: {group.session.time_slot}</p>
//               <p>Phòng: {group.session.room}</p>
//               <p>Số thành viên: {group.member_count}</p>
//               <p>Ngày tạo: {formatDate(group.created_at)}</p>
//             </div>
//           </div>
//           <div className="group-members">
//             <h4>Danh Sách Thành Viên</h4>
//             {group.members.length > 0 ? (
//               <ul>
//                 {group.members.map((member, index) => (
//                   <li key={index}>
//                     {member.hoten} ({member.mssv})
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="no-members">Chưa có thành viên trong nhóm</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <>
//           <p className="no-group">Bạn chưa thuộc nhóm nào.</p>
//           {availableGroups.length > 0 ? (
//             <div className="available-groups">
//               <h4>Nhóm Khả Dụng Để Tham Gia</h4>
//               <div className="group-grid">
//                 {availableGroups.map((g) => (
//                   <div key={g.id} className="group-card">
//                     <h5>{g.name}</h5>
//                     <p>({g.current_members}/{g.max_members}) thành viên</p>
//                     {g.description && <p className="group-desc">Mô tả: {g.description}</p>}
//                     <button className="join-button" onClick={() => joinGroup(g.id)}>
//                       Tham gia
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <p className="no-available">Không có nhóm khả dụng để tham gia. Vui lòng liên hệ giáo viên để biết thêm chi tiết.</p>
//           )}
//         </>
//       )}
//         </div>
//     );
// };

// export default StudentGroup;


import React, { useState, useEffect, useRef } from 'react';
import './StudentGroup.css';
import { toast } from 'react-toastify';

const StudentGroup = () => {
    const [group, setGroup] = useState(null);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            toast.error('Vui lòng đăng nhập để xem thông tin nhóm.');
            return;
        }

        try {
            const user = JSON.parse(userData);
            if (!user?.student?.mssv) {
                toast.error('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.');
                return;
            }
            console.log('MSSV người dùng:', user.student.mssv);
            fetchStudentGroup(user.student.mssv);
        } catch (error) {
            console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
            toast.error('Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.');
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                bellRef.current &&
                !bellRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchStudentGroup = async (mssv) => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost/Home_React_baoanh/backend/get_student_group.php?mssv=${mssv}`,
                {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                }
            );
            if (!response.ok) throw new Error('Phản hồi mạng không ổn');
            const data = await response.json();
            console.log('Phản hồi API get_student_group:', data);
            if (data.success && data.group) {
                setGroup(data.group);
                setSessionId(data.group.session_id);
                fetchNotifications(data.group.session_id, mssv);
            } else {
                setGroup(null);
                fetchAvailableGroups(mssv);
                toast.info('Bạn chưa thuộc nhóm nào.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin nhóm:', error);
            setGroup(null);
            toast.error('Không thể tải thông tin nhóm');
        }
        setLoading(false);
    };

    const fetchAvailableGroups = async (mssv) => {
        try {
            const sessionResponse = await fetch(
                `http://localhost/Home_React_baoanh/backend/get_student_sessions.php?mssv=${mssv}`
            );
            const sessionData = await sessionResponse.json();
            if (sessionData.success && sessionData.sessions && sessionData.sessions.length > 0) {
                const sessionId = sessionData.sessions[0].id;
                setSessionId(sessionId);
                const response = await fetch(
                    `http://localhost/Home_React_baoanh/backend/get_groups.php?session_id=${sessionId}`
                );
                const data = await response.json();
                if (data.success) {
                    const filteredGroups = data.data.groups.filter(
                        (g) => g.member_count < g.max_members
                    );
                    setAvailableGroups(filteredGroups);
                } else {
                    toast.error(data.message || 'Không thể tải danh sách nhóm');
                }
            } else {
                toast.error('Không tìm thấy ca học cho sinh viên');
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nhóm:', error);
            toast.error('Không thể tải danh sách nhóm');
        }
    };

    const handleJoinGroup = async (groupId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        setLoading(true);
        try {
            const response = await fetch(
                'http://localhost/Home_React_baoanh/backend/join_group.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        group_id: groupId,
                        mssv: user.student.mssv,
                    }),
                }
            );
            const data = await response.json();
            if (data.success) {
                toast.success('Tham gia nhóm thành công');
                fetchStudentGroup(user.student.mssv);
            } else {
                toast.error(data.message || 'Không thể tham gia nhóm');
            }
        } catch (error) {
            console.error('Lỗi khi tham gia nhóm:', error);
            toast.error('Không thể tham gia nhóm');
        }
        setLoading(false);
    };

    

    const fetchNotifications = async (sessionId, studentMssv) => {
        try {
            const response = await fetch(
                `http://localhost/Home_React_baoanh/backend/get_notifications.php?session_id=${sessionId}&student_mssv=${studentMssv}`
            );
            const data = await response.json();
            console.log('Phản hồi API thông báo:', data);
            if (data.success) {
                setNotifications(data.data);
                data.data.forEach((notification) => {
                    if (!notification.is_read) {
                        toast.info(`Thông báo mới: ${notification.message}`);
                    }
                });
            } else {
                toast.error(data.message || 'Không thể tải thông báo');
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            toast.error('Không thể tải thông báo');
        }
    };

    const markAsRead = async (notificationId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const response = await fetch(
                'http://localhost/Home_React_baoanh/backend/mark_notification_read.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        notification_id: notificationId,
                        student_mssv: user.student.mssv,
                    }),
                }
            );
            const data = await response.json();
            if (data.success) {
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif.id === notificationId ? { ...notif, is_read: true } : notif
                    )
                );
            } else {
                toast.error(data.message || 'Không thể đánh dấu đã đọc');
            }
        } catch (error) {
            console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
            toast.error('Không thể đánh dấu đã đọc');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') {
            return 'Chưa xác định';
        }
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Ngày không hợp lệ' : date.toLocaleString();
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <div className="student-group-container">
            <h2>Nhóm Của Tôi</h2>

            {/* Chuông thông báo */}
            <div
                className="notification-bell"
                ref={bellRef}
                onClick={toggleNotifications}
            >
                🔔
                {notifications.some((n) => !n.is_read) && (
                    <span className="notification-count">1</span>
                )}
            </div>

            {/* Dropdown thông báo */}
            {showNotifications && (
                <div className="notification-dropdown" ref={dropdownRef}>
                    <h3>Thông Báo</h3>
                    {notifications.length === 0 ? (
                        <p>Không có thông báo nào</p>
                    ) : (
                        <ul className="notification-list">
                            {notifications.map((notification) => (
                                <li
                                    key={notification.id}
                                    className={`notification-item ${notification.is_read ? 'read' : 'unread'
                                        }`}
                                    onClick={() =>
                                        !notification.is_read && markAsRead(notification.id)
                                    }
                                >
                                    <p>{notification.message}</p>
                                    <span className="timestamp">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </span>
                                    <span className="status">
                                        {notification.is_read ? 'Đã đọc' : 'Chưa đọc'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : group ? (
                <div className="group-details">
                    <div className="group-header">
                        <h3>{group.name}</h3>
                        <p>
                            Chế độ:{' '}
                            {group.mode === 'random'
                                ? 'Ngẫu Nhiên'
                                : group.mode === 'teacher'
                                    ? 'Giáo Viên Chỉ Định'
                                    : 'Sinh Viên Tự Chọn'}
                        </p>
                        <p>
                            Ca học:{' '}
                            {group.session
                                ? `${group.session.date} - ${group.session.time_slot} - ${group.session.room}`
                                : 'Chưa có thông tin ca học'}
                        </p>
                        <p>Số thành viên: {group.members.length}</p>
                        <p>Ngày tạo: {formatDate(group.created_at)}</p>
                    </div>
                    <div className="group-members">
                        <h4>Danh Sách Thành Viên:</h4>
                        {group.members.length > 0 ? (
                            <ul>
                                {group.members.map((member, index) => (
                                    <li key={index}>
                                        {member.hoten} ({member.mssv})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Chưa có thành viên trong nhóm</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="join-group">
                    <h3>Chọn Nhóm Để Tham Gia</h3>
                    {availableGroups.length === 0 ? (
                        <p>Không có nhóm nào để tham gia.</p>
                    ) : (
                        <ul className="group-list">
                            {availableGroups.map((g) => (
                                <li key={g.id} className="group-item">
                                    <div>
                                        <strong>{g.name}</strong>
                                        <p>
                                            Số thành viên: {g.member_count}/{g.max_members}
                                        </p>
                                        <p>
                                            Chế độ:{' '}
                                            {g.mode === 'student' ? 'Sinh Viên Tự Chọn' : g.mode}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleJoinGroup(g.id)}
                                        disabled={loading}
                                    >
                                        Tham Gia
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentGroup;