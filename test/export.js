const chai = require("chai");
const expect = chai.expect;

const Fuzziac = require('../index');

describe('exports', () => {
    it('should expose Fuzziac.score', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.score).to.be.an.instanceof(Function);
    });
});
