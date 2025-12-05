import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useClass } from '../context/ClassContext';
import { useStudentContext } from '../context/StudentContext';
import { useSaveStatus } from '../context/SaveStatusContext';

// 기본 평가 기준 템플릿
const DEFAULT_TEMPLATES = [
    {
        id: 'template_3_level_1',
        name: '3단계 (상/중/하)',
        levels: 3,
        labels: ['상', '중', '하']
    },
    {
        id: 'template_3_level_2',
        name: '3단계 (우수/보통/미흡)',
        levels: 3,
        labels: ['우수', '보통', '미흡']
    },
    {
        id: 'template_5_level_1',
        name: '5단계 (매우우수~매우미흡)',
        levels: 5,
        labels: ['매우우수', '우수', '보통', '미흡', '매우미흡']
    },
    {
        id: 'template_5_level_2',
        name: '5단계 (A~E)',
        levels: 5,
        labels: ['A', 'B', 'C', 'D', 'E']
    },
    {
        id: 'template_7_level',
        name: '7단계 (A+~D)',
        levels: 7,
        labels: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']
    }
];

const GradeManager = () => {
    const { currentClass } = useClass();
    const { students } = useStudentContext();
    const { updateSaveStatus } = useSaveStatus();
    const classId = currentClass?.id || 'default';

    // 상태 관리
    const [criteriaTemplates, setCriteriaTemplates] = useState([]);
    const [gradeGroups, setGradeGroups] = useState([]);
    const [gradeData, setGradeData] = useState({});
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [showInputModal, setShowInputModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: 설정, 2: 입력

    // 새 성적 입력 폼 상태
    const [newGrade, setNewGrade] = useState({
        assessmentName: '',
        groupName: '',
        useExistingCriteria: false,
        selectedCriteriaId: '',
        newCriteriaName: '',
        levels: 5,
        labels: ['매우우수', '우수', '보통', '미흡', '매우미흡'],
        studentGrades: {}
    });

    // 템플릿 선택 상태
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    // localStorage에서 데이터 로드
    useEffect(() => {
        const savedTemplates = localStorage.getItem(`grade_criteria_${classId}`);
        const savedGroups = localStorage.getItem(`grade_groups_${classId}`);
        const savedGrades = localStorage.getItem(`grade_data_${classId}`);

        if (savedTemplates) {
            setCriteriaTemplates(JSON.parse(savedTemplates));
        } else {
            setCriteriaTemplates([...DEFAULT_TEMPLATES]);
        }

        if (savedGroups) {
            setGradeGroups(JSON.parse(savedGroups));
        }

        if (savedGrades) {
            setGradeData(JSON.parse(savedGrades));
        }
    }, [classId]);

    // 데이터 저장
    useEffect(() => {
        localStorage.setItem(`grade_criteria_${classId}`, JSON.stringify(criteriaTemplates));
        updateSaveStatus();
    }, [criteriaTemplates, classId, updateSaveStatus]);

    useEffect(() => {
        localStorage.setItem(`grade_groups_${classId}`, JSON.stringify(gradeGroups));
        updateSaveStatus();
    }, [gradeGroups, classId, updateSaveStatus]);

    useEffect(() => {
        localStorage.setItem(`grade_data_${classId}`, JSON.stringify(gradeData));
        updateSaveStatus();
    }, [gradeData, classId, updateSaveStatus]);

    // 새 성적 입력 시작
    const handleStartNewGrade = () => {
        setNewGrade({
            assessmentName: '',
            groupName: '',
            useExistingCriteria: false,
            selectedCriteriaId: '',
            newCriteriaName: '',
            levels: 5,
            labels: ['매우우수', '우수', '보통', '미흡', '매우미흡'],
            studentGrades: {}
        });
        setSelectedTemplateId('');
        setCurrentStep(1);
        setShowInputModal(true);
    };

    // 템플릿 적용
    const handleApplyTemplate = (templateId) => {
        const template = [...DEFAULT_TEMPLATES, ...criteriaTemplates].find(t => t.id === templateId);
        if (template) {
            setNewGrade(prev => ({
                ...prev,
                levels: template.levels,
                labels: [...template.labels],
                newCriteriaName: template.name
            }));
            setSelectedTemplateId(templateId);
        }
    };

    // Step 1 → Step 2
    const handleNextStep = () => {
        // 유효성 검사
        if (!newGrade.assessmentName.trim()) {
            alert('평가 이름을 입력해주세요.');
            return;
        }
        if (!newGrade.groupName.trim()) {
            alert('그룹명을 입력해주세요.');
            return;
        }

        if (newGrade.useExistingCriteria) {
            if (!newGrade.selectedCriteriaId) {
                alert('평가 기준을 선택해주세요.');
                return;
            }
        } else {
            if (!newGrade.newCriteriaName.trim()) {
                alert('평가 기준 이름을 입력해주세요.');
                return;
            }
            if (newGrade.labels.some(l => !l.trim())) {
                alert('모든 단계 명칭을 입력해주세요.');
                return;
            }
        }

        // 학생별 초기 성적 설정 (모두 중간값으로)
        const initialGrades = {};
        students.forEach(student => {
            initialGrades[student.id] = Math.ceil(newGrade.levels / 2);
        });
        setNewGrade(prev => ({ ...prev, studentGrades: initialGrades }));

        setCurrentStep(2);
    };

    // 성적 저장
    const handleSaveGrade = () => {
        // 평가 기준 저장 (새로 만든 경우)
        let criteriaId = newGrade.selectedCriteriaId;
        if (!newGrade.useExistingCriteria) {
            const newCriteria = {
                id: `criteria_${Date.now()}`,
                name: newGrade.newCriteriaName,
                levels: newGrade.levels,
                labels: newGrade.labels,
                isCustom: true
            };
            setCriteriaTemplates(prev => [...prev, newCriteria]);
            criteriaId = newCriteria.id;
        }

        // 그룹 저장 (없으면 생성)
        let group = gradeGroups.find(g => g.name === newGrade.groupName);
        if (!group) {
            group = {
                id: `group_${Date.now()}`,
                name: newGrade.groupName,
                createdAt: new Date().toISOString()
            };
            setGradeGroups(prev => [...prev, group]);
        }

        // 성적 데이터 저장
        const gradeRecord = {
            id: `grade_${Date.now()}`,
            assessmentName: newGrade.assessmentName,
            groupId: group.id,
            groupName: group.name,
            criteriaId: criteriaId,
            studentGrades: newGrade.studentGrades,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setGradeData(prev => ({
            ...prev,
            [gradeRecord.id]: gradeRecord
        }));

        setShowInputModal(false);
        alert('✅ 성적이 저장되었습니다!');
    };

    // 성적 삭제
    const handleDeleteGrade = (gradeId) => {
        if (!window.confirm('이 성적을 삭제하시겠습니까?')) return;

        setGradeData(prev => {
            const newData = { ...prev };
            delete newData[gradeId];
            return newData;
        });
    };

    // 그룹 필터링
    const filteredGrades = Object.values(gradeData).filter(grade => {
        if (selectedGroup === 'all') return true;
        return grade.groupId === selectedGroup;
    });

    // 평가 기준 정보 가져오기
    const getCriteriaInfo = (criteriaId) => {
        return criteriaTemplates.find(c => c.id === criteriaId);
    };

    // 학생별 성적 변경
    const handleStudentGradeChange = (studentId, grade) => {
        setNewGrade(prev => ({
            ...prev,
            studentGrades: {
                ...prev.studentGrades,
                [studentId]: parseInt(grade)
            }
        }));
    };

    // 단계 레이블 변경
    const handleLabelChange = (index, value) => {
        setNewGrade(prev => {
            const newLabels = [...prev.labels];
            newLabels[index] = value;
            return { ...prev, labels: newLabels };
        });
    };

    // 단계 수 변경
    const handleLevelsChange = (levels) => {
        const newLevels = parseInt(levels);
        const newLabels = Array(newLevels).fill('').map((_, i) => {
            if (i < newGrade.labels.length) {
                return newGrade.labels[i];
            }
            return '';
        });
        setNewGrade(prev => ({
            ...prev,
            levels: newLevels,
            labels: newLabels
        }));
    };

    return (
        <div className="grade-manager">
            <div className="flex justify-between items-center mb-lg">
                <h1>📊 학생 성적 관리</h1>
                <Button variant="primary" onClick={handleStartNewGrade}>
                    + 새 성적 입력
                </Button>
            </div>

            {/* 그룹 필터 */}
            <div className="grade-filter mb-md">
                <label>그룹 선택: </label>
                <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="grade-group-select"
                >
                    <option value="all">전체</option>
                    {gradeGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
            </div>

            {/* 성적 목록 */}
            {filteredGrades.length === 0 ? (
                <Card>
                    <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                        등록된 성적이 없습니다. "새 성적 입력" 버튼을 눌러 시작하세요.
                    </p>
                </Card>
            ) : (
                <Card className="grade-list-container">
                    <div className="grade-list-table-wrapper">
                        <table className="grade-list-table">
                            <thead>
                                <tr>
                                    <th>평가 이름</th>
                                    <th>그룹</th>
                                    <th>평가 기준</th>
                                    <th>작성일</th>
                                    <th style={{ width: '150px', textAlign: 'center' }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGrades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(grade => {
                                    const criteria = getCriteriaInfo(grade.criteriaId);
                                    return (
                                        <tr key={grade.id}>
                                            <td>
                                                <strong>{grade.assessmentName}</strong>
                                            </td>
                                            <td>
                                                <span className="grade-group-badge">
                                                    📁 {grade.groupName}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="grade-criteria-badge">
                                                    {criteria?.name || '알 수 없음'}
                                                </span>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(grade.createdAt).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="grade-actions-cell">
                                                <div className="grade-actions">
                                                    <button className="grade-action-btn view-btn" title="보기">
                                                        👁️
                                                    </button>
                                                    <button
                                                        className="grade-action-btn delete-btn"
                                                        onClick={() => handleDeleteGrade(grade.id)}
                                                        title="삭제"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* 성적 입력 모달 */}
            {showInputModal && (
                <div className="grade-modal-overlay" onClick={() => setShowInputModal(false)}>
                    <div className="grade-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="grade-modal-close"
                            onClick={() => setShowInputModal(false)}
                            title="닫기"
                        >
                            ×
                        </button>

                        {currentStep === 1 ? (
                            /* Step 1: 설정 */
                            <div className="grade-setup-step">
                                <h2>📝 성적 입력 - 설정</h2>

                                {/* 평가 이름 */}
                                <div className="form-group">
                                    <label className="form-label">평가 이름 *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="예: 1학기 중간고사, 수행평가 1차"
                                        value={newGrade.assessmentName}
                                        onChange={(e) => setNewGrade({ ...newGrade, assessmentName: e.target.value })}
                                    />
                                </div>

                                {/* 그룹명 */}
                                <div className="form-group">
                                    <label className="form-label">그룹명 *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="예: 국어, 수학, 영어"
                                        value={newGrade.groupName}
                                        onChange={(e) => setNewGrade({ ...newGrade, groupName: e.target.value })}
                                        list="existing-groups"
                                    />
                                    <datalist id="existing-groups">
                                        {gradeGroups.map(group => (
                                            <option key={group.id} value={group.name} />
                                        ))}
                                    </datalist>
                                </div>

                                {/* 평가 기준 선택 */}
                                <div className="form-group">
                                    <label className="form-label">평가 기준 *</label>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                checked={newGrade.useExistingCriteria}
                                                onChange={() => setNewGrade({ ...newGrade, useExistingCriteria: true })}
                                            />
                                            기존 기준 사용
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                checked={!newGrade.useExistingCriteria}
                                                onChange={() => setNewGrade({ ...newGrade, useExistingCriteria: false })}
                                            />
                                            새 기준 만들기
                                        </label>
                                    </div>

                                    {newGrade.useExistingCriteria ? (
                                        <select
                                            className="form-input"
                                            value={newGrade.selectedCriteriaId}
                                            onChange={(e) => setNewGrade({ ...newGrade, selectedCriteriaId: e.target.value })}
                                        >
                                            <option value="">선택하세요</option>
                                            {criteriaTemplates.map(criteria => (
                                                <option key={criteria.id} value={criteria.id}>
                                                    {criteria.name} ({criteria.levels}단계)
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <>
                                            {/* 템플릿 선택 */}
                                            <div className="template-selector">
                                                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                    💡 템플릿에서 선택 (선택사항)
                                                </label>
                                                <select
                                                    className="form-input"
                                                    value={selectedTemplateId}
                                                    onChange={(e) => handleApplyTemplate(e.target.value)}
                                                >
                                                    <option value="">직접 입력</option>
                                                    {DEFAULT_TEMPLATES.map(template => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 기준명 */}
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="평가 기준 이름 (예: 5단계 평가)"
                                                value={newGrade.newCriteriaName}
                                                onChange={(e) => setNewGrade({ ...newGrade, newCriteriaName: e.target.value })}
                                                style={{ marginTop: '0.5rem' }}
                                            />

                                            {/* 단계 수 */}
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <label className="form-label">단계 수</label>
                                                <select
                                                    className="form-input"
                                                    value={newGrade.levels}
                                                    onChange={(e) => handleLevelsChange(e.target.value)}
                                                >
                                                    <option value="3">3단계</option>
                                                    <option value="5">5단계</option>
                                                    <option value="7">7단계</option>
                                                    <option value="9">9단계</option>
                                                </select>
                                            </div>

                                            {/* 단계별 명칭 */}
                                            <div style={{ marginTop: '0.75rem' }}>
                                                <label className="form-label">각 단계 명칭</label>
                                                {newGrade.labels.map((label, index) => (
                                                    <input
                                                        key={index}
                                                        type="text"
                                                        className="form-input"
                                                        placeholder={`${newGrade.levels - index}단계`}
                                                        value={label}
                                                        onChange={(e) => handleLabelChange(index, e.target.value)}
                                                        style={{ marginTop: '0.25rem' }}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-end gap-sm" style={{ marginTop: '1.5rem' }}>
                                    <Button variant="secondary" onClick={() => setShowInputModal(false)}>
                                        취소
                                    </Button>
                                    <Button variant="primary" onClick={handleNextStep}>
                                        다음 →
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* Step 2: 명렬표 입력 */
                            <div className="grade-input-step">
                                <h2>📝 성적 입력 - {newGrade.assessmentName}</h2>
                                <p className="text-muted" style={{ marginBottom: '1rem' }}>
                                    평가: {newGrade.useExistingCriteria
                                        ? getCriteriaInfo(newGrade.selectedCriteriaId)?.name
                                        : newGrade.newCriteriaName}
                                </p>

                                <div className="grade-table-container">
                                    <table className="grade-table">
                                        <thead>
                                            <tr>
                                                <th>번호</th>
                                                <th>이름</th>
                                                <th>성별</th>
                                                <th>평가</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.sort((a, b) => a.attendanceNumber - b.attendanceNumber).map(student => {
                                                const currentGrade = newGrade.studentGrades[student.id] || Math.ceil(newGrade.levels / 2);
                                                const labels = newGrade.useExistingCriteria
                                                    ? getCriteriaInfo(newGrade.selectedCriteriaId)?.labels
                                                    : newGrade.labels;

                                                return (
                                                    <tr key={student.id}>
                                                        <td>{student.attendanceNumber}</td>
                                                        <td>{student.name}</td>
                                                        <td>{student.gender}</td>
                                                        <td>
                                                            <select
                                                                className="grade-select"
                                                                value={currentGrade}
                                                                onChange={(e) => handleStudentGradeChange(student.id, e.target.value)}
                                                            >
                                                                {labels.map((label, index) => (
                                                                    <option key={index} value={labels.length - index}>
                                                                        {labels.length - index}단계 - {label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
                                    💡 Tip: Tab 키로 빠르게 이동할 수 있습니다
                                </p>

                                <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                                    <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                                        ← 이전
                                    </Button>
                                    <Button variant="primary" onClick={handleSaveGrade}>
                                        💾 저장하고 나가기
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .grade-manager {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .grade-filter {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .grade-group-select {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    font-size: 1rem;
                    outline: none;
                }

                .grade-group-select:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px var(--color-primary-light);
                }

                /* Grade List Table */
                .grade-list-container {
                    overflow: hidden;
                }

                .grade-list-table-wrapper {
                    overflow-x: auto;
                }

                .grade-list-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .grade-list-table thead {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }

                .grade-list-table th {
                    padding: 1rem;
                    text-align: left;
                    font-weight: 700;
                    color: #334155;
                    border-bottom: 2px solid #cbd5e1;
                    font-size: 0.95rem;
                }

                .grade-list-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    vertical-align: middle;
                }

                .grade-list-table tbody tr {
                    transition: background-color 0.2s;
                }

                .grade-list-table tbody tr:hover {
                    background-color: #f8fafc;
                }

                .grade-list-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .grade-group-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    color: #1e40af;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .grade-criteria-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    color: #92400e;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .grade-actions-cell {
                    text-align: center;
                }

                .grade-actions {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                }

                .grade-action-btn {
                    background: none;
                    border: 1px solid var(--color-border);
                    padding: 0.5rem;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: all 0.2s;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .grade-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .grade-action-btn.view-btn:hover {
                    background: #dbeafe;
                    border-color: #60a5fa;
                }

                .grade-action-btn.delete-btn:hover {
                    background: #fee2e2;
                    border-color: #f87171;
                }

                /* Modal Styles */
                .grade-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease-out;
                }

                .grade-modal-content {
                    position: relative;
                    background: white;
                    border-radius: var(--radius-lg);
                    padding: 2rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    width: 90vw;
                    animation: slideUp 0.3s ease-out;
                }

                .grade-modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: var(--color-text-muted);
                    line-height: 1;
                    padding: 0.25rem;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: background-color 0.2s, color 0.2s;
                }

                .grade-modal-close:hover {
                    background-color: #f1f5f9;
                    color: var(--color-text);
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--color-text);
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .form-input:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px var(--color-primary-light);
                }

                .radio-group {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .radio-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .template-selector {
                    margin-bottom: 0.75rem;
                }

                /* Grade Table */
                .grade-table-container {
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                }

                .grade-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .grade-table thead {
                    position: sticky;
                    top: 0;
                    background: #f8fafc;
                    z-index: 10;
                }

                .grade-table th {
                    padding: 0.75rem;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid var(--color-border);
                }

                .grade-table td {
                    padding: 0.75rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .grade-table tbody tr:hover {
                    background-color: #f8fafc;
                }

                .grade-select {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    font-size: 0.95rem;
                    outline: none;
                }

                .grade-select:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px var(--color-primary-light);
                }

                @media (max-width: 768px) {
                    .grade-manager {
                        padding: 1rem;
                    }

                    .grade-list-table th,
                    .grade-list-table td {
                        padding: 0.75rem 0.5rem;
                        font-size: 0.9rem;
                    }

                    .grade-group-badge,
                    .grade-criteria-badge {
                        font-size: 0.75rem;
                        padding: 0.2rem 0.5rem;
                    }

                    .grade-action-btn {
                        width: 36px;
                        height: 36px;
                        font-size: 1rem;
                    }
                }

                @media (max-width: 640px) {
                    .grade-manager {
                        padding: 1rem;
                    }

                    .grade-modal-content {
                        padding: 1.5rem;
                        width: 95vw;
                    }

                    /* 모바일에서 테이블을 카드 형식으로 변경 */
                    .grade-list-table thead {
                        display: none;
                    }

                    .grade-list-table,
                    .grade-list-table tbody,
                    .grade-list-table tr,
                    .grade-list-table td {
                        display: block;
                        width: 100%;
                    }

                    .grade-list-table tr {
                        margin-bottom: 1rem;
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-md);
                        padding: 0.75rem;
                        background: white;
                    }

                    .grade-list-table td {
                        padding: 0.5rem 0;
                        border: none;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .grade-list-table td:before {
                        content: attr(data-label);
                        font-weight: 700;
                        color: #64748b;
                        font-size: 0.85rem;
                    }

                    .grade-list-table td:nth-child(1):before {
                        content: "평가 이름";
                    }

                    .grade-list-table td:nth-child(2):before {
                        content: "그룹";
                    }

                    .grade-list-table td:nth-child(3):before {
                        content: "평가 기준";
                    }

                    .grade-list-table td:nth-child(4):before {
                        content: "작성일";
                    }

                    .grade-list-table td:nth-child(5):before {
                        content: "관리";
                    }

                    .grade-actions-cell {
                        justify-content: flex-end;
                    }

                    .grade-table th,
                    .grade-table td {
                        padding: 0.5rem;
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default GradeManager;
