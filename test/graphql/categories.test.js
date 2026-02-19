// test/graphql/categories.test.js
// Obs: este arquivo usa os endpoints REST do projeto (permitido pelo enunciado: contratos via REST ou GraphQL).
const { spec, request } = require('pactum');
const { eachLike, like } = require('pactum-matchers');

request.setBaseUrl('http://lojaebac.ebaconline.art.br');

let token;
const image = 'https://enotas.com.br/blog/wp-content/uploads/2017/05/banco-de-imagens-gratuitos-public-domain-pictures.jpg';

beforeEach(async () => {
  token = await spec()
    .post('/public/authUser')
    .withJson({
      email: 'admin@admin.com',
      password: 'admin123'
    })
    .returns('data.token');
});

describe('Categorias (REST com Pactum)', () => {
  it('API - Deve listar as categorias (contrato leve)', async () => {
    await spec()
      .get('/public/getCategories')
      .expectStatus(200)
      // contrato leve: alguns registros podem não ter photo, então validamos só _id e name
      .expectJsonMatch({
        categories: eachLike({
          _id: like('657b05fe31b986f1c0a7a053'),
          name: like('Guitarra')
        })
      });
  });

  it('API - Deve criar, editar e deletar uma categoria (fluxo completo)', async () => {
    const name = `Cat_${Date.now()}`;

    // CREATE
    const categoryId = await spec()
      .post('/api/addCategory')
      .withHeaders('Authorization', token)
      .withJson({ name, photo: image })
      .expectStatus(200)
      .expectJsonMatch('data', {
        _id: like('657b05fe31b986f1c0a7a053'),
        name: like(name)
      })
      .returns('data._id');

    // EDIT
    const nameEdit = `${name}_EDIT`;
    await spec()
      .put(`/api/editCategory/${categoryId}`)
      .withHeaders('Authorization', token)
      .withJson({ name: nameEdit, photo: image })
      .expectStatus(200)
      .expectJsonMatch('success', true)
      .expectJsonMatch('message', like('category updated'));

    // DELETE
    await spec()
      .delete(`/api/deleteCategory/${categoryId}`)
      .withHeaders('Authorization', token)
      .expectStatus(200);
  });
});
