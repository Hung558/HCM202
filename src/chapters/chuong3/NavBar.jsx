import { useState } from "react";

const TABS = [
    { id: "mindmap", label: "Sơ đồ tư duy" },
    { id: "knowledge", label: "Kiến thức" },
];

/**
 * Props (đều không bắt buộc):
 * - activeTab: id tab đang chọn (nếu muốn component cha điều khiển)
 * - onTabChange(id): được gọi khi bấm đổi tab
 * Không truyền gì thì NavBar tự quản lý, mặc định là "mindmap".
 */
export default function NavBar({ activeTab, onTabChange }) {
    const [innerTab, setInnerTab] = useState("mindmap");
    const current = activeTab ?? innerTab;

    const handleSelect = (id) => {
        setInnerTab(id);
        onTabChange?.(id);
    };

    return (
        <nav className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
                {/* Logo chương */}
                <a
                    href="/"
                    title="Về trang chủ Web học tập"
                    className="flex items-center gap-3 transition-opacity hover:opacity-85"
                >
                    <span className="grid size-9 place-items-center rounded-xl bg-primary text-[15px] font-extrabold text-on-dark sm:size-10 sm:text-[16px]">
                        III
                    </span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-[15px] font-bold text-ink sm:text-[16.5px]">Chương III</span>
                        <span className="text-[12px] text-muted sm:text-[12.5px]">Tư tưởng Hồ Chí Minh</span>
                    </span>
                </a>

                {/* Tabs */}
                <div role="tablist" aria-label="Nội dung chương III" className="flex items-center gap-2">
                    {TABS.map((tab) => {
                        const isActive = current === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => handleSelect(tab.id)}
                                className={
                                    "min-h-11 rounded-full px-4 text-[14px] font-semibold transition-colors sm:px-5 sm:text-[14.5px] " +
                                    (isActive
                                        ? "bg-ink text-on-dark"
                                        : "border border-line-strong text-ink-soft hover:bg-cream")
                                }
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}