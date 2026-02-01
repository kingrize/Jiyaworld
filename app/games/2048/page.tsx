"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { LayoutGrid, ArrowLeft, Gamepad2, RotateCcw } from "lucide-react";
import { FloatingSidebar } from "@/components/floating-sidebar";
import styles from "./game.module.css";

// ============================================
// GAME LOGIC - PORTED EXACTLY FROM ORIGINAL
// DO NOT MODIFY GAME MECHANICS
// ============================================

interface Position {
    x: number;
    y: number;
}

interface TileData {
    position: Position;
    value: number;
    id: number;
    previousPosition?: Position;
    mergedFrom?: TileData[];
}

interface GridData {
    size: number;
    cells: (TileData | null)[][];
}

// Tile class - exact port
class Tile {
    x: number;
    y: number;
    value: number;
    id: number;
    previousPosition: Position | null = null;
    mergedFrom: Tile[] | null = null;

    private static nextId = 0;

    constructor(position: Position, value: number = 2) {
        this.x = position.x;
        this.y = position.y;
        this.value = value;
        this.id = Tile.nextId++;
    }

    savePosition() {
        this.previousPosition = { x: this.x, y: this.y };
    }

    updatePosition(position: Position) {
        this.x = position.x;
        this.y = position.y;
    }

    serialize(): TileData {
        return {
            position: { x: this.x, y: this.y },
            value: this.value,
            id: this.id,
            previousPosition: this.previousPosition || undefined,
            mergedFrom: this.mergedFrom?.map(t => t.serialize()),
        };
    }
}

// Grid class - exact port
class Grid {
    size: number;
    cells: (Tile | null)[][];

    constructor(size: number, previousState?: (TileData | null)[][]) {
        this.size = size;
        this.cells = previousState ? this.fromState(previousState) : this.empty();
    }

    empty(): (Tile | null)[][] {
        const cells: (Tile | null)[][] = [];
        for (let x = 0; x < this.size; x++) {
            const row: (Tile | null)[] = [];
            for (let y = 0; y < this.size; y++) {
                row.push(null);
            }
            cells.push(row);
        }
        return cells;
    }

    fromState(state: (TileData | null)[][]): (Tile | null)[][] {
        const cells: (Tile | null)[][] = [];
        for (let x = 0; x < this.size; x++) {
            const row: (Tile | null)[] = [];
            for (let y = 0; y < this.size; y++) {
                const tile = state[x][y];
                row.push(tile ? new Tile(tile.position, tile.value) : null);
            }
            cells.push(row);
        }
        return cells;
    }

    randomAvailableCell(): Position | undefined {
        const cells = this.availableCells();
        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }
        return undefined;
    }

    availableCells(): Position[] {
        const cells: Position[] = [];
        this.eachCell((x, y, tile) => {
            if (!tile) {
                cells.push({ x, y });
            }
        });
        return cells;
    }

    eachCell(callback: (x: number, y: number, tile: Tile | null) => void) {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                callback(x, y, this.cells[x][y]);
            }
        }
    }

    cellsAvailable(): boolean {
        return this.availableCells().length > 0;
    }

    cellAvailable(cell: Position): boolean {
        return !this.cellOccupied(cell);
    }

    cellOccupied(cell: Position): boolean {
        return !!this.cellContent(cell);
    }

    cellContent(cell: Position): Tile | null {
        if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
        }
        return null;
    }

    insertTile(tile: Tile) {
        this.cells[tile.x][tile.y] = tile;
    }

    removeTile(tile: Tile) {
        this.cells[tile.x][tile.y] = null;
    }

    withinBounds(position: Position): boolean {
        return position.x >= 0 && position.x < this.size &&
            position.y >= 0 && position.y < this.size;
    }

    serialize(): GridData {
        const cellState: (TileData | null)[][] = [];
        for (let x = 0; x < this.size; x++) {
            const row: (TileData | null)[] = [];
            for (let y = 0; y < this.size; y++) {
                const tile = this.cells[x][y];
                row.push(tile ? tile.serialize() : null);
            }
            cellState.push(row);
        }
        return { size: this.size, cells: cellState };
    }
}

// GameManager class - exact port of game logic
class GameManager {
    size: number;
    grid: Grid;
    score: number = 0;
    over: boolean = false;
    won: boolean = false;
    keepPlayingMode: boolean = false;
    startTiles: number = 2;

    constructor(size: number) {
        this.size = size;
        this.grid = new Grid(size);
        this.setup();
    }

    restart() {
        this.setup();
    }

    keepPlaying() {
        this.keepPlayingMode = true;
    }

    isGameTerminated(): boolean {
        return this.over || (this.won && !this.keepPlayingMode);
    }

    setup() {
        this.grid = new Grid(this.size);
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlayingMode = false;
        this.addStartTiles();
    }

    addStartTiles() {
        for (let i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    }

    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            const value = Math.random() < 0.9 ? 2 : 4;
            const position = this.grid.randomAvailableCell();
            if (position) {
                const tile = new Tile(position, value);
                this.grid.insertTile(tile);
            }
        }
    }

    prepareTiles() {
        this.grid.eachCell((x, y, tile) => {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }

    moveTile(tile: Tile, cell: Position) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    }

    move(direction: number): boolean {
        // 0: up, 1: right, 2: down, 3: left
        if (this.isGameTerminated()) return false;

        const vector = this.getVector(direction);
        const traversals = this.buildTraversals(vector);
        let moved = false;

        this.prepareTiles();

        traversals.x.forEach((x) => {
            traversals.y.forEach((y) => {
                const cell = { x, y };
                const tile = this.grid.cellContent(cell);

                if (tile) {
                    const positions = this.findFarthestPosition(cell, vector);
                    const next = this.grid.cellContent(positions.next);

                    if (next && next.value === tile.value && !next.mergedFrom) {
                        const merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];

                        this.grid.insertTile(merged);
                        this.grid.removeTile(tile);

                        tile.updatePosition(positions.next);

                        this.score += merged.value;

                        if (merged.value === 2048) this.won = true;
                    } else {
                        this.moveTile(tile, positions.farthest);
                    }

                    if (cell.x !== tile.x || cell.y !== tile.y) {
                        moved = true;
                    }
                }
            });
        });

        if (moved) {
            this.addRandomTile();

            if (!this.movesAvailable()) {
                this.over = true;
            }
        }

        return moved;
    }

    getVector(direction: number): Position {
        const map: { [key: number]: Position } = {
            0: { x: 0, y: -1 },  // Up
            1: { x: 1, y: 0 },   // Right
            2: { x: 0, y: 1 },   // Down
            3: { x: -1, y: 0 },  // Left
        };
        return map[direction];
    }

    buildTraversals(vector: Position): { x: number[]; y: number[] } {
        const traversals: { x: number[]; y: number[] } = { x: [], y: [] };

        for (let pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    findFarthestPosition(cell: Position, vector: Position): { farthest: Position; next: Position } {
        let previous: Position;
        let current = cell;

        do {
            previous = current;
            current = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.grid.withinBounds(current) && this.grid.cellAvailable(current));

        return {
            farthest: previous,
            next: current,
        };
    }

    movesAvailable(): boolean {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }

    tileMatchesAvailable(): boolean {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const tile = this.grid.cellContent({ x, y });

                if (tile) {
                    for (let direction = 0; direction < 4; direction++) {
                        const vector = this.getVector(direction);
                        const cell = { x: x + vector.x, y: y + vector.y };
                        const other = this.grid.cellContent(cell);

                        if (other && other.value === tile.value) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    getTiles(): TileData[] {
        const tiles: TileData[] = [];
        this.grid.eachCell((x, y, tile) => {
            if (tile) {
                tiles.push(tile.serialize());
            }
        });
        return tiles;
    }
}

// ============================================
// REACT COMPONENT
// ============================================

export default function Game2048() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [game, setGame] = useState<GameManager | null>(null);
    const [tiles, setTiles] = useState<TileData[]>([]);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const gameContainerRef = useRef<HTMLDivElement>(null);

    // Initialize game
    useEffect(() => {
        const newGame = new GameManager(4);
        setGame(newGame);
        updateState(newGame);

        // Load best score from localStorage
        const saved = localStorage.getItem("2048-best");
        if (saved) setBestScore(parseInt(saved, 10));
    }, []);

    const updateState = (g: GameManager) => {
        setTiles(g.getTiles());
        setScore(g.score);
        setGameOver(g.over);
        setGameWon(g.won && !g.keepPlayingMode);

        // Update best score
        if (g.score > bestScore) {
            setBestScore(g.score);
            localStorage.setItem("2048-best", g.score.toString());
        }
    };

    const handleMove = useCallback((direction: number) => {
        if (!game) return;
        const moved = game.move(direction);
        if (moved) {
            updateState(game);
        }
    }, [game, bestScore]);

    const handleRestart = useCallback(() => {
        if (!game) return;
        game.restart();
        updateState(game);
    }, [game]);

    const handleKeepPlaying = useCallback(() => {
        if (!game) return;
        game.keepPlaying();
        setGameWon(false);
    }, [game]);

    // Keyboard input
    useEffect(() => {
        const map: { [key: number]: number } = {
            38: 0, 87: 0, 75: 0,  // Up: Arrow, W, K
            39: 1, 68: 1, 76: 1,  // Right: Arrow, D, L
            40: 2, 83: 2, 74: 2,  // Down: Arrow, S, J
            37: 3, 65: 3, 72: 3,  // Left: Arrow, A, H
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

            const direction = map[e.keyCode];
            if (direction !== undefined) {
                e.preventDefault();
                handleMove(direction);
            }

            // R key restarts
            if (e.keyCode === 82) {
                e.preventDefault();
                handleRestart();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleMove, handleRestart]);

    // Touch input
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length > 1) return;
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        if (e.changedTouches.length === 0) return;

        const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
        const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 10) {
            // Determine direction: right:1, left:3, down:2, up:0
            const direction = absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
            handleMove(direction);
        }

        touchStartRef.current = null;
    };

    // Get position class for tile
    const getTilePosition = (x: number, y: number) => {
        return `tile-position-${x + 1}-${y + 1}`;
    };

    // Get tile value class
    const getTileClass = (value: number) => {
        if (value > 2048) return "tile-super";
        return `tile-${value}`;
    };

    return (
        <main className={styles.gamePage}>
            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.backButton}>
                        <ArrowLeft size={18} />
                        <span>back</span>
                    </Link>
                    <div className={styles.navDivider} />
                    <div className={styles.navBrand}>
                        <Gamepad2 size={18} className={styles.navIcon} />
                        <span>2048</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={styles.menuButton}
                    aria-label="Open Menu"
                >
                    <LayoutGrid size={22} />
                </button>
            </nav>

            {/* GAME CONTAINER */}
            <div className={styles.container}>
                {/* Header: Score */}
                <div className={styles.header}>
                    <div className={styles.scores}>
                        <div className={styles.scoreBox}>
                            <span className={styles.scoreLabel}>score</span>
                            <span className={styles.scoreValue}>{score}</span>
                        </div>
                        <div className={styles.scoreBox}>
                            <span className={styles.scoreLabel}>best</span>
                            <span className={styles.scoreValue}>{bestScore}</span>
                        </div>
                    </div>
                    <button onClick={handleRestart} className={styles.restartButton}>
                        <RotateCcw size={16} />
                        <span>new game</span>
                    </button>
                </div>

                {/* Instructions */}
                <p className={styles.instructions}>
                    use arrow keys or swipe to merge tiles. get to <strong>2048</strong>!
                </p>

                {/* Game Board */}
                <div
                    ref={gameContainerRef}
                    className={styles.gameContainer}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Game Over / Won Overlay */}
                    {(gameOver || gameWon) && (
                        <div className={`${styles.gameMessage} ${gameWon ? styles.gameWon : styles.gameOverState}`}>
                            <p>{gameWon ? "You win!" : "Game over!"}</p>
                            <div className={styles.messageButtons}>
                                {gameWon && (
                                    <button onClick={handleKeepPlaying} className={styles.keepPlayingButton}>
                                        keep going
                                    </button>
                                )}
                                <button onClick={handleRestart} className={styles.retryButton}>
                                    try again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Grid Background */}
                    <div className={styles.gridContainer}>
                        {[0, 1, 2, 3].map((row) => (
                            <div key={row} className={styles.gridRow}>
                                {[0, 1, 2, 3].map((col) => (
                                    <div key={col} className={styles.gridCell} />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Tiles */}
                    <div className={styles.tileContainer}>
                        {tiles.map((tile) => (
                            <div
                                key={tile.id}
                                className={`${styles.tile} ${styles[getTileClass(tile.value)]} ${styles[getTilePosition(tile.position.x, tile.position.y)]} ${tile.mergedFrom ? styles.tileMerged : ""} ${!tile.previousPosition && !tile.mergedFrom ? styles.tileNew : ""}`}
                            >
                                <div className={styles.tileInner}>{tile.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer hint */}
                <p className={styles.hint}>
                    press <kbd>R</kbd> to restart
                </p>
            </div>
        </main>
    );
}
