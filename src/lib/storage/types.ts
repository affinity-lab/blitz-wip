export type Attachment = {
	name: string
	size: number
	metadata: Record<string, any>
}

export type Attachments = Array<Attachment>;

export type AttachmentRecord = {
	id: number
	name: string
	itemId: number
	data: string
}

export type TmpFile = {
	file: string
	release: () => void | Promise<void>
}

export type Rules = {
	size: number,
	limit: number,
	ext?: string | Array<string>,
}