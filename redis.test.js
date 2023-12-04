const redis = require('redis');

describe('Redis Client', () => {
  let client;

  // Initialiser le client Redis
  beforeAll(async () => {
    client = redis.createClient({
      url: 'redis://localhost:6379' 
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();
  });

  // Fermer la connexion après les tests
  afterAll(async () => {
    await client.quit();
  });

  // Test pour pinguer Redis
  test('should ping Redis', async () => {
    await expect(client.ping()).resolves.toEqual('PONG');
  });
});
