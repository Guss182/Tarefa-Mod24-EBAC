// test/contract/categories.contract.test.js
const { spec, request } = require('pactum');
const { like } = require('pactum-matchers');

request.setBaseUrl('http://lojaebac.ebaconline.art.br');

let token;
const image = 'https://enotas.com.br/blog/wp-content/uploads/2017/05/banco-de-imagens-gratuitos-public-domain-pictures.jpg';

beforeEach(async () => {
  token = await spec()
    .post('/public/authUser')
    .withJson({ email: 'admin@admin.com', password: 'admin123' })
    .returns('data.token');
});

describe('Contrato - Categorias (REST)', () => {
  it('Deve respeitar o contrato do ADD (addCategory)', async () => {
    const name = `CatContrato_${Date.now()}`;

    const categoryId = await spec()
      .post('/api/addCategory')
      .withHeaders('Authorization', token)
      .withJson({ name, photo: image })
      .expectStatus(200)
      .expectJsonMatch({
        // alguns ambientes retornam "success", outros retornam apenas "message" + "data"
        message: like('category added'),
        data: {
          _id: like('657b05fe31b986f1c0a7a053'),
          name: like(name)
          // photo pode variar (string ou array), então não travamos aqui
        }
      })
      .returns('data._id');

    await spec()
      .delete(`/api/deleteCategory/${categoryId}`)
      .withHeaders('Authorization', token)
      .expectStatus(200);
  });
});
