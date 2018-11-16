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
			
			// arrow object whose head we're dragging, or null if not
			draggingArrowObj: null,
		};
		
		this.downTileCallback = this.downTileCallback.bind(this);
		this.downArrowCallback = this.downArrowCallback.bind(this);
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
					downTileCallback={this.downTileCallback} 
					downArrowCallback={this.downArrowCallback} 
					key={tob.tileSerial} serial={tob.tileSerial} />);
		}
////		console.log('tileObjs', tileObjs);////
		
		return <svg id='editor' width={config.editorWidth} height={config.editorHeight} 
					onMouseMove={this.mouseMoveEvt} 
					onMouseUp={this.mouseUpEvt} 
					onMouseLeave={this.mouseLeaveEvt}>
			<defs>
				<marker id="arrow-head"
					refX="2.9" refY="1.5" 
					markerWidth="4" markerHeight="3"
					orient="auto">
					<path d="M 0 0 L 4 1.5 L 0 3 z" stroke='none' fill='#888' />
				</marker>
			</defs>
			<TileBar downTileCallback={this.downTileCallback} />
			<Flowchart downTileCallback={this.downTileCallback}>
				{tileComps}
			</Flowchart>
			<Tile tileObj={this.state.ghostTileObj} ghost
						downTileCallback={this.downTileCallback} />
		</svg>;
	}


	/* ************************************************************ dragging tiles */
	//	regenerated upon mousedown & on every move
	newGhostObj(srcTileObj, ev, innerX = this.state.innerX, innerY = this.state.innerY) {
		let nto = newTileObj(srcTileObj.type, 
				ev.clientX - innerX, 
				ev.clientY - innerY, 
				true, false, true);
		
		// share the arrows with the src
		// must recreate inlets/outlets so they follow ghost
		nto.inlets = srcTileObj.inlets.map(inlet => inlet.cloneForGhost(this.state.ghostTileObj));
		nto.outlets = srcTileObj.outlets.map(outlet => outlet.cloneForGhost(this.state.ghostTileObj));
		////console.log("newGhostObj from %o to %o", srcTileObj, nto);

		return nto;
	}
	
	// user has clicked down on a tile (whether in the TileBar or Flowchart)
	// actually called from clicked tile.  innerXY are coordinates of clickdown relative to center of tile.
	downTileCallback(tileComp, srcTileObj, ev, innerX, innerY) {
		////console.log("downTileCallback from src:%d,%d", srcTileObj.x, srcTileObj.y, srcTileObj);
		let tileObjs = this.state.tileObjs;
		if (! srcTileObj.proto) {
			srcTileObj.visible = false;
			tileObjs = {...tileObjs, [srcTileObj.tileSerial]: srcTileObj};  // so src tile goes invisible
		}
		
		let ghost = this.newGhostObj(srcTileObj, ev, innerX, innerY);
		////console.log("    ghost @%d,%d", ghost.x, ghost.y, ghost);
		this.setState({
			tileObjs,
			sourceTileObj: srcTileObj, 
			ghostTileObj: ghost ,
			innerX, innerY,
		});
	}
	
	// user has clicked down on an arrowhead, in flowchart
	// actually called from clicked Arrow.
	downArrowCallback(arrowComp, arrowObj, ev) {
		////console.log("downArrowCallback from src:%d,%d", arrowObj.x, arrowObj.y, arrowObj);
		let fromTileObj = Editor.getTileObj(arrowObj.fromTileSerial);

		// must recreate tileObjs array cuz arrows hang off of tileObjs
		let tileObjs = this.state.tileObjs;
		tileObjs = {...tileObjs, [arrowObj.fromTileSerial]: fromTileObj};  // so src tile goes invisible
		
		////console.log("    ghost @%d,%d", ghost.x, ghost.y, ghost);
		this.setState({
			tileObjs,
			sourceTileObj: fromTileObj, 
			draggingArrowObj: arrowObj,
		});
	}
	
	// a mouse move relevant to a drag
	mouseMoveEvt(ev) {
		let sto = this.state.sourceTileObj;
		if (! sto)
			return;
		
		if (! this.state.draggingArrowObj) {
			// dragging tile
			let ghost = this.newGhostObj(sto, ev);
			this.setState({
				ghostTileObj: ghost ,
			});
		}
		else {
			// dragging arrowhead, rooted at sto
			sto = sto.cloneForArrow();
			let newArrow = sto.outlets[this.state.draggingArrowObj.fromTileOutlet];
			newArrow.dragX = ev.clientX;
			newArrow.dragY = ev.clientY;
////			sto.outlets[this.state.draggingArrowObj.fromTileOutlet] = newArrow;
			this.setState({
				draggingArrowObj: newArrow,
				tileObjs: {...this.state.tileObjs, [sto.tileSerial]: sto},
			});
			
			console.log("arrw drag ", sto.outlets[0].dragX, sto.outlets[0].dragY, );
		}
	}
	
	// the end of a drag, however
	mouseUpEvt(ev) {
		let s = this.state;
		let sto = s.sourceTileObj;
		if (! sto)
			return;

		if (! this.state.draggingArrowObj) {
			// dragging a tile
			if (sto.proto) {
				// tile from the TileBar!  make a new one
				sto = newTileObj(sto.type, gto.x, gto.y, true).add();
			}
			else {
				// an existing tile, that's been sitting there, hidden.  Set new coords and make it visible.
				sto = sto.cloneAt(gto.x, gto.y);
				sto.visible = true;

				// replace old sto with new one
				this.setState({tileObjs: {...s.tileObjs, [sto.tileSerial]: sto}});
			}
			// end of dragging
			this.setState({
				sourceTileObj: null,
				ghostTileObj: newDummyGhostTile(),
			});
			console.log("    end tile drag @%d,%d", sto.x, sto.y, sto);
		}
		else {
			// dragging around an arrowhead
			let dao = this.state.draggingArrowObj;
			dao.dragging = false;
			dao.dragX = null;
			dao.dragY = null;
			let state = {...this.state, draggingArrowObj: null, sourceTileObj: null};
			this.setState(state);
			console.log("    end arrow drag", dao);
		}
		////console.log("end drag ghost@%d,%d %s", gto.x, gto.y, gto.visible ? 'vis' : 'hid', gto);
		////console.log("        src@%d,%d %s", sto.x, sto.y, sto, sto.visible ? 'vis' : 'hid', sto);
		
	}

	// cancel it if user drags out of the editor
	mouseLeaveEvt(ev) {
		if (! this.state.sourceTileObj)
			return;
		
		// just kill it
		this.state.sourceTileObj.visible = true;
		this.setState({sourceTileObj: null, ghostTileObj: newDummyGhostTile(), draggingArrowObj: null,});
	}
	
	/* ****************************************************** lookups */
	static lookupTileObj(serial) {
		return Editor.me.state.tileObjs[serial];
	}

	static lookupArrowObj(serial) {
		return Editor.me.state.arrows[serial];
	}
}

export default Editor;





