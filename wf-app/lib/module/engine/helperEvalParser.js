var util = ProjRequire('lib/MyUtil');
module.exports = function(){
	this.result = '';
	this.patterns = [];
	this.parse = function(str, vars) {
		try {
			this.result = str;
			this.patterns = this.evaluate(str); // -> [pattern1,pattern2]
			for(var i = 0; i < this.patterns.length; i++) {
				var pattern = this.patterns[i];
				var res = this.evalCode(pattern, vars);
				this.result = replacePatternRes(this.result, pattern, res);
			}
			return this.result;
		} catch (e) {
			throw new Error("Parse error", e);
		}
	}
	this.evaluate = function(str) {
		var res = searchBrackets(str);
		return res;
	}
	this.evalCode = function(code, vars) {
		if(code.indexOf('return') == -1) {
			code = 'return ' + code;
		}
		var val = new Function('vars', 'vars;for(key in vars) {global[key] = vars[key];} ' + code);
		try {
			return val(vars);
		} catch (e) {
			return '';
		}
	}
	var replacePatternRes = function(result, pattern, res) {
		pattern = '{{' + pattern + '}}';
		result = util.replaceAll(result, pattern, res);
		return result;
	}
}

function findBrackets(block) {
	var startIndex = block.indexOf('{{');
    var currPos = startIndex,
    openBrackets = 0,
    stillSearching = true,
    waitForChar = false;

while (stillSearching && currPos <= block.length) {
  var currChar = block.charAt(currPos);

  if (!waitForChar) {
    switch (currChar) {
      case '{':
	    if(block.charAt(currPos+1) == '{')
			openBrackets++; 
        break;
      case '}':
		if(block.charAt(currPos+1) == '}')
			openBrackets--; 
        break;
      case '"':
      case "'":
        waitForChar = currChar;
        break;
      case '/':
        var nextChar = block.charAt(currPos + 1);
        if (nextChar === '/') {
          waitForChar = '\n';
        } else if (nextChar === '*') {
          waitForChar = '*/';
        }
    }
  } else {
    if (currChar === waitForChar) {
      if (waitForChar === '"' || waitForChar === "'") {
        block.charAt(currPos - 1) !== '\\' && (waitForChar = false);
      } else {
        waitForChar = false;
      }
    } else if (currChar === '*') {
      block.charAt(currPos + 1) === '/' && (waitForChar = false);
    }
  }

  currPos++ 
  if (openBrackets === 0) { stillSearching = false; } 
}

//console.log(block.substring(startIndex , currPos+1)); // contents of the outermost brackets incl. everything inside
return block.substring(startIndex , currPos+1)
}
var searchBrackets = function(block) {
	var result = [];
	var temp = '';
	function whileeval() {
		temp = findBrackets(block);
		return temp.indexOf('{{') == 0 && temp.lastIndexOf('}}') == temp.length - 2;
	}
	while(whileeval()) {
		block = block.replace(temp, '');
		temp = temp.substring(2, temp.length - 2);
		result.push(temp);
	}
	return result;
}


