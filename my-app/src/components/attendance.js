import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import './attendance.css';

function Attendance() {
    const mockStudents = [
        {
            id: 'DH52110556',
            name: 'Nguyễn Bảo Anh',
            status: 'absent',
            lastPresentDateTime: '2025-03-24T14:23:34',
            attendanceHistory: [
                { status: 'present', dateTime: '2025-03-20 08:30:00' },
                { status: 'absent', dateTime: '2025-03-21 08:30:00' },
                { status: 'present', dateTime: '2025-03-23 08:30:00' },
            ],
        },
        {
            id: 'DH52107210',
            name: 'Võ Trung Kiên',
            status: 'present',
            lastPresentDateTime: '2025-03-23T08:30:00',
            attendanceHistory: [
                { status: 'present', dateTime: '2025-03-20 08:30:00' },
                { status: 'present', dateTime: '2025-03-21 08:30:00' },
                { status: 'present', dateTime: '2025-03-22 08:30:00' },
            ],
        },
    ];

    const [students, setStudents] = useState(mockStudents);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const filteredStudents = students.filter(
        (student) =>
            student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateAttendance = (history) => {
        const totalSessions = history.length;
        const presentSessions = history.filter((entry) => entry.status === 'present').length;
        const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;
        return { presentSessions, attendancePercentage };
    };

    const setAttendanceStatus = (index, newStatus) => {
        const updatedStudents = [...students];
        const currentTime = new Date();
        const isoTime = currentTime.toISOString();

        updatedStudents[index].status = newStatus;
        updatedStudents[index].attendanceHistory.push({
            status: newStatus,
            dateTime: currentTime.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        });

        if (newStatus === 'present') {
            updatedStudents[index].lastPresentDateTime = isoTime;
        } else if (newStatus === 'absent') {
            updatedStudents[index].lastPresentDateTime = null;
        }

        setStudents(updatedStudents);
    };

    // Hàm định dạng lại ngày giờ: giờ trước, ngày tháng năm sau
    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'Vắng';

        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).replace(',', '');
    };

    return (
        <div className="attendance-container">
            <h1>QUẢN LÝ ĐIỂM DANH SINH VIÊN</h1>

            <div className="datetime-section">
                <p>
                    Ngày: {currentDateTime.toLocaleDateString('vi-VN')} | Giờ:{' '}
                    {currentDateTime.toLocaleTimeString('vi-VN')}
                </p>
            </div>

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Tìm kiếm sinh viên (Mã SV hoặc Tên)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="attendance-table-wrapper">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Mã SV</th>
                            <th>Tên SV</th>
                            <th>Trạng Thái</th>
                            <th>Ngày Giờ Có Mặt</th>
                            <th>Tổng Buổi Đi Học</th>
                            <th>% Tham Gia</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const { presentSessions, attendancePercentage } = calculateAttendance(
                                    student.attendanceHistory
                                );
                                return (
                                    <React.Fragment key={student.id}>
                                        <tr>
                                            <td>{student.id}</td>
                                            <td>{student.name}</td>
                                            <td
                                                className={
                                                    student.status === 'present' ? 'present' : 'absent'
                                                }
                                            >
                                                {student.status === 'present' ? 'Có mặt' : 'Vắng'}
                                            </td>
                                            <td>{formatDateTime(student.lastPresentDateTime)}</td>
                                            <td>
                                                {presentSessions}/{student.attendanceHistory.length}
                                            </td>
                                            <td>{attendancePercentage.toFixed(2)}%</td>
                                            <td className="action-buttons">
                                                {/* Thay đổi thứ tự nút */}
                                                <button
                                                    className={`action-btn present-btn ${student.status === 'present' ? 'active' : ''}`}
                                                    onClick={() => setAttendanceStatus(index, 'present')}
                                                >
                                                    Có mặt
                                                </button>
                                                <button
                                                    className={`action-btn absent-btn ${student.status === 'absent' ? 'active' : ''}`}
                                                    onClick={() => setAttendanceStatus(index, 'absent')}
                                                >
                                                    Vắng
                                                </button>
                                                <button
                                                    className="action-btn history-btn"
                                                    onClick={() =>
                                                        navigate('/history', { state: { student } })
                                                    }
                                                >
                                                    Lịch Sử
                                                </button>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    Không tìm thấy sinh viên
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Attendance;
