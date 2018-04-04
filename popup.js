$(function() {
    
   var sortable;
   
    // select the target node
    var target = document.querySelector('.timesheet-suggestion tbody');
    var observer = new MutationObserver(function(mutations) {
        console.log(mutations);
     });
	
    	// configuration of the observer:
	var config = { attributes: true, childList: true, characterData: true };
	var pageCount = 0;
	var site = $("meta[property='og:site_name']").attr("content").toLowerCase();
	var files = [];
	var fileTree = [];
	var fileTreeStructure = [];
	var tree = {};
	var final = [];

		var getKids = function(data) {
				var arr = [];

				Object.getOwnPropertyNames(data).forEach(
						function (val, idx, array) {
						if (data[val].children != null)
								arr.push({ name : val, shortPath : data[val].shortPath, children : getKids(data[val].children) })
						}
				);
				return arr;
		};

		var addnode = function(obj) {

				var splitpath = obj.path.replace(/^\/|\/$/g, "").split('/');
				var ptr = tree;

				for (i=0;i<splitpath.length;i++)
				{
						node = { name: splitpath[i], type: 'directory', shortPath : obj.shortPath};

						if(i == splitpath.length-1)
							{node.shortPath = obj.shortPath; node.type = obj.type;}

						ptr[splitpath[i]] = ptr[splitpath[i]] || node;
						ptr[splitpath[i]].children=ptr[splitpath[i]].children||{};

						ptr=ptr[splitpath[i]].children;
				}    
		};
	
    var buildGitLabData = function(data){
        $('.diffs .file-header-content a').each(function(i,e){
            var fileNameInfo = $(e).text();
            var shortPath = $(e).attr('href').split('#')[1];
            $(e).parents('.diff-file:first').attr('id', shortPath);
            data.push( { shortPath: shortPath , path: 'r/' + fileNameInfo });
        })
    };

    var buildGitHubData = function(data){
        $('.file-info a').each(function(i,e){
            var fileNameInfo = $(e).attr('title');
            var shortPath = $(e).parents('.file:first').attr('id');
            $(e).parents('.file:first').attr('id', shortPath);
            $(e).text(fileNameInfo);
            data.push( { shortPath: shortPath , path: 'r/' + fileNameInfo });
        })
    };
		
    var loadUp = function(site){

        // only load in files diff mode
        if (window.location.href.indexOf('diffs') > 0 || window.location.href.indexOf('files') > 0) {

					var data = [];

					switch(site){
							case "gitlab" : buildGitLabData(data)
									break;
							default: buildGitHubData(data)
					}

					data.map(addnode);

					final.push({name : 'root', children : getKids(tree.r.children) });

					var t

					if (site === 'gitlab'){
							$('.files').before('<div id="tree" class="navigation"></div>');
							$('#tree').before('<div id="hiddentree" class="navigation"><a href="">&raquo;</a></div>');

							t = new TreeView(final, 'tree');

							$('#hiddentree').on('click', function(e){
									$('.diff-file').hide();
									$('#hiddentree').hide();
									$('#tree').show();
									e.preventDefault();
							});

							t.on('select', function (e) { 
									$('.diff-file').hide();
									$('#tree').hide();
									$('#hiddentree').show();
									var item = e.data.shortPath;
									document.getElementById(e.data.shortPath).style.display = 'block';
							})

							$('.diff-file').hide();

					} else {
							$('#files').before('<div id="tree" class="navigation"></div>');
							$('#tree').before('<div id="hiddentree" class="navigation"><a href="">&raquo;</a></div>');

							t = new TreeView(final, 'tree');

							$('#hiddentree').on('click', function(e){
									$('.file').hide();
									$('#hiddentree').hide();
									$('#tree').show();
									e.preventDefault();
							});

							t.on('select', function (e) { 
									$('.file').hide();
									$('#tree').hide();
									$('#hiddentree').show();
									var item = e.data.shortPath;
									document.getElementById(e.data.shortPath).style.display = 'block';
							});
					}
				}
    };

    var pager = window.setInterval( function(){

        if (site === 'gitlab'){
            if ($('.loading:visible').length === 0){

                window.clearInterval(pager);
                loadUp(site);
            }
        }
			
        if (site === 'github'){
            $('html, body').animate({
                scrollTop: $(".footer").offset().top
            });
    
            if ($('.js-diff-progressive-spinner').length === 0){
    
                window.clearInterval(pager);
    
                $('html, body').animate({
                    scrollTop: $("#files_bucket").offset().top
                });
    
                loadUp();
            
            }
        }
    }, 1000);
});
