import React, { useState, useEffect } from 'react';
import './GroupManagement.css';
import { toast } from 'react-toastify';

const GroupManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupSettings, setGroupSettings] = useState({
        sessionId: '',
        groupMode: 'random',
        minMembers: 2,
        maxMembers: 5
    });
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [editingGroup, setEditingGroup] = useState(null);
    const [editMode, setEditMode] = useState(null); // 'remove' hoặc 'add'

    const fetchSessions = async () => {
        try {
            const response = await fetch('http://localhost/doanne/backend/class_sessions.php');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (Array.isArray(data)) {
                setSessions(data);
            } else {
                toast.error('Dữ liệu không đúng định dạng');
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast.error('Không thể tải danh sách ca học');
        }
    };

    const fetchStudents = async (sessionId) => {
        try {
            const response = await fetch(`http://localhost/doanne/backend/get_students_by_session.php?session_id=${sessionId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.success && data.data && Array.isArray(data.data.students)) {
                const studentsWithoutGroup = await filterStudentsWithoutGroup(sessionId, data.data.students);
                setStudents(studentsWithoutGroup);
            } else {
                toast.error('Không thể tải danh sách sinh viên');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Không thể tải danh sách sinh viên');
        }
    };

    const fetchGroups = async (sessionId) => {
        try {
            const response = await fetch(`http://localhost/doanne/backend/get_groups.php?session_id=${sessionId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.success) {
                setGroups(data.data.groups);
                console.log("Fetched groups:", data.data.groups);
            } else {
                toast.error(data.message || 'Không thể tải danh sách nhóm');
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error('Không thể tải danh sách nhóm');
        }
    };

    const filterStudentsWithoutGroup = async (sessionId, allStudents) => {
        const groupResponse = await fetch(`http://localhost/doanne/backend/get_groups.php?session_id=${sessionId}`);
        const groupData = await groupResponse.json();
        if (groupData.success && groupData.data.groups) {
            const groupedStudents = new Set();
            groupData.data.groups.forEach(group => {
                group.members.forEach(member => groupedStudents.add(member.mssv));
            });
            return allStudents.filter(student => !groupedStudents.has(student.mssv));
        }
        return allStudents;
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        if (selectedSession) {
            fetchStudents(selectedSession);
            fetchGroups(selectedSession);
        }
    }, [selectedSession]);

    const handleSessionChange = (e) => {
        const sessionId = e.target.value;
        setSelectedSession(sessionId);
        setEditingGroup(null);
        setEditMode(null);
        setGroupSettings(prev => ({ ...prev, sessionId }));
        if (sessionId) {
            fetchStudents(sessionId);
            fetchGroups(sessionId);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGroupSettings(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'groupMode') {
            setSelectedStudents([]);
        }
    };

    const handleStudentSelect = (mssv) => {
        setSelectedStudents(prev => {
            if (prev.includes(mssv)) {
                return prev.filter(id => id !== mssv);
            }
            return [...prev, mssv];
        });
    };
    const handleCreateGroup = async (e) => {
        e.preventDefault();
    
        if (!groupSettings.sessionId) {
            alert('Vui lòng chọn ca học');
            return;
        }
    
        if ((groupSettings.groupMode === 'teacher' || groupSettings.groupMode === 'student') && selectedStudents.length === 0) {
            alert('Vui lòng chọn sinh viên cho nhóm');
            return;
        }
    
        const payload = {
            session_id: groupSettings.sessionId,
            mode: groupSettings.groupMode,
            min_members: groupSettings.minMembers,
            max_members: groupSettings.maxMembers
        };
    
        if (groupSettings.groupMode !== 'random') {
            payload.students = selectedStudents;
        }
    
        console.log("Sending to API:", payload);
    
        setLoading(true);
        try {
            const response = await fetch('http://localhost/doanne/backend/create_group.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
    
            const data = await response.json();
            console.log("📦 Dữ liệu nhận từ API:", data);
            // Thông báo nếu có nhóm vượt quá thành viên tối đa
            if (data.message) {
                alert(data.message);
            }
    
            // Kiểm tra nếu tạo nhóm thành công
            if (data.success) {
                alert('Tạo nhóm thành công');
                setGroupSettings(prev => ({
                    ...prev,
                    sessionId: selectedSession
                }));
                setSelectedStudents([]);
                await fetchGroups(selectedSession);
                await fetchStudents(selectedSession);
            } else {
                alert(data.message || 'Không thể tạo nhóm');
            }
    
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Không thể tạo nhóm. Vui lòng thử lại sau.');
        }
        setLoading(false);
    };
    
    
    const handleUpdateGroup = async (groupId, updatedStudents) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost/doanne/backend/group_management.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: groupId,
                    students: updatedStudents
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Cập nhật nhóm thành công');
                // Không reset editMode ở đây để tiếp tục xóa hoặc thêm
                setSelectedStudents([]);
                await fetchGroups(selectedSession);
                await fetchStudents(selectedSession);
            } else {
                toast.error(data.message || 'Lỗi khi cập nhật nhóm');
            }
        } catch (error) {
            console.error('Error updating group:', error);
            toast.error('Lỗi khi cập nhật nhóm');
        }
        setLoading(false);
    };

    const handleDeleteGroup = async (groupId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost/doanne/backend/delete_group.php?group_id=${groupId}`, {
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Xóa nhóm thành công');
                setEditingGroup(null);
                setEditMode(null);
                await fetchGroups(selectedSession);
                await fetchStudents(selectedSession);
            } else {
                toast.error(data.message || 'Lỗi khi xóa nhóm');
            }
        } catch (error) {
            console.error('Error deleting group:', error);
            toast.error('Lỗi khi xóa nhóm');
        }
        setLoading(false);
    };

    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setSelectedStudents([]);
        setEditMode(null); // Reset edit mode khi bắt đầu chỉnh sửa
    };

    const handleRemoveMember = async (groupId, mssv) => {
        const updatedStudents = editingGroup.members
            .map(member => member.mssv)
            .filter(id => id !== mssv);

        if (updatedStudents.length === 0) {
            // Nếu không còn thành viên nào, xóa nhóm
            await handleDeleteGroup(groupId);
        } else {
            // Cập nhật nhóm với danh sách thành viên còn lại
            await handleUpdateGroup(groupId, updatedStudents);
            // Cập nhật editingGroup để phản ánh danh sách thành viên mới
            setEditingGroup(prev => ({
                ...prev,
                members: prev.members.filter(member => member.mssv !== mssv),
                member_count: updatedStudents.length
            }));
        }
    };

    const handleAddMembers = () => {
        if (selectedStudents.length === 0) {
            toast.error('Vui lòng chọn ít nhất một sinh viên để thêm');
            return;
        }
        const updatedStudents = [...new Set([...editingGroup.members.map(m => m.mssv), ...selectedStudents])];
        handleUpdateGroup(editingGroup.id, updatedStudents);
        // Cập nhật editingGroup để phản ánh danh sách thành viên mới
        setEditingGroup(prev => ({
            ...prev,
            members: [
                ...prev.members,
                ...students.filter(student => selectedStudents.includes(student.mssv))
            ],
            member_count: updatedStudents.length
        }));
    };

    const handleRefresh = async () => {
        setGroupSettings({
            sessionId: selectedSession,
            groupMode: 'random',
            minMembers: 2,
            maxMembers: 5
        });
        setSelectedStudents([]);
        setEditingGroup(null);
        setEditMode(null);

        setLoading(true);
        try {
            await fetchSessions();
            if (selectedSession) {
                await Promise.all([
                    fetchStudents(selectedSession),
                    fetchGroups(selectedSession)
                ]);
                toast.success('Dữ liệu đã được làm mới thành công');
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast.error('Không thể làm mới dữ liệu');
        }
        setLoading(false);
    };

    return (
        <div className="group-management">
            <h2>Quản Lý Nhóm</h2>

            <div className="session-selector">
                <label>Chọn Ca Học:</label>
                <select value={selectedSession} onChange={handleSessionChange}>
                    <option value="">Chọn ca học</option>
                    {sessions.map(session => (
                        <option key={session.id} value={session.id}>
                            {session.date} - {session.time_slot} - {session.room}
                        </option>
                    ))}
                </select>
            </div>

            {selectedSession && (
                <>
                    <div className="create-group-form">
                        <h3>Tạo Nhóm Mới</h3>
                        <form onSubmit={handleCreateGroup}>
                            <div className="form-group">
                                <label>Chế Độ Chia Nhóm:</label>
                                <select name="groupMode" value={groupSettings.groupMode} onChange={handleChange}>
                                    <option value="random">Ngẫu Nhiên</option>
                                    <option value="teacher">Giáo Viên Chỉ Định</option>
                                    <option value="student">Sinh Viên Tự Chọn</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Số Thành Viên Tối Thiểu:</label>
                                <input
                                    type="number"
                                    name="minMembers"
                                    value={groupSettings.minMembers}
                                    onChange={handleChange}
                                    min="1"
                                    max={groupSettings.maxMembers}
                                />
                            </div>
                            <div className="form-group">
                                <label>Số Thành Viên Tối Đa:</label>
                                <input
                                    type="number"
                                    name="maxMembers"
                                    value={groupSettings.maxMembers}
                                    onChange={handleChange}
                                    min={groupSettings.minMembers}
                                />
                            </div>

                            {(groupSettings.groupMode === 'teacher' || groupSettings.groupMode === 'student') && (
                                <div className="student-selection">
                                    <h4>Danh Sách Sinh Viên Chưa Có Nhóm:</h4>
                                    <div className="student-list">
                                        {students.length === 0 ? (
                                            <p>Không còn sinh viên nào chưa có nhóm</p>
                                        ) : (
                                            students.map(student => (
                                                <div key={student.mssv} className="student-item">
                                                    <input
                                                        type="checkbox"
                                                        id={student.mssv}
                                                        checked={selectedStudents.includes(student.mssv)}
                                                        onChange={() => handleStudentSelect(student.mssv)}
                                                    />
                                                    <label htmlFor={student.mssv}>
                                                        {student.hoten} - {student.mssv}
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="selected-count">
                                        Đã chọn: {selectedStudents.length} sinh viên
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button className="submit-btn" type="submit" disabled={loading}>
                                    {loading ? 'Đang Xử Lý...' : 'Tạo Nhóm'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleRefresh}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang Làm Mới...' : 'Làm Mới'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="groups-list">
                        <h3>Danh Sách Nhóm</h3>
                        {groups.length === 0 ? (
                            <p>Chưa có nhóm nào</p>
                        ) : (
                            groups.map(group => (
                                <div key={group.id} className="group-card">
                                    <div className="group-header">
                                        <h4>{group.name}</h4>
                                        <div className="group-actions">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEditGroup(group)}
                                            >
                                                Chỉnh Sửa
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteGroup(group.id)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                    <div className="group-info">
                                        <span>Chế độ: {group.mode === 'random' ? 'Ngẫu Nhiên' :
                                            group.mode === 'teacher' ? 'Giáo Viên Chỉ Định' :
                                                'Sinh Viên Tự Chọn'}</span>
                                        <span>Số thành viên: {group.member_count}</span>
                                    </div>
                                    {editingGroup && editingGroup.id === group.id && (
                                        <div className="edit-actions">
                                            <button
                                                className="add-btn"
                                                onClick={() => setEditMode('add')}
                                            >
                                                Thêm
                                            </button>
                                            <button
                                                className="remove-btn"
                                                onClick={() => setEditMode('remove')}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    )}
                                    <div className="group-members">
                                        <h5>Thành Viên:</h5>
                                        {group.members.length === 0 ? (
                                            <p>Chưa có thành viên</p>
                                        ) : (
                                            <ul>
                                                {group.members.map((member, index) => (
                                                    <li key={index}>
                                                        {member.hoten} ({member.mssv})
                                                        {editingGroup && editingGroup.id === group.id && editMode === 'remove' && (
                                                            <span
                                                                className="remove-member"
                                                                onClick={() => handleRemoveMember(group.id, member.mssv)}
                                                            >
                                                                ✗
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {editingGroup && editingGroup.id === group.id && editMode === 'add' && (
                                            <div className="add-members">
                                                <span
                                                    className="add-member-btn"
                                                    onClick={() => setEditMode('selecting')}
                                                >
                                                    +
                                                </span>
                                            </div>
                                        )}
                                        {editingGroup && editingGroup.id === group.id && editMode === 'selecting' && (
                                            <div className="student-selection">
                                                <h4>Chọn Sinh Viên Để Thêm:</h4>
                                                {students.length === 0 ? (
                                                    <p>Không còn sinh viên nào để thêm</p>
                                                ) : (
                                                    <>
                                                        {students.map(student => (
                                                            <div key={student.mssv} className="student-item">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`add-${student.mssv}`}
                                                                    checked={selectedStudents.includes(student.mssv)}
                                                                    onChange={() => handleStudentSelect(student.mssv)}
                                                                />
                                                                <label htmlFor={`add-${student.mssv}`}>
                                                                    {student.hoten} - {student.mssv}
                                                                </label>
                                                            </div>
                                                        ))}
                                                        <div className="form-actions">
                                                            <button
                                                                className="submit-btn"
                                                                onClick={handleAddMembers}
                                                                disabled={loading}
                                                            >
                                                                Thêm Vào Nhóm
                                                            </button>
                                                            <button
                                                                className="cancel-btn"
                                                                onClick={() => setEditMode(null)}
                                                                disabled={loading}
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default GroupManagement;