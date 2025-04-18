import React, { useState } from 'react';
import './GroupManagement.css'; // Import CSS file

function GroupManagement() {
    const [groupSettings, setGroupSettings] = useState({
        mode: '', // Chế độ tạo nhóm
        leader: '', // Giáo viên chỉ định (nếu có)
        groupName: '',
        minMembers: '',
        maxMembers: '',
        description: '',
    });

    const [groups, setGroups] = useState([]); // Danh sách nhóm (ví dụ)
    const [selectedGroup, setSelectedGroup] = useState(null); // Nhóm đang được chọn

    const handleChange = (e) => {
        setGroupSettings({ ...groupSettings, [e.target.name]: e.target.value });
    };

    const handleCreateGroup = () => {
        // Validate input (important!)
        if (!groupSettings.mode || !groupSettings.groupName || !groupSettings.minMembers || !groupSettings.maxMembers) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        if (parseInt(groupSettings.minMembers) > parseInt(groupSettings.maxMembers)) {
            alert('Số thành viên tối thiểu không được lớn hơn số thành viên tối đa!');
            return;
        }


        const newGroup = {
            id: Date.now(), 
            ...groupSettings,
            members: [], 
        };
        setGroups([...groups, newGroup]);
        setSelectedGroup(newGroup); 

        
        setGroupSettings({
            mode: '',
            leader: '',
            groupName: '',
            minMembers: '',
            maxMembers: '',
            description: '',
        });

        console.log('Tạo nhóm mới:', newGroup);
    };

     const handleAddStudentToGroup = () => {
        console.log("Thêm sinh viên vào nhóm");
    };
   
    const handleRemoveStudentFromGroup = () => {
        console.log("Xóa sinh viên khỏi nhóm");
    }

    const handleManageGroupMembers = (groupId) => {
        setSelectedGroup(groups.find(group => group.id === groupId));
        console.log('Quản lý thành viên nhóm:', groupId);
    };


    return (
        <div className="group-management-container">
            <h2>Quản lý nhóm (Giáo viên)</h2>

            <div className="group-settings">
                <h3>Thiết lập nhóm</h3>
                <label htmlFor="mode">Chế độ tạo nhóm:</label>
                <select id="mode" name="mode" value={groupSettings.mode} onChange={handleChange} required>
                    <option value="">Chọn chế độ</option>
                    <option value="random">Ngẫu nhiên</option>
                    <option value="manual">Giáo viên chỉ định</option>
                    <option value="student-select">Học sinh tự chọn</option>
                </select>

                {groupSettings.mode === 'manual' && (
                    <>
                        <label htmlFor="leader">Giáo viên chỉ định:</label>
                        <input type="text" id="leader" name="leader" value={groupSettings.leader} onChange={handleChange} />
                    </>
                )}

                <label htmlFor="groupName">Tên nhóm:</label>
                <input type="text" id="groupName" name="groupName" value={groupSettings.groupName} onChange={handleChange} required />

                <label htmlFor="minMembers">Số thành viên tối thiểu:</label>
                <input type="number" id="minMembers" name="minMembers" value={groupSettings.minMembers} onChange={handleChange} required />

                <label htmlFor="maxMembers">Số thành viên tối đa:</label>
                <input type="number" id="maxMembers" name="maxMembers" value={groupSettings.maxMembers} onChange={handleChange} required />

                <label htmlFor="description">Mô tả (nếu có):</label>
                <textarea id="description" name="description" value={groupSettings.description} onChange={handleChange}></textarea>

                <button className="create-group-button" onClick={handleCreateGroup}>Tạo nhóm</button>
            </div>

            <div className="group-list">
                <h3>Danh sách nhóm</h3>
                 {groups.length === 0 ? (
                      <p>Chưa có nhóm nào được tạo.</p>
                    ) : (
                        <ul>
                          {groups.map((group) => (
                            <li key={group.id}>
                              {group.groupName} ({group.members.length} thành viên)
                               <button onClick={() => handleManageGroupMembers(group.id)}>Quản lý</button>
                            </li>
                          ))}
                        </ul>
                    )}
            </div>

            <div className="add-student-section">
                <h3>Thêm sinh viên vào nhóm</h3>
                <button className="add-manually-button" onClick={handleAddStudentToGroup}>Thêm thủ công</button>
                <button className="add-randomly-button" onClick={handleRemoveStudentFromGroup}>Xóa ngẫu nhiên</button>
            </div>

             {selectedGroup && (  
                <div className="manage-members-section">
                    <h3>Quản lý thành viên nhóm: {selectedGroup.groupName}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>MSSV</th>
                                <th>Họ Tên</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedGroup.members.map((member, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{member.mssv}</td>
                                    <td>{member.name}</td>
                                    <td>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
}

export default GroupManagement;