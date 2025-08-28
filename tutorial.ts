
export const FULL_TUTORIAL_STEPS = [
    // Main Menu
    { id: 0, screen: 'main_menu', title: "Welcome!", text: "Let's learn how to play Tiny Battle Simulator.", nextButton: "Let's go!", allowSkip: true },
    { id: 1, screen: 'main_menu', title: "Start Your Adventure", text: "Click 'Campaign' to begin your journey.", highlightTarget: 'campaign-button' },
    // Level Select
    { id: 2, screen: 'world_select', title: "World Map", text: "This is the world map. Let's start in the Verdant Plains (World 1).", highlightTarget: 'world-1-button' },
    { id: 3, screen: 'level_select', title: "Select a Level", text: "Now, select the first level to start your first battle.", highlightTarget: 'level-1-button' },
    // Battle Screen (original steps adapted)
    { id: 4, screen: 'battle', title: "Welcome to the Battle!", text: "Your goal is to defeat all enemy units. To do this, you must strategically place your own units.", nextButton: "Got it!" },
    { id: 5, screen: 'battle', title: "Your Budget", text: "You have a budget to build your army. A good start is two Knights and one Archer. Let's select a Knight first.", nextButton: "Okay" },
    { id: 6, screen: 'battle', title: "Select a Knight", text: "Click on the Knight's card in the selection bar below.", highlightTarget: 'unit-card-melee' },
    { id: 7, screen: 'battle', title: "Place Your Knight", text: "Great! Now, tap or click anywhere inside the blue deployment zone to place your first Knight.", highlightTarget: 'deployment-zone' },
    { id: 8, screen: 'battle', title: "Place a Second Knight", text: "Good job! Let's add another Knight. If it's not selected, click its card again and place it on the field.", highlightTarget: 'deployment-zone' },
    { id: 9, screen: 'battle', title: "Select an Archer", text: "Perfect. Now, let's add some ranged support. Select the Archer from the bar.", highlightTarget: 'unit-card-ranged' },
    { id: 10, screen: 'battle', title: "Place Your Archer", text: "Place the Archer behind your Knights. This will keep it safe while it attacks from a distance.", highlightTarget: 'deployment-zone' },
    { id: 11, screen: 'battle', title: "Start the Battle!", text: "Excellent! Your army is ready. Press Start to begin the fight.", highlightTarget: 'start-button' },
    { id: 12, screen: 'battle', title: "Spells & Energy", text: "Durante la batalla se regenera energía. Úsala para lanzar hechizos. El medidor y tus hechizos están aquí abajo.", highlightTarget: 'spell-energy', nextButton: "Entendido" },
    { id: 13, screen: 'battle', title: "Controles de Batalla", text: "Con estos botones puedes pausar y adelantar la simulación.", highlightTarget: 'speed-controls', nextButton: "Siguiente" },
    { id: 14, screen: 'battle', title: "Hechizo: Rayo", text: "Toca el botón del Rayo y luego pulsa sobre el campo para golpear a los enemigos en área.", highlightTarget: 'spell-button-lightning', dimBackground: false },
    { id: 15, screen: 'battle', title: "Victory!", text: "You won! Now let's use your reward to strengthen your army. Click 'Exit' to go to the store.", highlightTarget: 'exit-button-victory' },
    { id: 16, screen: 'store', title: "Store", text: "The Guardian is a tough tank that can protect your archers. Let's buy one! This will complete the tutorial.", highlightTarget: 'unit-card-tank' },
];
