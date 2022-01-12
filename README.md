# Effector History

Utility library that implements undo/redo feature for you

## Installation
```bash
npm install effector-history
```

## Usage
```ts
import { createHistory } from 'effector-history'

const right = createEvent()
const up = createEvent()

const $x = createStore(0)
const $y = createStore(0)

$x.on(right, (x) => x+1)

$y.on(up, y => y+1)

const history = createHistory({
  source: {
    x: $x,
    y: $y
  },
  maxLength: 20
})

combine([$x, $y]).watch(console.log)

up()     // [0, 1]
up()     // [0, 2]
right(); // [1, 2]
up();    // [1, 3]

history.undo(); // [1, 2]
history.undo(); // [0, 2]
history.redo(); // [1, 2]
```

## Customization

#### `clock` property
Sometimes you need to add records only on a specific event.  
For example, you have draggable blocks, and you want to push to history only whenever drag is ended.  
For such cases you can use `clock` property:

```ts
createHistory({
  source: { 
    x: $x, 
    y: $y 
  },
  // Only these events will trigger history
  clock: [
    dragEnded
  ],
  maxLength: 20
})
```
Keep in mind that store updates **won't** push to history in this case, so it can cause data incosistency

## API Reference
```ts
history.$history   // All history records
history.$canUndo   // `true` if can undo, `false` otherwise
history.$canRedo   // `true` if can redo, `false` otherwise
history.$curIndex  // Index of currently active history index
history.$curRecord // Current history record
history.$length    // Amount of records in history (min. 1)

history.undo()     // Undo
history.redo()     // Redo
history.clear()    // Clear history
history.push(data) // Manually push something to history
```

## TODO
- [ ] Store clocks that caused history push
- [ ] Suppport different shapes of `source` in `createHistory`
- [ ] Support `createHistory` without `source`
