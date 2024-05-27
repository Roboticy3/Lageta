import { CustomEventTarget, createCustomEvent, type CustomEventListener } from "$lib/misc_types/CustomEventSystem"

export type TutorialEventKey = "continue"

export interface TutorialEvent {}

export type TutorialEventListener = CustomEventListener<TutorialEvent, TutorialEventKey>

export class TutorialEventTarget extends CustomEventTarget<TutorialEvent, TutorialEventKey> {}