
const missingAudioPath = "audiomissing.wav"
const audioFolder = "/"

/**
 * Browser context singleton for playing sound effects
 */
export class SFXPlayer {

    private static audioCache:Map<string, HTMLAudioElement> = new Map()
    private static readonly missingPath = audioFolder + missingAudioPath

    static loadAudio(urls:string[]) {
        urls.forEach((url) => {
            const audio = new Audio(audioFolder + url)
            this.audioCache.set(url, audio)
        })
    }

    static clearAudio(urls:string[]) {
        urls.forEach((url) => this.audioCache.delete(url))
    }

    static play(url:string) {
        const audio = this.audioCache.get(url)
        if (audio === undefined) {
            const missing = new Audio(this.missingPath)
            missing.play()
            return
        }

        audio.play()
    }
}