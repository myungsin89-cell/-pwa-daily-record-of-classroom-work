import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStudentContext } from '../context/StudentContext';
import { useClass } from '../context/ClassContext';
import { getData, saveData, STORES } from '../db/indexedDB';
import { useSaveStatus } from '../context/SaveStatusContext';
import './GradeInput.css';

const GradeInput = () => {
    const { students } = useStudentContext();
    const { currentClass } = useClass();
    const { updateSaveStatus } = useSaveStatus();

    // ?îÎ©¥ Î™®Îìú: 'list', 'create', 'input', 'settings'
    const [mode, setMode] = useState('list');

    // ?ÑÏ≤¥ ?âÍ? Î™©Î°ù
    const [evaluations, setEvaluations] = useState([]);

    // ?ÑÏû¨ ?†ÌÉù???âÍ?
    const [currentEvaluation, setCurrentEvaluation] = useState(null);

    // ???âÍ? ?ùÏÑ±??    const [newEvaluation, setNewEvaluation] = useState({
        title: '',
        group: '',
        type: 'grade',
        gradeCount: 3,
        gradeLabels: ['??, 'Ï§?, '??],
        scoreRange: { min: 0, max: 100 },
        useColorHighlight: false,
        belowStandardColor: '#ef4444',
        belowStandardCondition: { grade: [], score: 60 },
        grades: {}
    });

    // ?òÏ†ï???ÑÏãú ?ÅÌÉú
    const [editData, setEditData] = useState({
        title: '',
        group: ''
    });

    // ?úÎûòÍ∑????úÎ°≠ ?ÅÌÉú
    const [draggedEvaluation, setDraggedEvaluation] = useState(null);
    const [dragOverGroup, setDragOverGroup] = useState(null);

    // ?àÏãú ?úÌîåÎ¶?    const gradeTemplates = {
        3: [
            { name: '??Ï§???, labels: ['??, 'Ï§?, '??] },
            { name: 'A/B/C', labels: ['A', 'B', 'C'] },
            { name: '?∞Ïàò/Î≥¥ÌÜµ/ÎØ∏Ìù°', labels: ['?∞Ïàò', 'Î≥¥ÌÜµ', 'ÎØ∏Ìù°'] }
        ],
        4: [
            { name: '????ÎØ?Í∞Ä', labels: ['??, '??, 'ÎØ?, 'Í∞Ä'] },
            { name: 'A/B/C/D', labels: ['A', 'B', 'C', 'D'] },
            { name: 'Îß§Ïö∞?∞Ïàò/?∞Ïàò/Î≥¥ÌÜµ/ÎØ∏Ìù°', labels: ['Îß§Ïö∞?∞Ïàò', '?∞Ïàò', 'Î≥¥ÌÜµ', 'ÎØ∏Ìù°'] }
        ],
        5: [
            { name: 'A/B/C/D/E', labels: ['A', 'B', 'C', 'D', 'E'] },
            { name: '????ÎØ???Í∞Ä', labels: ['??, '??, 'ÎØ?, '??, 'Í∞Ä'] },
            { name: 'Îß§Ïö∞?∞Ïàò/?∞Ïàò/Î≥¥ÌÜµ/ÎØ∏Ìù°/Îß§Ïö∞ÎØ∏Ìù°', labels: ['Îß§Ïö∞?∞Ïàò', '?∞Ïàò', 'Î≥¥ÌÜµ', 'ÎØ∏Ìù°', 'Îß§Ïö∞ÎØ∏Ìù°'] }
        ]
    };

    // ?∞Ïù¥??Î°úÎìú
    useEffect(() => {
        loadGradeData();
    }, [currentClass]);

    const loadGradeData = async () => {
        if (!currentClass) return;

        try {
            const data = await getData(STORES.GRADES, currentClass.id);
            if (data && data.evaluations) {
                setEvaluations(data.evaluations);
            }
        } catch (error) {
            console.error('Failed to load grade data:', error);
        }
    };

    // ?∞Ïù¥???Ä??    const saveGradeData = async (updatedEvaluations = evaluations) => {
        if (!currentClass) return;

        try {
            updateSaveStatus('saving');
            await saveData(STORES.GRADES, {
                classId: currentClass.id,
                evaluations: updatedEvaluations,
                updatedAt: new Date().toISOString()
            });
            updateSaveStatus('saved');
        } catch (error) {
            console.error('Failed to save grade data:', error);
            updateSaveStatus('error');
        }
    };

    // ???âÍ? ?ùÏÑ±
    const handleCreateEvaluation = () => {
        if (!newEvaluation.title.trim()) {
            alert('?âÍ? ?úÎ™©???ÖÎ†•?¥Ï£º?∏Ïöî.');
            return;
        }

        const evaluation = {
            id: Date.now().toString(),
            ...newEvaluation,
            createdAt: new Date().toISOString()
        };

        const updatedEvaluations = [...evaluations, evaluation];
        setEvaluations(updatedEvaluations);
        saveGradeData(updatedEvaluations);

        // Ï¥àÍ∏∞??        setNewEvaluation({
            title: '',
            group: '',
            type: 'grade',
            gradeCount: 3,
            gradeLabels: ['??, 'Ï§?, '??],
            scoreRange: { min: 0, max: 100 },
            useColorHighlight: false,
            belowStandardColor: '#ef4444',
            belowStandardCondition: { grade: [], score: 60 },
            grades: {}
        });

        setCurrentEvaluation(evaluation);
        setMode('input');
    };

    // ?âÍ? ?†ÌÉù
    const handleSelectEvaluation = (evaluation) => {
        setCurrentEvaluation(evaluation);
        setMode('input');
    };

    // ?âÍ? ??†ú
    const handleDeleteEvaluation = (evaluationId) => {
        if (!confirm('???±Ï†Å Í∏∞Î°ù????†ú?òÏãúÍ≤†Ïäµ?àÍπå?')) return;

        const updatedEvaluations = evaluations.filter(e => e.id !== evaluationId);
        setEvaluations(updatedEvaluations);
        saveGradeData(updatedEvaluations);
    };

    // ?ôÏÉù ?±Ï†Å Î≥ÄÍ≤?    const handleGradeChange = (studentId, value) => {
        const updatedEvaluation = {
            ...currentEvaluation,
            grades: {
                ...currentEvaluation.grades,
                [studentId]: value
            }
        };

        const updatedEvaluations = evaluations.map(e =>
            e.id === currentEvaluation.id ? updatedEvaluation : e
        );

        setCurrentEvaluation(updatedEvaluation);
        setEvaluations(updatedEvaluations);
        saveGradeData(updatedEvaluations);
    };

    // ?úÎûòÍ∑??úÏûë
    const handleDragStart = (e, evaluation) => {
        setDraggedEvaluation(evaluation);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    // ?úÎûòÍ∑?Ï¢ÖÎ£å
    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        setDraggedEvaluation(null);
        setDragOverGroup(null);
    };

    // Í∑∏Î£π ?ÑÎ°ú ?úÎûòÍ∑?    const handleDragOverGroup = (e, groupName) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverGroup(groupName);
    };

    // Í∑∏Î£π???úÎ°≠
    const handleDropOnGroup = (e, targetGroup) => {
        e.preventDefault();

        if (!draggedEvaluation) return;

        // Í∞ôÏ? Í∑∏Î£π?¥Î©¥ Î¨¥Ïãú
        const currentGroup = draggedEvaluation.group || 'ÎØ∏Î∂ÑÎ•?;
        if (currentGroup === targetGroup) {
            setDraggedEvaluation(null);
            setDragOverGroup(null);
            return;
        }

        // ?âÍ???Í∑∏Î£π Î≥ÄÍ≤?('ÎØ∏Î∂ÑÎ•?Î°??úÎ°≠?òÎ©¥ Îπ?Î¨∏Ïûê?¥Î°ú ?Ä??
        const newGroup = targetGroup === 'ÎØ∏Î∂ÑÎ•? ? '' : targetGroup;
        const updatedEvaluation = {
            ...draggedEvaluation,
            group: newGroup
        };

        const updatedEvaluations = evaluations.map(e =>
            e.id === draggedEvaluation.id ? updatedEvaluation : e
        );

        setEvaluations(updatedEvaluations);
        saveGradeData(updatedEvaluations);

        setDraggedEvaluation(null);
        setDragOverGroup(null);
    };

    // ?±Í∏â Í∞úÏàò Î≥ÄÍ≤?(???âÍ? ?ùÏÑ± ??
    const handleGradeCountChange = (count) => {
        let labels = ['??, 'Ï§?, '??];
        if (count === 4) labels = ['??, '??, 'ÎØ?, 'Í∞Ä'];
        else if (count === 5) labels = ['A', 'B', 'C', 'D', 'E'];

        setNewEvaluation({
            ...newEvaluation,
            gradeCount: count,
            gradeLabels: labels,
            belowStandardCondition: { ...newEvaluation.belowStandardCondition, grade: [] }
        });
    };

    // ?úÌîåÎ¶??ÅÏö©
    const applyTemplate = (template) => {
        setNewEvaluation({
            ...newEvaluation,
            gradeLabels: [...template.labels]
        });
    };

    // ?±Í∏â ?ºÎ≤® Î≥ÄÍ≤?    const handleGradeLabelChange = (index, newLabel) => {
        const newLabels = [...newEvaluation.gradeLabels];
        newLabels[index] = newLabel;
        setNewEvaluation({
            ...newEvaluation,
            gradeLabels: newLabels
        });
    };

    // ?±Ï†Å??Í∏∞Ï? ÎØ∏Îã¨?∏Ï? ?ïÏù∏
    const isBelowStandard = (evaluation, value) => {
        if (!value || !evaluation.useColorHighlight) return false;

        if (evaluation.type === 'score') {
            const score = parseInt(value);
            return score < evaluation.belowStandardCondition.score;
        } else {
            return evaluation.belowStandardCondition.grade.includes(value);
        }
    };

    // ?±Ï†Å???∞Î•∏ ?âÏÉÅ Í∞Ä?∏Ïò§Í∏?    const getGradeColor = (evaluation, value) => {
        return isBelowStandard(evaluation, value) ? evaluation.belowStandardColor : 'transparent';
    };

    // ?ôÏÉù Î™©Î°ù ?ïÎ†¨
    const sortedStudents = [...students].sort((a, b) => a.attendanceNumber - b.attendanceNumber);

    // Í∑∏Î£πÎ≥ÑÎ°ú ?âÍ? Î∂ÑÎ•ò
    const groupedEvaluations = evaluations.reduce((acc, evaluation) => {
        const group = evaluation.group || 'ÎØ∏Î∂ÑÎ•?;
        if (!acc[group]) acc[group] = [];
        acc[group].push(evaluation);
        return acc;
    }, {});

    // Î™©Î°ù ?îÎ©¥
    if (mode === 'list') {
        return (
            <div className="grade-input-container">
                <div className="flex justify-between items-center mb-lg">
                    <h1>?±Ï†Å ?ÖÎ†•</h1>
                    <div className="flex gap-sm">
                        <Button onClick={() => setMode('settings')} variant="secondary">
                            ?±Ï†Å?ÖÎ†• ?µÏÖò
                        </Button>
                        <Button onClick={() => setMode('create')} variant="primary">
                            ???±Ï†Å Í∏∞Î°ù ÎßåÎì§Í∏?                        </Button>
                    </div>
                </div>

                {evaluations.length === 0 ? (
                    <Card className="text-center" style={{ padding: '3rem' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            ?ÑÏßÅ ?ùÏÑ±???±Ï†Å Í∏∞Î°ù???ÜÏäµ?àÎã§.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                            "???±Ï†Å Í∏∞Î°ù ÎßåÎì§Í∏? Î≤ÑÌäº???¥Î¶≠?òÏó¨ Ï≤?Î≤àÏß∏ ?±Ï†Å Í∏∞Î°ù??ÎßåÎì§?¥Î≥¥?∏Ïöî!
                        </p>
                    </Card>
                ) : (
                    <div>
                        {Object.keys(groupedEvaluations).map(groupName => (
                            <div
                                key={groupName}
                                className={`evaluation-group mb-lg ${dragOverGroup === groupName ? 'drag-over' : ''}`}
                                onDragOver={(e) => handleDragOverGroup(e, groupName)}
                                onDragLeave={() => setDragOverGroup(null)}
                                onDrop={(e) => handleDropOnGroup(e, groupName)}
                            >
                                <h3 className="group-title">{groupName}</h3>
                                <div className="evaluation-cards">
                                    {groupedEvaluations[groupName].map(evaluation => (
                                        <Card
                                            key={evaluation.id}
                                            className="evaluation-card"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, evaluation)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => handleSelectEvaluation(evaluation)}
                                        >
                                            <div className="evaluation-card-header">
                                                <h4>{evaluation.title}</h4>
                                                <button
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteEvaluation(evaluation.id);
                                                    }}
                                                >
                                                    √ó
                                                </button>
                                            </div>
                                            <div className="evaluation-card-info">
                                                <span className="info-badge">
                                                    {evaluation.type === 'grade'
                                                        ? `${evaluation.gradeCount}???±Í∏â`
                                                        : '?êÏàò'}
                                                </span>
                                                <span className="info-text">
                                                    {Object.keys(evaluation.grades || {}).length} / {students.length}Î™??ÖÎ†•
                                                </span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ???±Ï†Å Í∏∞Î°ù ÎßåÎì§Í∏??îÎ©¥
    if (mode === 'create') {
        return (
            <div className="grade-input-container">
                <div className="flex justify-between items-center mb-lg">
                    <h1>???±Ï†Å Í∏∞Î°ù ÎßåÎì§Í∏?/h1>
                    <Button onClick={() => setMode('list')} variant="secondary">
                        Î™©Î°ù?ºÎ°ú
                    </Button>
                </div>

                <Card className="mb-lg">
                    <h3 className="mb-md">?âÍ? ?úÎ™©</h3>
                    <input
                        type="text"
                        value={newEvaluation.title}
                        onChange={(e) => setNewEvaluation({ ...newEvaluation, title: e.target.value })}
                        className="evaluation-title-input"
                        placeholder="?? ?òÌïô Ï§ëÍ∞ÑÍ≥†ÏÇ¨, ?ÅÏñ¥ ?òÌñâ?âÍ?"
                    />
                </Card>

                <Card className="mb-lg">
                    <h3 className="mb-md">Í∑∏Î£π (?†ÌÉù ?¨Ìï≠)</h3>
                    <div className="group-selector">
                        <select
                            value={newEvaluation.group}
                            onChange={(e) => setNewEvaluation({ ...newEvaluation, group: e.target.value })}
                            className="group-select"
                        >
                            <option value="">Í∑∏Î£π ?†ÌÉù ?êÎäî ?àÎ°ú ÎßåÎì§Í∏?/option>
                            {[...new Set(evaluations.map(e => e.group).filter(g => g))].map((group, idx) => (
                                <option key={idx} value={group}>{group}</option>
                            ))}
                            <option value="__new__">+ ??Í∑∏Î£π ÎßåÎì§Í∏?/option>
                        </select>
                        {newEvaluation.group === '__new__' && (
                            <input
                                type="text"
                                onChange={(e) => setNewEvaluation({ ...newEvaluation, group: e.target.value })}
                                className="group-input"
                                placeholder="??Í∑∏Î£πÎ™??ÖÎ†•"
                                autoFocus
                            />
                        )}
                    </div>
                    <p className="help-text">Í∑∏Î£π???§Ï†ï?òÎ©¥ Í∞ôÏ? Í∑∏Î£π???±Ï†Å Í∏∞Î°ù?§Ïù¥ ?®Íªò ?úÏãú?©Îãà??</p>
                </Card>

                <Card className="mb-lg">
                    <h3 className="mb-md">?âÍ? Î∞©Ïãù ?†ÌÉù</h3>
                    <div className="evaluation-type-selector">
                        <button
                            className={`type-btn ${newEvaluation.type === 'grade' ? 'active' : ''}`}
                            onClick={() => setNewEvaluation({ ...newEvaluation, type: 'grade' })}
                        >
                            ?±Í∏â ?âÍ?
                        </button>
                        <button
                            className={`type-btn ${newEvaluation.type === 'score' ? 'active' : ''}`}
                            onClick={() => setNewEvaluation({ ...newEvaluation, type: 'score' })}
                        >
                            ?êÏàò
                        </button>
                    </div>
                </Card>

                {newEvaluation.type === 'score' ? (
                    <Card className="mb-lg">
                        <h3 className="mb-md">?êÏàò Î≤îÏúÑ ?§Ï†ï</h3>
                        <div className="criteria-row">
                            <span className="criteria-label">?êÏàò Î≤îÏúÑ:</span>
                            <div className="score-range-inputs">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newEvaluation.scoreRange.min}
                                    onChange={(e) => setNewEvaluation({
                                        ...newEvaluation,
                                        scoreRange: { ...newEvaluation.scoreRange, min: parseInt(e.target.value) }
                                    })}
                                    className="score-input"
                                />
                                <span>~</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newEvaluation.scoreRange.max}
                                    onChange={(e) => setNewEvaluation({
                                        ...newEvaluation,
                                        scoreRange: { ...newEvaluation.scoreRange, max: parseInt(e.target.value) }
                                    })}
                                    className="score-input"
                                />
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="mb-lg">
                        <h3 className="mb-md">?±Í∏â ?§Ï†ï</h3>
                        <div className="grade-count-selector mb-md">
                            <span className="criteria-label">?±Í∏â Í∞úÏàò:</span>
                            <div className="grade-count-buttons">
                                {[3, 4, 5].map(count => (
                                    <button
                                        key={count}
                                        className={`count-btn ${newEvaluation.gradeCount === count ? 'active' : ''}`}
                                        onClick={() => handleGradeCountChange(count)}
                                    >
                                        {count}?®Í≥Ñ
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="template-selector mb-md">
                            <span className="criteria-label">?àÏãú ?úÌîåÎ¶?</span>
                            <div className="template-buttons">
                                {gradeTemplates[newEvaluation.gradeCount].map((template, idx) => (
                                    <button
                                        key={idx}
                                        className="template-btn"
                                        onClick={() => applyTemplate(template)}
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grade-labels-editor">
                            <span className="criteria-label mb-sm">?±Í∏â ?§Ï†ï:</span>
                            {newEvaluation.gradeLabels.slice(0, newEvaluation.gradeCount).map((label, index) => (
                                <div key={index} className="criteria-row">
                                    <span className="grade-number">{index + 1}?±Í∏â:</span>
                                    <input
                                        type="text"
                                        value={label}
                                        onChange={(e) => handleGradeLabelChange(index, e.target.value)}
                                        className="label-input"
                                        placeholder="?±Í∏âÎ™?
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                <div className="text-center">
                    <Button onClick={handleCreateEvaluation} variant="accent" size="large">
                        ?ùÏÑ±?òÍ≥† ?±Ï†Å ?ÖÎ†• ?úÏûë
                    </Button>
                </div>
            </div>
        );
    }

    // ?Ä????Î™©Î°ù?ºÎ°ú ?¥Îèô
    const handleSaveAndGoToList = async () => {
        await saveGradeData();
        setMode('list');
        setCurrentEvaluation(null);
    };

    // ?âÍ? ?§Ï†ï ?òÏ†ï
    const handleEditEvaluation = () => {
        setEditData({
            title: currentEvaluation.title,
            group: currentEvaluation.group
        });
        setMode('edit');
    };

    // ?±Ï†Å ?ÖÎ†• ?îÎ©¥
    if (mode === 'input' && currentEvaluation) {
        return (
            <div className="grade-input-container">
                <div className="flex justify-between items-center mb-lg">
                    <h1>{currentEvaluation.title}</h1>
                    <Button onClick={handleSaveAndGoToList} variant="primary">
                        ?Ä?•ÌïòÍ≥??òÍ?Í∏?                    </Button>
                </div>

                <Card className="mb-lg">
                    <div className="current-settings-info">
                        <span className="info-label">Í∑∏Î£π:</span>
                        <span className="info-value">{currentEvaluation.group || 'ÎØ∏Î∂ÑÎ•?}</span>
                        <span className="info-separator">|</span>
                        <span className="info-label">?âÍ? Î∞©Ïãù:</span>
                        <span className="info-value">
                            {currentEvaluation.type === 'grade'
                                ? `${currentEvaluation.gradeCount}???±Í∏â ?âÍ?`
                                : '?êÏàò'}
                        </span>
                        {currentEvaluation.useColorHighlight && (
                            <>
                                <span className="info-separator">|</span>
                                <span className="info-label">?âÏÉÅ Í∞ïÏ°∞:</span>
                                <span className="info-value">?¨Ïö©</span>
                            </>
                        )}
                    </div>
                </Card>

                <Card>
                    {sortedStudents.length === 0 ? (
                        <div className="text-center">
                            <p>?±Î°ù???ôÏÉù???ÜÏäµ?àÎã§. ?ôÏÉù Í¥ÄÎ¶¨Ïóê???ôÏÉù??Ï∂îÍ??¥Ï£º?∏Ïöî.</p>
                        </div>
                    ) : (
                        <div className="grade-table-wrapper">
                            <table className="grade-table">
                                <thead>
                                    <tr>
                                        <th>Ï∂úÏÑùÎ≤àÌò∏</th>
                                        <th>?¥Î¶Ñ</th>
                                        <th>?±Î≥Ñ</th>
                                        <th>?±Ï†Å</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td className="text-center">{student.attendanceNumber}</td>
                                            <td className="student-name">{student.name}</td>
                                            <td className="text-center">{student.gender}</td>
                                            <td className="grade-input-cell">
                                                {currentEvaluation.type === 'score' ? (
                                                    <input
                                                        type="number"
                                                        min={currentEvaluation.scoreRange.min}
                                                        max={currentEvaluation.scoreRange.max}
                                                        value={currentEvaluation.grades[student.id] || ''}
                                                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                                        className="grade-score-input"
                                                        style={{
                                                            backgroundColor: getGradeColor(currentEvaluation, currentEvaluation.grades[student.id])
                                                        }}
                                                        placeholder={`${currentEvaluation.scoreRange.min}-${currentEvaluation.scoreRange.max}`}
                                                    />
                                                ) : (
                                                    <select
                                                        value={currentEvaluation.grades[student.id] || ''}
                                                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                                        className="grade-select-input"
                                                        style={{
                                                            backgroundColor: getGradeColor(currentEvaluation, currentEvaluation.grades[student.id])
                                                        }}
                                                    >
                                                        <option value="">?†ÌÉù</option>
                                                        {currentEvaluation.gradeLabels.slice(0, currentEvaluation.gradeCount).map((label, index) => (
                                                            <option key={index} value={label}>
                                                                {label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    // ?âÍ? ?òÏ†ï ?Ä??    const handleSaveEdit = () => {
        if (!editData.title.trim()) {
            alert('?âÍ? ?úÎ™©???ÖÎ†•?¥Ï£º?∏Ïöî.');
            return;
        }

        const updatedEvaluation = {
            ...currentEvaluation,
            title: editData.title,
            group: editData.group
        };

        const updatedEvaluations = evaluations.map(e =>
            e.id === currentEvaluation.id ? updatedEvaluation : e
        );

        setEvaluations(updatedEvaluations);
        setCurrentEvaluation(updatedEvaluation);
        saveGradeData(updatedEvaluations);
        setMode('input');
    };

    // ?âÍ? ?òÏ†ï ?îÎ©¥
    if (mode === 'edit' && currentEvaluation) {

        return (
            <div className="grade-input-container">
                <div className="flex justify-between items-center mb-lg">
                    <h1>?âÍ? ?òÏ†ï</h1>
                    <Button onClick={() => setMode('input')} variant="secondary">
                        Ï∑®ÏÜå
                    </Button>
                </div>

                <Card className="mb-lg">
                    <h3 className="mb-md">?âÍ? ?úÎ™©</h3>
                    <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="evaluation-title-input"
                        placeholder="?? ?òÌïô Ï§ëÍ∞ÑÍ≥†ÏÇ¨, ?ÅÏñ¥ ?òÌñâ?âÍ?"
                    />
                </Card>

                <Card className="mb-lg">
                    <h3 className="mb-md">Í∑∏Î£π (?†ÌÉù ?¨Ìï≠)</h3>
                    <div className="group-selector">
                        <select
                            value={editData.group === '__new__' ? '__new__' : editData.group}
                            onChange={(e) => setEditData({ ...editData, group: e.target.value })}
                            className="group-select"
                        >
                            <option value="">Í∑∏Î£π ?†ÌÉù ?êÎäî ?àÎ°ú ÎßåÎì§Í∏?/option>
                            {[...new Set(evaluations.map(e => e.group).filter(g => g))].map((group, idx) => (
                                <option key={idx} value={group}>{group}</option>
                            ))}
                            <option value="__new__">+ ??Í∑∏Î£π ÎßåÎì§Í∏?/option>
                        </select>
                        {editData.group === '__new__' && (
                            <input
                                type="text"
                                onChange={(e) => setEditData({ ...editData, group: e.target.value })}
                                className="group-input"
                                placeholder="??Í∑∏Î£πÎ™??ÖÎ†•"
                                autoFocus
                            />
                        )}
                    </div>
                    <p className="help-text">Í∑∏Î£π???§Ï†ï?òÎ©¥ Í∞ôÏ? Í∑∏Î£π???±Ï†Å Í∏∞Î°ù?§Ïù¥ ?®Íªò ?úÏãú?©Îãà??</p>
                </Card>

                <Card className="mb-lg">
                    <h3 className="mb-md">?âÍ? Î∞©Ïãù</h3>
                    <div className="current-settings-info">
                        <span className="info-label">?ÑÏû¨ ?âÍ? Î∞©Ïãù:</span>
                        <span className="info-value">
                            {currentEvaluation.type === 'grade'
                                ? `${currentEvaluation.gradeCount}???±Í∏â ?âÍ?`
                                : '?êÏàò'}
                        </span>
                    </div>
                    <p className="help-text" style={{ marginTop: '0.5rem' }}>
                        ?âÍ? Î∞©Ïãù?Ä ?òÏ†ï?????ÜÏäµ?àÎã§. ?âÍ? Î∞©Ïãù??Î≥ÄÍ≤ΩÌïò?§Î©¥ ?àÎ°ú???±Ï†Å Í∏∞Î°ù??ÎßåÎì§?¥Ï£º?∏Ïöî.
                    </p>
                </Card>

                <div className="text-center">
                    <Button onClick={handleSaveEdit} variant="primary" size="large">
                        ?òÏ†ï ?ÑÎ£å
                    </Button>
                </div>
            </div>
        );
    }

    // ?±Ï†Å?ÖÎ†• ?µÏÖò ?îÎ©¥
    if (mode === 'settings') {
        return (
            <div className="grade-input-container">
                <div className="flex justify-between items-center mb-lg">
                    <h1>?±Ï†Å?ÖÎ†• ?µÏÖò</h1>
                    <Button onClick={() => setMode('list')} variant="secondary">
                        Î™©Î°ù?ºÎ°ú
                    </Button>
                </div>

                <Card>
                    <h3 className="mb-md">?±Ï†Å?ÖÎ†• Í∏∞Îä• ?àÎÇ¥</h3>
                    <div className="settings-description">
                        <p className="description-text">
                            ?±Ï†Å?ÖÎ†• Í∏∞Îä•???¨Ïö©?òÎ©¥ ?ôÏÉù?§Ïùò ?§Ïñë???âÍ? Í≤∞Í≥ºÎ•?Ï≤¥Í≥Ñ?ÅÏúºÎ°?Í¥ÄÎ¶¨Ìï† ???àÏäµ?àÎã§.
                        </p>

                        <h4 className="description-subtitle">Ï£ºÏöî Í∏∞Îä•</h4>
                        <ul className="description-list">
                            <li><strong>?¨Îü¨ ?±Ï†Å Í∏∞Î°ù Í¥ÄÎ¶?</strong> Ï§ëÍ∞ÑÍ≥†ÏÇ¨, Í∏∞ÎßêÍ≥†ÏÇ¨, ?òÌñâ?âÍ? ???§Ïñë???âÍ?Î•?Í∞ÅÍ∞Å Í¥ÄÎ¶¨Ìï† ???àÏäµ?àÎã§.</li>
                            <li><strong>Í∑∏Î£π??</strong> 1?ôÍ∏∞, 2?ôÍ∏∞ ?±ÏúºÎ°?Í∑∏Î£π???§Ï†ï?òÏó¨ ?±Ï†Å Í∏∞Î°ù??Î∂ÑÎ•ò?????àÏäµ?àÎã§.</li>
                            <li><strong>?§Ïñë???âÍ? Î∞©Ïãù:</strong> ?±Í∏â ?âÍ?(3~5?®Í≥Ñ) ?êÎäî ?êÏàò Î∞©Ïãù???†ÌÉù?????àÏäµ?àÎã§.</li>
                            <li><strong>?âÏÉÅ Í∞ïÏ°∞:</strong> Í∏∞Ï? ÎØ∏Îã¨ ?ôÏÉù???âÏÉÅ?ºÎ°ú ?úÏãú?òÏó¨ ?úÎàà???åÏïÖ?????àÏäµ?àÎã§.</li>
                        </ul>

                        <h4 className="description-subtitle">?¨Ïö© Î∞©Î≤ï</h4>
                        <ol className="description-list">
                            <li>"???±Ï†Å Í∏∞Î°ù ÎßåÎì§Í∏? Î≤ÑÌäº???¥Î¶≠?òÏó¨ ?âÍ?Î•??ùÏÑ±?©Îãà??</li>
                            <li>?âÍ? ?úÎ™©, Í∑∏Î£π, ?âÍ? Î∞©Ïãù???§Ï†ï?©Îãà??</li>
                            <li>?±Í∏â ?âÍ???Í≤ΩÏö∞ ?®Í≥Ñ?Ä ?±Í∏âÎ™ÖÏùÑ ?§Ï†ï?????àÏäµ?àÎã§.</li>
                            <li>?ùÏÑ±???±Ï†Å Í∏∞Î°ù???¥Î¶≠?òÏó¨ ?ôÏÉùÎ≥ÑÎ°ú ?±Ï†Å???ÖÎ†•?©Îãà??</li>
                            <li>?ÖÎ†•???±Ï†Å?Ä ?êÎèô?ºÎ°ú ?Ä?•Îê©?àÎã§.</li>
                        </ol>

                        <div className="tip-box">
                            <strong>?í° ??</strong> Í∑∏Î£π Í∏∞Îä•???úÏö©?òÎ©¥ ?ôÍ∏∞Î≥? Í≥ºÎ™©Î≥ÑÎ°ú ?±Ï†Å??Ï≤¥Í≥Ñ?ÅÏúºÎ°?Í¥ÄÎ¶¨Ìï† ???àÏäµ?àÎã§.
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return null;
};

export default GradeInput;
