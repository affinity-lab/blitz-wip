export class Point {
	constructor(readonly x: number, readonly y: number) {};
}

export class Dimension {
	constructor(readonly width: number, readonly height: number) {};

	static make(size: {width?: number, height?: number}): Dimension {
		return new Dimension(
			typeof size.width === "number" ? size.width : 0,
			typeof size.height === "number" ? size.height : 0
		);
	};

	contains(size: Dimension): boolean {return this.width >= size.width && this.height >= size.height;};
}

export class Rectangle {
	constructor(readonly position: Point, readonly size: Dimension) {};

	static make(x: number, y: number, x2: number, y2: number) {
		return new Rectangle(new Point(Math.min(x, x2), Math.min(y, y2)), new Dimension(Math.abs(x - x2), Math.abs(y - y2)));
	};

	get bottomLeft(): Point {return this.position;};
	get topLeft(): Point {return new Point(this.position.x, this.position.y + this.size.height);};
	get topRight(): Point {return new Point(this.position.x + this.size.width, this.position.y + this.size.height);};
	get bottomRight(): Point {return new Point(this.position.x + this.size.width, this.position.y);};

	contains(geometry: Point | Rectangle): boolean {
		if (geometry instanceof Point) return geometry.x >= this.bottomLeft.x && geometry.x <= this.bottomRight.x && geometry.y >= this.bottomLeft.y && geometry.y <= this.topLeft.y;
		return this.contains(geometry.bottomLeft) && this.contains(geometry.topLeft) && this.contains(geometry.bottomRight) && this.contains(geometry.topRight);
	};

	overlaps(rect: Rectangle): boolean {
		return (
			this.contains(rect.bottomLeft) ||
			this.contains(rect.topLeft) ||
			this.contains(rect.bottomRight) ||
			this.contains(rect.topRight) ||
			rect.contains(this.bottomLeft) ||
			rect.contains(this.topLeft) ||
			rect.contains(this.bottomRight) ||
			rect.contains(this.topRight)
		);
	};
}
