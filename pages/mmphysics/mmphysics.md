# Box2D and Platformer Physics

*Benefits and challenges of using Box2D for Mystic Melee's physics.*

Mystic Melee uses the Box2D physics engine. It's a popular solution for a rigid-body 2D physics simulation, with implementations in many languages and integrations with many game engines. However, using Box2D or any realistic physics engine is often not recommended for platformer games. *Tight* controls are almost always a key feature of platformers, which generally means the player characters feel extremely responsive to input. To achieve this, you'll want to break the laws of physics. For example, near-infinite acceleration when moving and non-parabolic jumping mechanics are common.

On the other hand, realistic physics simulations can lead to a lot of fun, emergent interactions. Entire games are built around playing with the rigid-body physics that we all have an intuition for understanding from the real world. So, for Mystic Melee, I wanted to try building a system where both the platformer controls felt tight and responsive *and* you could interact with a complex world based on rigid-body physics. Here, I'll detail how I wrangled Box2D for this purpose.

### Character Controller Goals

- Characters can run, slide, and wall-jump.
- Enable level designs with surfaces at any angle. The characters should transition seamlessly from running on flatter surfaces, to sliding/hugging a wall, to falling.
- Crouching and sliding on flatter surfaces should reduce the character hitbox size for dodging obstacles.
- Platforms can move and rotate. Characters should move in reference to moving platforms and adjust to their slope.
- Responsiveness: left/right acceleration should be very quick when on the ground, slightly slower in the air.

### Character Fixtures

The Box2d body for a character is made of 5 fixtures, one hitbox and four sensors.

-- image --

##### Hitbox Fixture

The hitbox fixture is a rectangle that's slightly smaller than the player sprite. This fixture is used to physically interact with the world by colliding with the ground, solid objects, or spells. Usually, this fixture is set to have fixed rotation so the player stays upright, although this is turned off if you've been frozen solid or reduced to a decapitated head.

Since fixture sizes can't be modified, the hitbox is swapped out with a smaller one if you're crouching or sliding, allowing you to get through tight spaces or avoid enemy attacks.

-- gif of crouching/sliding --

The friction property of the hitbox is modified often when the player is moving and stopping. When not pressing left or right, friction with the ground is set very high so the player stops moving fairly quickly. When trying to move or slide, friction with the ground is very low. This allows the force generated from walking to push you along the ground, or to maintain momentum. For me, this change in friction alone is enough to make stopping feel responsive. If you want your character to stop in the air when no buttons are pressed, you'll also have to apply an opposing force when no buttons are pressed.

Note that to ensure the friction is set properly between the player and a floor, it needs to be set in every PreSolve collision callback between the hitbox and a floor fixture. If you only modify the hitbox fixture's friction, the collision may use an outdated friction coefficient (e.g. if you were not walking when you landed on the floor, and then start walking without recontacting it).

##### Level Construction and the Foot Sensor Fixture

Mystic Melee levels are initially constructed with sets of tiles. When they levels are saved, the boundries of floor and slope tiles are parsed to create b2EdgeShapes which will ultimately be used by Box2d at runtime.

These edges are connected using the box2d "ghost verticies" feature. These are indicators to the physics engine that two edges are meant to form one surface. This prevents the hitbox from catching on the boundry between edge shapes, which can stop the characters and pop them into the air.

Some important information is also stored in the UserData of the b2EdgeShapes. UserData is a field that can store arbitrary info that your game might want connected to Box2d objects. For floors, I store the slope angle and type of floor (grass, metal, ice, etc.) which affects friction and footstep sound.

Sensors in Box2d can freely overlap with other objects, but still recieve collision callbacks. The foot sensor uses BeginContact and EndContact to keep a list of any objects tagged as floors that it is currently overlapping. The list is important when standing on multiple edges, as it makes sense to resolve to using the flattest edge . There's also a check for opposing edges, which can be treated as a flat ground so that characters can stand on steep peaks and at the bottom of wells.



##### Foot Sensor

