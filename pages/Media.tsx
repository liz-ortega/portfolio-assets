// Video and before/after slider components for Liz's portfolio.
import { useRef, useState } from "react"
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
