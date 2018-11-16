import React, { Component } from 'react';

////import SVG from 'SVG.js';

import config from './config';
import Arrow, {arrowObj} from './Arrow';
import Editor from './Editor';

// we'll need these doing the geometry
let w1 = config.tileWidth, h1 = config.tileHeight;
let w12 = config.tileWidth / 2, h12 = config.tileHeight / 2;
////let h18 = config.tileHeight / 8, h78 = 7 * config.tileHeight / 8;

// give each tile a unique ID
let tileSerial = 0;

/* ************************************************************************ tile object */
// this is the obj form of a tile, saved in the tiles list in the state
// do not confuse the tileObj, here, with the Tile component, and the nodes inside
export function newTileObj(type, x, y, visible = true, proto = false, ghost = false) {
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
		[this.type, this.x, this.y, this.visible, this.proto, this.ghost] = args;
		if (this.ghost)
			this.tileSerial = 'ghost';  // constantly created and destroyed; don't spend all your serials
		else
			this.tileSerial =  't'+ tileSerial++;
		
		this.inlets = [];  // no arrows pointing in yet.  Outlets handled by subclass.
	}
	
	// call to add tileObj to the flowchart list.  Not for ghosts or protos.
	add() {
		Editor.addTile(this);
		return this;  // chain it!
	}
	
	// abstract method
	getInletLoc() {
		throw "no tile inlets";
	}
	
	// abstract method
	getOutletLoc() {
		throw "no tile outlets";
	}
	
	render() {
		throw "cannot render undefined tile type";
	}
	
	// render however many arrows; pass me tileObj.outlets
	// used for all tileObj types
	renderArrows(outlets, downArrowCallback) {
		return outlets.map(arrow => 
			<Arrow arrowObj={arrow} downArrowCallback={downArrowCallback} />
		);
	}
	
	// make new identical flowchart tileObj from old, different obj so react notices
	// do not use on ghosts or protos (?) used to make final tileObj upon mouseup
	cloneAt(newX, newY) {
		let cl = newTileObj(this.type, newX, newY, this.visible, false, false);
		cl.tileSerial = this.tileSerial;  // was ghost cuz we tricked it
		cl.inlets = this.inlets////.map(inlet => inlet.clone());
		cl.outlets = this.outlets////.map(outlet => outlet.clone());
		console.log("    cloning %o to %o", this, cl);
		return cl;
	}

	// make new identical flowchart tileObj from old, different obj so react notices
	// this is for replicating the tile during arrow dragging
	cloneForArrow() {
		let cl = newTileObj(this.type, this.x, this.y, this.visible, false, true);
		cl.ghost = false;  // was ghost cuz we didn't want a new serial
		cl.tileSerial = this.tileSerial;
		cl.inlets = this.inlets.map(inlet => inlet.cloneForDragging(cl));
		cl.outlets = this.outlets.map(outlet => outlet.cloneForDragging(cl));
		console.log("    cloning %o to %o", this, cl);
		return cl;
	}
}

// for the Begin oval
class beginTileObj extends tileObj {
	constructor(args) {
		super(args);
		if (this.ghost || this.proto)
			this.outlets = [];
		else
			this.outlets = [new arrowObj(this, 0, [1,0])];
	}

	render(mouseDownEvt, visibility, downArrowCallback) {
		// I used to wrap these in <g elements but the arrow calculations made that confusing
		// cuz arrows started in one <g and ended in a different <g.
		// So everything is in Editor-relative coords.
		return <>
			<ellipse className='begin'  
					serial={this.tileSerial} key={this.tileSerial} 
					cx={this.x} cy={this.y} 
					rx={w12} ry={h12}
					onMouseDown={mouseDownEvt} style={{visibility}}  />
			{super.renderArrows(this.outlets, downArrowCallback)}
		</>;
	}
	
	getOutletLoc(outlet) {
		if (outlet != 0)
			throw "bad outlet for begin tile";
		return [this.x + w12, this.y];
	}
}

// for the End oval
class endTileObj extends tileObj {
	constructor(args) {
		super(args);
		this.outlets = [];  // no outlets, this is the end state
	}

	render(mouseDownEvt, visibility) {
		return <ellipse className='end'  
				serial={this.tileSerial} key={this.tileSerial} 
				cx={this.x} cy={this.y} 
				rx={w12} ry={h12}
				onMouseDown={mouseDownEvt} style={{visibility}} />;
		// has no outlets
	}
	
	getInletLoc(inletNum) {
		return [this.x, this.y - h12];
	}
}

// for the Statement rectangle
class statementTileObj extends tileObj {
	constructor(args) {
		super(args);
		if (this.ghost || this.proto)
			this.outlets = [];
		else
			this.outlets = [new arrowObj(this, 0, [0,1])];
	}

	render(mouseDownEvt, visibility, downArrowCallback) {
		return <>
			<rect className='statement'  
					serial={this.tileSerial} key={this.tileSerial} 
					x={this.x - w12} y={this.y - h12} width={w1} height={h1} 
					onMouseDown={mouseDownEvt} style={{visibility}} />
			{super.renderArrows(this.outlets, downArrowCallback)}
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

// for the Conditional diamond shape
class conditionalTileObj extends tileObj {
	constructor(args) {
		super(args);
		if (this.ghost || this.proto)
			this.outlets = [];
		else
			this.outlets = [new arrowObj(this, 0, [-1,0]), new arrowObj(this, 1, [1,0])];
	}

	render(mouseDownEvt, visibility, downArrowCallback) {
		let x = this.x, y = this.y;
		// starting at the top...
		let corners = `${x},${y-h12} ${x+w12},${y} ${x},${y+h12} ${x-w12},${y}`;
		return <>
			<polygon className='conditional' 
					serial={this.tileSerial} key={this.tileSerial} 
					points={corners} 
					onMouseDown={mouseDownEvt} style={{visibility}} />
			{super.renderArrows(this.outlets, downArrowCallback)}
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
////		console.info("render tile %s %o", 
////				p.tileObj.proto ? 'proto' : p.tileObj.ghost ? 'ghost' : p.tileObj.tileSerial, 
////				p.tileObj);////
		let tob = p.tileObj;
////		let x = p.x || tob.x;
////		let y = p.y || tob.y;
		
		// the x and y passed in  are for the center of the tile, not any corner
		////let txform = `translate(${x - w12},${y - h12})`
		let visibility = tob.visible ? 'visible' : 'hidden';

		return tob.render(this.mouseDownEvt, visibility, this.props.downArrowCallback);
	}



	/* ************************************************************ dragging tile */
	
	// the other mouse events are handled at the Editor layer.  Including most of mousedown anyway.
	mouseDownEvt(ev) {
		// the callback needs x and y of the click, relative to the center of the tile
		let bounds = ev.currentTarget.getBoundingClientRect();
		this.props.downTileCallback(this, this.props.tileObj, ev, 
			ev.clientX - (bounds.left + bounds.right) / 2, 
			ev.clientY - (bounds.top + bounds.bottom) / 2);
	}

}

export default Tile;
