# Momentum Platforming / Box2D in platformers

*Rigidbody physics + platforming in Mystic Melee.*

<video autoplay loop muted playsinline src="physicsplatforms.webm"></video> {.media}

Mystic Melee uses the Box2D physics engine. It's a popular solution for a rigidbody 2D physics simulation, with implementations in many languages and integrations with many game engines. However, using Box2D or any realistic physics engine is often not recommended for platformer games. *Tight* controls are imperative for platformers, which means the player characters feel highly responsive to input. To achieve this, we'll want to break the laws of physics. For example, near-infinite acceleration when moving and non-parabolic jumping mechanics are common in platformer games.

On the other hand, realistic physics simulations lead to fun, emergent interactions. Entire games are built around playing with rigidbody physics. We get to use our intuition of how real-world objects interact in the context of the game. So, for Mystic Melee, I wanted to try building a system where both the platformer controls felt tight and responsive *and* you could interact with a more realistic physics world. Here, I'll explain how I used Box2D for this purpose, with lessons for adapting any rigidbody physics engine to a platformer.

### Character Controller Goals

- Characters can run, slide, and wall-jump.
- Enable level designs with surfaces at any angle. The characters should transition seamlessly from running on flatter surfaces, to sliding down a wall, to falling.
- Crouching and sliding on flatter surfaces should reduce the character hitbox size for dodging obstacles.
- Platforms can move and rotate. Characters should move in reference to moving platforms and adjust to changing slope.
- Responsiveness: left/right acceleration should be very quick when on the ground, slightly slower in the air.
- Characters should take damage when they are being crushed in proportion to the acting forces.

### Character Fixtures

The Box2d body for a character is made of 5 fixtures, one hitbox and four sensors.

![Fixtures](/pages/mmphysics/fixtures.png) {.media-fixed-scale}

##### Hitbox Fixture

The hitbox fixture is a rectangle that's slightly smaller than the player sprite. This fixture is used to physically interact with the world by colliding with the ground, solid objects, or spells. Usually, this fixture is set to have fixed rotation so the player stays upright, although this is turned off if you've been frozen solid or reduced to a decapitated head.

Since fixture sizes can't be modified, the hitbox is swapped out with a smaller one if you're crouching or sliding, allowing you to get through tight spaces or avoid enemy attacks.

<video autoplay loop muted playsinline src="sliding.webm"></video> {.media}

The friction property of the hitbox is modified often when the player is moving and stopping. When not pressing left or right, friction with the ground is very high so the player stops moving quickly. When moving or sliding, friction with the ground is very low. This allows the force generated from walking to push you along the ground or to maintain momentum. For me, this change in friction alone is enough to make stopping feel responsive. If you want your character to stop in the air when no buttons are pressed, you'll have to apply an opposing force.

Note that to ensure the friction is set properly between the player and a floor, it needs to be set in every PreSolve collision callback between the hitbox and a floor fixture. If you only modify the hitbox fixture's friction, the collision may use an outdated friction coefficient (e.g. if you were not walking when you landed on the floor, and then start walking without recontacting it).

##### Level Construction and the Foot Sensor Fixture

Mystic Melee levels are initially constructed with sets of tiles. When levels are saved, the boundaries of floor and slope tiles are parsed to create b2EdgeShapes used by Box2d at runtime.

These edges are connected using the box2d "ghost vertices" feature. These are indicators to the physics engine that two edges are meant to form one surface. This prevents the hitbox from catching on the boundary between edge shapes, which can stop the characters and pop them into the air.

Some important information is also stored in the UserData of the b2EdgeShapes. UserData is a field that can store arbitrary info that your game might want connected to Box2d objects. For floors, I store the slope angle and type of floor (grass, metal, ice, etc.) which affects friction and footstep sound.

Sensors in Box2d can freely overlap with other objects, but still receive collision callbacks. The foot sensor uses BeginContact and EndContact to keep a list of any objects tagged as floors that it is currently overlapping. The list is important when standing on multiple edges, as it makes sense to resolve to standing on the flattest edge. There's also a check for opposing edges, which can be treated as a flat ground so that characters can stand on steep peaks and at the bottom of wells.

![Level Construction](/pages/mmphysics/level.png) {.media-fixed-scale}

**<span style="color:green">b2EdgeShapes</span>** generated from the level tiles.  
**<span style="color:red">Peaks</span>** and **<span style="color:blue">Wells</span>** of opposing edges, which can be treated as flat terrain.  
**<span style="color:yellow">Smoothing</span>** between flat ground and slopes to help the characters transition smoothly at speed.

Besides standing vs sliding, the floor angle is useful in other situations. When running, force applied is tangent to the edge so characters stick to downward slopes and run up slopes at the correct speed. Some spells interact with the floor angle, launching projectiles perpendicular to the edge.

##### Wall Sensor and Head Sensor Fixtures

The wall sensors simply let the character controller know if there is a wall to the left or right. They look for overlapping b2EdgeShapes with steep angles. This allows the character to perform wall jumps if the foot sensor isn't touching the ground, and the exact angle of the wall is used to determine the wall jump velocity.

The only time the head sensor is used is when jumping into a ceiling. Jumps are variable-height using the Mario method of assigning a constant upward velocity while the jump button is pressed for a number of frames after the jump starts. If the head sensor detects a ceiling, this routine is cut short so we can't stick to the ceiling.

### Platforms and Objects

There are two types of moving objects in Box2D - kinematic and dynamic. Kinematic objects can move and rotate but don't receive forces from collisions, like most classical moving platforms. Dynamic objects, like the characters, are affected by collision forces when moving and rotating.

The character controller can treat these objects similarly to static walls, but with a bit of extra work to correct for relative velocities and changing angles. Moving platforms and blocks are also built out of b2EdgeShapes. However, when the foot sensor detects that these shapes are attached to kinematic or dynamic objects, we query the object for its current velocity and rotation. These are used to figure out the correct *relative* velocity of the character and the real angle we are standing on.

```
b2Vec2 velocity = m_unit->m_physics->Body().GetLinearVelocity();
if (m_movingPlatform) // a *b2Body we are standing on
{
   // correct for the platform's movement
   velocity -= m_movingPlatform->GetLinearVelocity();
   if (m_movingPlatform->GetAngularVelocity() != 0)
   {
      // m_movingContactPoint stores the world position where we are contacting the platform,
      //  assigned in the PreSolve callback
      // contactVector is our position relative to the axis of rotation of the platform
      b2Vec2 contactVector = m_movingContactPoint - m_movingPlatform->GetPosition();
      b2Vec2 contactAngularVelocity = b2Vec2(
         -1 * m_movingPlatform->GetAngularVelocity() * contactVector.y, 
         m_movingPlatform->GetAngularVelocity() * contactVector.x);
      velocity -= contactAngularVelocity;
   }
}
// velocity now holds our relative velocity for use in movement and animations
```

<video autoplay loop muted playsinline src="seesaw.webm"></video> {.media}

A seesaw platform is a dynamic body with a fixed position. The character controller needs to calculate the correct relative velocity and contact angles from the edge fixtures and angular velocity. {.caption}

#### Crushing force

In Box2D's PostSolve for collisions, we can access the contact impulse. This can be used to determine how much force is being applied to our character and if they should take damage from being crushed. Each frame, all impluses are added together and tracked over time. This is important because a collision might apply its force over multiple frames depending on exactly how the objects collide. After considering certain thresholds, these crushing forces apply damage to the character.

<video autoplay loop muted playsinline src="crushing.webm"></video> {.media}

The impluses caused by heavy blocks or kinematic objects are appropriately much larger than light objects, and generally the force required to cause damage comes from two opposing impulses, like a wall and block! {.caption}

### Character Abilities

In addition to wall-jumping, characters can double-jump, down-jump, and dodge.

- **Double-jumping** is a classic feature for aerial control. When coding a double-jump, you'll probably want to make sure you never end up reducing the player's upwards velocity. Another nice feature that helps players feel under control is to set the player's X-velocity to zero if the double-jump is performed at a very low X-velocity.
- A **down-jump** is performed if the player is pressing down when they press the jump button in the air. It instantly gives the player a downwards Y-velocity. If the joystick isn't tilted left or right, it also sets the X-velocity to zero. This tool is great for quickly gaining momentum by down-jumping into slopes and for instantly controlling your X-velocity to avoid obstacles.
- **Dodging** in Mystic Melee uses two buttons, one for left and one for right. I believe it feels better to have each direction ready for an instant reaction, and it fits when dodge can only be used to go left or right. Dodge is primarily used to give the player I-frames and serves as a way to set the Y-velocity to zero. There's also a special momentum-directing feature to the dodge: if you've landed on the ground recently and dodge, the force you landed with is transferred to the dodge velocity. This is a super satisfying way to reward players for dropping from great heights.

<video autoplay loop muted playsinline src="precision.webm"></video> {.media}

Note: your viewport isn't this small in game! {.caption}

This combination of abilities allows the player to instantly set their X or Y velocities to zero with high precision. This allows for exacting platforming challenges at high speed.

### Other Considerations

There's more details under the hood which fine-tune the movement system. Here's a few considerations.

- Keeping up momentum: Characters have a maximum speed they can reach by running on flat ground. When they've exceeded that speed using slopes or abilities, continuing to run in that direction on flat ground keeps up their momentum to reward the player.
- Jump vectors: Jumping and wall-jumping consider the character's current velocity and contact angle when transitioning to the jump, so you can build up speed using slopes or chain wall jumps for extra height.
- Grace periods: Give the player a few frames after they have walked off an edge where they can still jump (without using their double-jump). This is another technique that dates all the way back to Super Mario Brothers!
- Unit state: Along with sliding, units can be in a stunned state or frozen solid. Being in these states affects the ground friction and can increase the damage recieved from crushing forces.
- Underground issues: A possible issue with using b2EdgeShapes as the ground is that sometimes bodies can be pushed inside the terrain. Usually this isn't an issue because crushing forces will kill the unit, but with many spells and abilities modifying velocity and position in non-physical ways, it can sometimes happen. To solve this, the position of units is checked against the tile array to determine if they are underground, in which case they should be instantly killed.

### Is mixing platforming with rigidbody physics worth the effort?

For Mystic Melee, this combination is what makes the game unique. Responsive movement that also rewards momentum-building can be hard to achieve. It's fun to fight in the interactive environment, and many spells and puzzles are built around this physical system.

<video autoplay loop muted playsinline src="ballgame.webm"></video> {.media}

Some of these techinques will have to be used anytime you want to leverage an engine's collision detection in your platformer. However, for a more classic feel, you may be better off trying to ignore the features of your physics engine as much as possible. It's simpler to make a character move like Megaman than like Sonic. But it's rewarding to learn the ins and outs of a physics engine and achieve responsive movement in a dynamic world.