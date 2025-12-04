import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { getLatestChangelog } from '../changelog';
import './UpdateNotification.css';

const UpdateNotification = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const [showNotification, setShowNotification] = useState(false);
    const changelog = getLatestChangelog();

    useEffect(() => {
        if (needRefresh) {
            setShowNotification(true);
        }
    }, [needRefresh]);

    const handleUpdate = () => {
        updateServiceWorker(true);
    };

    const handleDismiss = () => {
        setShowNotification(false);
        setNeedRefresh(false);
    };

    if (!showNotification) return null;

    return (
        <div className="update-notification-overlay">
            <div className="update-notification">
                <div className="update-header">
                    <span className="update-icon">?éâ</span>
                    <h3>?àÎ°ú???ÖÎç∞?¥Ìä∏Í∞Ä ?àÏäµ?àÎã§!</h3>
                </div>

                <div className="update-content">
                    <p className="update-version">Î≤ÑÏ†Ñ {changelog.version}</p>
                    <p className="update-date">{changelog.date}</p>

                    {changelog.features.length > 0 && (
                        <div className="update-section">
                            <h4>???àÎ°ú??Í∏∞Îä•</h4>
                            <ul>
                                {changelog.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {changelog.fixes.length > 0 && (
                        <div className="update-section">
                            <h4>?îß Î≤ÑÍ∑∏ ?òÏ†ï</h4>
                            <ul>
                                {changelog.fixes.map((fix, index) => (
                                    <li key={index}>{fix}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {changelog.breaking && changelog.breaking.length > 0 && (
                        <div className="update-section update-warning">
                            <h4>?†Ô∏è Ï£ºÏöî Î≥ÄÍ≤ΩÏÇ¨??/h4>
                            <ul>
                                {changelog.breaking.map((change, index) => (
                                    <li key={index}>{change}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="update-actions">
                    <button onClick={handleDismiss} className="btn-dismiss">
                        ?òÏ§ë??
                    </button>
                    <button onClick={handleUpdate} className="btn-update">
                        ÏßÄÍ∏??ÖÎç∞?¥Ìä∏
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateNotification;
