import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAPIKey } from '../context/APIKeyContext';
import { exportAllData, importAllData } from '../db/indexedDB';
import Button from '../components/Button';
import './Settings.css';

const Settings = () => {
    const { apiKey, isConnected, saveAPIKey, deleteAPIKey, testConnection } = useAPIKey();
    const navigate = useNavigate();

    const [inputKey, setInputKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentSlide, setCurrentSlide] = useState(0);

    const guideSteps = [
        {
            number: 1,
            title: "구글 AI Studio 접속",
            description: "아래 초록색 버튼을 클릭하면 구글 AI 사이트가 열립니다.",
            tip: "💡 Gmail 계정으로 로그인되어 있어야 해요"
        },
        {
            number: 2,
            title: "API 키 생성 버튼 찾기",
            description: "화면 왼쪽 메뉴에서 🔑 Get API key를 클릭하세요.",
            tip: "💡 왼쪽 사이드바에 있는 메뉴입니다"
        },
        {
            number: 3,
            title: "새 프로젝트에서 키 만들기",
            description: "Create API key in new project 버튼을 클릭하세요.",
            tip: "💡 처음 사용하시는 분은 이 버튼을 누르면 돼요"
        },
        {
            number: 4,
            title: "API 키 복사하기",
            description: "생성된 키(AIza...로 시작)를 복사 버튼(📋)으로 복사하세요.",
            tip: "⚠️ 이 키는 비밀번호처럼 중요하니 다른 사람과 공유하지 마세요"
        },
        {
            number: 5,
            title: "학급일지에 등록",
            description: "아래 입력칸에 복사한 API 키를 붙여넣고 💾 API 키 저장 버튼을 누르세요.",
            tip: "✅ 자동으로 연결 테스트가 진행됩니다"
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % guideSteps.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + guideSteps.length) % guideSteps.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const handleSaveAPIKey = async () => {
        if (!inputKey.trim()) {
            setMessage({ type: 'error', text: 'API 키를 입력해주세요.' });
            return;
        }

        setIsSaving(true);
        setMessage({ type: '', text: '' });

        const result = await saveAPIKey(inputKey.trim());

        setIsSaving(false);

        if (result.success) {
            setMessage({ type: 'success', text: '✅ API 키가 성공적으로 저장되었습니다!' });
            setInputKey('');
        } else {
            setMessage({ type: 'error', text: `❌ ${result.error}` });
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setMessage({ type: '', text: '' });

        const result = await testConnection();

        setIsTesting(false);

        if (result.success) {
            setMessage({ type: 'success', text: '✅ API 연결 성공! 정상 작동합니다.' });
        } else {
            setMessage({ type: 'error', text: `❌ ${result.error}` });
        }
    };

    const handleDeleteAPIKey = async () => {
        if (!confirm('정말로 API 키를 삭제하시겠습니까? AI 기능을 사용할 수 없게 됩니다.')) {
            return;
        }

        const result = await deleteAPIKey();

        if (result.success) {
            setMessage({ type: 'success', text: '✅ API 키가 삭제되었습니다.' });
        } else {
            setMessage({ type: 'error', text: `❌ ${result.error}` });
        }
    };

    const handleExportData = async () => {
        try {
            const data = await exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `class-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: '✅ 데이터가 성공적으로 내보내졌습니다!' });
        } catch (error) {
            setMessage({ type: 'error', text: `❌ 데이터 내보내기 실패: ${error.message}` });
        }
    };

    const handleImportData = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!confirm('기존 데이터를 모두 덮어쓰시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                event.target.value = '';
                return;
            }

            await importAllData(data);
            setMessage({ type: 'success', text: '✅ 데이터가 성공적으로 복원되었습니다! 페이지를 새로고침하세요.' });

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: `❌ 데이터 복원 실패: ${error.message}` });
        }

        event.target.value = '';
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>⚙️ 설정</h1>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    ← 뒤로가기
                </Button>
            </div>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* API Key Management Section */}
            <div className="settings-section">
                <h2>🤖 AI 연결 설정</h2>

                <div className="api-guide-card">
                    <div className="guide-badge">무료 사용 가능 ✨</div>
                    <h3>🤖 Gemini API 키가 필요해요!</h3>
                    <p style={{ marginBottom: '1rem' }}>
                        AI가 학생의 행동발달평가를 자동으로 작성해주는 <strong>무료 서비스</strong>예요.
                        <br />
                        구글 계정만 있으면 <strong>1분</strong>이면 충분합니다!
                    </p>

                    <div className="guide-slider">
                        <div className="slider-container">
                            <button
                                className="slider-btn prev"
                                onClick={prevSlide}
                                aria-label="이전 단계"
                            >
                                ‹
                            </button>

                            <div className="slide-content">
                                <div className="step-number-large">{guideSteps[currentSlide].number}</div>
                                <div className="step-info">
                                    <strong>{guideSteps[currentSlide].title}</strong>
                                    <p>{guideSteps[currentSlide].description}</p>
                                    <span className="step-tip">{guideSteps[currentSlide].tip}</span>
                                </div>
                            </div>

                            <button
                                className="slider-btn next"
                                onClick={nextSlide}
                                aria-label="다음 단계"
                            >
                                ›
                            </button>
                        </div>

                        <div className="slide-indicators">
                            {guideSteps.map((_, index) => (
                                <button
                                    key={index}
                                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => goToSlide(index)}
                                    aria-label={`${index + 1}단계로 이동`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="troubleshooting">
                        <strong>❓ 문제가 생겼나요?</strong>
                        <ul>
                            <li>API 키가 작동하지 않으면 → 키를 다시 생성해보세요</li>
                            <li>로그인이 안 되면 → Gmail 계정으로 로그인했는지 확인하세요</li>
                            <li>버튼이 안 보이면 → 페이지를 새로고침해보세요</li>
                        </ul>
                    </div>

                    <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="api-key-link"
                    >
                        🚀 지금 무료로 API 키 발급받기
                    </a>
                </div>

                <div className="api-status">
                    <div className="status-indicator">
                        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                        <span className="status-text">
                            {isConnected ? 'AI 연결됨' : 'AI 연결 안 됨'}
                        </span>
                    </div>
                </div>

                {isConnected && (
                    <div className="current-key-section">
                        <p style={{ color: 'var(--color-success)', fontWeight: '500' }}>
                            ✅ API 키가 설정되어 있습니다.
                        </p>
                        <div className="button-group">
                            <Button
                                variant="secondary"
                                onClick={handleTestConnection}
                                disabled={isTesting}
                            >
                                {isTesting ? '테스트 중...' : '🔍 연결 테스트'}
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDeleteAPIKey}
                            >
                                🗑️ API 키 삭제
                            </Button>
                        </div>
                    </div>
                )}

                <div className="api-key-input-section">
                    <label className="form-label">
                        {isConnected ? 'API 키 변경' : 'API 키 입력'}
                    </label>
                    <div className="input-with-toggle">
                        <input
                            type={showKey ? 'text' : 'password'}
                            className="api-key-input"
                            placeholder="AIza..."
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveAPIKey()}
                        />
                        <button
                            type="button"
                            className="toggle-visibility-btn"
                            onClick={() => setShowKey(!showKey)}
                        >
                            {showKey ? '🙈' : '👁️'}
                        </button>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSaveAPIKey}
                        disabled={isSaving || !inputKey.trim()}
                        style={{ marginTop: '1rem' }}
                    >
                        {isSaving ? '저장 중...' : '💾 API 키 저장'}
                    </Button>
                </div>
            </div>

            {/* Data Backup/Restore Section */}
            <div className="settings-section">
                <h2>💾 데이터 백업 및 복구</h2>
                <div className="section-description">
                    <p>
                        모든 학급 데이터를 파일로 백업하거나 다른 기기에서 복원할 수 있습니다.
                        <br />
                        정기적인 백업을 권장합니다.
                    </p>
                </div>

                <div className="button-group">
                    <Button
                        variant="primary"
                        onClick={handleExportData}
                    >
                        📥 데이터 내보내기
                    </Button>
                    <label className="import-button-wrapper">
                        <Button variant="secondary" as="span">
                            📤 데이터 가져오기
                        </Button>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>

            {/* App Info Section */}
            <div className="settings-section">
                <h2>ℹ️ 앱 정보</h2>
                <div className="app-info">
                    <p><strong>버전:</strong> 2.0.0 (PWA)</p>
                    <p><strong>저장 방식:</strong> IndexedDB (로컬)</p>
                    <p><strong>AI 모델:</strong> Google Gemini 2.0 Flash</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
