/**
 * Based upon:
 * A Dynamic Programming Algorithm for Name Matching
 * Top, P.;   Dowla, F.;   Gansemer, J.;   
 * Sch. of Electr. & Comput. Eng., Purdue Univ., West Lafayette, IN
 *
 * Variation in JavaScript
 * Copyright © 2011, 2021 Christopher Stoll
 * @author <a href="http://www.christopherstoll.org/">Christopher Stoll</a>
 * 
 * @constructor
 * @param {String[]} [dataset=[]] Dataset to search against
 * @param {Boolean} [useSearchSession=true] Use a search session
 */
class Fuzziac {
	constructor(dataset, useSearchSession=true) {
		// Pristine dataset, copied into the working dataset
		this.master_dataset = dataset || [];
		this.#reset_working_dataset();

		// search sessions will reduce the dataset size as searches are mode
		// search sessions must be manually closed with a call to closeSearchSession
		this.useSearchSession = useSearchSession;

		// minimum number of characters before a search session is started
		this.searchSessionMin = 2
	}

	/** Reset the working dataset from the master dataset
	 * 
	 * @private
	 */
	#reset_working_dataset() {
		this.working_dataset = [];
		for(const i in this.master_dataset) {
			this.working_dataset.push(this.master_dataset[i]);
		}
	}

	/** Update the working dataset from a provided dataset
	 * 
	 * @private
	 * @param {String[]} new_dataset The provided dataset
	 */
	#update_working_dataset(new_dataset) {
		this.working_dataset = [];
		for(const i in new_dataset) {
			this.working_dataset.push(new_dataset[i]);
		}
	}

	/** CM, character mismatch lookup,
	 * abreviated 2D array for hex values
	 * 
	 * @private
	 */
	static #characterMatrix = [
		//bcdefghijklmnopqrstuvwxyz
		'a0004000000000400000000000', // a
		'0a000000000000000000000000', // b
		'00a00000004000002000000000', // c
		'000a0000000000000002000000', // d
		'4000a000000000000000000020', // e
		'00000a00000000020000020000', // f
		'000000a0000000000000000000', // g
		'0000000a040000000000000000', // h
		'00000000a20400000000000020', // i
		'000000042a0000000000000040', // j
		'0040000000a000002000000000', // k
		'00000000400a00000000000000', // l
		'000000000000a4000000000000', // m
		'0000000000004a000000000000', // n
		'40000000000000a00000000000', // o
		'000002000000000a0000000000', // p
		'0020000000200000a000000000', // q
		'00000000000000000a00000000', // r
		'000000000000000000a0000000', // s
		'0002000000000000000a000000', // t
		'00000000000000000000a00000', // u
		'000002000000000000000a4000', // v
		'0000000000000000000004a000', // w
		'00000000000000000000000a00', // x
		'000020002400000000000000a0', // y
		'0000000000000000002000000a', // z
		'00000000000000400000000000', // 0
		'00000000400400000000000000', // 1
		'00000000000000000100000002', // 2
		'00002000000000000000000001', // 3
		'20000002000000000000000000', // 4
		'00000000000000000020000000', // 5
		'01000010000000000000000000', // 6
		'00000000100100000002000000', // 7
		'01000000000000000000000000', // 8
		'00000020000000000000000000'  // 9
	]

	/** Dictionary to speed lookups in the character matrix
	 * 
	 * @private
	 */
	static #charMatrixDictionary = {
		a: 0,
		b: 1,
		c: 2,
		d: 3,
		e: 4,
		f: 5,
		g: 6,
		h: 7,
		i: 8,
		j: 9,
		k: 10,
		l: 11,
		m: 12,
		n: 13,
		o: 14,
		p: 15,
		q: 16,
		r: 17,
		s: 18,
		t: 19,
		u: 20,
		v: 21,
		w: 22,
		x: 23,
		y: 24,
		z: 25,
		0: 26,
		1: 27,
		2: 28,
		3: 29,
		4: 30,
		5: 31,
		6: 32,
		7: 33,
		8: 34,
		9: 35
	}

	/**
	 * Return a matching score for two characters
	 * 
	 * @private
	 * @param {String} pCharA The first character to test
	 * @param {String} pCharB The second character to test
	 * @returns {Number} Score for the current characters
	 */
	static #characterScore(pCharA, pCharB) {
		const matchScore = 10,
			mismatchPenalty = -4;

		if (pCharA && pCharB) {
			if (pCharA == pCharB) {
				return matchScore;
			} else {
				const charIndexA = Fuzziac.#charMatrixDictionary[pCharA];
				const charIndexB = Fuzziac.#charMatrixDictionary[pCharB];

				if (charIndexA && charIndexB) {
					const mismatchScore = Fuzziac.#characterMatrix[charIndexA][charIndexB]
					const refValue = parseInt(mismatchScore, 16);

					if (refValue) {
						return refValue;
					} else {
						return mismatchPenalty;
					}
				} else {
					return mismatchPenalty;
				}
			}
		} else {
			return mismatchPenalty;
		}
	}

	/**
	 * Return a score for string gaps
	 * 
	 * @private
	 * @param {String} pCharA The first character to test
	 * @param {String} pCharB The second character to test
	 * @returns {Number} Score for the current characters
	 */
	static #gappedScore(pCharA, pCharB) {
		const gapPenalty = -3,
			mismatchPenalty = -4;

		if ((pCharA == ' ') || (pCharB == ' ')) {
			return gapPenalty;
		} else {
			return mismatchPenalty;
		}
	}

	/**
	 * Return a score for transposed strings
	 * TODO: Either actuallly check for transposed characters or eliminate
	 * 
	 * @private
	 * @param {String} pCharA The first character to test
	 * @param {String} pCharB The second character to test
	 * @returns {Number} Score for the current characters
	 */
	static #transposedScore(pCharA, pCharB) {
		const transposePenalty = -2;
		return transposePenalty;
	}

	/**
	 * Build the dynamic programming matrix for the two current strings
	 * 
	 * @private
	 * @param {String} sString The source string
	 * @param {String} tString The target string
	 * @returns {Number[]} The dynamic programming matrix
	 */
	static #buildMatrix(sString, tString) {
		const sStringLength = sString.length + 1,
			tStringLength = tString.length + 1;
		let dynamicMatrix = [],
			tmpArray = [],
			tCharA = '',
			tCharB = '',
			gapScore = 0;

		// fill DV, the dynamic programming matrix, with zeros
		for (let ix = 0; ix < tStringLength; ix++) {
			tmpArray.push(0);
		}
		for (let iy = 0; iy < sStringLength; iy++) {
			dynamicMatrix.push(tmpArray.slice(0));
		}

		// calculate the actual values for DV
		for (let iy = 1; iy < sStringLength; iy++) {
			for (let ix = 1; ix < tStringLength; ix++) {
				tCharA = sString[iy - 1];
				tCharB = tString[ix - 1];

				gapScore = Fuzziac.#gappedScore(tCharA, tCharB);

				dynamicMatrix[iy][ix] = Math.max(
					dynamicMatrix[iy - 1][ix - 1] + Fuzziac.#characterScore(tCharA, tCharB),
					0,
					dynamicMatrix[iy - 1][ix] + gapScore,
					dynamicMatrix[iy][ix - 1] + gapScore
				);

				if ((dynamicMatrix[iy - 1][ix] > dynamicMatrix[iy - 1][ix - 1]) &&
					(dynamicMatrix[iy][ix - 1] > dynamicMatrix[iy - 1][ix - 1])) {

					dynamicMatrix[iy - 1][ix - 1] = Math.max(
						dynamicMatrix[iy - 1][ix],
						dynamicMatrix[iy][ix - 1]
					);
					dynamicMatrix[iy][ix] = Math.max(
						dynamicMatrix[iy - 1][ix - 1] + Fuzziac.#transposedScore(tCharA, tCharB),
						dynamicMatrix[iy][ix]
					);
				}
			}
		}

		return dynamicMatrix;
	}

	/**
	 * Backtrack through the matrix to find the best path
	 * 
	 * @private
	 * @param {Number[]} dynamicMatrix The matrix built for these strings
	 * @param {String} sString The source string
	 * @param {String} tString The target string
	 * @returns {Number} The maximum matrix value
	 */
	static #backtrack(dynamicMatrix, sString, tString) {
		const sStringLength = sString.length + 1,
			tStringLength = tString.length + 1;
		let tmaxi = 0,
			maxix = 0,
			maxMatrixValue = 0;

		// find the intial local max
		for (let ix = tStringLength - 1; ix > 0; ix--) {
			if (dynamicMatrix[sStringLength - 1][ix] > tmaxi) {
				tmaxi = dynamicMatrix[sStringLength - 1][ix];
				maxix = ix;
			}

			// break out of loop if we have reached zeros after non zeros
			if ((tmaxi > 0) && (dynamicMatrix[sStringLength - 1][ix + 1] == 0)) {
				break;
			}
		}

		if (tmaxi <= 0) {
			return false;
		}

		let ix = maxix,
			iy = sStringLength - 1,
			diagonal = 0,
			above = 0,
			left = 0;

		// TODO: replace with better algo or refactor
		while ((iy > 0) && (ix > 0)) {
			// store max value
			if (dynamicMatrix[iy][ix] > maxMatrixValue) {
				maxMatrixValue = dynamicMatrix[iy][ix];
			}

			// calculate values for possible paths
			diagonal = dynamicMatrix[iy - 1][ix - 1];
			above = dynamicMatrix[iy][ix - 1];
			left = dynamicMatrix[iy - 1][ix];

			// choose next path
			if ((diagonal >= above) && (diagonal >= left)) {
				iy--;
				ix--;
			} else if ((above >= diagonal) && (above >= left)) {
				ix--;
			} else if ((left >= diagonal) && (left >= above)) {
				iy--;
			}

			// end while if we have all zeros
			if ((diagonal == 0) && (above == 0) && (left == 0)) {
				iy = 0;
				ix = 0;
			}
		}

		return maxMatrixValue;
	}

	/**
	 * Calculate the final match score for this pair of names
	 * 
	 * @private
	 * @param {String} sString The source string
	 * @param {String} tString The target string
	 * @param {Number} maxMatrixValue Max value found in the matrix
	 * @returns {Number} The final score
	 */
	static #finalMatchScore(sString, tString, maxMatrixValue) {
		const sStringLength = sString.length + 1,
			tStringLength = tString.length + 1;

		const averageNameLength = (sStringLength + tStringLength) / 2;
		const overallScore = (2 * maxMatrixValue) / averageNameLength;
		return overallScore / 10;
	}

	/**
	 * Prepare a search string for use (remove non-accounted for characters)
	 * 
	 * @param {String} searchString 
	 * @returns {String} The match score of the two strings
	 */
	static cleanSearchString(searchString) {
		return searchString.toLowerCase().trim().replace(/[.'"]/ig, ' ').replace(/\s{2,}/g, ' ');
	}

	/**
	 * Public method to perform a search
	 * 
	 * @param {String} sString The source string
	 * @param {String} tString The target string
	 * @returns The match score of the two strings
	 */
	score(sString, tString) {
		const dynamicMatrix = Fuzziac.#buildMatrix(sString, tString);
		const maxMatrixValue = Fuzziac.#backtrack(dynamicMatrix, sString, tString);
		return Fuzziac.#finalMatchScore(sString, tString, maxMatrixValue);
	}

	/**
	 * Close the search sesssion (reset the working dataset)
	 */
	closeSearchSession() {
		this.#reset_working_dataset()
	}

	/**
	 * Find matches from an array of choices
	 *
	 * @param {String} searchString The string to find matches for
	 * @param {Number} resultLimit The number of resutls to return
	 * @returns {String[]} The top matching strings
	 */
	search(searchString, resultLimit=0) {
		const cleanedSearchString = Fuzziac.cleanSearchString(searchString);

		let resultArray = [],
			tmpValue = 0,
			tmpCleanString = "";

		// score search string against each item of the working dataset
		for (let i = 0; i < this.working_dataset.length; i++) {
			tmpCleanString = Fuzziac.cleanSearchString(this.working_dataset[i])
			tmpValue = this.score(cleanedSearchString, tmpCleanString);

			// only keep values that are relevant
			if (tmpValue > 0) {
				resultArray.push({ v: tmpValue, k: this.working_dataset[i] })
			}
		}

		// sort the relevant results
		resultArray.sort((a, b) => {
			if (a.v < b.v) {
				return -1;
			} else if (a.v > b.v) {
				return 1;
			}
			return 0;
		}).reverse();

		// simplify the results list
		let tmp = {}
		for (let i = 0; i < resultArray.length; i++) {
			tmp = resultArray[i];
			resultArray[i] = tmp.k;
		}

		// only restrict the datase if:
		//  - search sessions are used
		//  - there are at least 2 characters in the search string
		//
		// speed performance can be increased by dropping this to 1,
		// the trade-off is a slight drop in accuracy performance
		if (this.useSearchSession && searchString.length >= this.searchSessionMin) {
			this.#update_working_dataset(resultArray)
		}

		if (resultLimit > 0) {
			return resultArray.slice(0, resultLimit);
		}
		return resultArray;
	}
}

module.exports = Fuzziac;
