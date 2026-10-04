import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ListChecks, Network } from "lucide-react";

const TABS = [
    { id: "knowledge", label: "Kiến thức", icon: BookOpen },
    { id: "mindmap", label: "Sơ đồ tư duy", icon: Network },
    { id: "review", label: "Ôn tập", icon: ListChecks },
];

/**
 * Props (đều không bắt buộc):
 * - activeTab: id tab đang chọn (nếu muốn component cha điều khiển)
 * - onTabChange(id): được gọi khi bấm đổi tab
 * Không truyền gì thì NavBar tự quản lý, mặc định là "knowledge".
 */
export default function NavBar({ activeTab, onTabChange }) {
    const [innerTab, setInnerTab] = useState("knowledge");
    const current = activeTab ?? innerTab;

    const handleSelect = (id) => {
        setInnerTab(id);
        onTabChange?.(id);
    };

    return (
        <nav className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-3">
                {/* Logo chương */}
                <a
                    href="/"
                    title="Về trang chủ Web học tập"
                    className="flex items-center gap-2.5 text-ink"
                >
                    <span className="grid size-9 place-items-center rounded-[10px] bg-primary text-[15px] font-extrabold text-on-dark">
                        III
                    </span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-[15px] font-bold">Chương III</span>
                        <span className="text-xs text-muted">Tư tưởng Hồ Chí Minh</span>
                    </span>
                </a>

                {/* Tabs */}
                <div role="tablist" aria-label="Nội dung chương III" className="ml-auto flex gap-1 rounded-full bg-[#EBE4D8] p-1">
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
                                    "relative inline-flex min-h-[40px] items-center gap-2 rounded-full px-[18px] text-sm font-semibold transition-colors " +
                                    (isActive ? "text-on-dark" : "text-ink-soft hover:text-ink")
                                }
                            >
                                {isActive && (
                                    <motion.span layoutId="ch3-tab-bg" className="absolute inset-0 rounded-full bg-ink" />
                                )}
                                <tab.icon className="relative hidden size-4 sm:block" />
                                <span className="relative">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}