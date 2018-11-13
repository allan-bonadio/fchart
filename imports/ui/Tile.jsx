import React, { Component } from 'react';

////import SVG from 'SVG.js';

import config from './config';
import Arrow, {arrowObj} from './Arrow';


// we'll need these doing the geometry
let w1 = config.tileWidth, h1 = config.tileHeight;
let w12 = config.tileWidth / 2, h12 = config.tileHeight / 2;
////let h18 = config.tileHeight / 8, h78 = 7 * config.tileHeight / 8;

// give each tile a unique ID
let tileSerial = 0;

/* ************************************************************************ tile object */
// this is the obj form of a tile, saved in the tiles list in the state
// do not confuse the tileObj, here, with the Tile component, and the nodes inside
export function newTileObj(type, x, y, visible = true) {
	let th;
	switch (type) {
	case 'begin': return new beginTileObj(arguments);
	case 'end': return new endTileObj(arguments);
	case 'statement': return new statementTileObj(arguments);
	case 'conditional': return new conditionalTileObj(arguments);
	default: throw "bad tileObj constructor type";
	}
}

export class tileObj {
	constructor(args) {
		[this.type, this.x, this.y, this.visible] = args;
		this.tileSerial =  tileSerial++;
		if (this.visible === undefined)
			this.visible = true;
		
		this.inlets = [];  // no arrows pointing in yet
	}
	
	getInletLoc() {
		throw "no tile inlets";
	}
	
	getOutletLoc() {
		throw "no tile outlets";
	}
	
	render() {
		throw "cannot render undefined tile type";
	}
}

class beginTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [new arrowObj(this, 0, [1,0])];
	}

	render(mouseDownEvt) {
		return <>
			<ellipse cx={w12} cy={h12} 
					rx={w12} ry={h12}
					onMouseDown={mouseDownEvt}  />
			<Arrow arrowObj={this.outlets[0]} />
		</>;
	}
	
	getOutletLoc(outletNum) {
		if (outletNum != 0)
			throw "bad outletNum for tile outlet";
		return [this.x + w1, this.y + h12];
	}
}

class endTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [];  // no outlets, this is the end state
	}

	render(mouseDownEvt) {
		return <>
			<ellipse cx={w12} cy={h12} 
					rx={w12} ry={h12}
					onMouseDown={mouseDownEvt}  />
		</>;
	}
	
	getInletLoc(inletNum) {
		return [this.x, this.y + h12];
	}
}

class statementTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [new arrowObj(this, 0, [0,1])];
	}

	render(mouseDownEvt) {
		return <>
			<rect x='0' y='0' width={config.tileWidth} height={config.tileHeight} 
					onMouseDown={mouseDownEvt}  />
			<Arrow arrowObj={this.outlets[0]} />
		</>;
	}
	
	getInletLoc(inletNum) {
		return [this.x, this.y + h12];
	}
	
	getOutletLoc(outletNum) {
		if (outletNum != 0)
			throw "bad outletNum for tile outlet";
		return [this.x + w1, this.y + h12];
	}
}

class conditionalTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [new arrowObj(this, 0, [-1,0]), new arrowObj(this, 1, [1,0])];
	}

	render(mouseDownEvt) {
		let corners = `0,${h12} ${w12},0 ${w1},${h12} ${w12},${h1}`;
		return <>
			<polygon points={corners} 
					onMouseDown={mouseDownEvt} />
			<Arrow arrowObj={this.outlets[0]} />
			<Arrow arrowObj={this.outlets[1]} />
		</>;
	}

	getInletLoc(inletNum) {
		return [this.x + w12, this.y];	
	}
	
	getOutletLoc(outletNum) {
		if (outletNum < 0 || outletNum >= 2)
			throw "bad outletNum for tile outlet";
		return [this.x + outletNum * w1, this.y + h12];
	}
}

/* ************************************************************************ tile component */

// each box/diamond on the flowchart is a 'tile'.
class Tile extends Component {
	constructor(props) {
		super(props);
		
		if (! props.tileObj) {
			debugger;
			//throw "Found it!";////
		}
		
		this.mouseDownEvt = this.mouseDownEvt.bind(this);
	}
	
	
	render() {
console.info("render tile");////
		let p = this.props;
		let tob = p.tileObj;
		let x = p.x || tob.x;
		let y = p.y || tob.y;
		
		// the x and y passed in  are for the center of the tile, not any corner
		let txform = `translate(${x - w12},${y - h12})`
		let visibility = tob.visible ? 'visible' : 'hidden';
		
		return <g className={tob.type} transform={txform} 
					serial={tob.tileSerial} key={tob.tileSerial}
					style={{visibility}} >
			{this.props.tileObj.render(this.mouseDownEvt)}
		</g>;
	}



	/* ************************************************************ dragging tile */
	
	// the other mouse events are handled at the Editor layer.  Including most of mousedown anyway.
	mouseDownEvt(ev) {
		let tob = this.props.tileObj;
		
		// the callback needs x and y of the click, relative to the center of the tile
		let bounds = ev.currentTarget.getBoundingClientRect();
		this.props.mouseDownCallback(this, tob, ev, 
			ev.clientX - (bounds.left + bounds.right) / 2, 
			ev.clientY - (bounds.top + bounds.bottom) / 2, 
			this.props.proto);
	}

}

export default Tile;
