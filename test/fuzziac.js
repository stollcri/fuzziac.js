const chai = require("chai");
const expect = chai.expect;

const { performance } = require('perf_hooks');
const allNames = require('./fixtures/names');

const Fuzziac = require('../index');

describe('score', () => {
    describe('exact matches', () => {
        it('should score 1.0 when 1 character matches', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("J", "J")).to.equal(1.0);
        });

        it('should score 1.3 when 2 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Jo", "Jo")).to.closeTo(1.3, 0.1);
        });

        it('should score 1.5 when 3 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joe", "Joe")).to.equal(1.5);
        });

        it('should score 1.6 when 4 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joel", "Joel")).to.equal(1.6);
        });

        it('should score 1.8 when 8 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joe Good", "Joe Good")).to.closeTo(1.8, 0.1);
        });

        it('should score 1.8 when 16 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joseph Good Luck", "Joseph Good Luck")).to.closeTo(1.8, 0.1);
        });
    });

    describe('partial matches', () => {
        it('should score 0.6 when 1 of 2 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Jo", "Yo")).to.closeTo(0.6, 0.1);
        });

        it('should score 1.0 when 1 of 3 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joe", "Yoe")).to.equal(1.0);
        });

        it('should score 0.5 when 2 of 3 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joe", "Yoh")).to.equal(0.5);
        });

        it('should score 0.4 when 1 of 4 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joel", "Yoho")).to.equal(0.4);
        });

        it('should score 0.6 when 2 of 4 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joel", "Yohl")).to.closeTo(0.6, 0.05);
        });

        it('should score 1.2 when 3 of 4 characters match', () => {
            const fuzziac = new Fuzziac();
            expect(fuzziac.score("Joel", "Yoel")).to.equal(1.2);
        });
    });
});

describe('cleanSearchString', () => {
    it('should remove leading and trailing sapces', () => {
        expect(Fuzziac.cleanSearchString("  Jo  ")).to.equal("jo");
    });

    it('should replace double spaces with single spaces', () => {
        expect(Fuzziac.cleanSearchString("Jo  Jo")).to.equal("jo jo");
    });

    it('should replace multiple double spaces with single spaces', () => {
        expect(Fuzziac.cleanSearchString("Jo  Jo  Jo")).to.equal("jo jo jo");
    });

    it('should replace single quotes with single spaces', () => {
        expect(Fuzziac.cleanSearchString("Joey O'Joson")).to.equal("joey o joson");
    });

    it('should replace single quotes with single spaces', () => {
        expect(Fuzziac.cleanSearchString("Joey \"Big Joe\" Joson")).to.equal("joey big joe joson");
    });

    it('should not remove special characters', () => {
        expect(Fuzziac.cleanSearchString("Jo$ey")).to.equal("jo$ey");
    });
});

describe('search', () => {
    it('should only return Moe when searching for Mo', () => {
        const fuzziac = new Fuzziac(["Larry", "Curly", "Moe"]);
        const searchResults = fuzziac.search("Mo");
        expect(searchResults).to.be.an('array').that.includes("Moe");
        expect(searchResults).to.have.lengthOf(1);
        expect(searchResults).to.not.include("Larry");
        expect(searchResults).to.not.include("Curly");
    });

    it('should only return Moe when searching for Jo', () => {
        const fuzziac = new Fuzziac(["Larry", "Curly", "Moe"]);
        const searchResults = fuzziac.search("Jo");
        expect(searchResults).to.be.an('array').that.includes("Moe");
        expect(searchResults).to.have.lengthOf(1);
        expect(searchResults).to.not.include("Larry");
        expect(searchResults).to.not.include("Curly");
    });

    // why is this so? because Lair-E, Curl-E -- it's approximate yo
    it('should return Larry, Curly, Moe when searching for Moe', () => {
        const fuzziac = new Fuzziac(["Larry", "Curly", "Moe"]);
        const searchResults = fuzziac.search("Moe");
        expect(searchResults).to.be.an('array').that.includes("Moe");
        expect(searchResults).to.have.lengthOf(3);
        expect(searchResults).to.include("Larry");
        expect(searchResults).to.include("Curly");
    });

    it('should only return Moe when searching for Moe and lmiting to 1 result', () => {
        const fuzziac = new Fuzziac(["Larry", "Curly", "Moe"]);
        const searchResults = fuzziac.search("Moe", 1)
        expect(searchResults).to.be.an('array').that.includes("Moe");
        expect(searchResults).to.have.lengthOf(1);
        expect(searchResults).to.not.include("Larry");
        expect(searchResults).to.not.include("Curly");
    });

    it('should return all in order when searching for a substring', () => {
        const fuzziac = new Fuzziac([
            "Larry of the Morn",
            "Curly McHairson",
            "Moe $ Moe Problems"
        ])
        const searchResults = fuzziac.search("the")
        expect(searchResults).to.be.an('array').that.includes("Larry of the Morn");
        expect(searchResults).to.have.lengthOf(3);
        expect(searchResults).to.include("Curly McHairson");
        expect(searchResults).to.include("Moe $ Moe Problems");
    });

    describe('session', () => {
        it('should only return Moe when searching for M-o-e', () => {
            const fuzziac = new Fuzziac(["Larry", "Curly", "Moe"]);
            
            let searchResults = fuzziac.search("M");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(1);
            expect(searchResults).to.not.include("Larry");
            expect(searchResults).to.not.include("Curly");

            searchResults = fuzziac.search("Mo");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(1);
            expect(searchResults).to.not.include("Larry");
            expect(searchResults).to.not.include("Curly");
            
            searchResults = fuzziac.search("Moe");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(1);
            expect(searchResults).to.not.include("Larry");
            expect(searchResults).to.not.include("Curly");
        });

        it('should only return Moe when searching for M-o-e', () => {
            const fuzziac = new Fuzziac(["Larry", "Curly", "Moe"]);

            let searchResults = fuzziac.search("Mo");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(1);
            expect(searchResults).to.not.include("Larry");
            expect(searchResults).to.not.include("Curly");
            
            searchResults = fuzziac.search("Moe");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(1);
            expect(searchResults).to.not.include("Larry");
            expect(searchResults).to.not.include("Curly");
        });
    });

    describe('session close', () => {
        it('should close when close is called', () => {
            const fuzziac = new Fuzziac(["Larry", "Curly", "Moe"]);

            let searchResults = fuzziac.search("Mo");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(1);
            expect(searchResults).to.not.include("Larry");
            expect(searchResults).to.not.include("Curly");

            searchResults = fuzziac.search("Moe");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(1);
            expect(searchResults).to.not.include("Larry");
            expect(searchResults).to.not.include("Curly");

            fuzziac.closeSearchSession();
            
            searchResults = fuzziac.search("Moe");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(3);
            expect(searchResults).to.include("Larry");
            expect(searchResults).to.include("Curly");
        });
    });

    describe('bypass session', () => {
        it('should return Larry, Curly, Moe when keepSearchOpen is off', () => {
            const fuzziac = new Fuzziac(["Larry", "Curly", "Moe"], false)

            let searchResults = fuzziac.search("Mo");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(1);
            expect(searchResults).to.not.include("Larry");
            expect(searchResults).to.not.include("Curly");
            
            searchResults = fuzziac.search("Moe");
            expect(searchResults).to.be.an('array').that.includes("Moe");
            expect(searchResults).to.have.lengthOf(3);
            expect(searchResults).to.include("Larry");
            expect(searchResults).to.include("Curly");
        });
    });

    describe('session performance', () => {
        it('should search over 7500 items for a long name in less then 375ms', () => {
            const fuzziac = new Fuzziac(allNames)

            const t0 = performance.now()
            let searchResults = fuzziac.search("Quentin Tarantino");
            const t1 = performance.now()

            expect(allNames.length).to.be.above(7500);
            expect(t1 - t0).to.be.below(allNames.length / 20);
            expect(searchResults[0]).to.equal("Quentin Tarantino");
        });

        it('should search over 7500 items progressively in less then 750ms', () => {
            const fuzziac = new Fuzziac(allNames)

            const t0 = performance.now()
            let searchResults = fuzziac.search("Q");
            searchResults = fuzziac.search("Qu");
            searchResults = fuzziac.search("Que");
            searchResults = fuzziac.search("Quen");
            searchResults = fuzziac.search("Quent");
            searchResults = fuzziac.search("Quenti");
            searchResults = fuzziac.search("Quentin");
            searchResults = fuzziac.search("Quentin ");
            searchResults = fuzziac.search("Quentin T");
            searchResults = fuzziac.search("Quentin Ta");
            searchResults = fuzziac.search("Quentin Tar");
            searchResults = fuzziac.search("Quentin Tara");
            searchResults = fuzziac.search("Quentin Taran");
            searchResults = fuzziac.search("Quentin Tarant");
            searchResults = fuzziac.search("Quentin Taranti");
            searchResults = fuzziac.search("Quentin Tarantin");
            searchResults = fuzziac.search("Quentin Tarantino");
            const t1 = performance.now()

            expect(allNames.length).to.be.above(7500);
            expect(t1 - t0).to.be.below(allNames.length / 10);
            expect(searchResults[0]).to.equal("Quentin Tarantino");
        });
    });
});
