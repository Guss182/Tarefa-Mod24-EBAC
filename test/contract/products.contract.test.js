const { spec, request } = require('pactum');
const { like } = require('pactum-matchers');

request.setBaseUrl('http://lojaebac.ebaconline.art.br');

let token;
const photoUrl = 'https://www.zipmaster.com/wp-content/uploads/2022/04/Reusable-Cloth-Shopping-Bags-Rainbow-Pack-200-Case-Reusable-Bags-B26-061-3-1000x1000.jpg.webp';

beforeEach(async () => {
  token = await spec()
    .post('/public/authUser')
    .withJson({ email: 'admin@admin.com', password: 'admin123' })
    .returns('data.token');
});

describe('Contrato - Produtos (REST)', () => {
  it('Deve respeitar o contrato do ADD (addProduct)', async () => {
    const name = `ProdContrato_${Date.now()}`;

    const productId = await spec()
      .post('/api/addProduct')
      .withHeaders('Authorization', token)
      .withJson({
        name,
        price: 99.9,
        quantity: 2,
        categories: [],
        description: 'Produto criado no contrato',
        photos: [photoUrl],
        visible: true,
        location: 'SP, SP'
      })
      .expectStatus(200)
      .expectJsonMatch({
        message: like('product added'),
        data: {
          _id: like('657b05fe31b986f1c0a7a053'),
          name: like(name),
          price: like(99.9)
        }
      })
      .returns('data._id');

    await spec()
      .delete(`/api/deleteProduct/${productId}`)
      .withHeaders('Authorization', token)
      .expectStatus(200);
  });
});
