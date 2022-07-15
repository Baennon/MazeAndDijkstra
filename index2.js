class Node {
	constructor(x, y, isWall = false) {
		this.x = x
		this.y = y
		this.isWall = isWall
		this.visited = false
		this.ignore = false
		this.dist = Infinity
		this.prev = null
	}
	equals(p) {
		return (this.x == p.x && this.y == p.y)
	}
}

class Field {
	constructor(width, height, canvaELement, nodeSize=50) {
		this.width = width
		this.height = height
		this.ctx = canvaELement.getContext("2d")
		this.nodeSize = nodeSize
		this.gridXSize = Math.floor(width/nodeSize)
		this.gridYSize = Math.floor(height/nodeSize)
		this.drawGrid()
		this.grid = []
		for (var x = 0; x < this.gridXSize; x++) {
			this.grid.push([])
			for (var y = 0; y < this.gridYSize; y++) {
				this.grid[x].push(new Node(x, y, false))
			}
		}
	}
	drawGrid() {
		for (var x = 0; x < this.gridXSize; x++) {
			for (var y = 0; y < this.gridYSize; y++) {
				var xCoord = x*this.nodeSize
				var yCoord = y*this.nodeSize
				this.ctx.fillStyle = "white"
				this.ctx.strokeStyle = "black"
				this.ctx.fillRect(xCoord,yCoord,this.nodeSize,this.nodeSize)
				this.ctx.strokeRect(xCoord,yCoord,this.nodeSize,this.nodeSize)
			}
		}
	}
	drawPoint(point, color, stroke=false) {
		var x = point.x*this.nodeSize
		var y = point.y*this.nodeSize
		if(!stroke) {
			this.ctx.fillStyle = color
			this.ctx.fillRect(x,y,this.nodeSize,this.nodeSize);

		} else {
			this.ctx.fillStyle = color
			this.ctx.strokeStyle = "black"
			this.ctx.fillRect(x,y,this.nodeSize,this.nodeSize);
			this.ctx.strokeRect(x,y,this.nodeSize,this.nodeSize);
		}
		
	}
	dijkstraNeighbors(node) {
		let result = []
		for(let i = node.x-1 ; i <= node.x+1; i++) {
			for(let j = node.y-1 ; j <= node.y+1; j++) {
					if(i >= 0 && i < this.gridXSize && j >= 0 && j < this.gridYSize && (i == node.x || j == node.y)) {
						if(this.grid[i][j] !== undefined && !this.grid[i][j].isWall && !this.grid[i][j].visited) result.push(this.grid[i][j])
					}
			}
		}
		return result
	}
	allNeighbors(node, diagonally=true) {
		let result = []
		for(let i = node.x-1 ; i <= node.x+1; i++) {
			for(let j = node.y-1 ; j <= node.y+1; j++) {
					if(i >= 0 && i < this.gridXSize && j >= 0 && j < this.gridYSize) {
						if(diagonally && !(i == node.x && j == node.y)) result.push(this.grid[i][j])
						if(!diagonally && (i == node.x || j == node.y) && !(i == node.x && j == node.y)) result.push(this.grid[i][j]) 
					}
			}
		}
		return result
	}
	clearGrid() {
		this.grid = []
		for (var x = 0; x < this.gridXSize; x++) {
			this.grid.push([])
			for (var y = 0; y < this.gridYSize; y++) {
				this.grid[x].push(new Node(x, y, false))
			}
		}
	}
	generateMaze() {
		var startingSide = ["N", "E", "S", "W"][Math.floor(Math.random()*["N", "E", "S", "W"].length)]
		this.startingNode = new Node(0,0,false)
		if(startingSide == "N") {
			this.startingNode.x = Math.floor(Math.random()*this.gridXSize)
		} else if(startingSide == "E") {
			this.startingNode.x = this.gridXSize - 1
			this.startingNode.y = Math.floor(Math.random()*this.gridYSize)
		} else if(startingSide == "S") {
			this.startingNode.x = Math.floor(Math.random()*this.gridXSize)
			this.startingNode.y = this.gridYSize - 1
		} else {
			this.startingNode.y = Math.floor(Math.random()*this.gridYSize)
		}
		this.grid = []
		for (var x = 0; x < this.gridXSize; x++) {
			this.grid.push([])
			for (var y = 0; y < this.gridYSize; y++) {
				this.grid[x].push(new Node(x, y, true))
				this.drawPoint(new Node(x, y), "red", false)
			}
		}

		this.drawPoint(this.startingNode, "blue", false)

		this.grid[this.startingNode.x][this.startingNode.y].isWall = false
		this.grid[this.startingNode.x][this.startingNode.y].visited = true
		this.grid[this.startingNode.x][this.startingNode.y].dist = 0

		var currentNode = this.startingNode
		var nbOfUnvisitedNodes = this.gridXSize * this.gridYSize - 1

		var field = this

		const eventLoopQueue = () => {
			return new Promise(resolve =>
				setTimeout(() => {
					nbOfUnvisitedNodes = field.grid.flat().filter(el => {if(el.visited==false) return el}).length
					var neighbors = field.allNeighbors(currentNode, false)
					var randomNeighbor = neighbors[Math.floor(Math.random()*neighbors.length)]
					var trueNeighbor = new Node(0,0)
					if(randomNeighbor.x == currentNode.x) {
						if(randomNeighbor.y > currentNode.y) trueNeighbor.y = randomNeighbor.y + 1
						if(randomNeighbor.y < currentNode.y) trueNeighbor.y = randomNeighbor.y - 1
						trueNeighbor.x = randomNeighbor.x
					} else {
						if(randomNeighbor.x > currentNode.x) trueNeighbor.x = randomNeighbor.x + 1
						if(randomNeighbor.x < currentNode.x) trueNeighbor.x = randomNeighbor.x - 1
						trueNeighbor.y = randomNeighbor.y
					}
					if(trueNeighbor.x >= 0 && trueNeighbor.x < field.gridXSize && trueNeighbor.y >= 0 && trueNeighbor.y < field.gridYSize) {
						if(!field.grid[trueNeighbor.x][trueNeighbor.y].visited) {
							field.grid[trueNeighbor.x][trueNeighbor.y].isWall = false
							field.grid[trueNeighbor.x][trueNeighbor.y].visited = true

							currentNode = field.grid[trueNeighbor.x][trueNeighbor.y]
							if(!field.grid[randomNeighbor.x][randomNeighbor.y].visited) {
								field.grid[randomNeighbor.x][randomNeighbor.y].isWall = false
								field.grid[randomNeighbor.x][randomNeighbor.y].visited = true
								var neighborsOfRandom = field.allNeighbors(randomNeighbor, false)
								for(var n of neighborsOfRandom) {
									if(n.isWall) {
										field.grid[n.x][n.y].visited = true
									}
								}
							}
						} else {
							field.grid[randomNeighbor.x][randomNeighbor.y].visited = true
							currentNode = field.grid[trueNeighbor.x][trueNeighbor.y]
						}
					} else {
						field.grid[randomNeighbor.x][randomNeighbor.y].visited = true
						var neighborsOfRandom = field.allNeighbors(randomNeighbor, false)
						for(var n of neighborsOfRandom) {
							if(n.isWall) {
								field.grid[n.x][n.y].visited = true
							}
						}
					}
					resolve();
				},0)
			);
		}

		const run = async () => {
			while (!stopMaze && nbOfUnvisitedNodes > 0) {
				for(var n of field.grid.flat()) {
					var neighbors = field.allNeighbors(n)
					var allNeighborsVisited = true
					for(var o of neighbors) {
						if(o.visited == false) {
							allNeighborsVisited = false
						}
					}
					if(allNeighborsVisited) field.grid[n.x][n.y].visited = true
					if(n.equals(this.startingNode)) {
						field.drawPoint(n, "blue", true)
					} else if(n.equals(currentNode)) {
						field.endingNode = n
						field.drawPoint(n, "blue", true)
					} else if (n.visited == true && !n.isWall) {
						field.drawPoint(n, "white", true)
					} else if(n.visited && n.isWall) {
						field.drawPoint(n, "black", true)
					}
				}
				await eventLoopQueue();
			}
		}

		run().then(() => {
			document.getElementById("draw").innerText = "Start"
			stopMaze = true
		});
	}
	
	dijkstra() {

		for(var n of this.grid.flat()) {
			this.grid[n.x][n.y].visited = false
		}

		this.grid[this.startingNode.x][this.startingNode.y].dist = 0

		var unvisitedNodes = Array.from(this.grid)

		var field = this

		var running = true
		// field.grid[field.startingNode.x][field.startingNode.y].visited = true
		const eventLoopQueue = () => {
			return new Promise(resolve =>
				setTimeout(() => {
					var closest = field.grid.flat().reduce(function(prev, curr) {
						if(prev.ignore) return curr
						if(curr.ignore) return prev
						return (prev.dist < curr.dist) ? prev : curr;
					});
					field.grid[closest.x][closest.y].ignore = true
					var neighbors = field.dijkstraNeighbors(closest)
					for(let n of neighbors) {
						if(n.x !== closest.x || n.y !== closest.y) {
							let alt = closest.dist + Math.abs(n.x - closest.x) + Math.abs(n.y - closest.y)
							if(alt < n.dist && closest.dist !== Infinity) {
								field.grid[n.x][n.y].dist = alt
								field.grid[n.x][n.y].prev = closest
							}
							if(!n.equals(field.endingNode)) {
								field.drawPoint(n, "red", true)
							} else {
								running = false
								resolve()
							}
						}
						field.grid[n.x][n.y].visited = true
					}
					resolve();
				},0)
			);
		}

		const run = async () => {
			while (!stopDijkstra && running && field.grid.flat().filter(el => {if(el.visited==false) return el}).length > 0) {
				await eventLoopQueue();
			}
		}
		run().then(() => {
			setTimeout(() => {
				if(dijkstraRunning) {
					stopDijkstra = true
					dijkstraRunning = false
					document.getElementById("draw").innerText = "Clean"
				}
				var target = field.grid[field.endingNode.x][field.endingNode.y]
				if(target.prev !== null || target.equals(field.startingNode)) {
					while(target !== null) {
						if(!(target.equals(field.startingNode) || target.equals(field.endingNode))) field.drawPoint(target, "green", true)
						target = target.prev
					}
				}
			}, 100)
		});
		
	}

	mouseEvent(e) {
		var x = Math.floor((e.clientX - e.target.getBoundingClientRect().left)/this.nodeSize)
		var y = Math.floor((e.clientY - e.target.getBoundingClientRect().top)/this.nodeSize)

		var clickedNode = new Node(x, y)
		var operation = document.querySelector('input[name="control"]:checked').value 
		if(operation == "start") {
			if(this.startingNode !== undefined) this.drawPoint(this.startingNode, "white", true)
			this.drawPoint(clickedNode, "blue", true)
			this.startingNode = clickedNode
		} else if(operation == "end") {
			if(this.endingNode !== undefined) this.drawPoint(this.endingNode, "white", true)
			this.drawPoint(clickedNode, "blue", true)
			this.endingNode = clickedNode
		} else if(operation == "wall") {
			clickedNode.isWall = true
			this.grid[clickedNode.x][clickedNode.y].isWall = true
			this.drawPoint(clickedNode, "black", true)
		}
	}

}

var field
var stopMaze = false
var stopDijkstra = false
var dijkstraRunning = false

document.addEventListener("DOMContentLoaded", () => {
	var canvaElement = document.getElementById("drawing")
	field = new Field(1500, 600, canvaElement, 30)

	document.getElementById("draw").addEventListener("click", (e) => {
		if(!stopMaze) {
			e.target.innerText = "Start"
			stopMaze = true
			field.clearGrid()
			field.drawGrid()
		} else {
			if(!stopDijkstra && !dijkstraRunning) {
				e.target.innerText = "Stop and clean"
				dijkstraRunning = true
				field.dijkstra()
			} else {
				e.target.innerText = "Start"
				stopDijkstra = true
				setTimeout(() => {
					stopDijkstra = false
					dijkstraRunning = false
					field.clearGrid()
					field.drawGrid()
				}, 10)
			
			}
		}
	})

	canvaElement.addEventListener("click", (e) => {
		field.mouseEvent(e)
	})

	canvaElement.addEventListener("mousemove", (e) => {
		if(e.buttons == 1) {
			e.preventDefault();
			field.mouseEvent(e)
		}
	})

	field.generateMaze()
})