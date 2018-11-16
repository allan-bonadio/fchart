// arrows connecting outlets of one tile to inlets of others
// or stubs, if it's not connected yet
// Arrows are drawn with their source tiles.
// arrowObjs are children of their source tileObjs, in .outlets[]
// and they have refs to their outlet/src tileObjs and inlet/dest tileObjs

import React, { Component } from 'react';

import config from './config';
import Tile, {tileObj} from './Tile';
import Editor from './Editor';

////// line them up along the middle
////let w1 = config.ArrowBarWidth;
////let w12 = config.ArrowBarWidth / 2;

// describes an arrow, soon to be a Arrow component
export class arrowObj {
	// create the info needed for an arrow component, from 'src' tile
	// initially unattached.  direction = [dx, dy]
	// [1,0]=right, [0, 1] means Bottom, [-1,0]=left
	constructor(fromTileObj, fromTileOutlet, direction) {
		// arrow starts from the outlet of the 'from' tile
		this.fromTileSerial = fromTileObj.tileSerial;
		this.fromTileOutlet = fromTileOutlet;
		this.direction = direction;  // only used when arrow is unattached to draw stub
	
		this.toTileSerial = null;
		this.toTileInlet = -1;
		this.arrowSerial = 'a'+ fromTileObj.tileSerial +'_'+ fromTileOutlet;
		// notice this has no coordinates - they all come from the tiles
		// also no refs to tiles - only serials.
	}
	
	// attach arrowhead end to tile obj
	attach(toTileObj, toTileInlet) {
		this.toTileSerial = toTileObj.tileSerial;
		this.toTileInlet = toTileInlet;
	}
	
	// recreate so react redraws it - used in tile ghost.  this=src tileObj original
	cloneForGhost(ghostTileObj) {
		return new arrowObj(ghostTileObj, 
				this.fromTileOutlet, this.direction);
	}

	// do a clone of this arrow while arrowhead draggin
	cloneForDragging(sourceTileObj) {
		return new arrowObj(sourceTileObj, 
				this.fromTileOutlet, this.direction);
	}
}

function coords(ar) {
	return ar[0] +','+ ar[1];
}

// each box/diamond on the flowchart is a 'Arrow'.  Also on the ArrowBar
class Arrow extends Component {
	constructor(props) {
		super(props);
		
		if (! props.arrowObj)
			debugger;////
		this.arrowClickEvt = this.arrowClickEvt.bind(this);
	}
	
	render() {
		let ao = this.props.arrowObj;
		let fromTileObj = Editor.getTileObj(ao.fromTileSerial) || Editor.me.state.ghostTileObj;
		let toTileObj = ao.toTileSerial ?  Editor.getTileObj(ao.toTileSerial) : null;
		let start = fromTileObj.getOutletLoc(ao.fromTileOutlet);
		let end;
		if (toTileObj) {
			// a line to the destination.  How to avoid other stuff in the way?!?!?!
			end = toTileObj.getInletLoc(0);
			end[0] = end[0] + toTileObj.direction[0];
			end[1] = end[1] + toTileObj.direction[1];
			if (ao.arrowSerial == 'at0_0')
				console.log("arrow to a tile");////
		}
		else if (ao.dragging) {
			// any location the mouse is at
			end = [ao.dragX, ao.dragY]
			if (ao.arrowSerial == 'at0_0')
				console.log("dragging arrow");////
		}
		else {
			// stubs if they haven't been attached yet
			end= [start[0] + ao.direction[0] * 20, 
					start[1] + ao.direction[1] * 20];
			if (ao.arrowSerial == 'at0_0')
				console.log("arrow stub");////
		}
		let path = `M ${coords(start)} L ${coords(end)}`;
		if (ao.arrowSerial == 'at0_0')
			console.log("arrow %s path=", ao.arrowSerial, path);////
		
		return <path className='arrow' d={path} 
			marker-end="url(#arrow-head)" style={{visibility: fromTileObj.visible ? 'visible' : 'hidden'}}
			key={this.arrowSerial} serial={this.arrowSerial} 
			onMouseDown={this.arrowClickEvt} />;
	}
	
	// click on arrow head drags it to a destination
	arrowClickEvt(ev) {
		if (! this.props.downArrowCallback)
			return;  // ghosts and protos
			
		let ao = this.props.arrowObj;
		console.log("arrow event", ev);

		ao.dragging = true;
		ao.dragX = ev.clientX;
		ao.dragY = ev.clientY;
		this.props.downArrowCallback(this, ao, ev);
	}
}

export default Arrow;