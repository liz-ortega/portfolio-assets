// Video and before/after slider components for Liz's portfolio.
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function Video(props) {
    const { src, poster, autoplay, controls, radius, fit, background, label } = props
    return (
        <video
            src={src}
            poster={poster || undefined}
            autoPlay={autoplay}
            muted={autoplay || !controls}
            loop={autoplay}
            controls={controls}
            playsInline
            preload={autoplay ? "auto" : "metadata"}
            aria-label={label}
            style={{ width: "100%", height: "100%", objectFit: fit, borderRadius: radius, display: "block", background }}
        />
    )
}
Video.defaultProps = { src: "", poster: "", autoplay: true, controls: false, radius: 18, fit: "cover", background: "transparent", label: "" }
addPropertyControls(Video, {
    src: { type: ControlType.String, title: "Video URL" },
    poster: { type: ControlType.String, title: "Poster URL" },
    autoplay: { type: ControlType.Boolean, title: "Autoplay" },
    controls: { type: ControlType.Boolean, title: "Controls" },
    radius: { type: ControlType.Number, title: "Radius", min: 0, max: 60 },
    fit: { type: ControlType.Enum, title: "Fit", options: ["cover", "contain"] },
    background: { type: ControlType.Color, title: "Background" },
    label: { type: ControlType.String, title: "Alt text" },
})

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function BeforeAfter(props) {
    const { before, after, radius, beforeAlt, afterAlt } = props
    const [pos, setPos] = useState(50)
    const box = useRef(null)
    const move = (clientX) => {
        const r = box.current.getBoundingClientRect()
        setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)))
    }
    const img = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" } as const
    const pill = { position: "absolute", top: 16, padding: "6px 12px", borderRadius: 999, fontSize: 12, letterSpacing: ".1em", fontFamily: "Inter, sans-serif" } as const
    return (
        <div
            ref={box}
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                move(e.clientX)
            }}
            onPointerMove={(e) => e.buttons && move(e.clientX)}
            style={{ position: "relative", width: "100%", height: "100%", borderRadius: radius, overflow: "hidden", background: "#E9E9EF", cursor: "ew-resize", touchAction: "pan-y", userSelect: "none" }}
        >
            <img src={before} alt={beforeAlt} style={img} draggable={false} />
            <img src={after} alt={afterAlt} style={{ ...img, clipPath: `inset(0 0 0 ${pos}%)` }} draggable={false} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 3, marginLeft: -1, background: "#FFFFFF", boxShadow: "0 0 0 1px rgba(22,21,31,.15)" }} />
            <div
                role="slider"
                tabIndex={0}
                aria-label="Compare before and after"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pos)}
                onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5))
                    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5))
                }}
                style={{ position: "absolute", top: "50%", left: `${pos}%`, width: 44, height: 44, marginLeft: -22, marginTop: -22, borderRadius: 999, background: "#FFFFFF", boxShadow: "0 4px 14px rgba(22,21,31,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#16151F" }}
            >
                ⇆
            </div>
            <span style={{ ...pill, left: 16, background: "rgba(22,21,31,.75)", color: "#FFFFFF" }}>BEFORE</span>
            <span style={{ ...pill, right: 16, background: "#FFFFFF", color: "#16151F" }}>AFTER</span>
        </div>
    )
}
BeforeAfter.defaultProps = { before: "", after: "", radius: 20, beforeAlt: "Before", afterAlt: "After" }
addPropertyControls(BeforeAfter, {
    before: { type: ControlType.String, title: "Before URL" },
    after: { type: ControlType.String, title: "After URL" },
    beforeAlt: { type: ControlType.String, title: "Before alt" },
    afterAlt: { type: ControlType.String, title: "After alt" },
    radius: { type: ControlType.Number, title: "Radius", min: 0, max: 60 },
})

/**
 * Scrollable image: a fixed-height box you can scroll through (for tall page mockups).
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function ScrollImage(props) {
    const { src, alt, radius, border } = props
    return (
        <div
            tabIndex={0}
            aria-label={alt ? alt + ", scroll to see the full page" : "Scroll to see the full image"}
            style={{ width: "100%", height: "100%", overflowY: "auto", overscrollBehavior: "contain", borderRadius: radius, border: border ? "1px solid " + border : "none", background: "#FFFFFF", boxSizing: "border-box", WebkitOverflowScrolling: "touch" }}
        >
            <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "auto" }} draggable={false} />
        </div>
    )
}
ScrollImage.defaultProps = { src: "", alt: "", radius: 18, border: "#E6E6EE" }
addPropertyControls(ScrollImage, {
    src: { type: ControlType.String, title: "Image URL" },
    alt: { type: ControlType.String, title: "Alt text" },
    radius: { type: ControlType.Number, title: "Radius", min: 0, max: 60 },
    border: { type: ControlType.Color, title: "Border" },
})


// ───────────── Play page: hands-on pieces ─────────────
const A = "https://cdn.jsdelivr.net/gh/liz-ortega/portfolio-assets@main/"
const PX = "'Silkscreen', 'Courier New', monospace"
const SERIF = "'Instrument Serif', 'Iowan Old Style', Georgia, serif"
const SANS = "'Instrument Sans', 'Avenir Next', 'Segoe UI', sans-serif"
const INK = "#16151F", MUTED = "#5B5A6B", BODY = "#3D3C52", BLUE = "#2569B8"
const clamp01 = (v) => Math.max(0, Math.min(1, v))

function useWidth(ref) {
    const [w, setW] = useState(800)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    return w
}
const reduced = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Poster wall: drag the taped prints around.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export function PosterWall() {
    const box = useRef(null)
    const w = useWidth(box)
    const narrow = w < 600
    const prints = [
        ["2a5148c50b07b1126a4f295ea5d524f8", "Show & Tell event poster", [0.06, 0.08, -5], [0.03, 0.03, -5]],
        ["f49279f9b93457a73fd879314dc77192", "Abstract poster study", [0.3, 0.18, 4], [0.5, 0.08, 4]],
        ["d15fd777d6eaa10932b05cf567235d48", "Repeat pattern", [0.54, 0.06, -2], [0.05, 0.52, -2]],
        ["77f4ced1c85b0f2ad20371f0fd00b307", "Swan repeat pattern", [0.75, 0.2, 6], [0.5, 0.56, 6]],
    ]
    const [pos, setPos] = useState(null)
    const [order, setOrder] = useState([0, 1, 2, 3])
    const [lift, setLift] = useState(-1)
    const drag = useRef(null)
    const layout = pos || prints.map((p) => (narrow ? p[3] : p[2]))
    const H = narrow ? 720 : 620
    const pw = narrow ? Math.round(w * 0.44) : 210
    const down = (i, e) => {
        const el = e.currentTarget
        el.setPointerCapture(e.pointerId)
        setOrder((o) => [...o.filter((k) => k !== i), i])
        setLift(i)
        drag.current = { i, sx: e.clientX, sy: e.clientY, ox: el.offsetLeft, oy: el.offsetTop, ew: el.offsetWidth, eh: el.offsetHeight, base: layout }
    }
    const move = (e) => {
        const d = drag.current
        if (!d) return
        const W = box.current.clientWidth, Hh = box.current.clientHeight
        const x = Math.max(0, Math.min(W - d.ew, d.ox + e.clientX - d.sx)) / W
        const y = Math.max(0, Math.min(Hh - d.eh, d.oy + e.clientY - d.sy)) / Hh
        const next = d.base.slice()
        next[d.i] = [x, y, d.base[d.i][2]]
        setPos(next)
    }
    const up = () => {
        const d = drag.current
        if (!d) return
        drag.current = null
        setLift(-1)
        setPos((p) => {
            const next = (p || d.base).slice()
            next[d.i] = [next[d.i][0], next[d.i][1], Math.round(Math.random() * 12 - 6)]
            return next
        })
    }
    return (
        <div
            ref={box}
            style={{ position: "relative", width: "100%", height: H, borderRadius: 24, overflow: "hidden", background: "#EFE9DD radial-gradient(#d9d0bf 1.2px, transparent 1.3px) 0 0 / 22px 22px", touchAction: "pan-y" }}
        >
            {prints.map(([id, cap], i) => {
                const [x, y, r] = layout[i]
                const on = lift === i
                return (
                    <div
                        key={id}
                        onPointerDown={(e) => down(i, e)}
                        onPointerMove={move}
                        onPointerUp={up}
                        onPointerCancel={up}
                        style={{ position: "absolute", left: x * 100 + "%", top: y * 100 + "%", width: pw, padding: "10px 10px 34px", background: "#FFFFFF", borderRadius: 4, boxSizing: "border-box", zIndex: 10 + order.indexOf(i), cursor: on ? "grabbing" : "grab", userSelect: "none", touchAction: "none", transform: on ? `rotate(${r / 2}deg) scale(1.04)` : `rotate(${r}deg)`, boxShadow: on ? "0 22px 40px rgba(22,21,31,.28)" : "0 6px 16px rgba(22,21,31,.18)", transition: "box-shadow .2s, transform .2s" }}
                    >
                        <span style={{ position: "absolute", top: -12, left: "50%", width: 84, height: 24, marginLeft: -42, background: "rgba(255,229,138,.75)", transform: "rotate(-3deg)", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }} />
                        <img src={A + id + ".jpg"} alt={cap} draggable={false} style={{ display: "block", width: "100%", borderRadius: 2, pointerEvents: "none" }} />
                        <span style={{ position: "absolute", left: 12, right: 12, bottom: 9, fontFamily: SANS, fontSize: 12, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cap}</span>
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Columbus diorama: drag the stage or the walker to go from alive to abandoned.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export function DioramaWalk() {
    const [t, setT] = useState(0)
    const [stepping, setStepping] = useState(false)
    const track = useRef(null), stage = useRef(null), sd = useRef(null), td = useRef(false)
    const fromTrack = (e) => { const r = track.current.getBoundingClientRect(); return clamp01((e.clientX - r.left - 28) / (r.width - 56)) }
    const night = t < 0.5
    const fade = clamp01((t - 0.35) / 0.3)
    const img = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" } as const
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <div
                ref={stage}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); sd.current = { x: e.clientX, t }; setStepping(true) }}
                onPointerMove={(e) => { const d = sd.current; if (!d) return; setT(clamp01(d.t + (d.x - e.clientX) / stage.current.clientWidth)) }}
                onPointerUp={() => { sd.current = null; setStepping(false) }}
                onPointerCancel={() => { sd.current = null; setStepping(false) }}
                style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 16, overflow: "hidden", background: INK, cursor: sd.current ? "grabbing" : "grab", touchAction: "pan-y", userSelect: "none" }}
            >
                <img src={A + "d97b5d34ceac0bd9fd0afa99a259add6.jpg"} alt="Columbus alive: the school under a bright blue sky" draggable={false} style={{ ...img, transform: `scale(${1.06 - t * 0.06}) translateX(${-t * 4}%)` }} />
                <img src={A + "a3c9b08d9a645d28f4c62da86a422754.jpg"} alt="Abandoned Columbus: an empty lot behind a worn fence" draggable={false} style={{ ...img, opacity: fade }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,18,48,.55), rgba(14,18,48,0) 60%)", opacity: t * 0.9, pointerEvents: "none" }} />
                <span style={{ position: "absolute", top: 12, left: 12, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.9)", fontFamily: PX, fontSize: 11, color: INK }}>{night ? "☀︎ COLUMBUS ALIVE" : "☾ ABANDONED"}</span>
            </div>
            <div
                ref={track}
                role="slider"
                tabIndex={0}
                aria-label="Walk around the diorama, from alive to abandoned"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(t * 100)}
                onKeyDown={(e) => { if (e.key === "ArrowLeft") setT((v) => clamp01(v - 0.1)); if (e.key === "ArrowRight") setT((v) => clamp01(v + 0.1)) }}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); td.current = true; setStepping(true); setT(fromTrack(e)) }}
                onPointerMove={(e) => { if (td.current) setT(fromTrack(e)) }}
                onPointerUp={() => { td.current = false; setStepping(false) }}
                onPointerCancel={() => { td.current = false; setStepping(false) }}
                style={{ position: "relative", height: 56, borderRadius: 999, background: "#FFFFFF", border: "1px solid #E6E6EE", cursor: "pointer", touchAction: "none", boxSizing: "border-box" }}
            >
                <div style={{ position: "absolute", left: 28, right: 28, top: "50%", borderTop: "2px dashed #C9C8D6" }} />
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontFamily: PX, fontSize: 11 }}>{"☀︎"}</span>
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontFamily: PX, fontSize: 11 }}>{"☾"}</span>
                <div style={{ position: "absolute", top: "50%", left: `calc(28px + ${t} * (100% - 56px))`, width: 40, height: 40, margin: "-20px 0 0 -20px", borderRadius: 10, background: "#FFFFFF", border: "2px solid " + INK, display: "grid", placeItems: "center", boxShadow: "0 4px 10px rgba(22,21,31,.15)", boxSizing: "border-box" }}>
                    <img src="https://cdn.jsdelivr.net/gh/liz-ortega/portfolio-assets@9fc1f5dc0349b5bdaa6726964ac4f34be70c1fe2/svg/ac04c7b5a726f790b506c9fce21f89a0.svg" alt="" draggable={false} style={{ width: 28, height: 28, imageRendering: "pixelated", transform: stepping && !reduced() ? `translateY(${Math.round(t * 40) % 2 ? -3 : 0}px)` : "none" }} />
                </div>
            </div>
        </div>
    )
}

/**
 * Brick dig: scrape the rubble away to find the hand-labeled brick.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export function BrickDig() {
    const cv = useRef(null)
    const [found, setFound] = useState(false)
    const st = useRef({ down: false, n: 0, ctx: null, W: 0, H: 0, dpr: 1 })
    useEffect(() => {
        const c = cv.current
        if (!c) return
        const paint = () => {
            const s = st.current, r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1
            if (!r.width) return
            s.dpr = dpr; s.W = c.width = Math.round(r.width * dpr); s.H = c.height = Math.round(r.height * dpr)
            const ctx = (s.ctx = c.getContext("2d"))
            ctx.globalCompositeOperation = "source-over"
            ctx.fillStyle = "#8C8178"; ctx.fillRect(0, 0, s.W, s.H)
            for (let i = 0; i < 1400; i++) {
                const x = Math.random() * s.W, y = Math.random() * s.H, z = (Math.random() * 10 + 2) * dpr, g = (150 + Math.random() * 70) | 0
                ctx.fillStyle = `rgb(${g},${g - 8},${g - 18})`
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + z, y + z * 0.3); ctx.lineTo(x + z * 0.6, y + z); ctx.closePath(); ctx.fill()
            }
            for (let i = 0; i < 70; i++) {
                ctx.fillStyle = Math.random() < 0.5 ? "#A4473A" : "#7E3A30"
                ctx.fillRect(Math.random() * s.W, Math.random() * s.H, (14 + Math.random() * 18) * dpr, (7 + Math.random() * 6) * dpr)
            }
            ctx.globalCompositeOperation = "destination-out"
        }
        paint()
        let lastW = c.getBoundingClientRect().width
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { const w = c.getBoundingClientRect().width; if (Math.abs(w - lastW) > 4) { lastW = w; paint() } }) : null
        ro && ro.observe(c)
        return () => ro && ro.disconnect()
    }, [])
    const scrape = (e) => {
        const s = st.current
        if (found || !s.ctx) return
        const r = cv.current.getBoundingClientRect()
        s.ctx.beginPath(); s.ctx.arc((e.clientX - r.left) * s.dpr, (e.clientY - r.top) * s.dpr, 26 * s.dpr, 0, Math.PI * 2); s.ctx.fill()
        if (++s.n % 8) return
        const d = s.ctx.getImageData(0, 0, s.W, s.H).data
        let k = 0
        for (let i = 3; i < d.length; i += 64) if (d[i] === 0) k++
        if (k / (d.length / 64) > 0.45) setFound(true)
    }
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: PX, fontSize: 11, color: MUTED }}>AFTER THE DEMOLITION · <b style={{ color: INK }}>DIG</b> THROUGH THE RUBBLE</span>
            <div style={{ position: "relative", height: 190, borderRadius: 14, overflow: "hidden", background: "#6B5E52", boxShadow: "inset 0 2px 8px rgba(0,0,0,.25)" }}>
                <img src={A + "d491e493afe5cda60f322f348ab16bd9.jpg"} alt="Hand-labeled brick on moss" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <canvas
                    ref={cv}
                    aria-label="Scrape away the rubble"
                    onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); st.current.down = true; scrape(e) }}
                    onPointerMove={(e) => { if (st.current.down) scrape(e) }}
                    onPointerUp={() => (st.current.down = false)}
                    onPointerCancel={() => (st.current.down = false)}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", cursor: "crosshair", opacity: found ? 0 : 1, pointerEvents: found ? "none" : "auto", transition: "opacity .6s" }}
                />
            </div>
            <p style={{ margin: 0, fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: BODY, opacity: found ? 1 : 0, transform: found ? "none" : "translateY(6px)", transition: "opacity .5s, transform .5s" }}>
                When Columbus came down in 2021, neighbors saved real bricks as keepsakes. My 3D-printed brick kept failing, so I labeled one by hand. The imperfections felt right: memory holds on to fragments, not exact replicas.
            </p>
        </div>
    )
}

const CASTS = [
    [0.16, "play/cast-white-void.jpg", "THE WHITE BRAIN", "a clean slate", "Cast upside down by accident, it kept a void at the top. In DPDR, perhaps what isn’t felt, what’s missing, becomes most visible: the empty space invites you to project your own experience."],
    [0.3, "a806ab2e3bb6c1a062007fb18ea75828.jpg", "FLATTENED DARK GREY", "a soft core", "It looks sliced at the end, with a soft silicone core left intact: even amid structural collapse there’s a vulnerable core. Disconnection isn’t just absence."],
    [0.45, "play/cast-grey.jpg", "GREYISH-WHITE, FRAGMENTED", "closest to the idea", "Neutral, empty and disconnected, it stays truest to the original concept. It feels ghostly, and turned on its side it almost stops looking like a brain."],
    [0.58, "0c9bbfec91cc14cfe3c5676f612a82a4.jpg", "SPARKLY BLUE", "synthetic thought", "Its shimmer blurs human consciousness and machine logic. If AI doesn’t have a brain but still “thinks” for the ones who do, what happens when thought starts to feel outsourced?"],
    [0.71, "8f35b67df46190ae4cace81914597b88.jpg", "SQUISHY PINK", "innocence and fragility", "Cotton-candy soft, playful and nostalgic, yet fleeting, like the slipping grasp of reality during an episode of detachment. Almost dreamlike."],
    [0.85, "play/cast-red.jpg", "RED", "the original", "The original brain I made the molds from. Every other cast started here."],
]

/**
 * Lost Brain: pick up a cast from the table to see it up close.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export function CastTable() {
    const box = useRef(null)
    const w = useWidth(box)
    const [cur, setCur] = useState(4)
    const [hov, setHov] = useState(-1)
    const shot = w < 440 ? 110 : 150
    return (
        <div ref={box} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 16, overflow: "hidden", background: "#E6E6EE" }}>
                <img src={A + "c4cfeb218dece19c27445738aadf5d1c.jpg"} alt="The Lost Brain cast series side by side" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                {CASTS.map(([x, , name], i) => {
                    const on = cur === i, h = hov === i
                    return (
                        <button
                            key={i}
                            type="button"
                            aria-label={"Pick up the " + String(name).toLowerCase() + " cast"}
                            aria-pressed={on}
                            onMouseEnter={() => { setHov(i); setCur(i) }}
                            onMouseLeave={() => setHov(-1)}
                            onFocus={() => setCur(i)}
                            onClick={() => setCur(i)}
                            style={{ position: "absolute", left: (x as number) * 100 + "%", top: "27%", width: "12%", aspectRatio: "1", padding: 0, transform: `translate(-50%,-50%) scale(${on || h ? 1.08 : 1})`, borderRadius: "50%", cursor: "pointer", background: "transparent", border: on ? "2px solid #FFFFFF" : h ? "2px dashed rgba(22,21,31,.6)" : "2px dashed rgba(255,255,255,.55)", boxShadow: on ? "0 0 0 3px rgba(22,21,31,.35)" : "none", transition: "border-color .2s, transform .2s" }}
                        />
                    )
                })}
            </div>
            <div style={{ display: "grid", padding: 12, borderRadius: 14, background: "#FFFFFF" }}>
                {CASTS.map(([, img, name, tag, cap], i) => (
                    <div key={i} aria-hidden={cur !== i} style={{ gridArea: "1 / 1", display: "grid", gridTemplateColumns: `${shot}px 1fr`, gap: 16, alignItems: "start", visibility: cur === i ? "visible" : "hidden" }}>
                        <img src={A + img} alt={String(name).toLowerCase() + " cast"} draggable={false} style={{ width: shot, aspectRatio: "3 / 4", borderRadius: 8, objectFit: "cover", background: "#F3F1EC", transform: cur === i ? "rotate(-2deg)" : "rotate(-2deg) translateY(10px) scale(.94)", opacity: cur === i ? 1 : 0.4, boxShadow: "0 8px 18px rgba(22,21,31,.18)", transition: "transform .35s ease-out, opacity .35s ease-out" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontFamily: PX, fontSize: 11, color: MUTED, marginBottom: 2 }}>{name}</span>
                            {tag ? <h4 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.05, color: INK }}>{tag}</h4> : null}
                            <p style={{ margin: 0, fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: BODY }}>{cap}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Drifting Outside Myself: peer in through a glowing viewing hole.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export function Peephole() {
    const box = useRef(null)
    const [on, setOn] = useState(false)
    const [p, setP] = useState({ x: 0, y: 0, w: 1, h: 1 })
    const aim = (e) => { const r = box.current.getBoundingClientRect(); setP({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }) }
    const glow = reduced() ? "0 0 22px 8px rgba(255,120,80,.5)" : undefined
    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <style>{`@keyframes lizGlow{0%,100%{box-shadow:0 0 0 0 rgba(255,120,80,.6)}50%{box-shadow:0 0 28px 10px rgba(255,120,80,.55)}}`}</style>
            <div
                ref={box}
                onPointerMove={(e) => on && aim(e)}
                onPointerLeave={() => setOn(false)}
                onPointerUp={(e) => { if (e.pointerType !== "mouse") setOn(false) }}
                onPointerCancel={() => setOn(false)}
                style={{ position: "relative", width: "100%", maxWidth: 460, aspectRatio: "3 / 4", borderRadius: 16, overflow: "hidden", background: "#0E0D14", userSelect: "none", touchAction: "pan-y" }}
            >
                <img src={A + "19ed421912ee9325c3cc3d475bee073b.jpg"} alt="Lit 3D-printed brain installation with two viewing holes" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.42) saturate(.9)", pointerEvents: "none" }} />
                {[[32, 45], [65, 45]].map(([x, y], i) => (
                    <div
                        key={i}
                        role="button"
                        tabIndex={0}
                        aria-label={"Peer in through viewing hole " + (i + 1)}
                        onPointerEnter={(e) => { setOn(true); aim(e) }}
                        onPointerDown={(e) => { box.current.setPointerCapture(e.pointerId); setOn(true); aim(e) }}
                        onFocus={() => { const r = box.current.getBoundingClientRect(); setP({ x: (x / 100) * r.width, y: (y / 100) * r.height, w: r.width, h: r.height }); setOn(true) }}
                        onBlur={() => setOn(false)}
                        style={{ position: "absolute", left: x + "%", top: y + "%", width: "15%", aspectRatio: "1", transform: "translate(-50%,-50%)", borderRadius: "50%", cursor: "none", touchAction: "none", animation: glow ? "none" : "lizGlow 2.2s ease-in-out infinite", boxShadow: glow }}
                    />
                ))}
                <div style={{ position: "absolute", left: p.x, top: p.y, width: "62%", aspectRatio: "1", borderRadius: "50%", transform: `translate(-50%,-50%) scale(${on ? 1 : 0.6})`, opacity: on ? 1 : 0, pointerEvents: "none", backgroundImage: `url(${A}3f7eccc135e635c5832eac52c0d2012c.jpg)`, backgroundSize: "180%", backgroundPosition: `${(p.x / p.w) * 100}% ${(p.y / p.h) * 100}%`, boxShadow: "0 0 0 9999px rgba(8,7,12,.86), inset 0 0 40px 18px rgba(0,0,0,.75)", transition: "opacity .25s, transform .25s" }} />
                <span style={{ position: "absolute", left: 12, right: 12, bottom: 12, textAlign: "center", fontFamily: PX, fontSize: 11, color: "#F6D9CF", opacity: 0.9, pointerEvents: "none" }}>{on ? "YOU ARE LOOKING IN FROM THE OUTSIDE" : "HOVER OR HOLD A GLOWING HOLE"}</span>
            </div>
        </div>
    )
}
