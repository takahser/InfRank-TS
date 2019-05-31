
/**
 * global variables
 */
const allVertices: Vertice[] = [];

/**
 * data structures
 */
// source ~ u_i
// target ~ u_j
enum Label {
  Following, // source follows target
  Retweeting, // source retweets target
  Metioning, // source mentions target
}

interface Vertice {}

/**
 * static methods
 */

const ivan = (vertice: Vertice, label: Label): Vertice[] => {
  // TODO: get all vertices that match relationship instead
  return allVertices;
}

const sizeOf = (vertices: Vertice[]): number => vertices.length;

const calcInfK = (vertice: Vertice) =>
  sizeOf(
    ivan(
      vertice,
      Label.Following,
    )
  ) / sizeOf(allVertices)

// w_r a.k.a. "retweeting" relationship
// const basil = (source: Vertice, target: Vertice) => 

// 