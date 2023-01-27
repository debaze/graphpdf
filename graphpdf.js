/**
 * GraphPDF for JavaScript 1.7
 * 
 * @author matteokeole <matteo@keole.net>
 */

function Diagram(options) {
	const
		canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d");

	canvas.width = PDF_WIDTH;

	// Default context settings
	ctx.fillStyle = ctx.strokeStyle = "#9e9e9e";
	ctx.lineWidth = .5;
	ctx.font = "lighter 14px sans-serif";
	ctx.translate(25, 25);

	this.data = options.data;
	this.entries = Object.keys(this.data);
	this.diagram = options.diagram;
	this.legend = options.legend ? {
		x: options.legend.x ? options.legend.x : 0,
		y: options.legend.y ? options.legend.y : 0,
		percentages: options.legend.percentages,
	} : false;
	this.colors = (options.colors ? options.colors : []).concat(COLORS);
	this.canvas = canvas;
	this.ctx = ctx;

	this.diagram.id && (canvas.id = this.diagram.id);
}

function PieChart() {
	Diagram.call(this, arguments[0]);

	const
		ctx = this.ctx,
		data = this.data,
		legend = this.legend,
		rad = this.diagram.rad;
	var i, j, A;
	j = A = 0;

	this.canvas.height = (BORDER_OFFSET + rad) * 2;

	ctx.translate(this.diagram.x, 0);

	// Diagram fill
	{
		ctx.globalCompositeOperation = "destination-over";
		ctx.translate(rad, rad);

		for (i in data) {
			if (data[i]) {
				A += data[i] * Math.PI * 2;

				ctx.fillStyle = this.colors[j];
				ctx.beginPath();
				ctx.arc(0, 0, rad, 0, A);
				ctx.lineTo(0, 0);
				ctx.fill();
			}

			j++;
		}

		ctx.globalCompositeOperation = "source-over";
		ctx.translate(-rad, -rad);
	}

	// Optional legend
	if (legend) {
		legend.x += rad * 2 + 20;

		Utils.drawLegend(ctx, legend, this.entries, this.colors, data);
	}
};

function BarChart() {
	Diagram.call(this, arguments[0]);

	const
		ctx = this.ctx,
		data = this.data,
		entries = this.entries,
		diagram = this.diagram,
		legend = this.legend,
		grid = diagram.grid,
		max = Utils.getNearest10(data);
	var i = 0, j, k, y = 0, dw, dh, lh = 20, entry = Object.values(data)[0];

	if (typeof entry === "object") {
		if (entry.constructor.name !== "Array") entry = Object.keys(entry);
	} else entry = [entry];

	grid.rows === "auto" && (grid.rows = entries.length + 1);
	grid.cols === "auto" && (grid.cols = AUTO_COLUMNS);

	dw = PDF_WIDTH * (3 / 5);
	dh = entries.length * (entry.length + 1) * lh;

	this.canvas.height = dh + BORDER_OFFSET * 2;

	ctx.translate(diagram.x, 0);

	diagram.width = dw;
	diagram.height = dh;

	Utils.drawGrid(ctx, diagram, max);

	// Diagram fill
	{
		ctx.font = "lighter 14px sans-serif";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";

		k = 0;

		for (i in data) {
			y += lh / 2;

			ctx.fillStyle = "#000";
			ctx.fillText(i, -10, y + (lh * entry.length / 2) + TEXT_OFFSET_Y);

			if (typeof data[i] !== "object") {
				ctx.fillStyle = this.colors[k];
				ctx.fillRect(0, y, data[i] / max * dw, lh);

				if (diagram.indicators && data[i]) {
					ctx.textAlign = "left";
					ctx.fillText(data[i], data[i] / max * dw + 5, y + (lh / 2) + TEXT_OFFSET_Y);
					ctx.textAlign = "right";
				}

				y += lh;
				k++;
			} else {
				k = 0;

				for (j in data[i]) {
					// Draw the line
					ctx.fillStyle = this.colors[k];
					ctx.fillRect(0, y, data[i][j] / max * dw, lh);

					if (diagram.indicators && data[i][j]) {
						ctx.textAlign = "left";
						ctx.fillText(data[i][j], data[i][j] / max * dw + 5, y + (lh / 2) + TEXT_OFFSET_Y);
						ctx.textAlign = "right";
					}

					k++;
					y += lh;
				}
			}

			y += lh / 2;
		}
	}

	// Optional legend
	if (legend) {
		legend.x += dw + 10;

		Utils.drawLegend(ctx, legend, entry.length > 1 ? entry : entries, this.colors);
	}
}

function LineChart() {
	Diagram.call(this, arguments[0]);

	const
		ctx = this.ctx,
		data = this.data,
		entries = this.entries,
		diagram = this.diagram,
		grid = diagram.grid,
		legend = this.legend,
		O = [diagram.x, 25],
		max = Utils.getNearest10(data),
		lines = {};
		var i, j, k, x, y, dw, dh, row;

	grid.rows === "auto" && (grid.rows = AUTO_ROWS);
	grid.cols === "auto" && (grid.cols = Object.values(data).map(function(entry) {
		return Object.keys(entry).length;
	}).sum() - 1);

	dw = PDF_WIDTH * (3 / 5);
	dh = 250;
	diagram.width = dw;
	diagram.height = dh;
	this.canvas.height = dh + 50 + (entries.length === 1 ? 0 : 20);

	ctx.translate(O[0], O[1]);

	row = Utils.drawLCGrid(ctx, diagram, max, data);

	// Get the line data
	{
		for (i in data) {
			for (j in data[i]) {
				for (k in data[i][j]) {
					lines[k] === undefined && (lines[k] = []);
					lines[k].push(data[i][j][k]);
				}
			}
		}
	}

	// Diagram fill
	{
		k = 0;

		ctx.lineWidth = 2;

		for (i in lines) {
			x = 0;
			y = (1 - lines[i][0] / max) * dh;

			ctx.strokeStyle = this.colors[k];

			ctx.beginPath();
			ctx.moveTo(x, y);
			if (lines[i].length === 1) ctx.lineTo(dw, y);
			else for (j = 1; j < lines[i].length; j++) {
				x += row;
				y = (1 - lines[i][j] / max) * dh;

				ctx.lineTo(x, y);
			}
			ctx.stroke();

			k++;
		}
	}

	// Optional legend
	if (legend) {
		legend.x += dw + 10;

		Utils.drawLegend(ctx, legend, Object.keys(lines), this.colors);
	}
}

const
	PDF_WIDTH = 880,
	AUTO_ROWS = 6,
	AUTO_COLUMNS = 6,
	BORDER_OFFSET = 25,
	TEXT_OFFSET_Y = 2,
	COLORS = [
		"#2979ff",
		"#ff8a65",
		"#ffd600",
		"#8e24aa",
		"#4caf50",
		"#e64a19",
		"#009688",
		"#1de9b6",
		"#42a5f5",
		"#ef9a9a",
		"#6d4c41",
		"#ffa000",
		"#f06292",
		"#c5cae9",
		"#aed581",
		"#9575cd",
		"#f44336",
		"#607d8b",
	],
	Utils = {
		getNearest10: function(data) {
			var values, jvalues, kvalues, result, i, j, k;
			values = jvalues = kvalues = [];
			i = j = k = 0;

			for (i in data) {
				if (typeof data[i] === "object") {
					if (typeof Object.values(data[i])[0] === "object") {
						for (j in data[i]) {
							if (typeof data[i][j] === "object") {
								for (k in data[i][j]) {
									data[i][j][k] && kvalues.push(data[i][j][k]);
								}

								jvalues = jvalues.concat(kvalues);
							} else jvalues = jvalues.concat([data[i][j]]);
						}

						values = values.concat(jvalues);
					} else values = values.concat(Object.values(data[i]));
				} else values = values.concat([data[i]]);
			}

			result = Math.ceil(Math.max.apply(null, values) / 10) * 10;

			return result === 0 ? 10 : result;
		},
		drawGrid: function(ctx, diagram, max) {
			const
				dw = diagram.width,
				dh = diagram.height,
				grid = diagram.grid,
				rows = grid.rows + 1,
				cols = grid.cols + 1,
				row = dw / (cols - 1),
				col = dh / (rows - 1),
				step = cols - 1;
			var i;

			ctx.fillStyle = ctx.strokeStyle = "#9e9e9e";
			ctx.lineWidth = .5;
			ctx.font = "lighter 12px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "top";

			// Rows
			if (rows > 1) {
				var y = 0;

				ctx.beginPath();
				for (i = 0; i < rows; i++, y += col) {
					ctx.moveTo(0, y);
					ctx.lineTo(dw, y);
				}
				ctx.stroke();
			}

			// Columns
			if (cols > 1) {
				var x = 0;

				ctx.beginPath();
				for (i = 0; i < cols; i++, x += row) {
					ctx.moveTo(x, 0);
					ctx.lineTo(x, dh);

					ctx.fillText(i / step * max, x, dh + 5);
				}
				ctx.stroke();
			}
		},
		drawLCGrid: function(ctx, diagram, max, data) {
			const
				dw = diagram.width,
				dh = diagram.height,
				grid = diagram.grid,
				truncate = grid.truncate,
				rows = grid.rows,
				cols = grid.cols,
				row = dw / cols,
				col = dh / rows;
			var i, j, text;

			var values = Object.values(data);
			var keys = Object.keys(data);

			ctx.fillStyle = ctx.strokeStyle = "#9e9e9e";
			ctx.lineWidth = .5;
			ctx.font = "lighter 12px sans-serif";
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";

			// Rows
			if (rows) {
				var y = col * rows;

				ctx.beginPath();
				for (i = 0; i <= rows; i++, y -= col) {
					ctx.moveTo(0, y);
					ctx.lineTo(dw, y);

					i && ctx.fillText(i / rows * max, -5, y + 2);
				}
				ctx.stroke();
			}

			ctx.textAlign = "center";
			ctx.textBaseline = "top";

			// Columns
			if (keys.length === 1) {
				// Month scope
				var months = Object.keys(values[0]);

				if (months.length === 1) {
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(0, dh);
					ctx.moveTo(dw, 0);
					ctx.lineTo(dw, dh);
					ctx.stroke();
	
					ctx.fillText(months[0], dw / 2, dh + 5);
				} else if (cols) {
					var x = 0;
	
					ctx.beginPath();
					for (i = 0; i <= cols; i++, x += row) {
						ctx.moveTo(x, 0);
						ctx.lineTo(x, dh);
	
						text = months[i];
						truncate && (text = text.slice(0, truncate));
						ctx.fillText(text, x, dh + 5);
					}
					ctx.stroke();
				}
			} else {
				// Year scope
				var x = 0, months;

				const years = keys;

				ctx.beginPath();
				for (i = 0; i < years.length; i++) {
					months = Object.keys(data[keys[i]]);

					months[0] === "Janvier" && ctx.fillText(years[i], x, dh + 20);

					for (j = 0; j < months.length; j++, x += row) {
						ctx.moveTo(x, 0);
						ctx.lineTo(x, dh);

						text = months[j];
						truncate && (text = text.slice(0, truncate));
						ctx.fillText(text, x, dh + 5);
					}
				}
				ctx.stroke();
			}

			return row;
		},
		drawLegend: function(ctx, legend, entries, colors, percents) {
			const
				ox = legend.x,
				oy = legend.y,
				rw = 50,
				rh = 20;
			var y, i, entry;
			y = i = 0;

			ctx.font = "lighter 14px sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";

			ctx.translate(ox, oy);

			for (; i < entries.length; i++, y += rh + 10) {
				ctx.fillStyle = colors[i];
				ctx.fillRect(0, y, rw, rh);

				entry = entries[i];
				legend.percentages && (entry += " (" + Math.floor(percents[entries[i]] * 1000) / 10 + "%)");

				ctx.fillStyle = "#000";
				ctx.fillText(entry, rw + 7, y + rh / 2 + TEXT_OFFSET_Y);
			}
		},
	};

/**
 * Array.prototype.map polyfill.
 * 
 * @see {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/map}
 * @param {function} callback The modifier called for each item
 * @returns {array}
 */
Array.prototype.map = function(callback) {
	const mapped = [], length = this.length;
	var i = 0;

	for (; i < length; i++) mapped[i] = callback(this[i], i, this);

	return mapped;
};

/**
 * Array.prototype.sum polyfill.
 * 
 * @returns {number}
 */
Array.prototype.sum = function() {
	const length = this.length;
	var sum, i;
	sum = i = 0;

	for (; i < length; i++) sum += this[i];

	return sum;
};

/**
 * Object.values polyfill.
 * 
 * @see {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/values}
 * @param {object} object The object to extract values from
 * @returns {array}
 */
Object.values = function(object) {
	const result = [];
	var i;

	for (i in object) result.push(object[i]);

	return result;
};