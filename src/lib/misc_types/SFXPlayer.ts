
const missingAudioPath = "audiomissing.wav"
const audioFolder = "/"

/**
 * Browser context singleton for playing sound effects
 */
export class SFXPlayer {

    private static audioCache:Map<string, HTMLAudioElement> = new Map()
    private static readonly missingPath = audioFolder + missingAudioPath

    static loadAudio(urls:string[], override=false) {
        urls.forEach((url) => {
            if (this.audioCache.has(url) && !override) return
            const audio = new Audio(audioFolder + url)
            this.audioCache.set(url, audio)
        })
        console.log("loaded audio: ", this.audioCache)
    }

    static clearAudio(urls:string[]) {
        urls.forEach((url) => this.audioCache.delete(url))
    }

    static play(url:string) {
        console.log("playing audio at", url)
        const audio = this.audioCache.get(url)
        if (audio === undefined) {
            const missing = new Audio(this.missingPath)
            missing.play()
            return
        }

        audio.play()
    }
}