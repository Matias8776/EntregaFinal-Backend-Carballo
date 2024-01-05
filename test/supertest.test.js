/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing Ecommerce', () => {
  let regCookie;
  let uid;
  let auth;
  let pid;
  let cid;
  describe('Test de sessions', () => {
    let cookie;
    it('El endpoint POST /api/sessions/register debe crear un nuevo usuario correctamente', async () => {
      const userMock = {
        first_name: 'Ejemplo',
        last_name: 'Test',
        email: 'ejemplo@test.com',
        age: 35,
        password: '123456',
        role: 'premium'
      };
      const result = await requester
        .post('/api/sessions/register')
        .send(userMock);
      regCookie = result.headers['set-cookie'];
      uid = result.body.payload._id;
      cid = result.body.payload.cart;
      expect(result.body.payload).to.have.property('_id');
    });
    it('El endpoint POST /api/sessions/login debe iniciar sesión correctamente y devolver una cookie', async () => {
      const userMock = {
        email: 'ejemplo@test.com',
        password: '123456'
      };
      const result = await requester.post('/api/sessions/login').send(userMock);
      auth = result.headers['set-cookie'];
      const cookieResult = result.headers['set-cookie'][0];
      expect(cookieResult).to.be.ok;
      cookie = {
        name: cookieResult.split('=')[0],
        value: cookieResult.split('=')[1]
      };
      expect(cookie.name).to.be.ok.and.eql('coderCookie');
      expect(cookie.value).to.be.ok;
    });
    it('El endpoint GET /api/sessions/current debe enviar la cookie con el usuario y desestructurarlo correctamente', async () => {
      const { body } = await requester
        .get('/api/sessions/current')
        .set('Cookie', [`${cookie.name}=${cookie.value}`]);
      expect(body.payload.email).to.be.eql('ejemplo@test.com');
    });
  });
  describe('Test de products', () => {
    it('El endpoint POST /api/products debe crear un nuevo producto correctamente', async () => {
      const productMock = {
        title: 'Producto test',
        description: 'Descripción producto test',
        price: 20.0,
        code: 'producto-test-1',
        stock: 100,
        category: 'Música'
      };
      const { body } = await requester
        .post('/api/products')
        .set('Cookie', auth)
        .send(productMock);
      pid = body.payload._id;
      expect(body.payload).to.have.property('_id');
    });
    it('El endpoint PUT /api/products/:pid debe actualizar un producto por su ID correctamente', async () => {
      const productMock = {
        title: 'Producto actualizado'
      };
      const { body } = await requester
        .put(`/api/products/${pid}`)
        .set('Cookie', auth)
        .send(productMock);
      expect(body.payload.title).to.be.eql('Producto actualizado');
    });
    it('El endpoint DELETE /api/products/:pid debe eliminar un producto por su ID correctamente', async () => {
      const { body } = await requester
        .delete(`/api/products/${pid}`)
        .set('Cookie', auth);
      expect(body.payload).to.be.ok;
    });
  });
  describe('Test de carts', () => {
    it('El endpoint POST /api/carts/:cid/products/:pid debe agregar un producto en el carrito correctamente', async () => {
      const { body } = await requester
        .post(`/api/carts/${cid}/products/64fca344bc7da40deee9e304`)
        .set('Cookie', auth);
      expect(body.payload).to.be.ok;
    });
    it('El endpoint PUT /api/carts/:cid/products/:pid debe actualizar la cantidad de un producto en el carrito correctamente', async () => {
      const productMock = {
        quantity: 5
      };
      const { body } = await requester
        .put(`/api/carts/${cid}/products/64fca344bc7da40deee9e304`)
        .set('Cookie', auth)
        .send(productMock);
      expect(body.payload.products[0].quantity).to.be.eql(5);
    });
    it('El endpoint DELETE /api/carts/:cid debe vaciar un carrito por su ID correctamente', async () => {
      const { body } = await requester
        .delete(`/api/carts/${cid}`)
        .set('Cookie', auth);
      expect(body.payload).to.be.ok;
    });
  });
  after(async () => {
    await requester.get('/api/sessions/logout').set('Cookie', regCookie);
    await requester.get('/api/sessions/logout').set('Cookie', auth);
    await requester.delete(`/api/users/${uid}`);
  });
});
