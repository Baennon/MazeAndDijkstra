class Point {
    constructor(x, y, isWall=false) {
        this.x = x
        this.y = y
        this.dist = Infinity
        this.visited = false
        this.prev = null
        this.diagonal = false
        this.isWall = isWall
    }
    equals(p) {
        if(this.x == p.x && this.y == p.y) return true
        return false
    }
    neighbors(nodes, diagonally=true) {
        let result = []
        for(let i = this.x-50 ; i <= this.x+50; i+=50) {
            for(let j = this.y-50 ; j <= this.y+50; j+=50) {
                    if(diagonally) var find = nodes.find(p => {if(p.x == i && p.y == j && p.visited == false) return p})
                    if(!diagonally) var find = nodes.find(p => {if(p.x == i && p.y == j && p.visited == false && (p.x == this.x || p.y == this.y)) return p})
                    if(find !== undefined && !find.isWall) {
                        find.visited = true
                        if(find.x == this.x || find.y == this.y) find.diagonal = false
                        result.push(find)
                    }
            }
        }
        return result
    }
}

class Canva {
    constructor(canva, width, height) {
        this.canva = canva
        this.ctx = this.canva.getContext("2d")
        this.width = width
        this.height = height
        this.walls = []
        this.nodes = []
    }

    findPoint(point) {
        return this.nodes.find(el => { if(el.x == point.x && el.y == point.y) return el})
    }

    drawPoint(point, color, stroke, r=50) {
        if(!stroke) {
            this.ctx.fillStyle = color
            this.ctx.fillRect(point.x,point.y,r,r);

        } else {
            this.ctx.fillStyle = color
            this.ctx.strokeStyle = "black"
            this.ctx.fillRect(point.x,point.y,r,r);
            this.ctx.strokeRect(point.x,point.y,r,r);
        }
        
    }
    drawBoard(){
        for (var x = 0; x <= this.width; x += 50) {
            for (var y = 0; y <= this.height; y += 50) {
                this.ctx.fillStyle = "white"
                this.ctx.strokeStyle = "black"
                this.ctx.fillRect(x,y,50,50)
                this.ctx.strokeRect(x,y,50,50)
            }
        }
    }
    generateMaze() {
        var possibleStartSide = ["N", "E", "S", "W"]
        var startingSide = possibleStartSide[Math.floor(Math.random()*possibleStartSide.length)]
        this.startingPoint = new Point(0,0,false)
        
        if(startingSide == "N") {
            this.startingPoint.x = Math.floor(Math.random()*this.width/50)*50
        } else if(startingSide == "E") {
            this.startingPoint.x = this.width - 50
            this.startingPoint.y = Math.floor(Math.random()*this.height/50)*50
        } else if(startingSide == "S") {
            this.startingPoint.x = Math.floor(Math.random()*this.width/50)*50
            this.startingPoint.y = this.height - 50
        } else {
            this.startingPoint.y = Math.floor(Math.random()*this.height/50)*50
        }
        this.drawPoint(this.startingPoint, "blue", false)

        this.nodes = []
        for (var x = 0; x <= this.width; x += 50) {
            for (var y = 0; y <= this.height; y += 50) {
                this.nodes.push(new Point(x, y, true))
            }
        }
        
        this.findPoint(this.startingPoint).isWall = false
    
        var currentNode = this.startingPoint
        var numberOfUnvisitedNodes = this.nodes.filter(x => x.visited==false).length
        while(numberOfUnvisitedNodes > 0) {
            var neighbors = currentNode.neighbors(this.nodes, false)
            var selectedNeighbor = neighbors[Math.floor(Math.random()*neighbors.length)]
            var wallNeighbor = this.findPoint(selectedNeighbor)
            wallNeighbor.isWall = false
            wallNeighbor.visited = true
            var trueNeighbor = new Point(selectedNeighbor.x == currentNode.x ? (selectedNeighbor.y < currentNode.y ? selectedNeighbor.y-50 : selectedNeighbor.y+50) : (selectedNeighbor.x < currentNode.x ? selectedNeighbor.x-50 : selectedNeighbor.x+50), 
            selectedNeighbor.y == currentNode.y ? (selectedNeighbor.x < currentNode.x ? selectedNeighbor.x-50 : selectedNeighbor.x+50) : (selectedNeighbor.y < currentNode.y ? selectedNeighbor.y-50 : selectedNeighbor.y+50))   
            this.findPoint(trueNeighbor)
        }
    }
    start() {
        
        for(let i = 0; i < this.width; i+=50) {
            for(let j = 0; j < this.height; j+=50) {
                let point = new Point(i, j)
                this.nodes.push(point)
            }
        }

        for(var w of this.walls) {
            this.nodes.find(el => { if(el.x == w.x && el.y == w.y) return el}).isWall = 1
        }

        this.nodes.find(el => { if(el.x == this.startingPoint.x && el.y == this.startingPoint.y) return el}).dist = 0
    
        var unvisitedNodes = Array.from(this.nodes)
    
        while(unvisitedNodes.length > 0) {
            var closest = unvisitedNodes.reduce(function(prev, curr) {
                return prev.dist < curr.dist ? prev : curr;
            });
            unvisitedNodes = unvisitedNodes.filter((el) => {if(el.x !== closest.x || el.y !== closest.y) return el})
            var neighbors = closest.neighbors(unvisitedNodes)
            for(let n of neighbors) {
                let neighborDistance = n.diagonal ? Math.sqrt(2) : 1 
                let alt = closest.dist + Math.abs(n.x - closest.x) + Math.abs(n.y - closest.y)
                console.log(neighborDistance)
                if(alt < n.dist && closest.dist !== Infinity) {
                    n.dist = alt
                    n.prev = closest
                }
                if(!n.equals(this.endingPoint)) {
                    pointsQueue.push([n, "#FF0000", true])
                } else {
                    unvisitedNodes = []
                    break
                }
            }
        }
    
        var target = this.nodes.find(el => { if(el.x == this.endingPoint.x && el.y == this.endingPoint.y) return el})
        if(target.prev !== null || target == this.startingPoint) {
            while(target !== null) {
                if(!(target.equals(this.startingPoint) || target.equals(this.endingPoint))) pointsQueue.push([target, "#00FF00", true])
                target = target.prev
            }
        }
        var drawPoints = setInterval(() => {
            let current = pointsQueue.shift()
            this.drawPoint(current[0], current[1], current[2])
            if(pointsQueue.length == 0) clearInterval(drawPoints)
        }, 1)
    }
    mouseEvent(e) {
        var clickedPoint = new Point(Math.floor(e.clientX/this.nodeSize)*50, Math.floor(e.clientY/50)*50)
        var operation = document.querySelector('input[name="control"]:checked').value 
        if(operation == "start") {
            if(this.startingPoint !== undefined) this.drawPoint(this.startingPoint, "white", true)
            this.drawPoint(clickedPoint, "blue", true)
            this.startingPoint = clickedPoint
        } else if(operation == "end") {
            if(this.endingPoint !== undefined) this.drawPoint(this.endingPoint, "white", true)
            this.drawPoint(clickedPoint, "blue", true)
            this.endingPoint = clickedPoint
        } else if(operation == "wall") {
            clickedPoint.isWall = true
            this.walls.push(clickedPoint)
            this.drawPoint(clickedPoint, "black", true)
        }
    }
}

var pointsQueue = []
var canva 
document.addEventListener("DOMContentLoaded", () => {

    var canvaElement = document.getElementById("drawing")
    canva = new Canva(document.getElementById("drawing"), 1500, 800)
    canva.drawBoard()

    document.getElementById("draw").addEventListener("click", () => {
        canva.start()
    })

    canvaElement.addEventListener("click", (e) => {
        canva.mouseEvent(e)
    })

    canvaElement.addEventListener("mousemove", (e) => {
        if(e.buttons == 1) {
            e.preventDefault();
            canva.mouseEvent(e)
        }
    })

    canva.generateMaze()
})