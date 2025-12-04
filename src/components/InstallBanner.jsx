import React, { useState, useEffect } from 'react';
import './InstallBanner.css';

const InstallBanner = ({ isInstallable, onInstall }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if already installed (running as PWA)
        const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches ||
                               window.navigator.standalone === true;

        // Check if user dismissed the banner before
        const dismissedBefore = localStorage.getItem('pwa-banner-dismissed') === 'true';

        // Show banner if: not running as PWA and not dismissed
        // We show it even if not installable yet (for testing and visibility)
        setIsVisible(!isRunningAsPWA && !dismissedBefore);
        setIsDismissed(dismissedBefore);
    }, [isInstallable]);

    const handleDismiss = () => {
        localStorage.setItem('pwa-banner-dismissed', 'true');
        setIsVisible(false);
        setIsDismissed(true);
    };

    const handleInstall = async () => {
        if (isInstallable) {
            await onInstall();
            setIsVisible(false);
        } else {
            // If not installable yet, show instructions
            alert('이 기능은 HTTPS 환경에서만 작동합니다.\n\n배포된 사이트에서는 자동으로 설치 가능합니다.\n\n또는 브라우저 주소창 옆의 설치 아이콘을 클릭하세요.');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="install-banner">
            <div className="install-banner-content">
                <div className="install-banner-icon">📱</div>
                <div className="install-banner-text">
                    <h3>앱으로 설치하기</h3>
                    <p>홈 화면에 추가하고 오프라인에서도 사용하세요!</p>
                </div>
                <div className="install-banner-actions">
                    <button className="install-banner-btn-install" onClick={handleInstall}>
                        ⬇️ 설치
                    </button>
                    <button className="install-banner-btn-close" onClick={handleDismiss} title="닫기">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallBanner;
