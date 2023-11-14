import {Collection} from "../collection";
import TmpFile from "../../tmp-file";

export class DocumentCollection extends Collection<{ title: string, fityfasz: string }> {
	async setTitle(id: number, filename: string, title: string) {
		await this.updateMetadata(id, filename, {title});
	}
	async setFityfasz(id: number, filename: string, fityfasz: string) {
		await this.updateMetadata(id, filename, {fityfasz});
	}
}


export class ImgCollection extends Collection<{ title: string, fityfasz: string }> {
	protected async prepareFile(file: TmpFile): Promise<{ file: TmpFile; metadata: Record<string, any> }> {
		return {file, metadata:{}};
	}
	async setTitle(id: number, filename: string, title: string) {
		await this.updateMetadata(id, filename, {title});
	}
	async setFityfasz(id: number, filename: string, fityfasz: string) {
		await this.updateMetadata(id, filename, {fityfasz});
	}
}