import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import knowledge from "./knowledge.json";
import quiz from "./quiz.json";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Xáo thứ tự câu hỏi và đáp án; lưu lại vị trí đáp án đúng sau khi xáo. */
function buildDeck(questions) {
    return shuffle(questions).map((q) => {
        const order = shuffle(q.options.map((text, i) => ({ text, isCorrect: i === q.answer })));
        return { ...q, shuffled: order, answer: order.findIndex((o) => o.isCorrect) };
    });
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.2 },
};

export default function Review() {
    const [phase, setPhase] = useState("setup"); // setup | quiz | result
    const [scope, setScope] = useState("all");
    const [deck, setDeck] = useState([]);
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState(null);
    const [results, setResults] = useState([]); // { id, correct }

    const sections = knowledge.sections;
    const sectionTitle = useMemo(
        () => Object.fromEntries(sections.map((s) => [s.id, `${s.number} · ${s.title}`])),
        [sections]
    );
    const countBySection = useMemo(() => {
        const map = { all: quiz.questions.length };
        quiz.questions.forEach((q) => (map[q.section] = (map[q.section] || 0) + 1));
        return map;
    }, []);

    const start = (questions) => {
        setDeck(buildDeck(questions));
        setIndex(0);
        setPicked(null);
        setResults([]);
        setPhase("quiz");
    };

    const startScope = () =>
        start(scope === "all" ? quiz.questions : quiz.questions.filter((q) => q.section === scope));

    const current = deck[index];
    const answered = picked !== null;
    const score = results.filter((r) => r.correct).length;

    const choose = (i) => {
        if (answered) return;
        setPicked(i);
        setResults((prev) => [...prev, { id: current.id, correct: i === current.answer }]);
    };

    const next = () => {
        if (index + 1 >= deck.length) {
            setPhase("result");
        } else {
            setIndex(index + 1);
            setPicked(null);
        }
    };

    const retryWrong = () => {
        const wrongIds = new Set(results.filter((r) => !r.correct).map((r) => r.id));
        start(quiz.questions.filter((q) => wrongIds.has(q.id)));
    };

    const wrongCount = results.filter((r) => !r.correct).length;
    const percent = deck.length ? Math.round((score / deck.length) * 100) : 0;

    return (
        <div className="mx-auto max-w-[1180px] px-5 pt-10 pb-20">
            <header className="text-center">
                <p className="eyebrow">Chương III · Ôn tập</p>
                <h1 className="mt-2.5 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
                    Trắc nghiệm ôn tập
                </h1>
                <p className="mx-auto mt-3 max-w-[640px] text-[15.5px] leading-[1.65] text-ink-soft">
                    Các câu hỏi được soạn từ phần Kiến thức của chương. Chọn một phần để ôn riêng, hoặc làm toàn bộ.
                </p>
            </header>

            <div className="mx-auto mt-8 max-w-[760px]">
                <AnimatePresence mode="wait">
                    {/* ---------- Chọn phạm vi ---------- */}
                    {phase === "setup" && (
                        <motion.div key="setup" {...fade} className="card p-[22px]">
                            <h2 className="text-[22px] font-extrabold tracking-[-0.01em]">Chọn phạm vi ôn tập</h2>
                            <div className="mt-4 flex flex-col gap-2.5" role="radiogroup" aria-label="Phạm vi ôn tập">
                                {[{ id: "all", label: "Toàn bộ chương" }, ...sections.map((s) => ({ id: s.id, label: sectionTitle[s.id] }))].map(
                                    (opt) => {
                                        const active = scope === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                role="radio"
                                                aria-checked={active}
                                                onClick={() => setScope(opt.id)}
                                                className={
                                                    "flex min-h-11 items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors " +
                                                    (active
                                                        ? "border-ink bg-ink text-on-dark"
                                                        : "border-line-strong bg-white text-ink hover:bg-cream")
                                                }
                                            >
                                                <span className="font-semibold">{opt.label}</span>
                                                <span className={"shrink-0 text-[13px] " + (active ? "text-gold" : "text-muted")}>
                                                    {countBySection[opt.id] || 0} câu
                                                </span>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                            <button type="button" onClick={startScope} className="btn btn-primary mt-6">
                                Bắt đầu làm bài
                                <ArrowRight className="size-4" />
                            </button>
                        </motion.div>
                    )}

                    {/* ---------- Làm bài ---------- */}
                    {phase === "quiz" && current && (
                        <motion.div key={`q-${current.id}`} {...fade}>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="text-[13px] font-semibold text-muted">
                                    Câu {index + 1}/{deck.length}
                                </span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-track">
                                    <div
                                        className="h-full rounded-full bg-amber transition-all duration-200"
                                        style={{ width: `${((index + (answered ? 1 : 0)) / deck.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[13px] font-semibold text-success">{score} đúng</span>
                            </div>

                            <div className="card p-[22px]">
                                <p className="text-[12.5px] text-muted">
                                    Mục {current.subsection} · {sectionTitle[current.section]}
                                </p>
                                <h2 className="mt-2 text-[20px] font-extrabold leading-snug tracking-[-0.01em]">
                                    {current.question}
                                </h2>

                                <div className="mt-5 flex flex-col gap-2.5">
                                    {current.shuffled.map((opt, i) => {
                                        const isCorrect = i === current.answer;
                                        const isPicked = i === picked;
                                        let style = "border-line-strong bg-white text-ink hover:bg-cream";
                                        if (answered && isCorrect) style = "border-success bg-success-soft text-ink";
                                        else if (answered && isPicked) style = "border-primary bg-primary/10 text-ink";
                                        else if (answered) style = "border-line bg-white text-faint";

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                disabled={answered}
                                                onClick={() => choose(i)}
                                                className={
                                                    "flex min-h-11 items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] leading-[1.5] transition-colors " +
                                                    style
                                                }
                                            >
                                                <span className="mt-px w-5 shrink-0 font-extrabold text-muted">{LETTERS[i]}</span>
                                                <span className="flex-1">{opt.text}</span>
                                                {answered && isCorrect && <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />}
                                                {answered && isPicked && !isCorrect && (
                                                    <XCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {answered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-5 rounded-2xl bg-cream px-5 py-4"
                                    >
                                        <p className="text-[13px] font-semibold text-muted">
                                            {picked === current.answer ? "Chính xác" : "Chưa đúng"}
                                        </p>
                                        <p className="mt-1 text-[15px] leading-[1.65] text-ink-soft">{current.explanation}</p>
                                    </motion.div>
                                )}

                                {answered && (
                                    <button type="button" onClick={next} className="btn btn-dark mt-5">
                                        {index + 1 >= deck.length ? "Xem kết quả" : "Câu tiếp theo"}
                                        <ArrowRight className="size-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ---------- Kết quả ---------- */}
                    {phase === "result" && (
                        <motion.div key="result" {...fade} className="card p-[22px]">
                            <p className="text-[13px] font-semibold text-muted">Kết quả</p>
                            <p className="mt-1 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
                                {score}/{deck.length} <span className="text-amber">câu đúng</span>
                            </p>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-track">
                                <div className="h-full rounded-full bg-amber" style={{ width: `${percent}%` }} />
                            </div>
                            <p className="mt-4 rounded-2xl bg-cream px-5 py-4 text-[15px] leading-[1.65] text-ink-soft">
                                {percent === 100
                                    ? "Bạn đã trả lời đúng toàn bộ. Nội dung phần này đã nắm rất chắc."
                                    : percent >= 70
                                    ? "Kết quả tốt. Xem lại các câu sai bên dưới để củng cố thêm."
                                    : "Nên đọc lại phần Kiến thức tương ứng rồi làm lại để nhớ chắc hơn."}
                            </p>

                            {wrongCount > 0 && (
                                <div className="mt-5">
                                    <h3 className="text-[16px] font-extrabold">Các câu cần xem lại</h3>
                                    <ul className="mt-3 flex flex-col gap-2.5">
                                        {results
                                            .filter((r) => !r.correct)
                                            .map((r) => {
                                                const q = deck.find((d) => d.id === r.id);
                                                return (
                                                    <li key={r.id} className="rounded-xl border border-line px-4 py-3">
                                                        <p className="text-[15px] font-semibold text-ink">{q.question}</p>
                                                        <p className="mt-1 text-[14px] leading-[1.6] text-success">
                                                            Đáp án: {q.shuffled[q.answer].text}
                                                        </p>
                                                        <p className="mt-1 text-[13.5px] leading-[1.6] text-muted">
                                                            Xem lại mục {q.subsection}
                                                        </p>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap gap-3">
                                {wrongCount > 0 && (
                                    <button type="button" onClick={retryWrong} className="btn btn-primary">
                                        <RotateCcw className="size-4" />
                                        Làm lại {wrongCount} câu sai
                                    </button>
                                )}
                                <button type="button" onClick={() => setPhase("setup")} className="btn btn-outline">
                                    Chọn phạm vi khác
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
