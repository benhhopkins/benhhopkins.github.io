# Aerial Navigation in Procedural Worlds (3D)

![Dropship](/pages/dropship/dropship.png) {.media}

how i'm implementing aerial + ground pathfinding in skyjunk

why the game needs a combination of aerial and ground pathing

aerial pathfinding already a tricky challenge, generating graphs from procedural levels is even harder

for actual pathfinding algorithms, using A* Pathfinding Project
https://arongranberg.com/astar/

## Open Spaces to efficient graphs

similar techniques used in Warframe, as told by Dan Brewer in excellent GDC talk
https://www.gdcvault.com/play/1022016/Getting-off-the-NavMesh-Navigating

the naive approach would be to create a 3d graph of pathing nodes, but this would make the search space extremely large for many paths, preventing us from pathfinding in real time.

our goal is to have a higher density of points in the graph around level geometry, and low density of points in large open spaces.

### Rasterization

level generation uses octree to create terrain and platforms
same octree is used to rasterize the empty spaces, recursively creating nodes until a minimum size is reached

### Weights

our graph isn't more efficient than a simple grid when we're trying to path around an obstacle, since we'll be hitting the densest areas of nodes. need to reduce the weight of larger spaces when pathing to encourage using them. this has the effect of causing your agents to "steer clear" of geometry, which is actually a somewhat natural behavior to see from flying objects.

## Connecting to the ground

## Agent restrictions

## Bringing agents to life

