export interface CorrectFileMessage {
    readonly message: string
    readonly model_size: Array<Array<number>>
}
export function isCorrectFileMessage(obj: any): obj is CorrectFileMessage {
    return obj !== undefined && obj.message !== undefined && obj.model_size !== undefined;
}

export interface ErrorFileMessage {
    readonly error: string
}
export function isErrorFileMessage(obj: any): obj is ErrorFileMessage {
    return obj !== undefined && obj.error !== undefined;
}

export type FileMessageResponse = CorrectFileMessage | ErrorFileMessage;