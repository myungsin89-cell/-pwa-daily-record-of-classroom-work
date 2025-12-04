// Version changelog for update notifications
export const CURRENT_VERSION = '1.0.0';

export const changelog = [
    {
        version: '1.0.0',
        date: '2024-12-04',
        features: [
            '?Ž‰ ?™ê¸‰?¼ì? PWA ì¶œì‹œ',
            '?¤– AI ê¸°ë°˜ ?‰ë™ë°œë‹¬?‰ê? ?ë™ ?ì„±',
            '?ï¸ ?™ìƒë³??„ê?ê¸°ë¡ ê´€ë¦?,
            '?“Š ì¶œê²° ê´€ë¦??œìŠ¤??,
            '?’¾ ?ë™ ?€??ê¸°ëŠ¥',
            '?“± ?¤í”„?¼ì¸ ì§€??,
            '?”„ ?ë™ ?…ë°?´íŠ¸ ?Œë¦¼'
        ],
        fixes: [],
        breaking: []
    }
];

export const getLatestChangelog = () => changelog[0];
export const getChangelogByVersion = (version) =>
    changelog.find(log => log.version === version);
