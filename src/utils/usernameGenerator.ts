const adjectives = [
  'Anonymous', 'Mysterious', 'Secret', 'Hidden', 'Unknown',
  'Quiet', 'Silent', 'Stealthy', 'Covert', 'Private',
  'Invisible', 'Unseen', 'Shadow', 'Ghost', 'Phantom',
  'Whisper', 'Echo', 'Silhouette', 'Veiled', 'Masked'
];

const nouns = [
  'User', 'Visitor', 'Guest', 'Stranger', 'Observer',
  'Spectator', 'Witness', 'Viewer', 'Reader', 'Listener',
  'Traveler', 'Explorer', 'Wanderer', 'Nomad', 'Pilgrim',
  'Seeker', 'Adventurer', 'Voyager', 'Rover', 'Rambler'
];

// Generate a random username using localStorage to persist it
export const generateUsername = (): string => {
  // Check if we already have a username stored
  const storedUsername = localStorage.getItem('anonymousUsername');
  if (storedUsername) {
    return storedUsername;
  }

  // Generate a new username
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  const newUsername = `${randomAdjective}${randomNoun}${randomNumber}`;

  // Store the username
  localStorage.setItem('anonymousUsername', newUsername);
  
  return newUsername;
}; 