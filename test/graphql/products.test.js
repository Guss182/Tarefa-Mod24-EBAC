const { spec, request } = require('pactum');
const { eachLike, like } = require('pactum-matchers');

request.setBaseUrl('http://lojaebac.ebaconline.art.br');

let token;
const photoUrl = 'https://www.zipmaster.com/wp-content/uploads/2022/04/Reusable-Cloth-Shopping-Bags-Rainbow-Pack-200-Case-Reusable-Bags-B26-061-3-1000x1000.jpg.webp';

beforeEach(async () => {
  token = await spec()
    .post('/public/authUser')
    .withJson({
      email: 'admin@admin.com',
      password: 'admin123'
    })
    .returns('data.token');
});

describe('Produtos (REST com Pactum)', () => {
  it('API + Contrato - Deve listar os produtos (contrato leve)', async () => {
    await spec()
      .get('/public/getProducts')
      .expectStatus(200)
      .expectJsonMatch({
        products: eachLike({
          _id: like('657b05fe31b986f1c0a7a053')
        })
      });
  });

  it('API - Deve criar, editar e deletar um produto (fluxo completo)', async () => {
    const name = `Prod_${Date.now()}`;

    const productId = await spec()
      .post('/api/addProduct')
      .withHeaders('Authorization', token)
      .withJson({
        name,
        price: 1327.0,
        quantity: 3,
        categories: [],
        description: 'Produto criado pelo teste automatizado',
        photos: [photoUrl],
        visible: true,
        location: 'SP, SP'
      })
      .expectStatus(200)
      .expectJsonMatch('data', {
        _id: like('657b05fe31b986f1c0a7a053'),
        name: like(name),
        price: like(1327.0)
      })
      .returns('data._id');

    const nameEdit = `${name}_EDIT`;
    await spec()
      .put(`/api/editProduct/${productId}`)
      .withHeaders('Authorization', token)
      .withJson({
        name: nameEdit,
        price: 5500.0,
        quantity: 1,
        categories: [],
        description: 'Produto editado pelo teste automatizado',
        photos: [photoUrl],
        visible: true,
        location: 'SP, SP'
      })
      .expectStatus(200)
      .expectJsonMatch('success', true)
      .expectJsonMatch('message', like('product updated'));

    await spec()
      .delete(`/api/deleteProduct/${productId}`)
      .withHeaders('Authorization', token)
      .expectStatus(200);
  });
});
