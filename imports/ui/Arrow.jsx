// the toolbar on the left with prototype Arrows in it, 
// for the user to drag and drop onto the Flowchart

import React, { Component } from 'react';

import config from './config';
import Tile, {tileObj} from './Tile';

////// line them up along the middle
////let w1 = config.ArrowBarWidth;
////let w12 = config.ArrowBarWidth / 2;

// describes an arrow, soon to be a Arrow component
export class arrowObj {
	// create the info needed for an arrow component, from 'src' tile
	// initially unattached.  direction = [dx, dy]
	// [1,0]=right, [0, 1] means Bottom, [-1,0]=left
	constructor(fromTileObj, fromOutlet, direction) {
		// arrow starts from the outlet of the 'from' tile
		this.fromTileObj = fromTileObj;
		this.fromTileOutlet = fromOutlet;
		this.direction = direction;
	
		this.toTileObj = null;
		this.toInlet = -1;
	}
	
	// attach arrowhead end to tile obj
	attach( toTileObj, toInlet) {
		this.toTileObj = toTileObj;
		this.toInlet = toInlet;
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
	}
	
	render() {
		let ao = this.props.arrowObj;
		let fromTileObj = ao.fromTileObj;
		let toTile = ao.toTile || null;
		let start = fromTileObj.getOutletLoc(ao.fromOutlet);
		let end = [fromTileObj.x + ao.direction[0] * 5, fromTileObj.y + ao.direction[1] * 5];
		if (ao.toTile) {
			end = toTile.getInletLoc(0);
			end[0] = end[0] + ao.toTile.direction[0];
			end[1] = end[1] + ao.toTile.direction[1];
		}
		
		let path = `M ${coords(start)} L ${coords(end)}`;
		return <path className='arrow' 
			d={path}
			stroke='#666' />;
	}


}

export default Arrow;