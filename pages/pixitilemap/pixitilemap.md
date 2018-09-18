# Pixi.js Tilemap
***Warning:** Written in Fall '14, possibly outdated! More recently, I'd prefer to use typescript and [Phaser](https://phaser.io/) to build HTML5 games (which is built on Pixi.js).*

<p id="demo" class="media"></p>

Try it above. {.caption}

[Pixi.js](http://www.pixijs.com/ "Pixi.js")  is a lightweight 2D webGL renderer. This post details how to extend it with a Tilemap class. It allows for reporting mouse hovers and clicks, dragging to scroll, and zooming (here, at integer amounts to preserve the pixel art).

I made the Tilemap with intentions to build a simple Civilization-like game that runs in the browser. It could also be suitable for any type of game or application that uses discrete tiles. The class extends the basic Pixi.js classes for sprites and groups of sprites ([Sprite](http://www.goodboydigital.com/pixijs/docs/classes/Sprite.html)  and  [DisplayObjectContainer](http://www.goodboydigital.com/pixijs/docs/classes/DisplayObjectContainer.html)).

### Files

[main.js](https://github.com/benhhopkins/Tilemap/blob/master/main.js)  – Sets up and returns the Pixi renderer, loads the sprites, and initializes the tilemap + menu.  
[tilemap.js](https://github.com/benhhopkins/Tilemap/blob/master/tilemap.js)  – Defines a Tilemap object that extends Pixi’s DisplayObjectContainer. The rest of this post details the specifics of this class.  
[menu.js](https://github.com/benhhopkins/Tilemap/blob/master/menu.js)  – Defines a simple Menu object that also extends DisplayObjectContainer. Contains buttons for zooming the map and displays the coordinates of the currently selected tile.  
[tiles.json](https://github.com/benhhopkins/Tilemap/blob/master/tiles.json)  and  [tiles.png](https://github.com/benhhopkins/Tilemap/blob/master/tiles.png)  – The sprites and data for loading them.  [See here](      http://www.emanueleferonato.com/2010/05/07/6-games-you-must-be-able-to-make-in-less-than-a-day/)  for a tutorial that covers loading Pixi sprites like this.

### Tilemap from DisplayObjectContainer

Mainly, I will cover the [Tilemap class](https://github.com/benhhopkins/Tilemap/blob/master/tilemap.js).

We do the following to extend the DisplayObjectContainer:
```
Tilemap.prototype = new PIXI.DisplayObjectContainer();
Tilemap.prototype.constructor = Tilemap;
```
There are a number of ways to implement inheritance in JavaScript. This way is fairly straightforward and there is a [good tutorial here](http://phrogz.net/js/classes/OOPinJS2.html). By inheriting from DisplayObjectContainer, we can add our Tilemap object directly to the Pixi Stage for drawing, and inherited methods and properties won’t need to be duplicated. It also makes sense because the tiles added to the map are also Pixi sprites, and we can store them inside the DisplayObjectContainer’s array of children.

All of this is set up in the Tilemap constructor.
```
function Tilemap(width, height){
  PIXI.DisplayObjectContainer.call(this);
  this.interactive = true;

  this.tilesWidth = width;
  this.tilesHeight = height;

  this.tileSize = 16;
  this.zoom = 2;
  this.scale.x = this.scale.y = this.zoom;

  this.startLocation = { x: 0, y: 0 };

  // fill the map with tiles
  this.generateMap();
}
```
By calling the DisplayObjectContainer constructor on  `this`, the Tilemap object we are constructing now is initialized as it’s Pixi parent. We set the inherited property  `interactive = true`  so the container will receive mouse and touch events.

`tilesWidth`  and  `tilesHeight`  are used to store the dimensions of the map (as opposed to  `width`  and  `height`  which are properties of the parent object and track the pixel dimensions).  `tileSize`  is the width and height of a single tile in pixels and will be used in many calculations.  `zoom`  tracks the zoom level of the map, and anywhere this is changed the inherited property  `scale`  is also changed in the x and y dimensions to properly scale the displayed sprites.

`startLocation`  will be set later to track the location of a hypothetical player’s starting village if this tilemap was used in a game.

### Generating

`generateMap()`  is called to fill the map with tiles. The key part of interfacing with Pixi here is in the  `addTile`, `changeTile`, and  `getTile`  methods.
```
Tilemap.prototype.addTile = function(x, y, terrain){
  var tile = PIXI.Sprite.fromFrame(terrain);
  tile.position.x = x * this.tileSize;
  tile.position.y = y * this.tileSize;
  tile.tileX = x;
  tile.tileY = y;
  tile.terrain = terrain;
  this.addChildAt(tile, x * this.tilesHeight + y);
}

Tilemap.prototype.changeTile = function(x, y, terrain){
  this.removeChild(this.getTile(x, y));
  this.addTile(x, y, terrain);
}

Tilemap.prototype.getTile = function(x, y){
  return this.getChildAt(x * this.tilesHeight + y);
}
```
As mentioned earlier, each tile is in fact just a Pixi sprite with a few extra properties. This allows us to add the tiles as children of the Tilemap which is a DisplayObjectContainer, and avoid duplicating the map data in any way. As long as we use the  `addTile`,  `changeTile`, and  `getTile`  methods, this optimization is nicely encapsulated.

`generateMap`  uses these methods to fill all valid tile locations with tiles, create landmasses with varied tile types, and find a start location for the player. The algorithm for shaping the land is simple — a random point on the map is chosen to spawn land of a certain “height”, and then the process is recursively called on random neighboring tiles with a reduced height. I’m pleased that, just by calling this simple method on a number of points, interesting continents and shapes can be formed. World creation isn’t the purpose of this post so I’ll leave it at that, but I look forward to exploring it more in the future.

### Interacting

After the map is generated, we return to the  `Tilemap`  constructor where the inherited callback methods for reacting to mouse and touch events will be set up.
```
 // variables and functions for moving the map
 this.mouseoverTileCoords = [0, 0];
 this.selectedTileCoords = [0, 0];
 this.mousePressPoint = [0, 0];
 this.selectedGraphics = new PIXI.Graphics();
 this.mouseoverGraphics = new PIXI.Graphics();
 this.addChild(this.selectedGraphics);
 this.addChild(this.mouseoverGraphics);
```
Above are some declarations that will be used for scrolling and selecting. The  `mouseoverTileCoords`  and  `selectedTileCoords`  properties are used for tracking the moused-over and selected tiles, respectively. When the mouse is pressed on the map,  `mousePressPoint`  stores this position, so that moving the mouse can scroll the map relative to the original position. The two Pixi graphics objects are used to draw the selected and moused-over tile highlights. Coming from other types of graphics frameworks (especially ones where you are directing the redrawing of the graphics every frame), it seemed a bit strange to need multiple graphics objects for these tasks. But in the Pixi framework,  `clear()`  and drawing methods are used sparingly — only when you want to change the display — and the frame-by-frame redraw is under the hood. Because of this, it makes sense to have a different graphics object for each set of shapes that you’d like to clear separately.

Now, we set the callback methods that Pixi will call during mouse and touch events.
```
this.mousedown = this.touchstart = function(data) {
  if(data.getLocalPosition(this.parent).x > menuBarWidth) {
    this.dragging = true;
    this.mousePressPoint[0] = data.getLocalPosition(this.parent).x -
                              this.position.x;
    this.mousePressPoint[1] = data.getLocalPosition(this.parent).y -
                              this.position.y;

    this.selectTile(Math.floor(this.mousePressPoint[0] / 
                               (this.tileSize * this.zoom)),
                    Math.floor(this.mousePressPoint[1] /
                               (this.tileSize * this.zoom)));
  }
};
```
Clicking or touching the map will set  `dragging = true`  so we know to scroll the map when the mouse or touch point is moved. We also want to store this point, so we can scroll relative to it. The  `data`  argument passed in to this callback can provide us with the point information.  `getLocalPosition`  is called with  `this.parent`, which actually references the Pixi Stage which has this Tilemap object as a child. This conversion is necessary to translate the absolute mouse or touch point into local coordinates for the Tilemap object, whose position is defined relative to its parent. We call`selectTile`  to update the graphics according to the tile clicked or touched, taking into account the size of the tiles we are working with and the current zoom level to get the correct tile coordinates. The code for drawing the graphical highlight is below.
```
Tilemap.prototype.selectTile = function(x, y){
  this.selectedTileCoords = [x, y];
  menu.selectedTileText.setText("Selected Tile: " + this.selectedTileCoords);
  this.selectedGraphics.clear();
  this.selectedGraphics.lineStyle(2, 0xFFFF00, 1);
  this.selectedGraphics.beginFill(0x000000, 0);
  this.selectedGraphics.drawRect(this.selectedTileCoords[0] * this.tileSize,
                         this.selectedTileCoords[1] * this.tileSize,
                         this.tileSize,
                         this.tileSize);
  this.selectedGraphics.endFill();
}
```
Back in the Tilemap constructor, continuing to define touch callbacks…
```
this.mouseup = this.mouseupoutside =
  this.touchend = this.touchendoutside = function(data) {
  this.dragging = false;
};
```
We want to make sure to end the dragging when any one of these events fires.
```
this.mousemove = this.touchmove = function(data)
{
  if(this.dragging)
  {
    var position = data.getLocalPosition(this.parent);
    this.position.x = position.x - this.mousePressPoint[0];
    this.position.y = position.y - this.mousePressPoint[1];

    this.constrainTilemap();
  }
  else{
    var mouseOverPoint = [0, 0];
    mouseOverPoint[0] = data.getLocalPosition(this.parent).x -
                        this.position.x;
    mouseOverPoint[1] = data.getLocalPosition(this.parent).y -
                        this.position.y;

    var mouseoverTileCoords = 
        [Math.floor(mouseOverPoint[0] / (this.tileSize * this.zoom)),
         Math.floor(mouseOverPoint[1] / (this.tileSize * this.zoom))];
    this.mouseoverGraphics.clear();


    this.mouseoverGraphics.lineStyle(1, 0xFFFFFF, 1);
    this.mouseoverGraphics.beginFill(0x000000, 0);
    this.mouseoverGraphics.drawRect(
                          mouseoverTileCoords[0] * this.tileSize,
                          mouseoverTileCoords[1] * this.tileSize,
                          this.tileSize - 1,
                          this.tileSize - 1);
    this.mouseoverGraphics.endFill();
  }
};
```
When the mouse or touch point moves, we want to scroll the map if we are clicking or holding down the touch. Otherwise, we draw the mouseover graphical tile highlight. The latter is similar to the code for drawing the selected tile highlight. For dragging or scrolling the map, we need to change the Tilemap’s  `position`  property (inherited from DisplayObjectContainer). We simply want to change it to the difference between the original touched point and the current touched point.  `constrainTilemap`  is called to make sure we aren’t dragging the map out of bounds of the viewport.

### Zooming

That’s it for the Tilemap constructor. I want to review the Tilemap’s zooming methods as well, which are called when the + and – buttons are clicked (defined in  [menu.js](https://github.com/benhhopkins/Tilemap/blob/master/menu.js)).
```
Tilemap.prototype.zoomIn = function(){
  this.zoom = Math.min(this.zoom * 2, 8);
  this.scale.x = this.scale.y = this.zoom;

  this.centerOnSelectedTile();
  this.constrainTilemap();
}

Tilemap.prototype.zoomOut = function(){
  this.mouseoverGraphics.clear();

  this.zoom = Math.max(this.zoom / 2, 1);
  this.scale.x = this.scale.y = this.zoom;

  this.centerOnSelectedTile();
  this.constrainTilemap();
}

Tilemap.prototype.centerOnSelectedTile = function(){
  this.position.x = (renderWidth - menuBarWidth) / 2 -
    this.selectedTileCoords[0] * this.zoom * this.tileSize -
    this.tileSize * this.zoom / 2 + menuBarWidth;
  this.position.y = renderHeight / 2 -
    this.selectedTileCoords[1] * this.zoom * this.tileSize -
    this.tileSize * this.zoom / 2;
}
```
Both zooming methods are similar. Note that when zooming out, we want to make sure to clear the mouseover graphics because the tile that was previously under the ‘-‘ button will be highlighted when it is moved into view, and this highlight won’t be corrected until the mouse is moved. The zoom property is doubled or halved for each zoom level, and the scale is set appropriately.

The tricky calculation involved in zooming is in  `centerOnSelectedTile`. For computing the X position,  
`(renderWidth - menuBarWidth) / 2`  is half the width of the viewport on the Tilemap.  
Starting from this center point, we move the over to the left to the position of the currently selected tile,  
`- this.selectedTileCoords[0] * this.zoom * this.tileSize`  
and move a bit further to the left to be centered on the tile sprite,  
`- this.tileSize * this.zoom / 2`  
and finally move to the right to take into account the size of the menu obscuring the viewport,  
`+ menuBarWidth;`.  
The Y position is a simplified calculation since there is no menu above the map to take into consideration.

That's it, thanks for reading.