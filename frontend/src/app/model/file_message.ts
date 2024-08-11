import { ModelStructure } from "./model";

export interface CorrectFileMessage {
    readonly message: string
    readonly model_size: ModelStructure
}

export interface ErrorFileMessage {
    readonly error: string
}
export function isErrorFileMessage(obj: any): obj is ErrorFileMessage {
    return obj !== undefined && obj.error !== undefined;
}

export interface ExtensionsMessage {
    readonly extension: Array<string>
}