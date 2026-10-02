export default function NavBar() {
    return (
        <nav className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-4 sm:px-6 py-3">
            {/* Logo chương */}
            <a
                href="/"
                title="Về trang chủ Web học tập"
                className="flex items-center gap-3 transition-opacity hover:opacity-85"
            >
                <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-primary text-[15px] sm:text-[16px] font-extrabold text-on-dark">
                III
                </span>
                <span className="flex flex-col leading-tight">
                <span className="text-[15px] sm:text-[16.5px] font-bold text-ink">Chương III</span>
                <span className="text-[12px] sm:text-[12.5px] text-muted">Tư tưởng Hồ Chí Minh</span>
                </span>
            </a>
            </div>
        </nav>
    );
 }