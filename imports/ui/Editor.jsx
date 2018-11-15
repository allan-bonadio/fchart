import React, { Component } from 'react';

import config from './config';
import Tile, {newTileObj} from './Tile';
import Arrow, {arrowObj} from './Arrow';
import TileBar from './TileBar';
import Flowchart from './Flowchart.jsx';

// not visible.  
function newDummyGhostTile() {
	return newTileObj('begin', 0,  0, false, false, true);
}

// create the initial tileObjs upon startup.  Pass in the Editor instance.
function initialData() {
	// just for testing
	iTiles = [
		newTileObj('begin', 200, 100, true),
		newTileObj('conditional', 400, 100, true),
		newTileObj('statement', 200, 300, true),
		newTileObj('end', 300, 300, true),
	];
	
	// but must be indexed obj
	let tilesStart = {};
	iTiles.forEach(tileObj => tilesStart[tileObj.tileSerial] = tileObj);
	return tilesStart;
}

// the main editing space for constructing a flowchart, including TileBar
class Editor extends Component {
	constructor(props) {
		super(props);
		Editor.me = this;
		
		this.state = {
			// indexed by serial number but not necessarily consecutive
			tileObjs: initialData(),
			
			// non-null iff dragging
			sourceTileObj: null,  // where the mousedown was, won't move during drag
			
			//  invisible unless dragging; follows the mouse.  
			// Just a dummy when not dragging.
			ghostTileObj: newDummyGhostTile(),
		};
		
		this.mouseDownCallback = this.mouseDownCallback.bind(this);
		this.mouseMoveEvt = this.mouseMoveEvt.bind(this);
		this.mouseUpEvt = this.mouseUpEvt.bind(this);
		this.mouseLeaveEvt = this.mouseLeaveEvt.bind(this);
	}
	
	// append this tile onto the list.  called from tileObj.add()
	// this is idempotent as you'll just be replacing the same slot at tileSerial
	// except it'll replicate the table for react to notice.
	// DOn't call this multiple times in the same event loop!  it'll toss away all but the last.
	static addTile(tileObj) {
		let th = Editor.me;
		let newState = {...th.state, tileObjs: {...th.state.tileObjs, [tileObj.tileSerial]: tileObj}};
		Editor.me.setState(newState);
	}
	
	static getTileObj(serial) {
		return Editor.me.state.tileObjs[serial];
	}
	
	render() {
		console.info("------------------------------------------------------------- render edit start");////

		// given the tile set, make an array of the tile components
		let tileObjs = this.state.tileObjs;
		let tileComps = [];
		for (let serial in tileObjs) {
			let tob = tileObjs[serial];
			tileComps.push(<Tile tileObj={tob} 
					mouseDownCallback={this.mouseDownCallback} 
					key={tob.tileSerial} serial={tob.tileSerial} />);
		}
		console.log('tileObjs', tileObjs);////
		
		return <svg id='editor' width={config.editorWidth} height={config.editorHeight} 
					onMouseMove={this.mouseMoveEvt} 
					onMouseUp={this.mouseUpEvt} 
					onMouseLeave={this.mouseLeaveEvt}>
			<defs>
				<marker id="arrow-head"
					refX="0" refY="1.5" 
					markerWidth="4" markerHeight="3"
					orient="auto">
					<path d="M 0 0 L 4 1.5 L 0 3 z" stroke='none' fill='black' />
				</marker>
			</defs>
			<TileBar mouseDownCallback={this.mouseDownCallback} />
			<Flowchart mouseDownCallback={this.mouseDownCallback}>
				{tileComps}
			</Flowchart>
			<Tile tileObj={this.state.ghostTileObj} ghost
						mouseDownCallback={this.mouseDownCallback} />
		</svg>;
	}


	/* ************************************************************ dragging tiles */
	newGhostObj(srcTileObj, ev, innerX = this.state.innerX, innerY = this.state.innerY) {
		let nto = newTileObj(srcTileObj.type, 
				ev.clientX - innerX, 
				ev.clientY - innerY, 
				true, false, true);
		return nto;
	}
	
	// user has clicked down on a tile (whether in the TileBar or Flowchart)
	// actually called from clicked tile.  innerXY are coordinates of clickdown relative to center of tile.
	mouseDownCallback(tileComp, srcTileObj, ev, innerX, innerY) {
		let tileObjs = this.state.tileObjs;
		if (! srcTileObj.proto) {
			srcTileObj.visible = false;
			tileObjs = {...tileObjs, [srcTileObj.tileSerial]: srcTileObj};  // so src tile goes invisible
		}
		
		this.setState({
			tileObjs,
			sourceTileObj: srcTileObj, 
			ghostTileObj: this.newGhostObj(srcTileObj, ev, innerX, innerY) ,
			innerX, innerY,
		});
	}
	
	// a mouse move relevant to a drag
	mouseMoveEvt(ev) {
		if (! this.state.sourceTileObj)
			return;
		this.setState({
			ghostTileObj: this.newGhostObj(this.state.sourceTileObj, ev) ,
		});
	}
	
	// the end of a drag, however
	mouseUpEvt(ev) {
		let s = this.state;
		let sto = s.sourceTileObj;
		let gto = s.ghostTileObj;
		if (! sto)
			return;
		
////		// the mouse down location counts, too!
////		this.mouseMoveEvt(ev);
		
////		// now move it or clone it
////		let newTiles = [...s.tileObjs];
		
		if (sto.proto) {
			// it's from the TileBar!  make a new one
			newTileObj(sto.type, gto.x, gto.y, true).add();
		}
		else {
			// an existing one, that's been sitting there, hidden.  Set new coords and make it visible.
			let newObj = sto.clone();
			newObj.x = gto.x;
			newObj.y = gto.y;
			newObj.visible = true;

			this.setState({tileObjs: {...s.tileObjs, [newObj.tileSerial]: newObj}});
		}
		
		// end of dragging
		this.setState({
			sourceTileObj: null,
			ghostTileObj: newDummyGhostTile(),
		});
	}

	// cancel it if user drags out of the editor
	mouseLeaveEvt(ev) {
		if (! this.state.sourceTileObj)
			return;
		
		// just kill it
		this.state.sourceTileObj.visible = true;
		this.setState({sourceTileObj: null, ghostTileObj: newDummyGhostTile()});
	}
	
	
		
	static lookupTileObj(serial) {
		return Editor.me.state.tileObjs[serial];
	}

	
	static lookupArrowObj(serial) {
		return Editor.me.state.arrows[serial];
	}


}

export default Editor;





