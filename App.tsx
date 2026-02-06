
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Point, Direction, GameStatus } from './types';
import { GRID_SIZE, HEART_GOAL, INITIAL_SPEED, SPEED_INCREMENT, MIN_SPEED, COLORS } from './constants';
import { BearHead, BearBody, MatchaItem, ToiletItem, BedItem, ManItem } from './components/BearParts';
import { BackgroundDecor } from './components/BackgroundDecor';
import { soundManager } from './components/SoundManager';

const getRandomPoint = (exclude: Point[]): Point => {
  let p: Point;
  do {
    p = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (exclude.some(s => s.x === p.x && s.y === p.y));
  return p;
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [snake, setSnake] = useState<Point[]>([{ x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }]);
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [matcha, setMatcha] = useState<Point>({ x: 7, y: 3 });
  const [toilet, setToilet] = useState<Point>({ x: 10, y: 10 });
  const [bed, setBed] = useState<Point>({ x: 2, y: 2 });
  const [man, setMan] = useState<Point>({ x: 12, y: 2 });
  const [count, setCount] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isFrozen, setIsFrozen] = useState(false);
  
  const directionRef = useRef<Direction>(Direction.UP);
  const lastUpdateRef = useRef<number>(0);
  const requestRef = useRef<number>();

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }];
    setSnake(initialSnake);
    setDirection(Direction.UP);
    directionRef.current = Direction.UP;
    const p1 = getRandomPoint(initialSnake);
    const p2 = getRandomPoint([...initialSnake, p1]);
    const p3 = getRandomPoint([...initialSnake, p1, p2]);
    const p4 = getRandomPoint([...initialSnake, p1, p2, p3]);
    setMatcha(p1);
    setToilet(p2);
    setBed(p3);
    setMan(p4);
    setCount(0);
    setSpeed(INITIAL_SPEED);
    setIsFrozen(false);
    setStatus(GameStatus.PLAYING);
    soundManager.startBGM();
  }, []);

  const moveSnake = useCallback(() => {
    if (isFrozen) return;

    setSnake(prev => {
      const head = prev[0];
      let newHead = { ...head };

      // Magnet logic: Check distance to man
      const dx = man.x - head.x;
      const dy = man.y - head.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Reduced threshold from 2.5 to 1.5 to make the pull less "strong" / aggressive
      if (dist <= 1.5) {
        // Force movement towards man when very close
        if (Math.abs(dx) > Math.abs(dy)) {
          newHead.x += Math.sign(dx);
          directionRef.current = dx > 0 ? Direction.RIGHT : Direction.LEFT;
        } else {
          newHead.y += Math.sign(dy);
          directionRef.current = dy > 0 ? Direction.DOWN : Direction.UP;
        }
        setDirection(directionRef.current);
      } else {
        // Standard movement based on current directionRef
        switch (directionRef.current) {
          case Direction.UP: newHead.y -= 1; break;
          case Direction.DOWN: newHead.y += 1; break;
          case Direction.LEFT: newHead.x -= 1; break;
          case Direction.RIGHT: newHead.x += 1; break;
        }
      }

      // Check wall/self collision
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prev.some((segment, idx) => idx !== prev.length - 1 && segment.x === newHead.x && segment.y === newHead.y)
      ) {
        soundManager.playCrash();
        soundManager.stopBGM();
        setStatus(GameStatus.GAMEOVER);
        return prev;
      }

      // Check collision with man emoji
      if (newHead.x === man.x && newHead.y === man.y) {
        soundManager.playCrash();
        soundManager.stopBGM();
        setStatus(GameStatus.GAMEOVER_MAN);
        return prev;
      }

      const newSnake = [newHead, ...prev];

      // Collect Matcha
      if (newHead.x === matcha.x && newHead.y === matcha.y) {
        soundManager.playPop();
        const newCount = count + 1;
        setCount(newCount);
        if (newCount >= HEART_GOAL) {
          soundManager.playWin();
          soundManager.stopBGM();
          setStatus(GameStatus.WON);
          return prev;
        }
        setMatcha(getRandomPoint([...newSnake, toilet, bed, man]));
        setSpeed(s => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
      } 
      // Collect Toilet
      else if (newHead.x === toilet.x && newHead.y === toilet.y) {
        soundManager.playToilet();
        setCount(c => Math.max(0, c - 5));
        setToilet(getRandomPoint([...newSnake, matcha, bed, man]));
        newSnake.pop();
      }
      // Collect Bed
      else if (newHead.x === bed.x && newHead.y === bed.y) {
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 1000);
        setBed(getRandomPoint([...newSnake, matcha, toilet, man]));
        newSnake.pop();
      }
      else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [matcha, toilet, bed, man, count, isFrozen]);

  const gameLoop = useCallback((time: number) => {
    if (status === GameStatus.PLAYING) {
      if (time - lastUpdateRef.current > speed) {
        moveSnake();
        lastUpdateRef.current = time;
      }
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  }, [status, speed, moveSnake]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(requestRef.current!);
      soundManager.stopBGM();
    };
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (directionRef.current !== Direction.DOWN) directionRef.current = Direction.UP; break;
        case 'ArrowDown': if (directionRef.current !== Direction.UP) directionRef.current = Direction.DOWN; break;
        case 'ArrowLeft': if (directionRef.current !== Direction.RIGHT) directionRef.current = Direction.LEFT; break;
        case 'ArrowRight': if (directionRef.current !== Direction.LEFT) directionRef.current = Direction.RIGHT; break;
        case 'w': if (directionRef.current !== Direction.DOWN) directionRef.current = Direction.UP; break;
        case 's': if (directionRef.current !== Direction.UP) directionRef.current = Direction.DOWN; break;
        case 'a': if (directionRef.current !== Direction.RIGHT) directionRef.current = Direction.LEFT; break;
        case 'd': if (directionRef.current !== Direction.LEFT) directionRef.current = Direction.RIGHT; break;
      }
      setDirection(directionRef.current);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center p-4 bg-[#F3E5F5]">
      <BackgroundDecor />

      <div className="z-10 text-center mb-6">
        <h1 className="text-3xl md:text-5xl font-pacifico text-[#9575CD] drop-shadow-sm px-4">
          Mareeha the Bear and her Valentine's Journey
        </h1>
        <div className="mt-2 flex items-center justify-center space-x-2 bg-white px-4 py-1 rounded-full shadow-sm border border-purple-100">
           <div className="w-5 h-4 bg-[#9BB068] rounded-b-full border border-[#7D8C55]" />
           <span className="font-bold text-[#9575CD] text-lg">{count} / {HEART_GOAL} Matcha</span>
        </div>
      </div>

      <div 
        className={`z-10 relative bg-white rounded-2xl shadow-xl border-8 border-[#D1C4E9] overflow-hidden transition-opacity duration-300 ${isFrozen ? 'opacity-70' : 'opacity-100'}`}
        style={{ width: 'min(90vw, 500px)', height: 'min(90vw, 500px)' }}
      >
        <div 
          className="absolute inset-0 grid" 
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-[#F3E5F5]" />
          ))}
        </div>

        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}>
          {status !== GameStatus.START && (
            <>
              <div style={{ gridColumn: matcha.x + 1, gridRow: matcha.y + 1 }}>
                <MatchaItem />
              </div>
              <div style={{ gridColumn: toilet.x + 1, gridRow: toilet.y + 1 }}>
                <ToiletItem />
              </div>
              <div style={{ gridColumn: bed.x + 1, gridRow: bed.y + 1 }}>
                <BedItem />
              </div>
              <div style={{ gridColumn: man.x + 1, gridRow: man.y + 1 }}>
                <ManItem />
              </div>
            </>
          )}

          {snake.map((segment, i) => (
            <div key={i} style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}>
              {i === 0 ? <BearHead direction={direction} heartEyes={status === GameStatus.GAMEOVER_MAN} /> : <BearBody />}
            </div>
          ))}

          {isFrozen && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-100/30 pointer-events-none">
              <span className="text-4xl">💤</span>
            </div>
          )}
        </div>

        {status === GameStatus.START && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 mb-4 scale-150">
              <BearHead direction="UP" />
            </div>
            <p className="text-[#8d6e63] font-bold text-xl mb-2">Help Mareeha find her Matcha!</p>
            <p className="text-[#a1887f] text-sm mb-1">Avoid toilets! 🛏️ Bed freezes you.</p>
            <p className="text-red-400 text-sm font-bold mb-6">Watch out for the white man emoji! 👱‍♂️</p>
            <button 
              onClick={resetGame}
              className="bg-[#9575CD] hover:bg-[#B39DDB] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95 text-lg"
            >
              Start Journey 🐾
            </button>
          </div>
        )}

        {(status === GameStatus.GAMEOVER || status === GameStatus.GAMEOVER_MAN) && (
          <div className="absolute inset-0 bg-purple-50/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl md:text-4xl font-pacifico text-[#9575CD] mb-4">
              {status === GameStatus.GAMEOVER_MAN 
                ? "You chose a white man over me… try again." 
                : "Try again Mars!"}
            </h2>
            <button 
              onClick={resetGame}
              className="bg-[#9575CD] hover:bg-[#B39DDB] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95"
            >
              Restart ❤️
            </button>
          </div>
        )}

        {status === GameStatus.WON && (
          <div className="absolute inset-0 bg-purple-50/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in slide-in-from-bottom duration-500">
            <div className="w-20 h-20 mb-4 float-animation">
               <BearHead direction="UP" />
            </div>
            <h2 className="text-3xl font-pacifico text-[#9575CD] mb-4">Mareeha is happy!</h2>
            <p className="text-[#8d6e63] font-bold text-2xl mb-8">Will you be my Valentine?</p>
            <div className="flex space-x-4 w-full justify-center">
              <button 
                onClick={() => { setStatus(GameStatus.CELEBRATING); soundManager.playWin(); }}
                className="bg-[#9575CD] hover:bg-[#B39DDB] text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex-1 max-w-[140px]"
              >
                YES!
              </button>
              <button 
                onClick={() => { setStatus(GameStatus.CELEBRATING); soundManager.playWin(); }}
                className="bg-[#9575CD] hover:bg-[#B39DDB] text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex-1 max-w-[140px]"
              >
                YES!
              </button>
            </div>
          </div>
        )}

        {status === GameStatus.CELEBRATING && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
             {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute pointer-events-none animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#B39DDB] opacity-70">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
             ))}

            <div className="relative z-10 space-y-4">
              <div className="w-32 h-32 mx-auto animate-bounce mb-8">
                 <BearHead direction="UP" />
              </div>
              <h2 className="text-4xl md:text-5xl font-pacifico text-[#9575CD] leading-relaxed">
                Yay! <br/> Happy Valentine's Day! 💖
              </h2>
              <button 
                onClick={() => setStatus(GameStatus.START)}
                className="mt-8 text-[#9575CD] font-bold hover:underline"
              >
                Play again?
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 md:hidden z-10">
        <div />
        <button onTouchStart={() => { if (directionRef.current !== Direction.DOWN) directionRef.current = Direction.UP; setDirection(Direction.UP); }} className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center active:bg-purple-200">
          <svg className="w-8 h-8 rotate-0 fill-[#9575CD]" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
        </button>
        <div />
        <button onTouchStart={() => { if (directionRef.current !== Direction.RIGHT) directionRef.current = Direction.LEFT; setDirection(Direction.LEFT); }} className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center active:bg-purple-200">
          <svg className="w-8 h-8 -rotate-90 fill-[#9575CD]" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
        </button>
        <button onTouchStart={() => { if (directionRef.current !== Direction.UP) directionRef.current = Direction.DOWN; setDirection(Direction.DOWN); }} className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center active:bg-purple-200">
          <svg className="w-8 h-8 rotate-180 fill-[#9575CD]" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
        </button>
        <button onTouchStart={() => { if (directionRef.current !== Direction.LEFT) directionRef.current = Direction.RIGHT; setDirection(Direction.RIGHT); }} className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center active:bg-purple-200">
          <svg className="w-8 h-8 rotate-90 fill-[#9575CD]" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
        </button>
      </div>

    </div>
  );
};

export default App;
