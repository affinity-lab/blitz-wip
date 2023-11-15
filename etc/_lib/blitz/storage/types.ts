export type Attachment = {
	name: string
	size: number
	id: string
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
	filename: string
	release: () => void | Promise<void>
}

export type Rules = {
	size: number,
	limit: number,
	ext?: string | Array<string>,
}

export type ImgDimension = {
	width: number;
	height: number;
}

export type ImgRGB = {
	r: number;
	g: number;
	b: number;
}

export type ImgFocus = "centre" | "top" | "left" | "bottom" | "right" | "entropy" | "attention";