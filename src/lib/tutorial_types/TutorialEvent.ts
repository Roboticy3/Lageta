import { CustomEventTarget, createCustomEvent, type CustomEventListener } from "$lib/misc_types/CustomEventSystem"

export const TUTORIALEVENTKEYS = ["continue"] as const
type TutorialEventKeyTuple = typeof TUTORIALEVENTKEYS
export type TutorialEventKey = TutorialEventKeyTuple[number]

export interface TutorialEvent {}

export type TutorialEventListener = CustomEventListener<TutorialEvent, TutorialEventKey>

export class TutorialEventTarget extends CustomEventTarget<TutorialEvent, TutorialEventKey> {}