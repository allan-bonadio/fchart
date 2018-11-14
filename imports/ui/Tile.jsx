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
	
	// make new identical tileObj from old
	clone() {
		let cl = newTileObj(this.type, this.x, this.y, this.visible);
		cl.inlets = this.inlets;
		cl.outlets = this.outlets;
		return cl;
	}
}

class beginTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [new arrowObj(this, 0, [1,0])];
	}

	render(mouseDownEvt, visibility, arrowVisibility) {
		// I used to wrap these in <g elements but the arrow calculations made that confusing
		// cuz arrows started in one <g and ended in a different <g.
		// So everything is in Editor-relative coords.
		return <>
			<ellipse className='begin'  serial={'t'+ this.tileSerial} key={'t'+ this.tileSerial} 
					cx={this.x} cy={this.y} 
					rx={w12} ry={h12}
					onMouseDown={mouseDownEvt} style={{visibility}}  />
			<Arrow arrowObj={this.outlets[0]} visibility={arrowVisibility} />
		</>;
	}
	
	getOutletLoc(outlet) {
		if (outlet != 0)
			throw "bad outlet for begin tile";
		return [this.x + w12, this.y];
	}
}

class endTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [];  // no outlets, this is the end state
	}

	render(mouseDownEvt, visibility, arrowVisibility) {
		return <ellipse className='end'  serial={'t'+ this.tileSerial} key={'t'+ this.tileSerial} 
				cx={this.x} cy={this.y} 
				rx={w12} ry={h12}
				onMouseDown={mouseDownEvt} style={{visibility}} />
	}
	
	getInletLoc(inletNum) {
		return [this.x, this.y - h12];
	}
}

class statementTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [new arrowObj(this, 0, [0,1])];
	}

	render(mouseDownEvt, visibility, arrowVisibility) {
		return <>
			<rect className='statement'  serial={'t'+ this.tileSerial} key={'t'+ this.tileSerial} 
					x={this.x - w12} y={this.y - h12} width={w1} height={h1} 
					onMouseDown={mouseDownEvt} style={{visibility}} />
			<Arrow arrowObj={this.outlets[0]} visibility={arrowVisibility} />
		</>;
	}
	
	getInletLoc(inletNum) {
		return [this.x, this.y - h12];
	}
	
	getOutletLoc(outletNum) {
		if (outletNum != 0)
			throw "bad outlet for stmt tile";
		return [this.x, this.y + h12];
	}
}

class conditionalTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [new arrowObj(this, 0, [-1,0]), new arrowObj(this, 1, [1,0])];
	}

	render(mouseDownEvt, visibility, arrowVisibility) {
		let x = this.x, y = this.y;
		// starting at the top...
		let corners = `${x},${y-h12} ${x+w12},${y} ${x},${y+h12} ${x-w12},${y}`;
		return <>
			<polygon className='conditional' serial={'t'+ this.tileSerial} key={'t'+ this.tileSerial} 
					points={corners} 
					onMouseDown={mouseDownEvt} style={{visibility}} />
			<Arrow arrowObj={this.outlets[0]} visibility={arrowVisibility} />
			<Arrow arrowObj={this.outlets[1]} visibility={arrowVisibility} />
		</>;
	}

	getInletLoc(inletNum) {
		return [this.x + w12, this.y - h12];	
	}
	
	getOutletLoc(outletNum) {
		if (outletNum < 0 || outletNum >= 2)
			throw "bad outlet for conditional tile";
		return [this.x - w12 + outletNum * w1, this.y];
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
		let p = this.props;
		console.info("render tile %s %o", p.tileObj.proto ? 'proto' : '', p.tileObj);////
		let tob = p.tileObj;
////		let x = p.x || tob.x;
////		let y = p.y || tob.y;
		
		// the x and y passed in  are for the center of the tile, not any corner
		////let txform = `translate(${x - w12},${y - h12})`
		let visibility = tob.visible ? 'visible' : 'hidden';
		let arrowVisibility = (tob.proto || tob.ghost) ? 'hidden' : visibility;

		return tob.render(this.mouseDownEvt, visibility, arrowVisibility);
	}



	/* ************************************************************ dragging tile */
	
	// the other mouse events are handled at the Editor layer.  Including most of mousedown anyway.
	mouseDownEvt(ev) {
		// the callback needs x and y of the click, relative to the center of the tile
		let bounds = ev.currentTarget.getBoundingClientRect();
		this.props.mouseDownCallback(this, this.props.tileObj, ev, 
			ev.clientX - (bounds.left + bounds.right) / 2, 
			ev.clientY - (bounds.top + bounds.bottom) / 2);
	}

}

export default Tile;
