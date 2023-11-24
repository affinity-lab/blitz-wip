import express, {Express, NextFunction, Request, Response} from "express";
import * as fs from "fs";
import path from "path";
import sharp from "sharp";

export function imgRoute(
	exp: Express,
	endpoint: string,
	imgStoragePath: string,
	fileStoragePath: string,
	maxAge: string | number
): void {
	exp.use(
		endpoint + "/:name/:id/:size/:uid/:ext/:file",
		(req: Request, res: Response, next: NextFunction): void => {
			req.url = `//${req.params.uid}.${req.params.size}${path.extname(req.params.file)}`;
			res.getHeader("Cache-Control") === undefined && res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
			next();
		},
		express.static(imgStoragePath),
		imgNotFoundMiddleware(fileStoragePath, imgStoragePath),
		(req: Request, res: Response): void => {
			res.removeHeader("Cache-Control");
			res.sendStatus(404);
		}
	);
}


export function imgNotFoundMiddleware(fileStoragePath: string, imgStoragePath: string) {
	return async (req: Request, res: Response): Promise<void> => {
		let b36: string = parseInt(req.params.id).toString(36).padStart(6, "0");
		const originalFileName = req.params["file"].split(".").slice(0, -1).join(".") + `.${req.params.ext}`;
		const inp: string = `/${req.params.name}/${b36.slice(0, 2)}/${b36.slice(2, 4)}/${b36.slice(4, 6)}/${originalFileName}`;
		if (fs.existsSync(path.resolve(fileStoragePath, inp))) {
			res.sendStatus(404);
			return;
		}
		sharp.cache({files: 0});
		let img: sharp.Sharp = sharp(fileStoragePath + inp);
		let meta = await Promise.all([img.metadata(), img.stats()])
								.then((res: [sharp.Metadata, sharp.Stats]) => ({meta: res[0], stats: res[1]}));

		const size = req.params.size.split("x");
		let oWidth: number = meta.meta.width!;
		let oHeight: number = meta.meta.height!;

		let width: number = parseInt(size[0]);
		let height: number = parseInt(size[1]);
		width = (width === 0) ? oWidth : width;
		height = (height === 0) ? oHeight : height;

		if (oWidth < width) {
			height = Math.floor(height * oWidth / width);
			width = oWidth;
		}
		if (oHeight < height) {
			width = Math.floor(width * oHeight / height);
			height = oHeight;
		}

		const focus = req.params.focus !== undefined ? req.params.focus : "entropy";

		await sharp(fileStoragePath + inp, {animated: true})
			.resize(width, height, {
				kernel: sharp.kernel.lanczos3,
				fit: "cover",
				position: focus,
				withoutEnlargement: true
			})
			.toFile(imgStoragePath + "/" + req.url);
		res.sendFile(path.resolve(imgStoragePath + "/" + req.url));
	};
}
