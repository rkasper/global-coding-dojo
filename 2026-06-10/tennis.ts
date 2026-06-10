const POINT_NAMES = ["Love", "Fifteen", "Thirty", "Forty"];

export function score(player1Points: number, player2Points: number): string {
  if (player1Points === player2Points) {
    return player1Points >= 3 ? "Deuce" : `${POINT_NAMES[player1Points]}-All`;
  }

  const leader = player1Points > player2Points ? 1 : 2;
  const lead = Math.abs(player1Points - player2Points);

  if (Math.max(player1Points, player2Points) >= 4 && lead >= 2) {
    return `Player ${leader} wins`;
  }

  if (player1Points >= 3 && player2Points >= 3 && lead === 1) {
    return `Advantage Player ${leader}`;
  }

  return `${POINT_NAMES[player1Points]}-${POINT_NAMES[player2Points]}`;
}
