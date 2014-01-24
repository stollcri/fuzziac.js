/**
 * A Dynamic Programming Algorithm for Name Matching
 * Top, P.;   Dowla, F.;   Gansemer, J.;   
 * Sch. of Electr. & Comput. Eng., Purdue Univ., West Lafayette, IN
 *
 * Implementation in JavaScript
 * Copyright © 2011, Christopher Stoll
 * @author <a href="http://www.christopherstoll.org/">Christopher Stoll</a>
 *
 * @constructor
 * @param {String} [pNameSource=''] The source name, the name of interest
 */
function nameMatch(pNameSource){
	var tNameSource = pNameSource || '';
	
	if(tNameSource){
		tNameSource = tNameSource.toLowerCase();
		tNameSource = tNameSource.replace(/\./ig, ' ');
		tNameSource = tNameSource.replace(/\s{2,}/g, ' ');
	}
	
	// y axis in matrix, the name in question
	this.nameSource = tNameSource;
	this.nameSourceLength = this.nameSource.length + 1;
	this.nameSourceScore = 0;
	this._reset();
}

nameMatch.prototype = {
	_reset: function(pNameTarget){
		var tNameTarget = pNameTarget || '';
		
		if(tNameTarget){
			tNameTarget = tNameTarget.toLowerCase();
			tNameTarget = tNameTarget.replace(/\./ig, ' ');
			tNameTarget = tNameTarget.replace(/\s{2,}/g, ' ');
		}
		
		// x axis in matrix, the name to check against
		this.nameTarget = tNameTarget;
		this.nameTargetLength = this.nameTarget.length + 1;
		this.nameTargetScore = 0;
	
		// DV, the dunamic programming matrix
		this.dynamicMatrix = [];
		
		// Wi
		this.tokensSource = [];
		this.tokensTarget = [];
		this.tokenMatches = [];
		this.tokenCosts = [];
		
		// Max value in the matrix
		this.maxMatrixValue = 0;
		
		// WC, number of tokens
		this.normalizationConstant = 1;
		
		// the score for the string
		this.overallScore = 0;
		
		// weighted average of string and tokens
		this.finalScore = 0;
	},
	
	/**
	 * CM, character mismatch lookup,
	 * Abreviated 2D array for hex values
	 *
	 * @static
	 * @field
	 */
	characterMatrix: [
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
	],
	
	/**
	 * Dictionary to speed lookups in the character matrix
	 *
	 * @static
	 * @field
	 */
	charMatrixDictionary: {
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
		9: 35,
	},
	
	/**
	 * Return a matching score for two characters
	 *
	 * @private
	 * @param {String} pCharA The first character to test
	 * @param {String} pCharB The second character to test
	 * @returns {Number} Score for the current characters
	 */
	_characterScore: function(pCharA, pCharB){
		var matchScore = 1,
			mismatchScore = 0,
			mismatchPenalty = -.4,
			charIndexA = 0,
			charIndexB = 0,
			refValue = 0;
			
		if(pCharA && pCharB){
			if(pCharA == pCharB){
				return matchScore;
			}else{
				charIndexA = this.charMatrixDictionary[pCharA];
				charIndexB = this.charMatrixDictionary[pCharB];
				
				if(charIndexA && charIndexB){
					mismatchScore = this.characterMatrix[charIndexA][charIndexB]
					refValue = parseInt(mismatchScore, 16) / 10;
					// DEBUG, to match example
					refValue=mismatchPenalty;
										
					if(refValue){
						return refValue;
					}else{
						return mismatchPenalty;
					}
				}else{
					return mismatchPenalty;
				}
			}
		}else{
			return mismatchPenalty;
		}
	},
	
	/**
	 * Return a score for string gaps
	 *
	 * @private
	 * @param {String} pCharA The first character to test
	 * @param {String} pCharB The second character to test
	 * @returns {Number} Score for the current characters
	 */
	_gappedScore: function(pCharA, pCharB){
		var gapPenalty = -.4,
			mismatchPenalty = -.4;
			
		if((pCharA == ' ') || (pCharB == ' ')){
			return gapPenalty;
		}else{
			return mismatchPenalty;
		}
	},
	
	/**
	 * Return a score for transposed strings
	 *
	 * @private
	 * @param {String} pCharA The first character to test
	 * @param {String} pCharB The second character to test
	 * @returns {Number} Score for the current characters
	 */
	_transposedScore: function(pCharA, pCharB){
		var transposePenalty = -.4; //-.2; // DEBUG, to match example
		return transposePenalty;
	},
	
	/**
	 * Build the dynamic programming matrix for the two current strings 
	 *
	 * @private
	 */
	_buildMatrix: function(){
		var tmpArray = [],
			tCharA = '',
			tCharB = '';
		
		// fill DV, the dynamic programming matrix, with zeros
		for(var ix=0; ix<this.nameTargetLength; ix++){
			tmpArray.push(0);
		}		
		for(var iy=0; iy<this.nameSourceLength; iy++){
			this.dynamicMatrix.push(tmpArray.slice(0));
		}
		
		// calculate the actual values for DV
		for(var iy=1; iy<this.nameSourceLength; iy++){
			for(var ix=1; ix<this.nameTargetLength; ix++){
				tCharA = this.nameSource[iy-1];
				tCharB = this.nameTarget[ix-1];
				
				this.dynamicMatrix[iy][ix] = Math.max(
					this.dynamicMatrix[iy-1][ix-1] + this._characterScore(tCharA, tCharB),
					0,
					this.dynamicMatrix[iy-1][ix] + this._gappedScore(tCharA, tCharB),
					this.dynamicMatrix[iy][ix-1] + this._gappedScore(tCharA, tCharB)
				);
				
				if((this.dynamicMatrix[iy-1][ix] > this.dynamicMatrix[iy-1][ix-1]) && 
					(this.dynamicMatrix[iy][ix-1] > this.dynamicMatrix[iy-1][ix-1])){
					
					this.dynamicMatrix[iy-1][ix-1] = Math.max(
						this.dynamicMatrix[iy-1][ix],
						this.dynamicMatrix[iy][ix-1]
					);
					this.dynamicMatrix[iy][ix] = Math.max(
						this.dynamicMatrix[iy-1][ix-1] + this._transposedScore(tCharA, tCharB),
						this.dynamicMatrix[iy][ix]
					);
				}
			}
		}
	},
	
	/**
	 * Backtrack through the matrix to find the best path
	 *
	 * @private
	 */
	_backtrack: function(){
		var tmaxi = 0,
			maxix = 0;
		
		// find the intial local max
		for(var ix=this.nameTargetLength-1; ix>0; ix--){
			if(this.dynamicMatrix[this.nameSourceLength-1][ix] > tmaxi){
				tmaxi = this.dynamicMatrix[this.nameSourceLength-1][ix];
				maxix = ix;
			}
			
			// break out of loop if we have reached zeros after non zeros
			if((tmaxi > 0) && (this.dynamicMatrix[this.nameSourceLength-1][ix+1] == 0)){
				break;
			}
		}
		
		if(tmaxi <= 0){
			return false;
		}
		
		// TODO: refactor all below to own method and then refactor again
		var ix = maxix,
			iy = this.nameSourceLength-1,
			ixLast = 0,
			iyLast = 0,
			diagonal = 0,
			above = 0,
			left = 0,
			currentTokenMatches = 0,
			currentTokenSource = '',
			currentTokenTarget = '',
			currentTokenCost = 0,
			sourceDone = false,
			targetDone = false;
		
		// TODO: replace with better algo or refactor
		while((iy>0) && (ix>0)){
			// store max value
			if(this.dynamicMatrix[iy][ix] > this.maxMatrixValue){
				this.maxMatrixValue = this.dynamicMatrix[iy][ix];
			}
			
			// increment counters
			currentTokenCost++;
			if(this.nameSource[iy-1] == this.nameTarget[ix-1]){
				currentTokenMatches++;
			}
			
			// is the source name short, moving horizontaly
			if(iy == iyLast){
				sourceDone = true;
			}else{
				sourceDone = false;
			}
			iyLast = iy;
			
			// is the target name short, moving verticaly
			if(ix == ixLast){
				targetDone = true;
			}else{
				targetDone = false;
			}
			ixLast = ix;
			
			// this token in the source name is done
			if(this.nameSource[iy-1] == ' '){
				if(currentTokenSource != ''){
					this.tokensSource.push(currentTokenSource);
				}
				currentTokenSource = '';
				
				if(targetDone){
					this.tokenCosts.push(currentTokenCost);
					currentTokenCost = 0;
					sourceDone = false;
					targetDone = false;
				}else{
					sourceDone = true;
				}
			}else{
				if(!sourceDone){
					currentTokenSource = this.nameSource[iy-1] + currentTokenSource;
				}
			}
			
			// this token in the target name is done
			if(this.nameTarget[ix-1] == ' '){
				if(currentTokenTarget != ''){
					this.tokensTarget.push(currentTokenTarget);
				}
				currentTokenTarget = '';
				
				if(sourceDone){
					this.tokenCosts.push(currentTokenCost);
					currentTokenCost = 0;
					sourceDone = false;
					targetDone = false;
				}else{
					targetDone = true;
				}
			}else{
				if(!targetDone){
					currentTokenTarget = this.nameTarget[ix-1] + currentTokenTarget;
				}
			}
			
			// the token arrays are different sizes so we need to pad
			// one string must have more tokens than the other string
			if((currentTokenSource != '') || (currentTokenTarget != '')){
				if(this.tokensSource.length < this.tokensTarget.length){
					this.tokensSource.push('');
				}else if(this.tokensSource.length > this.tokensTarget.length){
					this.tokensTarget.push('');
				}
			}
			
			// reset token matches at the intersection of spaces
			if((this.nameSource[iy-1] == ' ') && (this.nameTarget[ix-1] == ' ')){
				this.tokenMatches.push(currentTokenMatches-1);
				currentTokenMatches = 0;
			}
			
			// DEBUG
			$('#'+this.DEBUG_AC+(iy+1)+'-'+(ix+1)).css('background-color','#ccc');
			
			// calculate values for possible paths
			diagonal = this.dynamicMatrix[iy-1][ix-1];
			above = this.dynamicMatrix[iy][ix-1];
			left = this.dynamicMatrix[iy-1][ix];
			
			// choose next path
			if((diagonal>=above) && (diagonal>=left)){
				iy--;
				ix--;
			}else if((above>=diagonal) && (above>=left)){
				ix--;
			}else if((left>=diagonal) && (left>=above)){
				iy--;
			}
			
			// end while if we have all zeros
			if((diagonal == 0) && (above == 0) && (left == 0)){
				iy = 0;
				ix = 0;
			}
		}
		
		// store final token info
		this.tokensSource.push(currentTokenSource);
		this.tokensTarget.push(currentTokenTarget);
		this.tokenMatches.push(currentTokenMatches-1);
		this.tokenCosts.push((currentTokenCost+1));
		// update normalization count
		this.normalizationConstant = this.tokensSource.length;
		
		console.log(this.tokensSource, this.tokensTarget, this.tokenMatches, this.tokenCosts);
		return true;
	},
	
	/**
	 *
	 * @private
	 */
	// Score for a string
	// The score for each string is computed as a normalized sum of the scores for the individual tokens
	_stringScore: function(){
		var currentTokenSource = '',
			currentTokenSourceLen = 0,
			currentTokenTarget = '',
			currentTokenTargetLen = 0,
			tokenDeflator = 1,
			normalizationDeflator = 0,
			tmpResultSource = 0,
			tmpResultTarget = 0,
			result = 0;
		
		for(var i=0; i<this.tokensSource.length; i++){
			currentTokenSource = this.tokensSource[i];
			currentTokenSourceLen = currentTokenSource.length;
			
			if(currentTokenSourceLen <= 3){
				if(currentTokenSourceLen == 3){
					tokenDeflator = .5;
					this.normalizationConstant -= .5;
				}else if(currentTokenSourceLen == 2){
					tokenDeflator = .33;
					this.normalizationConstant -= .66;
				}else if(currentTokenSourceLen == 1){
					tokenDeflator = .25;
					this.normalizationConstant -= .75;
				}
			}
			
			if(currentTokenSourceLen > 0){
				tmpResultSource += tokenDeflator * (this.tokenMatches[i] / currentTokenSourceLen);
			}
		}
		
		for(var i=0; i<this.tokensTarget.length; i++){
			currentTokenTarget = this.tokensTarget[i];
			currentTokenTargetLen = currentTokenTarget.length;
			
			if(currentTokenTargetLen <= 3){
				if(currentTokenTargetLen == 3){
					tokenDeflator = .5;
					this.normalizationConstant -= .5;
				}else if(currentTokenTargetLen == 2){
					tokenDeflator = .33;
					this.normalizationConstant -= .66;
				}else if(currentTokenTargetLen == 1){
					tokenDeflator = .25;
					this.normalizationConstant -= .75;
				}
			}
			
			if(currentTokenTargetLen > 0){
				tmpResultTarget += tokenDeflator * (this.tokenMatches[i] / currentTokenTargetLen);
			}
		}
		
		if(this.normalizationConstant < 1){
			this.normalizationConstant = 1
		}
		
		this.nameSourceScore = tmpResultSource / this.normalizationConstant;
		this.nameTargetScore = tmpResultTarget / this.normalizationConstant;
		console.log(this.nameSourceScore, this.nameTargetScore);
	},
	
	/**
	 *
	 */
	// Score between two strings
	// An overall matching score is computed as the maximum value in the matching matrix divided by the average string length
	_overallMatchScore: function(){
		var averageNameLength = (this.nameSourceLength + this.nameTargetLength) / 2
		this.overallScore = (2 * this.maxMatrixValue) / averageNameLength;
		console.log(this.overallScore);
	},
	
	/**
	 *
	 */
	// The final match score is a weighted sum of the individual string scores and an overall match scores
	_finalMatchScore: function(pStringScores, pStringWeights){
		if(isNaN(this.nameSourceScore) || isNaN(this.nameTargetScore)){
			if(!isNaN(this.overallScore)){
				this.finalScore = this.overallScore * 10;
			}else{
				this.finalScore = 0;
			}
		}else{
			this.finalScore = this.nameSourceScore * 35;
			this.finalScore += this.nameTargetScore * 35;
			this.finalScore += this.overallScore * 3;
		}
		console.log(this.finalScore);
	},
	
	/**
	 *
	 */
	_testScore: function(pNameTarget){
		this._reset(pNameTarget);
		
		this._buildMatrix();
		this._debug_ShowDVtable();
		
		if(this._backtrack()){
			this._stringScore();
			this._overallMatchScore();
			this._finalMatchScore();
		}
		
		return this.finalScore;
	},
	
	/**
	 *
	 */
	_debug_ShowDVtable: function(pNameTarget){
		var DEBUG_AA = 0,
			DEBUG_AB = '';
			DEBUG_AC = Math.round(Math.random() * 9999);
			
		this.DEBUG_AC = DEBUG_AC;
			
		DEBUG_AB += '<table class="example">';
		for(var iy=0; iy<=(this.nameSourceLength); iy++){
			DEBUG_AB += '<tr>';
			for(var ix=0; ix<=(this.nameTargetLength); ix++){
				if(iy==0){
					if(ix>1){
						DEBUG_AB += '<td id="'+DEBUG_AC+iy+'-'+ix+'">'+this.nameTarget[ix-2]+'</td>';
					}else{
						DEBUG_AB += '<td id="'+DEBUG_AC+iy+'-'+ix+'"></td>';
					}
				}else{
					if(ix>0){
						DEBUG_AA = Math.round(this.dynamicMatrix[iy-1][ix-1] * 100) / 100;
						DEBUG_AB += '<td id="'+DEBUG_AC+iy+'-'+ix+'">'+DEBUG_AA+'</td>';
					}else{
						if(iy>1){
							DEBUG_AB += '<td id="'+DEBUG_AC+iy+'-'+ix+'">'+this.nameSource[iy-2]+'</td>';
						}else{
							DEBUG_AB += '<td id="'+DEBUG_AC+iy+'-'+ix+'"></td>';
						}
					}
				}
			}
			DEBUG_AB += '</tr>';
		}
		DEBUG_AB += '</table>';
		$('#test_table').append(DEBUG_AB);
	}
}