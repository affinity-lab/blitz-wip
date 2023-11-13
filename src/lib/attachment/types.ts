export type Entity = Record<string, any> & { id: number };
export type Attachment = {
	n: string,    // name
	s: number,    // size
	u: string,    // uuid
	t: string,    // title
	i: boolean,   // is image
	w: number,    // width
	h: number,    // height
	d: string,    // dominant color
	f: "entropy", // focus
	a: boolean    // animated
};

export type TFocus = "entropy"|"left"|"right"
export type Collection = Array<Attachment>;
export type Collections = Record<string, Collection>;
export type CollectionsWithID = Record<number, Collections>
export type AttachmentWithId = Record<number, Attachment | undefined>
export type File = any
