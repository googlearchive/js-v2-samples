// For browserFun
// TODO:
// Make it so that you can make the code editing window wider...
// Make it so that you can click links to the documentation of each object
// Add Ping Pong
// Fix the spacing in the editor (when u hit tab)
// Try to see if for the javascript part you can eval line by line so that you can output the line number


var ie;
var opera;
var safari;
var gecko;

function deepObjCopy(dupeObj) {
    var retObj = new Object();
    if (typeof(dupeObj) == 'object') {
        if (typeof(dupeObj.length) != 'undefined')
            var retObj = new Array();
        for (var objInd in dupeObj) {   
            if (typeof(dupeObj[objInd]) == 'object') {
                retObj[objInd] = deepObjCopy(dupeObj[objInd]);
            } else if (typeof(dupeObj[objInd]) == 'string') {
                retObj[objInd] = dupeObj[objInd];
            } else if (typeof(dupeObj[objInd]) == 'number') {
                retObj[objInd] = dupeObj[objInd];
            } else if (typeof(dupeObj[objInd]) == 'boolean') {
                ((dupeObj[objInd] == true) ? retObj[objInd] = true : retObj[objInd] = false);
            }
        }
    }
    return retObj;
}

function singleLevelKeyCopy(dupeObj) {
  var retObj = new Object();
  for (var objInd in dupeObj) {
    retObj[objInd] = true;
  }
  return retObj;
}

function browserFun() {
  // Browser fun.
  if (window.ActiveXObject) {
    ie = this[window.XMLHttpRequest ? 'ie7' : 'ie6'] = true;
  } else if (window.opera) {
    opera = true;
  } else if (document.childNodes && !document.all && !navigator.taintEnabled) {
    safari = true;
  } else if (document.getBoxObjectFor != null) {
    gecko = true;
  }
}
browserFun();
if (!gecko) {
  alert("This site (& plugin) is currently for Firefox only.");
}

if (typeof console == 'undefined') {
  var console = {
    log : function() {}
  };
}

function _cel(name) {
  return document.createElement(name);
}

function _gel(name) {
  return document.getElementById(name);
}

function addEvent(a,b,c,d) {
  if (a.addEventListener) {
    a.addEventListener(b,c,d?true:false);
  } else if(a.attachEvent) {
    a.attachEvent('on'+b,c);
  } else{
    a['on'+b]=c;
  }
}

function InteractiveSample(){
  this.categories = [];
  this.codeTitles = [];
  this.adjustCodeBoxAmount = 50;
  this.selectCode;
  this.textArea;
  this.codeLIs = [];
  this.currentCode;
  this.curI = 0;
	this.cleanWindowObj;
};

function sortByCategory(a, b) {
  return a.category > b.category;
}

function sortByName(a, b) {
  return a.sampleName > b.sampleName;
}

function nameToHashName(name) {
  var hashName = name.toLowerCase();
  hashName = hashName.replace(/ /g, '_');
  return hashName;
}

InteractiveSample.prototype.init = function(textArea) {
 this.textArea = textArea;
  this.createCategories();
  this.addShowHideClicks();
  
//  codeArray.sort(sortByCategory);

  for (var i=0; i < codeArray.length; i++) {
    codeArray[i].samples.sort(sortByName);
  }

  // Gotta set this for the iFrame to know it and change it
  window.iframeZindex = '4999';
  this.cleanWindowObj = singleLevelKeyCopy(window);
};

InteractiveSample.prototype.createCategories = function() {
  // codeArray is from interactive_samples.js
  this.selectCode = _gel('selectCode');
  
  for (var i=0; i < codeArray.length; i++) {
    var container = _cel('span');
    container.className = 'category';
    
    var catName = _cel('span');
    
    var img = _cel('img');
    img.className = 'collapse';
    img.src = 'http://code.google.com/images/cleardot.gif';
    // addEvent(img, 'click', this.toggleExpand(img), false);
    
    catName.appendChild(img);
    catName.innerHTML += codeArray[i].category;
    
    container.appendChild(catName);
    
    var ul = _cel('ul');
    ul.className = 'categoryItems';
    
    container.appendChild(ul);
    
    for (var j=0; j < codeArray[i].samples.length; j++) {
      var sample = codeArray[i].samples[j];
      var li = _cel('li');
      
      li.innerHTML = sample.title;
      
      this.codeTitles.push(li);
      addEvent(li, 'click', this.showCode(this, sample, li));
      
      if (i == 0 && j == 0) {
        // li.className = 'selected';
        // this.textArea.edit(code[0].code, 'javascript');
        // this.currentCode = code;
        this.showCode(this, sample, li, true)();
      }
      
      if (window.location.hash.length > 0) {
        var hashName = nameToHashName(sample.title);
        if (window.location.hash.substring(1) == hashName) {
          this.showCode(this, sample, li)();
          // for (var z=0; z < this.codeLIs.length; z++) {
          //   this.codeLIs[z].className = '';
          // }
          // 
          // li.className = 'selected';
          // this.textArea.edit(code[0].code, 'javascript');
          // this.currentCode = code;
        }
      }
      
      this.codeLIs.push(li);
      ul.appendChild(li);
    }
    
    this.selectCode.appendChild(container);
    this.categories.push(container);
  }  
};

InteractiveSample.prototype.toggleShowHide = function(category, interactiveSample) {
  return function() {
    var li = category.nextSibling;
    var el = category.childNodes[0];
    if (el.className == 'expand') 
      el.className = 'collapse';
    else
      el.className = 'expand';
    
    if (li.style.display == 'none') {
      li.style.display = 'block';
    } else {
      li.style.display = 'none';
    }
  };
};

InteractiveSample.prototype.addShowHideClicks = function() {
  for (var i=0; i < this.categories.length; i++) {
    categoryName = this.categories[i].childNodes[0];
    addEvent(categoryName, 'click', this.toggleShowHide(categoryName, this));
  }
};

InteractiveSample.prototype.showCode = function(is_self, sample, thisLI, def) {
  return function() {
    is_self.refreshInlinePlugin();
	
    var textArea = is_self.textArea;
    var codeLIs = is_self.codeLIs;
    
    for (var i=0; i < codeLIs.length; i++) {
      codeLIs[i].className = '';
    }
    
    // For linking purposes
    if (!def)
      window.location.hash = nameToHashName(thisLI.innerHTML);
    
    // Make code selected designate this as selected
    thisLI.className = 'selected';
    
    if (sample.script) {
      for (var i in sample.script) {
        var oldscript = document.getElementById("__s_" + nameToHashName(thisLI.innerHTML) + "_" + i);
        if (!oldscript) {
          var script = document.createElement("script");
          script.type = "text/javascript";
          script.setAttribute("id", "__s_" + nameToHashName(thisLI.innerHTML) + "_" + i);
          document.body.appendChild(script);
          script.src = sample.script[i];
        }
      }
    }

  if (sample.onload) {
    try {
      eval(sample.onload);
    } catch (e) {
      alert(e);
    }
  } 
    // change code text area
    GDownloadUrl(sample.code, function(text) {
      textArea.edit(text);
      is_self.currentCode = text;
    });
    
    window.is.curI = 0;
  };
};

InteractiveSample.prototype.changeTab = function(i, textArea) {
  return function() {
    var siblings = this.parentNode.childNodes;
    var isInstance = window.is;
    isInstance.currentCode[isInstance.curI].code = textArea.getCode();
    
    for (var z=0; z < siblings.length; z++) {
      if (z == i) {
        siblings[z].childNodes[0].className = 'db_top';
        siblings[z].childNodes[1].className = 'db_roundedcornr_content';
      } else {
        siblings[z].childNodes[0].className = 'lb_top';
        siblings[z].childNodes[1].className = 'lb_roundedcornr_content';
      }
    }
    
    var fileName = isInstance.currentCode[i].fileName;
    
    if (fileName.indexOf('.html') != -1)
      textArea.edit(isInstance.currentCode[i].code,'html');
    else
      textArea.edit(isInstance.currentCode[i].code,'javascript');
      
    isInstance.curI = i;
  }
}

InteractiveSample.prototype.increaseCodeBoxHeight = function() {
  var curHeight = this.textArea.style.height;
  curHeight = curHeight.substr(0, curHeight.indexOf('px'));
  var newHeight = parseInt(curHeight) + this.adjustCodeBoxAmount;
  newHeight += 'px';
  this.textArea.style.height = newHeight;
};

InteractiveSample.prototype.decreaseCodeBoxHeight = function() {
  var curHeight = this.textArea.style.height;
  curHeight = curHeight.substr(0, curHeight.indexOf('px'));
  var newHeight = parseInt(curHeight) - this.adjustCodeBoxAmount;
  newHeight += 'px';
  this.textArea.style.height = newHeight;
};

InteractiveSample.prototype.prepareAllCodeRun = function() {
  // TODO: Change this so it doesn't rely on the first file being HTML
  // TODO: Change this to use REGEX to replace
	this.deleteOldWindowStuff();

	this.refreshInlinePlugin();

  this.currentCode[this.curI].code = this.textArea.getCode();
  
  
  var html = this.currentCode[0].code;
  var nextStart = 0;
  var replacing = true;
  
  while(replacing) {
    var scriptLoc = html.indexOf('<script src="', nextStart);
    if (scriptLoc != -1) {
      nextStart = scriptLoc;
      var scriptSrc = scriptLoc + 13;
      var scriptSrcEnd = html.indexOf('"', scriptSrc);
      var script = html.substring(scriptSrc, scriptSrcEnd);
      var endScriptLoc = html.indexOf('</script>', scriptLoc) + 9;
      var found = false;
      for (var z=0; z < this.currentCode.length; z++) {
        if (this.currentCode[z].fileName == script) {
          found = true;
          script = '<script type="text/javascript" charset="utf-8">'+this.currentCode[z].code+'</script>';
        }
      }
      if (found)
        html = html.substring(0, scriptLoc) + script + html.substring(endScriptLoc);      
    } else {
      replacing = false;
    }
  }
  
  // console.log(html);
  window.codeToRun = html;
  
  // console.log(html.slice(scriptLoc, endScriptLoc));
  // console.log(html);
}

InteractiveSample.prototype.refreshInlinePlugin = function() {
}

InteractiveSample.prototype.runJS = function() {
  // TODO don't assume that we run javascript in any order.  Make it so that 
  // it checks the HTML for which order JS goes in
  var src = this.textArea.getCode();
  eval(src);
}

InteractiveSample.prototype.deleteOldWindowStuff = function() {
  for (var i in window) {
    if (typeof this.cleanWindowObj[i] == 'boolean' && this.cleanWindowObj[i] == true) {} else delete window[i];
  }
}

InteractiveSample.prototype.startJS = function() {
	this.deleteOldWindowStuff();
  
  this.currentCode[this.curI].code = this.textArea.getCode();
  
  for (var i=0; i < this.currentCode.length; i++) {
		if ( this.currentCode[i].fileName.indexOf('.html') != -1) {
			// Change the name and id of the object tag before appending HTML, 
			// otherwise it will override the inline object we Actually want the demo
			// to be run in
			var safeCode = this.currentCode[i].code;
			safeCode = safeCode.replace('id="client3d"', 'id="notuchy"');
			safeCode = safeCode.replace('id=\'client3d\'', 'id="notuchy"');
			safeCode = safeCode.replace('name="client3d"', 'name="notuchy"');
			safeCode = safeCode.replace('name=\'client3d\'', 'name="notuchy"');
			
			// Now add the HTML to the page
			_gel('HTMLforInlineJavascript').innerHTML = safeCode;
		}
    if (this.currentCode[i].fileName.indexOf('.js') != -1) {
      // var newScript = _cel('script');
      // newScript.type = "text/javascript";
      // newScript.charset = "utf-8";
      // newScript.innerHTML = this.currentCode[i].code;
      // console.log(this.currentCode[i].code);
      window.eval(this.currentCode[i].code);
      // document.getElementsByTagName('head')[0].appendChild(newScript);
      // window.onload();
    }
  }
	try {
		window.onload();
	} catch(e) {
		alert(e.message);
	}
	
	_gel('client3d').focus();
	
}
