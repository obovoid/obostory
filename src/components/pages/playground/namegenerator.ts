const syllables = [
    'be', 'bo', 'ba', 'de', 'do', 'da', 'fe', 'fo', 'fa',
    'ge', 'go', 'ga', 'he', 'ho', 'ha', 'je', 'jo', 'ja',
    'ke', 'ko', 'ka', 'le', 'lo', 'la', 'me', 'mo', 'ma',
    'ne', 'no', 'na', 'pe', 'po', 'pa', 're', 'ro', 'ra',
    'se', 'so', 'sa', 'te', 'to', 'ta', 've', 'vo', 'va',
    'we', 'wo', 'wa', 'ye', 'yo', 'ya'
];
  
  // Function to generate a random English first name
function generateRandomFirstName(): string {
    // Generate 2 to 3 syllables
    const min = 2
    const max = 3
    const numberOfSyllables = Math.floor(Math.random() * (max - min + 1) + min);

    let firstName = '';
  
    for (let i = 0; i < numberOfSyllables; i++) {
      const randomIndex = Math.floor(Math.random() * syllables.length);
      firstName += syllables[randomIndex];
    }
  
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

export { generateRandomFirstName }