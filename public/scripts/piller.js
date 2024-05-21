/**
 * poller.js
 * @author Saud Khan - @s-khan-net
 * @description A simple, feature rich jqury plugin
 *   		 to create a poll on a web page.
 * 		Supports server side ajax calls to save and retieve poll data
 */
(function ( $ ) {
    var resNo,resText;
	$.fn.poller = function(options) {
		var defaults = { 
	            radio:false,
                answers:[['Option1'],['Option2'],['Option3'],['Option4']],
                question:'Poller?',

                showResults:false,
	            showResultsBtn:false,
                resultBtnAlign:'center',
                resultBtnText:'View Results',

                showBackBtn:false,
                backBtnAlign:'center',
                backBtnText:'Back',

                alertAfterSave:false,
                alertAfterSaveMsg:'Your selected option {answer_no}',

                resultGraph:false,
	    };
	    options = $.extend(defaults, options);
        var elemntId = this[0].id;
        var b=true;
        showPoll(this);	
		function showPoll(p)
        {
            var r=null;
            if($('#'+elemntId).html().indexOf('pollerRes')>-1)
            {
                r = $('.pollerRes'); // coming from the back button
                r.hide()//hide pollerRes
                p.show();//show poller
            }
            if(!p.hasClass('poller'))
            {
                if(options.width)
	    		    p.append('<div class="poller" style="width:'+options.width+'"><div>');	
	    	    else
		    	    p.append('<div class="poller"></div>');
		        p = $('.poller');
            }
            var resultText = options.question.toString();
            if(resultText.indexOf('{fa-')>-1)
            {
                var fa = resultText.split('{')[1].split('}')[0];
                resultText = resultText.replace('{'+fa+'}','<i class="fa '+fa+'"></i>');
            }
            if(resultText.indexOf('{glyphicon-')>-1)
            {
                var gl = resultText.split('{')[1].split('}')[0];
                resultText = resultText.replace('{'+gl+'}','<span class="glyphicon  '+gl+'"></span');
            }
            p.html('<div class="question" >'+resultText+'</div>');
            p.append('<div class="load" id="loader">Please wait</div>');
            if(options.answersUrl)
            {
               try {
                        //show loader
                        $('#loader').show();
                        $.ajax({
		                    type: "post",
		                    url: options.answersUrl,
		                    contentType: "application/json; charset=utf-8",
                            async: false,
                            cache: false,
		                    dataType: "json",
			                success: function(res) {
                                options.answers = eval(res.d);
                                //hide loader
                                $('#loader').hide();
			                },
			                error: function(){
                                alert('Could not get the options.');
                                //hide loader
                                $('#loader').hide();
                            }
			            });
                    } catch (ex) {
                         alert('Could not load the options.');
                    }
            }
            else if(options.answersMethod)
            {
                try {
                        options.answers = options.answersMethod();
                    } 
                    catch (ex){
                         alert('Could not load the options.');
                        }
            }
		    for(var i=0;i<options.answers.length;i++)
		    {
                var idnum = Number(i)+1;
                var optionText = options.answers[i].toString();
                if(optionText.indexOf('{fa-')>-1)
                {
                    var fa = optionText.split('{')[1].split('}')[0];
                    optionText = optionText.replace('{'+fa+'}','<i class="fa '+fa+'"></i>');
                }
                if(resultText.indexOf('{glyphicon-')>-1)
                {
                    var gl = resultText.split('{')[1].split('}')[0];
                    resultText = resultText.replace('{'+gl+'}','<span class="glyphicon  '+gl+'"></span');
                }
		    	if(options.radio)
		    	{
	    			p.append('<div  class="answer" id="q_'+idnum+'" ><input type=radio name="pollerQuestions" id="rad_'+idnum+'">'+optionText+'</div>');	
		    	}
		    	else
		    	{
		    		p.append('<div  class="answer" id="q_'+idnum+'" style="cursor:pointer">'+optionText+'</div>');
	    		}
		    }
            
		    if(options.showResultsBtn)
		    {
		    	p.append('<div class="btnContainer"  style="text-align:'+options.resultBtnAlign+'" ><button id="btnShowResults" class=pollerButtons>'+options.resultBtnText+'</button><div>')
	    		$('#btnShowResults').click(function(){
	    			showResults(p);
	    		})
		    }
            if(options.radio)
		    {
                 $('input:radio[name=pollerQuestions]').click(function(){
                    p = $('.poller');//get the main div 
                     //save results
	    	        var res=saveResults(this,p);
	    	        //show the results
                    if(options.showResults)
                    {
			            showResults(p);  	
                    }
                    if(res!='')
                    {
                        alert(res);
                    }
                 });
            }
            else
            {
	            $('.answer').click(function(){
	    	        //save results
	    	        var res=saveResults(this,p);
	    	        //show the results
                    if(options.showResults)
                    {
			            showResults(p);  			
                    }
                    if(res!='')
                    {
                        alert(res);
                    }
	            });
            }
        }
        function saveResults(el,p)
        {
            var n = Number(el.id.replace('rad_','').replace('q_','')); 
            var t = $("#"+el.id.replace('rad','q')).text();
           var resMsg='';
            if(options.saveUrl)
	    	{
                try {
                        var r=null;
                        if($('#'+elemntId).html().indexOf('pollerRes')==-1)
                        {
                            $('#'+elemntId).append('<div class="pollerRes"></div>');
                            r = $('.pollerRes');
                        }
                        else
                        {
                            r = $('.pollerRes');   
                            r.show();//there is a pollerRes
                        }
                        r.append('<input type="hidden" name="no" value="'+el.id+'" />');
                        r.append('<input type="hidden" name="text" value="'+t+'" />');
                        r.append('<div class="load" id="loader">Please wait</div>');

                        //show loader
                        $('#loader').show();
                        $.ajax({
		                    type: "post",
		                    url: options.saveUrl,
		                    contentType: "application/json; charset=utf-8",
		                    dataType: "json",
                            data: JSON.stringify({id:el.id,text:$("#"+el.id.replace('rad','q')).text()}),
			                success: function(res) {
                             //hide loader
                                $('#loader').hide();
                                
                               //var results = eval(res.d);
                                if(options.alertAfterSave)
                                {
                                    var msg= options.alertAfterSaveMsg;
                                    if(options.alertAfterSaveMsg.indexOf('{answer_no}')>-1)
                                        msg = options.alertAfterSaveMsg.replace('{answer_no}',n);
                                    if(options.alertAfterSaveMsg.indexOf('{answer_text}')>-1)
                                       msg =  options.alertAfterSaveMsg.replace('{answer_text}',t);
                                    resMsg = msg;
                                }
			                },
			                error: function(){
                                //hide loader
                                $('#loader').hide();
                                 resMsg = 'Failed to save results';
                            }
			            });
                    } catch (ex) {
                        resMsg = 'Failed to save results \n Details:'+ex.message;
                    }
	    	}
            else if(options.saveMethod)
            {
            try{
                    var b = options.saveMethod(t);
                    if(b)
                    {
                        var r=null;
                        if($('#'+elemntId).html().indexOf('pollerRes')==-1)
                        {
                            $('#'+elemntId).append('<div class="pollerRes"></div>');
                            r = $('.pollerRes');
                        }
                        else
                        {
                            r = $('.pollerRes');   
                            r.show();//there is a pollerRes
                        }
                        r.append('<input type="hidden" name="no" value="'+el.id+'" />');
                        r.append('<input type="hidden" name="text" value="'+t+'" />');
                        r.append('<div class="load" id="loader">Please wait</div>');

                        if(options.alertAfterSave)
                            {
                                var msg= options.alertAfterSaveMsg;
                                if(options.alertAfterSaveMsg.indexOf('{answer_no}')>-1)
                                    msg = options.alertAfterSaveMsg.replace('{answer_no}',n);
                                if(options.alertAfterSaveMsg.indexOf('{answer_text}')>-1)
                                    msg =  options.alertAfterSaveMsg.replace('{answer_text}',t);
                                resMsg = msg;
                            }
                    }
                    else
                    {
                        resMsg ='Failed to save results';
                    }
                }
                catch(ex)
                {
                    resMsg = 'Failed to save results\nDetails: '+ex.message;
                }
            }
            else
            {
                var r=null;
                if($('#'+elemntId).html().indexOf('pollerRes')==-1)
                {
                    $('#'+elemntId).append('<div class="pollerRes"></div>');
                    r = $('.pollerRes');
                }
                else
                {
                    r = $('.pollerRes');   
                    r.show();//there is a pollerRes
                }
                r.append('<input type="hidden" name="no" value="'+el.id+'" />');
                r.append('<input type="hidden" name="text" value="'+t+'" />');
                r.append('<div class="load" id="loader">Please wait</div>');
                if(options.alertAfterSave)
                        {
                            var msg= options.alertAfterSaveMsg;
                            if(options.alertAfterSaveMsg.indexOf('{answer_no}')>-1)
                                msg = options.alertAfterSaveMsg.replace('{answer_no}',n);
                            if(options.alertAfterSaveMsg.indexOf('{answer_text}')>-1)
                               msg =  options.alertAfterSaveMsg.replace('{answer_text}',t);
                            resMsg = msg;
                        }
               //  r.html('<div class="exceptionMsg">No options to save the results were found</div>')
               resMsg = resMsg+'\nNo method to save the results was found';
            }
            return resMsg;
        }
	    function showResults(p)
	    {
	    	if( options.showresultsUrl)
	    	{
                var results = null;
                var r=null;
                if($('#'+elemntId).html().indexOf('pollerRes')==-1)
                {
                    $('#'+elemntId).append('<div class="pollerRes"></div>');
                    r = $('.pollerRes');
                }
                else
                {
                    r = $('.pollerRes');
                    r.show();//there is a pollerRes
                }
               try {
                    //show loader
                    $('#loader').show();
	    		    $.ajax({
		                type: "post",
		                url: options.showresultsUrl,
		                contentType: "application/json; charset=utf-8",
		                dataType: "json",
			            success: function(res) {
                            results = eval(res.d);
                                //hide loader
                            $('#loader').hide();
			            },
			            error: function(){
                            //hide loader
                            $('#loader').hide();
                            alert('An error occured while showing the results')
                        }
			        });
                } catch (ex) {
                    alert('An error occured while showing the results');
				    r.html('<div class="question">No results available<br>Please verify if a valid server url, or a valid method is present to get the results is available<br><span class="exceptionMsg">Details: '+ex.message+'</span></div>');
                }
                p.hide(); //hide poller
	    	}
            else if(options.showResultsMethod)
            {
                var r=null;
                if($('#'+elemntId).html().indexOf('pollerRes')==-1)
                {
                    $('#'+elemntId).append('<div class="pollerRes"></div>');
                    r = $('.pollerRes');
                }
                else
                {
                    r = $('.pollerRes');   
                    r.html('');
                    r.show();//there is a pollerRes
                }
             try{
                    results = options.showResultsMethod();
                    if(options.resultGraph)
                    {
                        for(var i=0;i<results.length;i++)
                        {
                            var resultText = results[i].toString();
                            var w = resultText.split(' ')[0].toString();
                            if(resultText.indexOf('{fa-')>-1)
                            {
                                var fa = resultText.split('{')[1].split('}')[0];
                                resultText = resultText.replace('{'+fa+'}','<i class="fa '+fa+'"></i>');
                            }
                            if(resultText.indexOf('{glyphicon-')>-1)
                            {
                                var gl = resultText.split('{')[1].split('}')[0];
                                resultText = resultText.replace('{'+gl+'}','<span class="glyphicon  '+gl+'"></span');
                            }
                            r.append('<div class="pollerGraph"><div class="bar" style="width: '+w+'%;background: #CCC;text-align:center;">'+resultText+'</div></div>');
                        }
                        if(options.showBackBtn)
                        {
                            r.append('<div class="btnContainer" style="text-align:'+options.backBtnAlign+'"><button id="btnBack" class=pollerButtons>'+options.backBtnText+'</button><div>');
                            $('#btnBack').click(function(){
                                showPoll(p);
                            });
                        }
                    }
                    else
                    {
                        for(var i=0;i<results.length;i++)
                        {
                            var resultText = results[i].toString();
                            if(resultText.indexOf('{fa-')>-1)
                            {
                                var fa = resultText.split('{')[1].split('}')[0];
                                resultText = resultText.replace('{'+fa+'}','<i class="fa '+fa+'"></i>');
                            }
                            if(resultText.indexOf('{glyphicon-')>-1)
                            {
                                var gl = resultText.split('{')[1].split('}')[0];
                                resultText = resultText.replace('{'+gl+'}','<span class="glyphicon  '+gl+'"></span');
                            }
                            r.append('<div class="question" style="cursor:default">'+resultText+'</div>');
                        }
                        if(options.showBackBtn)
                        {
                            r.append('<div class="btnContainer" style="text-align:'+options.backBtnAlign+'"><button id="btnBack" class=pollerButtons>'+options.backBtnText+'</button><div>');
                            $('#btnBack').click(function(){
                                showPoll(p);
                            });
                        }
                    }
                }
                catch(ex)
                {
                    alert('An error occured while showing the results');
				    r.html('<div class="question">No results available<br>Please verify if the server URL, or a valid method<br> is present to get the results is available<br><span class="exceptionMsg">Details: '+ex.message+'</span></div>');
                    if(options.showBackBtn)
                    {
                        r.append('<div class="btnContainer" style="text-align:'+options.backBtnAlign+'"><button id="btnBack" class=pollerButtons>'+options.backBtnText+'</button><div>');
                        $('#btnBack').click(function(){
	    			        showPoll(p);
	    		        });
                    }
                }
                p.hide(); // hide poller 
            }
    		else
			{
                //no showresult method
				alert('Cannot show the results as there is no function');
           	}
	    }
	};
	return this;
}(jQuery ));
