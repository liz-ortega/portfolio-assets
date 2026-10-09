// Interactions for Liz's portfolio: shared state + code overrides.
import type { ComponentType } from "react"
import { forwardRef, useSyncExternalStore } from "react"

type S = { dog: number; pdog: number; filter: string; mode: string; col: number; face: number }
let s: S = { dog: 0, pdog: 0, filter: "all", mode: "full", col: 0, face: 0 }
const subs = new Set<() => void>()
const set = (p: Partial<S>) => {
    s = { ...s, ...p }
    subs.forEach((f) => f())
}
const useS = () =>
    useSyncExternalStore(
        (cb) => {
            subs.add(cb)
            return () => subs.delete(cb)
        },
        () => s,
        () => s
    )

const DOGS = [{"name": "Chiquis", "line": "hi, i'm chiquis! click a project to start."}, {"name": "Candy", "line": "candy here! every case study has a 2-min speedrun."}, {"name": "Olaf", "line": "olaf! liz made a game called Fix It in Post-It."}, {"name": "Buddy", "line": "moo. just kidding, woof! i'm buddy."}, {"name": "Minnie", "line": "minnie here. go see the award-winning Nodo project!"}, {"name": "Chochis", "line": "chochis! say hi to liz, the email's at the bottom."}]
const PDOGS = [{"name": "Chiquis", "tag": "MAIN · GOOD GIRL", "fact": "white with a little cream. the main character, so you'll spot her all over the site."}, {"name": "Candy", "tag": "GOOD GIRL", "fact": "mostly white and [a fun fact about Candy]."}, {"name": "Olaf", "tag": "GOOD BOY", "fact": "mostly white, like his name, and [a fun fact about Olaf]."}, {"name": "Buddy", "tag": "GOOD BOY", "fact": "spotted like a cow. [a fun fact about Buddy]."}, {"name": "Minnie", "tag": "GOOD GIRL", "fact": "black with white paws. [a fun fact about Minnie]."}, {"name": "Chochis", "tag": "GOOD BOY", "fact": "brown with a slightly blue-ish coat. [a fun fact about Chochis]."}]

// show the layer only when pred(state) is true
const show = (pred: (s: S) => boolean) => (C: any): ComponentType =>
    forwardRef((p: any, ref) => {
        const st = useS()
        return pred(st) ? <C ref={ref} {...p} /> : null
    })
// clickable layer that updates state and highlights itself when active
const tap =
    (patch: (s: S) => Partial<S>, active: ((s: S) => boolean) | null, on = "#FFFFFF", off = "rgba(0,0,0,0)", ring = false) =>
    (C: any): ComponentType =>
    forwardRef((p: any, ref) => {
        const st = useS()
        const a = active ? active(st) : null
        const extra: any = { cursor: "pointer" }
        if (a !== null) {
            if (ring) {
                extra["--border-color"] = a ? "#16151F" : "#E6E6EE"
                extra.borderColor = a ? "#16151F" : "#E6E6EE"
            } else {
                extra.backgroundColor = a ? on : off
                extra.background = a ? on : off
            }
        }
        return <C ref={ref} {...p} style={{ ...p.style, ...extra }} onTap={() => set(patch(st))} />
    })
// recolor a layer based on state
const paint = (active: (s: S) => boolean, on: string, off: string) => (C: any): ComponentType =>
    forwardRef((p: any, ref) => {
        const st = useS()
        const c = active(st) ? on : off
        return <C ref={ref} {...p} style={{ ...p.style, backgroundColor: c, background: c }} />
    })
const text = (fn: (s: S) => string) => (C: any): ComponentType =>
    forwardRef((p: any, ref) => {
        const st = useS()
        return <C ref={ref} {...p} text={fn(st)} />
    })

export function withDog0(C: any): ComponentType {
    return show((s) => s.dog === 0)(C)
}

export function withPickDog0(C: any): ComponentType {
    return tap(() => ({ dog: 0 }), (s) => s.dog === 0)(C)
}

export function withPDog0(C: any): ComponentType {
    return show((s) => s.pdog === 0)(C)
}

export function withPPick0(C: any): ComponentType {
    return tap(() => ({ pdog: 0 }), (s) => s.pdog === 0, "", "", true)(C)
}

export function withDog1(C: any): ComponentType {
    return show((s) => s.dog === 1)(C)
}

export function withPickDog1(C: any): ComponentType {
    return tap(() => ({ dog: 1 }), (s) => s.dog === 1)(C)
}

export function withPDog1(C: any): ComponentType {
    return show((s) => s.pdog === 1)(C)
}

export function withPPick1(C: any): ComponentType {
    return tap(() => ({ pdog: 1 }), (s) => s.pdog === 1, "", "", true)(C)
}

export function withDog2(C: any): ComponentType {
    return show((s) => s.dog === 2)(C)
}

export function withPickDog2(C: any): ComponentType {
    return tap(() => ({ dog: 2 }), (s) => s.dog === 2)(C)
}

export function withPDog2(C: any): ComponentType {
    return show((s) => s.pdog === 2)(C)
}

export function withPPick2(C: any): ComponentType {
    return tap(() => ({ pdog: 2 }), (s) => s.pdog === 2, "", "", true)(C)
}

export function withDog3(C: any): ComponentType {
    return show((s) => s.dog === 3)(C)
}

export function withPickDog3(C: any): ComponentType {
    return tap(() => ({ dog: 3 }), (s) => s.dog === 3)(C)
}

export function withPDog3(C: any): ComponentType {
    return show((s) => s.pdog === 3)(C)
}

export function withPPick3(C: any): ComponentType {
    return tap(() => ({ pdog: 3 }), (s) => s.pdog === 3, "", "", true)(C)
}

export function withDog4(C: any): ComponentType {
    return show((s) => s.dog === 4)(C)
}

export function withPickDog4(C: any): ComponentType {
    return tap(() => ({ dog: 4 }), (s) => s.dog === 4)(C)
}

export function withPDog4(C: any): ComponentType {
    return show((s) => s.pdog === 4)(C)
}

export function withPPick4(C: any): ComponentType {
    return tap(() => ({ pdog: 4 }), (s) => s.pdog === 4, "", "", true)(C)
}

export function withDog5(C: any): ComponentType {
    return show((s) => s.dog === 5)(C)
}

export function withPickDog5(C: any): ComponentType {
    return tap(() => ({ dog: 5 }), (s) => s.dog === 5)(C)
}

export function withPDog5(C: any): ComponentType {
    return show((s) => s.pdog === 5)(C)
}

export function withPPick5(C: any): ComponentType {
    return tap(() => ({ pdog: 5 }), (s) => s.pdog === 5, "", "", true)(C)
}

export function withBark(C: any): ComponentType {
    return tap((s) => ({ dog: (s.dog + 1) % DOGS.length }), null)(C)
}

export function withDogLine(C: any): ComponentType {
    return text((s) => DOGS[s.dog].name + ": " + DOGS[s.dog].line)(C)
}

export function withPName(C: any): ComponentType {
    return text((s) => PDOGS[s.pdog].name)(C)
}

export function withPTag(C: any): ComponentType {
    return text((s) => PDOGS[s.pdog].tag)(C)
}

export function withPFact(C: any): ComponentType {
    return text((s) => PDOGS[s.pdog].fact)(C)
}

export function withFilterAll(C: any): ComponentType {
    return tap(() => ({ filter: "all" }), (s) => s.filter === "all", "#ECECF3")(C)
}

export function withFilterUx(C: any): ComponentType {
    return tap(() => ({ filter: "ux" }), (s) => s.filter === "ux", "#ECECF3")(C)
}

export function withFilterGame(C: any): ComponentType {
    return tap(() => ({ filter: "game" }), (s) => s.filter === "game", "#ECECF3")(C)
}

export function withCatUx(C: any): ComponentType {
    return show((s) => s.filter === "all" || s.filter === "ux")(C)
}

export function withCatGame(C: any): ComponentType {
    return show((s) => s.filter === "all" || s.filter === "game")(C)
}

export function withToSpeed(C: any): ComponentType {
    return tap(() => ({ mode: "speed" }), (s) => s.mode === "speed")(C)
}

export function withToFull(C: any): ComponentType {
    return tap(() => ({ mode: "full" }), (s) => s.mode === "full")(C)
}

export function withGoFull(C: any): ComponentType {
    return tap(() => ({ mode: "full" }), null)(C)
}

export function withSpeedOnly(C: any): ComponentType {
    return show((s) => s.mode === "speed")(C)
}

export function withFullOnly(C: any): ComponentType {
    return show((s) => s.mode === "full")(C)
}

export function withModeHint(C: any): ComponentType {
    return text((s) => (s.mode === "speed" ? "the 2-minute version, for busy recruiters." : "in a hurry? switch to the 2-min speedrun."))(C)
}

export function withColAlive(C: any): ComponentType {
    return show((s) => s.col === 0)(C)
}

export function withColAban(C: any): ComponentType {
    return show((s) => s.col === 1)(C)
}

export function withShowAlive(C: any): ComponentType {
    return tap(() => ({ col: 0 }), (s) => s.col === 0, "#FFFFFF", "rgba(255,255,255,0.55)")(C)
}

export function withShowAban(C: any): ComponentType {
    return tap(() => ({ col: 1 }), (s) => s.col === 1, "#FFFFFF", "rgba(255,255,255,0.55)")(C)
}

export function withFacePixel(C: any): ComponentType {
    return show((s) => s.face === 0)(C)
}

export function withFacePhoto(C: any): ComponentType {
    return show((s) => s.face === 1)(C)
}

export function withShowPixel(C: any): ComponentType {
    return tap(() => ({ face: 0 }), null)(C)
}

export function withShowPhoto(C: any): ComponentType {
    return tap(() => ({ face: 1 }), null)(C)
}

export function withDotPixel(C: any): ComponentType {
    return paint((s) => s.face === 0, "#16151F", "rgba(22,21,31,0.3)")(C)
}

export function withDotPhoto(C: any): ComponentType {
    return paint((s) => s.face === 1, "#16151F", "rgba(22,21,31,0.3)")(C)
}
