import { rows } from "./mainscript.js";

export function dijkstra(startX, startY, goalX, goalY, snakey) {
  let totalRows = 20;
      // Initialize the distances and paths to all nodes
  let distances = [];
  let paths = [];
  for (let i = 0; i < totalRows*2; i++) {
    distances[i] = new Array(totalRows).fill(Infinity);
    paths[i] = new Array(totalRows).fill(null);
  }
  distances[startX][startY] = 0;


  // Create a set of unvisited nodes
  let unvisited = new Set();
  for (let i = 0; i < totalRows; i++) {
    for (let j = 0; j < totalRows; j++) {
      unvisited.add([i, j]);
    }
  }


  // Loop until we visit all nodes
  while (unvisited.size > 0) {
    
    // Find the node with the shortest distance from the start node
    let minDistance = Infinity;
    let minNode;
    for (let node of unvisited) {
      if (distances[node[0]][node[1]] < minDistance) {
        minDistance = distances[node[0]][node[1]];
        minNode = node;
      }
    }
    // Remove the node from the unvisited set
    unvisited.delete(minNode);
    if(minNode == null) {
      return null;
    } else {
      // If we have reached the end node, return the path
      if (minNode[0] === goalX && minNode[1] === goalY) {
        let path = [];
        let currentNode = minNode;
        while (currentNode !== null) {
          path.unshift(currentNode);
          currentNode = paths[currentNode[0]][currentNode[1]];
          
        }
        return path;
      }

      // Update the distances and paths of the neighboring nodes
      let neighbors = getNeighbors(minNode[0], minNode[1], snakey);
      for (let neighbor of neighbors) {
        let distance = distances[minNode[0]][minNode[1]] + 1;
        if (distance < distances[neighbor[0]][neighbor[1]]) {
          distances[neighbor[0]][neighbor[1]] = distance;
          paths[neighbor[0]][neighbor[1]] = minNode;
        }
      }
    }
  }

  // If we haven't found a path to the end node, return null
  return null;

  function getNeighbors(x, y, snakey) {
    let neighbors = [];
    if (x > 0 && rows[x - 1].boxes[y].box.classList.contains("wall") == false) {
      neighbors.push([x - 1, y]);
    }
    if (y > 0 && rows[x].boxes[y - 1].box.classList.contains("wall") == false) {
      neighbors.push([x, y - 1]);
    }
    if (x < totalRows-1 && rows[x + 1].boxes[y].box.classList.contains("wall") == false) {
      neighbors.push([x + 1, y]);
    }
    if (y < totalRows-1 && rows[x].boxes[y + 1].box.classList.contains("wall") == false ) {
      neighbors.push([x, y + 1]);
    } 
    return neighbors;
  }
}