import { parseStorage } from "./ParseStorage"

export class OptionsStorage {


  public data:OptionsData = {}
  private storageKey = "OptionsStorage"

  constructor(
      storageKey?:string
  ) {

      this.storageKey = storageKey || this.storageKey

      this.load()
  }

  private commit(storage = this.data) {
      localStorage.setItem(this.storageKey, JSON.stringify(storage))
  }

  save() {
    this.commit()
  }

  load() {
    this.data = parseStorage(
      localStorage, this.storageKey,
      () => {return {}}
    )
  }

  private animationSpeedScale = 3

  setAnimationSpeed(to:number) {
    this.data.animationSpeed = this.animationSpeedScale / to
    this.commit()
  }

  getAnimationSpeed() {
    if (!this.data.animationSpeed) return 0
    return (1 / this.data.animationSpeed) * this.animationSpeedScale
  }

  setColor(key:string, to:string) {
    this.data[key] = to + "88"
    this.commit()
  }

  getColor(key:string) {
    const s = this.data[key]
    if (typeof s === "string") return s.substring(0, 8)
    return undefined
  }

  applyStyles(documentElement?:HTMLElement) {
    if (documentElement) {
      const d = documentElement
      CSSOptionMapping.forEach((o) => {
        const kData = this.data[o.k]
        if (!kData) return
        d.style.setProperty(o.v, `${kData}${o.u}`) 
      })
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey)
  }
}

export type OptionsData = {
  [key: string]: any;
  animationSpeed?: number;
  mainBgColor?: string;
  secondaryBgColor?: string;
  tertiaryBgColor?: string;
  gateColor?: string;
  connectionColorOff?: string;
  connectionColorOn?: string;
  connectionColorX?: string;
  circuitColor?: string;
  verificationColor?: string;
  failureColor?: string;
}
export const CSSOptionMapping = [
  { v: "--animation-speed", k: "animationSpeed", u: 's' },
  { v: "--main-bg-color", k: "mainBgColor", u: '' },
  { v: "--secondary-bg-color", k: "secondaryBgColor", u: '' },
  { v: "--tertiary-bg-color", k: "tertiaryBgColor", u: '' },
  { v: "--gate-color", k: "gateColor", u: '' },
  { v: "--connection-color-off", k: "connectionColorOff", u: '' },
  { v: "--connection-color-on", k: "connectionColorOn", u: '' },
  { v: "--connection-color-x", k: "connectionColorX", u: '' },
  { v: "--circuit-color", k: "circuitColor", u: '' },
  { v: "--verification-color", k: "verificationColor", u: '' },
  { v: "--failure-color", k: "failureColor", u: '' }
];