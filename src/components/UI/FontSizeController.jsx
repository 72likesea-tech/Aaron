import { useUser } from '../../context/UserContext';
import { Type, Plus, Minus } from 'lucide-react';

export default function FontSizeController({ pageName }) {
    const { settings, updateSettings } = useUser();
    const currentScale = settings.fontScales?.[pageName] || 1.0;

    const changeScale = (delta) => {
        const newScales = { ...settings.fontScales };
        newScales[pageName] = Math.max(0.7, Math.min(2.0, currentScale + delta));
        updateSettings('fontScales', newScales);
    };

    const resetScale = () => {
        const newScales = { ...settings.fontScales };
        newScales[pageName] = 1.0;
        updateSettings('fontScales', newScales);
    };

    return (
        <div className="font-size-controller">
            <button className="ctrl-btn" onClick={() => changeScale(-0.1)} aria-label="Decrease font size">
                <Minus size={14} />
            </button>
            <button className="current-scale" onClick={resetScale} aria-label="Reset font size">
                <Type size={16} />
                <span>{Math.round(currentScale * 100)}%</span>
            </button>
            <button className="ctrl-btn" onClick={() => changeScale(0.1)} aria-label="Increase font size">
                <Plus size={14} />
            </button>

            <style>{`
                .font-size-controller {
                    display: flex;
                    align-items: center;
                    background: var(--bg-card);
                    border: 1px solid rgba(128,128,128,0.2);
                    border-radius: 100px;
                    padding: 4px;
                    gap: 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    width: fit-content;
                    z-index: 100;
                }
                .ctrl-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .ctrl-btn:active {
                    background: rgba(128,128,128,0.1);
                    transform: scale(0.9);
                }
                .current-scale {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 10px;
                    background: transparent;
                    border: none;
                    border-left: 1px solid rgba(128,128,128,0.1);
                    border-right: 1px solid rgba(128,128,128,0.1);
                    color: var(--text-primary);
                    font-size: 11px;
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
}
