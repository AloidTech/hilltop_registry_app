"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const COLS = 10;
const ROWS = 10;
const CELL = 48; // px

const walls = [
  [0, 1],
  [0, 2],
];

const keys = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "w",
  "a",
  "s",
  "d",
]);

function placewall(i: number) {
  let x = i;
  let y = i;
  let mult;

  //Formula for turning an index into an x and y if arranged in a grid
  for (let num = 1; num <= ROWS; num++) {
    mult = num * COLS;
    if (i < mult) {
      mult = num - 1 * COLS;
      x = i - mult;
      y = num;
      break;
    }
  }

  return [x, y];
}

/*export default function BoxSimilation() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const wallgrid = useMemo(() => {
    var grid = Array(COLS * ROWS).fill(false) as boolean[];
    for (const [y, x] of walls) {
      if ((x >= 0 && x < COLS) || (y >= 0 && y < ROWS)) {
      }
    }
  }, []);
  /* useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!keys.has(e.key)) return;
      e.preventDefault();

      setPos((p) => {
        let nx = p.x;
        let ny = p.y;
        if (e.key === "ArrowLeft" || e.key === "a") nx = Math.max(0, p.x - 1);
        if (e.key === "ArrowRight" || e.key === "d")
          nx = Math.min(COLS - 1, p.x + 1);
        if (e.key === "ArrowUp" || e.key === "w") ny = Math.max(0, p.y - 1);
        if (e.key === "ArrowDown" || e.key === "s")
          ny = Math.min(ROWS - 1, p.y + 1);
        return { x: nx, y: ny };
      });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(45,46,45)] flex items-center justify-center p-6">
      <div
        className={`relative rounded-xl border border-neutral-700 bg-neutral-800/60 p-4`}
      >
        {/* Grid *//*}
        <div
          className="grid gap-[6px]"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
          }}
        >
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const [cx, cy] = placewall(i);
            const isWall = walls.some(([wy, wx]) => wy === cy && wx === cx);
            return (
              <div
                key={i}
                className={`rounded-md  ${
                  isWall
                    ? "bg-neutral-700/60 border border-neutral-700"
                    : "bg-amber-900 border-amber-700"
                }`}
              />
            );
          })}
        </div>

        {// Player }
        <motion.div
          aria-label="player"
          className="absolute top-4 left-4 rounded-md border border-blue-400/40 bg-blue-500/30 shadow-lg"
          style={{ width: CELL, height: CELL }}
          animate={{ x: pos.x * (CELL + 6), y: pos.y * (CELL + 6) }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          whileTap={{ scale: 0.95 }}
        />

        {// HUD }
        <div className="absolute -top-3 left-4 text-xs text-gray-300">
          Use arrows or WASD to move
        </div>
        <div className="absolute -top-3 right-4 text-xs text-gray-400">
          ({pos.x}, {pos.y})
        </div>
      </div>
    </div>
  );
}*/
