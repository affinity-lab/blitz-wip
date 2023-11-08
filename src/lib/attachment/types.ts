export type Entity = Record<string, any> & { id: number };
export type Attachment = Record<string, any>;
export type Attachments = Record<string, Array<Attachment>>;
export type File = any