import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from './index'; // Import the app object


// remember to have the OpenAI api key or add mock-api-key
describe('Movie App Server API Tests', () => {
    let server; 

    beforeAll(() => {
        server = app.listen(5001); // Start the server on a different port for testing
    });
    afterAll(async () => {
        // Clean up the database
        await request(server)
            .delete('/register') 
            .send({ email: 'testuser@mail.test' })
            
        server.close(); // Close the server after tests
    }); 

    //register/sign up a new user
    it('should respond to POST /register', async () => {
        const res = await request(server)
            .post('/register')
            .send({ email: 'testuser@mail.test', 
                    password: 'testpassword1', 
                    firstName: 'Jane', 
                    lastName: 'Doe', 
                    city: 'Helsinki' })
            .expect(201);

        expect(res.body).toBeTypeOf('object');
        console.log(res.body.message);
    });

    //list users to see if the new user is added
    it('should list users to GET /register', async () => {
        const res = await request(server)
            .get('/register')
            .expect(200);

        expect(res.body).toBeTypeOf('object');
        console.log(res.body);
    }); 
 
    //sign in the new user
    it ('should respond Sign-in successful to POST /signin', async () => {
        const res = await request(server) 
            .post('/signin')
            .send({email: 'testuser@mail.test', password: 'testpassword1' })
            .expect(200);

        expect(res.body).toBeTypeOf('object');
        expect(res.body).toHaveProperty('token');
        console.log(res.body.message);
    });

    //sign in with wrong password
    it ('should respond Invalid email or password to POST /signin', async () => {
        const res = await request(server) 
            .post('/signin')
            .send({email: 'testuser@mail.test', password: 'wrongpassword' })
            .expect(401);

        expect(res.body).toBeTypeOf('object');
        console.log(res.body.message);
    });
}); 