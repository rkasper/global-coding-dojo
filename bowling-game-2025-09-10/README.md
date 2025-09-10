# Bowling Game Kata Instructions

## Goal
Write a program to calculate the total score of a bowling game.

## Bowling Rules Refresher
- A game consists of 10 frames
- In each frame, the player has up to 2 rolls to knock down 10 pins
- **Strike**: All 10 pins knocked down with the first roll (marked X)
- **Spare**: All 10 pins knocked down with two rolls (marked /)
- **Regular**: Some pins left standing after two rolls

## Scoring Rules
- **Regular frame**: Just add up the pins knocked down
- **Spare**: 10 + the next roll
- **Strike**: 10 + the next TWO rolls
- **10th frame special**: If you get a strike or spare, you get extra rolls to complete the bonus

## Test Cases to Build (in order)

### 1. ✅ Start Simple - Gutter Game
```
All rolls knock down 0 pins
Score = 0
```

### 2. ✅ All Ones
```
Player knocks down 1 pin with each roll
20 rolls total, score = 20
```

### 3. ✅ One Spare
```
First frame: 5 pins, then 5 pins (spare)
Third roll: 3 pins
All other rolls: 0 pins
Score = 10 + 3 + 3 = 16
```

### 4. ✅ One Strike
```
First roll: 10 pins (strike)
Next two rolls: 3 and 4
All other rolls: 0 pins
Score = 10 + 3 + 4 + 3 + 4 = 24
```

### 5. Perfect Game
```
All strikes (12 strikes total - 10 frames plus 2 bonus)
Score = 300
```

## Interface Suggestions
```
game = BowlingGame()
game.roll(pins)  # Record pins knocked down
game.score()     # Return total score
```

## Facilitator Tips
- **Start with the gutter game** - easiest test to pass
- **Let the tests drive the design** - don't think ahead too much
- **One test at a time** - resist jumping ahead
- **Keep it simple** - the elegance emerges through refactoring
- **Don't worry about input validation** - focus on the scoring logic

## Common Pitfalls to Avoid
- Don't try to model frames explicitly at first
- Don't worry about the 10th frame complexity until you get there
- Keep the interface simple - just roll() and score()

## The Beauty of This Kata
- Shows how simple tests can drive elegant design
- Demonstrates incremental development
- The final solution is surprisingly clean and small
- Great for showing TDD red-green-refactor cycle
