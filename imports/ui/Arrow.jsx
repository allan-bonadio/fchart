// arrows connecting outlets of one tile to inlets of others
// or stubs, if it's not connected yet
// Arrows are drawn with their source tiles.
// arrowObjs are children of their source tileObjs, in .outlets[]
// and they have refs to their outlet/src tileObjs and inlet/dest tileObjs

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
	constructor(fromTileObj, fromTileOutlet, direction) {
		// arrow starts from the outlet of the 'from' tile
		this.fromTileObj = fromTileObj;
		this.fromTileOutlet = fromTileOutlet;
		this.direction = direction;
	
		this.toTileObj = null;
		this.toTileInlet = -1;
		
		// notice this has no coordinates - they all come from the tiles
	}
	
	// attach arrowhead end to tile obj
	attach( toTileObj, toTileInlet) {
		this.toTileObj = toTileObj;
		this.toTileInlet = toTileInlet;
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
		let toTileObj = ao.toTileObj || null;
		let start = fromTileObj.getOutletLoc(ao.fromTileOutlet);
		let end;
		if (toTileObj) {
			end = toTileObj.getInletLoc(0);
			end[0] = end[0] + toTileObj.direction[0];
			end[1] = end[1] + toTileObj.direction[1];
		}
		else {
			end= [start[0] + ao.direction[0] * 55, 
					start[1] + ao.direction[1] * 55];
		}
		let path = `M ${coords(start)} L ${coords(end)}`;
		console.log("path=", path);////
		
		let key = 'a'+ fromTileObj.tileSerial +'_'+ ao.fromTileOutlet;
		return <path className='arrow' d={path} key={key} serial={key}
			marker-end="url(#arrow-head)" style={{visibility: this.props.visibility}} />;
	}


}

export default Arrow;