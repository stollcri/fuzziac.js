const chai = require("chai");
const expect = chai.expect;

const Fuzziac = require('../index');

describe('scoreSingle exact matches', () => {
    it('should score 1.0 when 1 character matches', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("J", "J")).to.equal(1.0);
    });

    it('should score 1.3 when 2 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Jo", "Jo")).to.closeTo(1.3, 0.1);
    });

    it('should score 1.5 when 3 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joe", "Joe")).to.equal(1.5);
    });

    it('should score 1.6 when 4 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joel", "Joel")).to.equal(1.6);
    });

    it('should score 1.8 when 8 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joe Good", "Joe Good")).to.closeTo(1.8, 0.1);
    });

    it('should score 1.8 when 16 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joseph Good Luck", "Joseph Good Luck")).to.closeTo(1.8, 0.1);
    });
});

describe('scoreSingle partial matches', () => {
    it('should score 0.6 when 1 of 2 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Jo", "Yo")).to.closeTo(0.6, 0.1);
    });

    it('should score 1.0 when 1 of 3 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joe", "Yoe")).to.equal(1.0);
    });

    it('should score 0.5 when 2 of 3 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joe", "Yoh")).to.equal(0.5);
    });

    it('should score 0.4 when 1 of 4 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joel", "Yoho")).to.equal(0.4);
    });

    it('should score 0.6 when 2 of 4 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joel", "Yohl")).to.closeTo(0.6, 0.05);
    });

    it('should score 1.2 when 3 of 4 characters match', () => {
        const fuzziac = new Fuzziac()
        expect(fuzziac.scoreSingle("Joel", "Yoel")).to.equal(1.2);
    });
});

describe('score', () => {
    it('should only return Moe when searching for Mo', () => {
        const fuzziac = new Fuzziac([
            "Larry",
            "Curly",
            "Moe"
        ])
        const scoreResults = fuzziac.score("Mo");
        expect(scoreResults).to.be.an('array').that.includes("Moe");
        expect(scoreResults).to.have.lengthOf(10);
        expect(scoreResults).to.not.include("Larry");
        expect(scoreResults).to.not.include("Curly");
    });

    it('should only return Moe when searching for Jo', () => {
        const fuzziac = new Fuzziac([
            "Larry",
            "Curly",
            "Moe"
        ])
        const scoreResults = fuzziac.score("Jo");
        expect(scoreResults).to.be.an('array').that.includes("Moe");
        expect(scoreResults).to.have.lengthOf(10);
        expect(scoreResults).to.not.include("Larry");
        expect(scoreResults).to.not.include("Curly");
    });

    // why is this so? because Lair-E, Curl-E -- it's approximate yo
    it('should return Larry, Curly, Moe when searching for Moe', () => {
        const fuzziac = new Fuzziac([
            "Larry",
            "Curly",
            "Moe"
        ])
        const scoreResults = fuzziac.score("Moe");
        expect(scoreResults).to.be.an('array');
        expect(scoreResults).to.have.lengthOf(10);
        expect(scoreResults).to.include("Larry");
        expect(scoreResults).to.include("Curly");
        expect(scoreResults).to.include("Moe");
    });

    it('should only return Moe when searching for Moe and lmiting to 1 result', () => {
        const fuzziac = new Fuzziac([
            "Larry",
            "Curly",
            "Moe"
        ])
        const scoreResults = fuzziac.score("Moe", 1)
        expect(scoreResults).to.be.an('array').that.includes("Moe");
        expect(scoreResults).to.have.lengthOf(1);
        expect(scoreResults).to.not.include("Larry");
        expect(scoreResults).to.not.include("Curly");
    });

    it('should return all in order when searching for a substring', () => {
        const fuzziac = new Fuzziac([
            "Larry of the Morn",
            "Curly McHairson",
            "Moe $ Moe Problems"
        ])
        const scoreResults = fuzziac.score("the")
        expect(scoreResults).to.be.an('array').that.includes("Larry of the Morn");
        expect(scoreResults).to.have.lengthOf(10);
        expect(scoreResults).to.include("Curly McHairson");
        expect(scoreResults).to.include("Moe $ Moe Problems");
    });
});
