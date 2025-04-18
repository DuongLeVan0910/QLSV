// AttendanceHistory.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './attendance.css';

function AttendanceHistory() {
    const { state } = useLocation(); // Lấy dữ liệu sinh viên từ state
    const navigate = useNavigate(); // Để quay lại trang trước
    const student = state?.student;

    if (!student) {
        return <div>Không tìm thấy thông tin sinh viên.</div>;
    }

    return (
        <div className="attendance-container">
            <h1>LỊCH SỬ ĐIỂM DANH - {student.name}</h1>
            <button
                onClick={() => navigate('/attendance')}
                style={{
                    marginBottom: '20px',
                    padding: '8px 16px',
                    backgroundColor: '#4ade80',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Quay Lại
            </button>
            <div className="history-section">
                {student.attendanceHistory.length > 0 ? (
                    <ul>
                        {student.attendanceHistory.map((entry, idx) => (
                            <li key={idx}>
                                {entry.dateTime}: {entry.status === 'present' ? 'Có mặt' : 'Vắng'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Chưa có lịch sử điểm danh.</p>
                )}
            </div>
        </div>
    );
}

export default AttendanceHistory;