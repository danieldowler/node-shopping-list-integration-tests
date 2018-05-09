const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Recipes', function () {

    before(function () {
        return runServer();
    });

    after(function () {
        return closeServer();
    });

    it('should list recipes on GET', function () {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.
        return chai.request(app)
            .get('/recipes')
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');

                expect(res.body.length).to.be.at.least(1);
                // each item should be an object with key/value pairs
                // for `id`, `name` and `checked`.
                const expectedKeys = ['id', 'name', 'ingredients'];
                res.body.forEach(function (item) {
                    expect(item).to.be.a('object');
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });


    it('should add a recipe on POST', function () {
        const newRecipe = {
            name: 'coffee', ingredients: ['ground coffee', 'hot water']
        };
        return chai.request(app)
            .post('/recipes')
            .send(newRecipe)
            .then(function (res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res).body.to.be.a('object');
                res.body.should.include.keys('id', 'name', 'ingredients');
                res.body.name.should.equal(newRecipe.name);
                res.body.ingredients.should.be.a('array');
                res.body.ingredients.should.include.members(newRecipe.ingredients);
            });
    });

    it('should update recipes on PUT', function () {

        const updateData = {
            name: 'foo',
            ingredients: ['bizz', 'bang']
        };

        return chai.request(app)

            .get('/recipes')
            .then(function (res) {
                updateData.id = res.body[0].id;

                return chai.request(app)
                    .put(`/recipes/${updateData.id}`)
                    .send(updateData)
            })
            .then(function (res) {
                expect(res).to.have.status(204);
            });
    });

    it('should delete recipes on DELETE', function () {
        return chai.request(app)

            .get('/recipes')
            .then(function (res) {
                return chai.request(app)
                    .delete(`/recipes/${res.body[0].id}`);
            })
            .then(function (res) {
                expect(res).to.have.status(204);
            });
    });
});