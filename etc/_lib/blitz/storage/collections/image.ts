import {Collection} from "../collection";
import {ImgFocus, ImgRGB, Rules} from "../types";
import TmpFile from "../../../util/tmp-file";
import {FileDescriptor} from "../../../util/file-descriptor";
import MySqlRepository from "../../repository/my-sql-repository";

export class ImageCollection extends Collection<{
	title: string,
	width: string,
	height: string,
	color: ImgRGB,
	animated: boolean,
	focus: ImgFocus
}> {

	static factory(repository: MySqlRepository, name: string, rules: Rules) {
		return new ImageCollection(
			repository.name + name,
			repository.eventEmitter,
			repository,
			repository.collectionStorage!,
			rules
		);
	}

	protected async prepareFile(file: TmpFile): Promise<{ file: TmpFile; metadata: Record<string, any> }> {
		const descriptor = new FileDescriptor(file.file);
		let img = await descriptor.image;
		return {
			file, metadata: {
				width: img?.meta.width,
				height: img?.meta.height,
				color: img?.stats.dominant,
				animated: (img?.meta.pages) ? img.meta.pages > 1 : false,
				focus: "entropy"
			}
		};
	}
	async setTitle(id: number, filename: string, title: string) {
		await this.updateMetadata(id, filename, {title});
	}
}