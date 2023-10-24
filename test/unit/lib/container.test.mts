import { expect } from 'chai';
import { container, initializeContainer } from '../../../src/lib/container.mjs';
import { ModelService } from '../../../src/services/modelservice.mjs';
import { SearchService } from '../../../src/services/searchservice.mjs';

describe('Container', function () {
    beforeEach(function () {
        return container.dispose();
    });

    describe('initializeContainer', function () {
        it('should initialize the container', function () {
            const container = initializeContainer();

            expect(container.resolve('searchService')).to.be.an('object').that.is.instanceOf(SearchService);
            expect(container.resolve('modelService')).to.be.an('object').that.is.instanceOf(ModelService);

            expect(container.resolve('db')).to.be.a('function').that.has.property('name', 'knex');

            expect(container.resolve('meter'))
                .to.be.an('object')
                .that.has.property('createCounter')
                .that.is.a('function');

            expect(container.resolve('environment'))
                .to.be.an('object')
                .that.has.property('NODE_ENV')
                .that.is.a('string');
        });
    });
});
