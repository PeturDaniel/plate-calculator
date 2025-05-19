import { useEffect, useRef, useState } from "react";
import type { Item } from "../../types/items";
import { PlacedItem } from "../../types/placed-item";
import { styles } from "./styles";



export function Calculator() {
  const [plateWidth, setPlateWidth] = useState<number>(1000);
  const [plateHeight, setPlateHeight] = useState<number>(1000);
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState({ width: 0, height: 0, quantity: 1 });
  const [layouts, setLayouts] = useState<PlacedItem[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addItem = () => {
    if (newItem.width > 0 && newItem.height > 0 && newItem.quantity > 0) {
      setItems(prev => [...prev, { ...newItem, id: Date.now() }]);
      setNewItem({ width: 0, height: 0, quantity: 1 });
    }
  };


  const calculateLayouts = () => {
    const allItems = items.flatMap(item =>
      Array.from({ length: item.quantity }).map(() => ({ width: item.width, height: item.height }))
    );

    interface Shelf { y: number; height: number; x: number; }

    const plates: PlacedItem[][] = [];
    const plateShelves: Shelf[][] = [];

    allItems.forEach(item => {
      let placed = false;
      for (let i = 0; i < plates.length; i++) {
        const shelves = plateShelves[i];
        for (const shelf of shelves) {
          if (item.width <= plateWidth - shelf.x && item.height <= shelf.height) {
            plates[i].push({ x: shelf.x, y: shelf.y, width: item.width, height: item.height });
            shelf.x += item.width;
            placed = true;
            break;
          }
        }
        if (placed) break;
        const usedHeight = shelves.reduce((sum, s) => sum + s.height, 0);
        if (item.height <= plateHeight - usedHeight) {
          const shelf = { y: usedHeight, height: item.height, x: item.width };
          shelves.push(shelf);
          plates[i].push( { x: 0, y: shelf.y, width: item.width, height: item.height });
          placed = true;
          break;
        }
      }
      if (!placed) {
        plates.push([{ x: 0, y: 0, width: item.width, height: item.height }]);
        plateShelves.push([{ y: 0, height: item.height, x: item.width }]);
      }
    });

    setLayouts(plates);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || layouts.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvas.width / plateWidth, canvas.height / plateHeight);

    layouts[0].forEach(item => {
      ctx.strokeStyle = '#333';
      ctx.strokeRect(item.x * scale, item.y * scale, item.width * scale, item.height * scale);
    });
  }, [layouts, plateWidth, plateHeight]);

  return (
    <div style={styles.body}>
      <h1>Plate Cutting Calculator</h1>

      <section>
        <h2>Big Plate Size</h2>
        <input
          type="number"
          value={plateWidth}
          onChange={e => setPlateWidth(Number(e.target.value))}
          placeholder="Width"
        /> x
        <input
          type="number"
          value={plateHeight}
          onChange={e => setPlateHeight(Number(e.target.value))}
          placeholder="height"
        />
      </section>

      <section>
        <h2>Add Small Plate</h2>
        <input
          type="number"
          value={newItem.width}
          onChange={e => setNewItem({ ...newItem, width: Number(e.target.value) })}
          placeholder="Width"
        /> x
        <input
          type="number"
          value={newItem.height}
          onChange={e => setNewItem({ ...newItem, height: Number(e.target.value) })}
          placeholder="Height"
        /> x
        <input
          type="number"
          value={newItem.quantity}
          onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
          placeholder="Quantity"
        />
        <button onClick={addItem} style={styles.button}>
          Add
        </button>
      </section>

      <section>
        <h2>Items to Cut</h2>
        <ul>
          {items.map(item => (
            <li key={item.id}>
              {item.width} x {item.height} (x{item.quantity})
            </li>
          ))}
        </ul>
      </section>
      <button onClick={calculateLayouts} style={styles.calculateButton}>
        Calculate
      </button>

      {layouts.length > 0 && (
        <section style={styles.calculateButton}>
          <h2>Results</h2>
          <p>Plates needed: {layouts.length}</p>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={styles.canvas}
          />
        </section>
      )}
    </div>
  );
}
