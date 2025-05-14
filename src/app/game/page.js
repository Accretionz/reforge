"use client";

import { useEffect, useRef } from "react";
import { Camera } from "@/Camera.js";
import "../../../style.css";
import { GameLoop } from "@/GameLoop.js";
import { Vector2 } from "@/Vector2.js";
import { Sprite } from "@/Sprite.js";
import { resources } from "@/Resource.js";
import { Hero } from "@/objects/Hero/Hero.js";
import { Input } from "@/Input.js";
import { gridCells } from "@/helpers/grid.js";
import { GameObject } from "@/GameObject.js";

export default function GamePage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Establish the root scene
    const mainScene = new GameObject({
      position: new Vector2(0, 0),
    });

    // Build up the scene by adding a sky, ground, and hero
    const skySprite = new Sprite({
      resource: resources.images.sky,
      frameSize: new Vector2(320, 180),
    });

    const groundSprite = new Sprite({
      resource: resources.images.ground,
      frameSize: new Vector2(320, 180),
    });
    mainScene.addChild(groundSprite);

    const hero = new Hero(gridCells(6), gridCells(5));
    mainScene.addChild(hero);

    const camera = new Camera();
    mainScene.addChild(camera);

    // Add an input class to the main scene
    mainScene.input = new Input();

    // Establish update and draw loops
    const update = (delta) => {
      mainScene.stepEntry(delta, mainScene);
    };

    const draw = () => {
      // Clear anything stale
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      skySprite.drawImage(ctx, 0, 0);

      // Save the current state (for camera offset)
      ctx.save();

      // Offset by camera position
      ctx.translate(camera.position.x, camera.position.y);

      // Draw objects in the mounted scene
      mainScene.draw(ctx, 0, 0);

      // Restore to original state
      ctx.restore();
    };

    // Start the game
    const gameLoop = new GameLoop(update, draw);
    gameLoop.start();

    // Cleanup on unmount
    return () => gameLoop.stop();
  }, []);

  return <canvas id="game-canvas" ref={canvasRef}></canvas>;
}