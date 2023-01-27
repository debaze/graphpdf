# GraphPDF





###### *Graph library for PDF templates. Supports pie charts, bar charts and line charts.*





## Overview

The library is made for JavaScript 1.7 because this is the most recent version supported by the PDF on which I worked.  
Make sure to include the [`graphpdf.js`](https://github.com/matteokeole/graphpdf/blob/master/graphpdf.js) file before the scripts that depend on it.  

> @todo: Replace this file by the minified variant

You can create a graph by instanciating a `Diagram` subclass. After its creation, the graph will be rendered on a canvas element, which can then be added to the page.

```js
const chart = new PieChart({
	data: {...}, // The data to display
	diagram: {...}, // Canvas options
	legend: {...}, // Legend options
	colors: [...], // Replacement colors (optional)
});

document.body.appendChild(chart.canvas);
```

### Generic options

These options apply to all types of graphs.

`diagram.id: ?String` – Optional ID which will be assigned to the graph canvas. *Defaults to `null`.*

`diagram.x: Number` – Graph X offset from the top of the canvas. *Defaults to 0.*

`legend: any` – Legend options. If you want the legend to be shown without giving any options, set it to `true`. If you want to customize the way the legend renders, use the options below in an object. *Defaults to `false`.*

`legend.x: Number` – Determines the legend X offset from its determined position (calculated when rendering the graph). *Defaults to 0.*

`legend.y: Number` – Determines the legend X offset from its determined position (calculated when rendering the graph). *Defaults to 0.*

`colors: Array` – See Colors section below. *Defaults to `[]`.*

### Colors

The library has a built-in list of 18 Material Design colors used as defaults for the chart rows. If you want to use custom colors instead, add them to the `colors` option when creating the graph:
```js
colors: [
	"#ff9800",
	"#de1818",
],
```
This will replace the first 2 default colors with these custom ones. You can add as many colors as you want.





## Diagrams





### `PieChart`
A camembert-shaped diagram. [Example](https://github.com/matteokeole/graphpdf/blob/master/examples/piechart.html)

#### Data structure
```json
{
	"Bread": 0.055,
	"Cereals": 0.117,
	"Fish": 0.279,
	"Fruits": 0.106,
	"Meat": 0.314,
	"Rice": 0.025,
	"Vegetables": 0.105
}
```
Note 1: A row occupying 0% of the pie is still showed in the legend.  
Note 2: The pie sections are drawed in the same order as the data object, so if the sum of the rows is greater than 1, the remaining rows won't be drawed (they will still be showed in the legend though).

#### Options

`diagram.rad: Number` – Pie radius. No default, but 150 is a great radius for a PDF template. If the legend is shown, make sure to shift it to the right to not override the pie.

`legend.percentages: ?Boolean` – If `true`, displays row percentages in the legend. Defaults to `null`.





***





### `Bar chart`

Bar charts can map each data row to either a single bar ([example](https://github.com/matteokeole/graphpdf/blob/master/examples/barchart.html)) or multiple bars ([example](https://github.com/matteokeole/graphpdf/blob/master/examples/barchart2.html)).

#### Data structure (single)

```json
{
	"Python": 30,
	"JavaScript": 18.5,
	"Go": 17.9,
	"TypeScript": 17,
	"Rust": 14.6,
	"Kotlin": 12.6,
	"Java": 8.8,
	"C++": 8.6,
	"SQL": 8.2,
	"C#": 7.3
}
```

#### Data structure (multiple)

Multiple bar charts can be made by wrapping the data of a row in an object with the display name of that row. The legend builder makes a new item when it encounters a new key name, if you want the same data structure per row, make sure each object share the same key names.

```json
{
	"Avatar": {
		"Revenue": 2788,
		"Budget": 237
	},
	"Star Wars: The Force Awakens": {
		"I am your father": true, // This property will only appear on this row and in the legend
		"Revenue": 2068,
		"Budget": 245
	},
	"Titanic": {
		"Revenue": 1845,
		"Budget": 200
	}
}
```

Note 1: The first column number will be clipped by the canvas left border. You can adjust the diagram X axis to fix that.  
Note 2: On a chart where the legend is shown and the `diagram.indicators` option is `true`, if a bar has the max possible length, its indicator will be rendered below the legend.
Note 3: the legend can't be moved.

#### Options

`diagram.grid.rows: Number` – Number of rows in the chart. *Defaults to 0.*

`diagram.grid.columns: Number` – Number of columns in the chart. *Defaults to 0.*

`diagram.indicators: ?Boolean` – If `true`, displays row values at the end of each bar. *Defaults to `null`.*





***





### `LineChart`

A diagram that uses a serie of points to display data. [Example](https://github.com/matteokeole/graphpdf/blob/master/examples/linechart.html)

#### Data structure

```json
{
	"inner_data": {
		"2003": {
			"Burglary": 3400,
			"Car theft": 2800,
			"Robbery (theft from the person)": 600
		},
		"2004": {
			"Burglary": 3800,
			"Car theft": 2850,
			"Robbery (theft from the person)": 800
		},
		"2005": {
			"Burglary": 3100,
			"Car theft": 2750,
			"Robbery (theft from the person)": 900
		}
	}
}
```

Note: This structure must have a parent key before being provided to the chart. In this example the key is `inner_data`.





***





https://github.com/keole/sf_oxygene_repit/blob/ff5b4b4906c64f5b65a20584afcec58d73eab884/templates/back/report/diagram.html.twig

> @todo: Finish BarChart/LineChart  
> @todo: Issue: constant modifier (e.g. PDF_WIDTH)  
> @todo: Add minified variant