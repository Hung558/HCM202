import { useState } from "react";
import ChapterTabBar from "../../components/ChapterTabBar.jsx";
import ChapterMenu from "../../components/ChapterMenu.jsx";
import ChapterLogo from "../../components/ChapterLogo.jsx";
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
        <nav className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-3">
                <ChapterMenu current="III" />
                {/* Logo chương */}
                <ChapterLogo num="III" />

                {/* Tabs */}
                <ChapterTabBar tabs={TABS} value={current} onChange={handleSelect} label="Nội dung chương III" hideIconsOnMobile />
            </div>
        </nav>
    );
}