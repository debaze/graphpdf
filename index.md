# GraphPDF





###### *Diagram library for PDF templates. Supports pie charts, bar charts and line charts.*





## Overview

The library is built for JavaScript 1.7, because PDF templates don't always support the lastest JS version.  
Upon creation, a diagram will be rendered **once** on its canvas.  
All featured diagrams support a legend.  





## Prerequisites

First, include the [`graphpdf.js`](https://github.com/matteokeole/graphpdf/blob/master/graphpdf.js) script before the scripts that use it.  
To create a new diagram, instantiate one of the `Diagram` subclasses:
```js
const diagram = new PieChart({
	// options...
});

// `diagram` has now a canvas node which can be added to the DOM
document.body.appendChild(diagram.canvas);
```





## Generic options

`diagram.id: ?String` – n





## Diagrams





### `PieChart`
A camembert-shaped diagram.

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

`diagram.rad: Number` – Pie radius. No defaults, but 150 is a great radius for a PDF template. If the legend is shown, make sure to shift it to the right to not override the pie.

`legend.percentages: ?Boolean` – If `true`, displays row percentages in the legend. Defaults to `null`.





***





### `Bar chart`

#### Data structure

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

Note 1: The first column number will be clipped by the canvas left border. You can adjust the diagram X axis to fix that.  
Note 2: On a chart where the legend is shown and the `diagram.indicators` option is `true`, if a bar has the max possible length, its indicator will be rendered below the legend.
Note 3: the legend can't be moved.

#### Options

`diagram.grid.rows: Number` – Number of rows in the chart. Defaults to 0.

`diagram.grid.columns: Number` – Number of columns in the chart. Defaults to 0.

`diagram.indicators: ?Boolean` – If `true`, displays row values right to each bar. Defaults to `null`.





***





### `LineChart`

#### Data structure

```json
{
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
```

Note: each entry must have the same sub-entry names.

https://github.com/keole/sf_oxygene_repit/blob/ff5b4b4906c64f5b65a20584afcec58d73eab884/templates/back/report/diagram.html.twig

> @todo: margin doc  
@todo: diagram doc  
@todo: legend doc  
@todo: material color doc  
@todo: make notes as gh issues
@todo: minified variant